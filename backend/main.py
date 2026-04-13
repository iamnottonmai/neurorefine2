"""
NeuroRefine Backend — FastAPI server wrapping the Restormer ensemble.

Setup:
  pip install fastapi uvicorn python-multipart torch torchvision opencv-python numpy scipy pillow gdown

Run:
  uvicorn main:app --host 0.0.0.0 --port 8000

Environment variables:
  MODEL_DIR   — path containing the .pth model files (default: /tmp/models)
  CORS_ORIGIN — frontend origin for CORS (default: *)
"""

import os
import time
import base64
import logging
from io import BytesIO

import numpy as np
import cv2
import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as tv_models
import gdown
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("neurorefine")

# ─── DEVICE ────────────────────────────────────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"Using device: {device}")

MODEL_DIR = os.getenv("MODEL_DIR", "./models")
os.makedirs(MODEL_DIR, exist_ok=True)

CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")

# ─── GOOGLE DRIVE FILE IDs ─────────────────────────────────────────────────────
GDRIVE_IDS = {
    "run2": "1yw5UwMLS_c3UnAWADvBEw0RQQCm6MMDo",
    "run3": "1Tl7tj4KYLZuiGpxRpxrflfbf_5MpyjFE",
    "run4": "17B6IKMChiBpvGD3tEZvz4eEuYjIuq_0m",
}

MODEL_PATHS = {
    name: os.path.join(MODEL_DIR, f"Restormer_{name}_best.pth")
    for name in GDRIVE_IDS
}

# Path for corruption classifier (placed alongside other models in MODEL_DIR)
CORRUPTION_CLF_PATH = os.path.join(MODEL_DIR, "corruption_clf_best.pth")

# ─── MODEL DEFINITION ──────────────────────────────────────────────────────────
class LayerNorm2d(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.norm = nn.LayerNorm(dim)
    def forward(self, x):
        return self.norm(x.permute(0,2,3,1)).permute(0,3,1,2)

class FeedForward(nn.Module):
    def __init__(self, dim, expansion=2.66):
        super().__init__()
        hidden = int(dim * expansion)
        self.project_in  = nn.Conv2d(dim, hidden*2, 1)
        self.dwconv      = nn.Conv2d(hidden*2, hidden*2, 3, padding=1, groups=hidden*2)
        self.project_out = nn.Conv2d(hidden, dim, 1)
    def forward(self, x):
        x = self.project_in(x)
        x = self.dwconv(x)
        x1, x2 = x.chunk(2, dim=1)
        return self.project_out(F.gelu(x1) * x2)

class MDTA(nn.Module):
    def __init__(self, dim, num_heads=4):
        super().__init__()
        self.num_heads   = num_heads
        self.temperature = nn.Parameter(torch.ones(num_heads, 1, 1))
        self.qkv         = nn.Conv2d(dim, dim*3, 1)
        self.dwconv      = nn.Conv2d(dim*3, dim*3, 3, padding=1, groups=dim*3)
        self.project_out = nn.Conv2d(dim, dim, 1)
    def forward(self, x):
        b, c, h, w = x.shape
        qkv = self.dwconv(self.qkv(x))
        q, k, v = qkv.chunk(3, dim=1)
        q = q.reshape(b, self.num_heads, -1, h*w)
        k = k.reshape(b, self.num_heads, -1, h*w)
        v = v.reshape(b, self.num_heads, -1, h*w)
        q = F.normalize(q, dim=-1)
        k = F.normalize(k, dim=-1)
        attn = (q @ k.transpose(-2,-1)) * self.temperature
        attn = attn.softmax(dim=-1)
        out  = (attn @ v).reshape(b, c, h, w)
        return self.project_out(out)

class TransformerBlock(nn.Module):
    def __init__(self, dim, num_heads):
        super().__init__()
        self.norm1 = LayerNorm2d(dim)
        self.attn  = MDTA(dim, num_heads)
        self.norm2 = LayerNorm2d(dim)
        self.ffn   = FeedForward(dim)
    def forward(self, x):
        x = x + self.attn(self.norm1(x))
        x = x + self.ffn(self.norm2(x))
        return x

class Downsample(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.body = nn.Conv2d(dim, dim*2, 3, stride=2, padding=1)
    def forward(self, x): return self.body(x)

class Upsample(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.body = nn.ConvTranspose2d(dim, dim//2, 2, stride=2)
    def forward(self, x): return self.body(x)

class Restormer(nn.Module):
    def __init__(self, inp_channels=1, out_channels=1, dim=64,
                 num_blocks=[4,6,8,10], num_heads=[2,4,8,8]):
        super().__init__()
        self.patch_embed = nn.Conv2d(inp_channels, dim, 3, padding=1)
        self.encoder1 = nn.Sequential(*[TransformerBlock(dim,   num_heads[0]) for _ in range(num_blocks[0])])
        self.down1    = Downsample(dim)
        self.encoder2 = nn.Sequential(*[TransformerBlock(dim*2, num_heads[1]) for _ in range(num_blocks[1])])
        self.down2    = Downsample(dim*2)
        self.encoder3 = nn.Sequential(*[TransformerBlock(dim*4, num_heads[2]) for _ in range(num_blocks[2])])
        self.down3    = Downsample(dim*4)
        self.latent   = nn.Sequential(*[TransformerBlock(dim*8, num_heads[3]) for _ in range(num_blocks[3])])
        self.up3      = Upsample(dim*8)
        self.decoder3 = nn.Sequential(*[TransformerBlock(dim*4, num_heads[2]) for _ in range(num_blocks[2])])
        self.up2      = Upsample(dim*4)
        self.decoder2 = nn.Sequential(*[TransformerBlock(dim*2, num_heads[1]) for _ in range(num_blocks[1])])
        self.up1      = Upsample(dim*2)
        self.decoder1 = nn.Sequential(*[TransformerBlock(dim,   num_heads[0]) for _ in range(num_blocks[0])])
        self.output   = nn.Conv2d(dim, out_channels, 3, padding=1)

    def forward(self, x):
        x1 = self.encoder1(self.patch_embed(x))
        x2 = self.encoder2(self.down1(x1))
        x3 = self.encoder3(self.down2(x2))
        x4 = self.latent(self.down3(x3))
        x  = self.decoder3(self.up3(x4) + x3)
        x  = self.decoder2(self.up2(x)  + x2)
        x  = self.decoder1(self.up1(x)  + x1)
        return self.output(x)


# ─── CORRUPTION CLASSIFIER ─────────────────────────────────────────────────────

class CorruptionClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        resnet       = tv_models.resnet18(weights=None)
        resnet.conv1 = nn.Conv2d(1, 64, 7, stride=2, padding=3, bias=False)
        resnet.fc    = nn.Linear(512, 2)
        self.model   = resnet

    def forward(self, x):
        return self.model(x)


corruption_clf: CorruptionClassifier | None = None


def load_corruption_classifier():
    """Load the corruption classifier from MODEL_DIR if available."""
    global corruption_clf
    if not os.path.exists(CORRUPTION_CLF_PATH):
        logger.warning(
            f"Corruption classifier not found at {CORRUPTION_CLF_PATH} — "
            "classification will be skipped (passthrough mode)."
        )
        return
    try:
        clf = CorruptionClassifier().to(device)
        clf.load_state_dict(torch.load(CORRUPTION_CLF_PATH, map_location=device))
        clf.eval()
        corruption_clf = clf
        logger.info(f"✓ Corruption classifier loaded from {CORRUPTION_CLF_PATH}")
    except Exception as e:
        logger.error(f"Failed to load corruption classifier: {e}")


def classify_corruption(img_tensor: torch.Tensor) -> dict:
    """
    Classify the corruption level of an MRI image tensor.

    Args:
        img_tensor: (1, 1, 256, 256) float32 tensor in [0, 1]

    Returns:
        dict with keys: decision, confidence, label, classifier_available
    """
    if corruption_clf is None:
        return {
            "decision": "reconstruct",
            "confidence": None,
            "label": "ℹ️  Classifier not loaded — proceeding with reconstruction.",
            "classifier_available": False,
        }

    img_tensor = img_tensor.to(device)
    with torch.no_grad():
        logits         = corruption_clf(img_tensor)
        probs          = F.softmax(logits, dim=1)
        conf_corrupted = probs[0, 1].item()

    if conf_corrupted < 0.40:
        decision = "reconstruct"
        label    = (
            "✅ Mild corruption detected — reconstructing. "
            "Minor artifacts present. Reconstruction expected to be highly accurate."
        )
    elif conf_corrupted < 0.75:
        decision = "reconstruct"
        label    = (
            "⚠️ Corruption detected — reconstructing. "
            "Moderate artifacts present. Reconstruction quality may vary."
        )
    else:
        decision = "reconstruct_severe"
        label    = (
            "🚨 Severe corruption detected — reconstructing. "
            "Heavy artifacts present. Results should be interpreted with caution."
        )

    return {
        "decision": decision,
        "confidence": round(conf_corrupted * 100, 1),
        "label": label,
        "classifier_available": True,
    }


# ─── ENSEMBLE WEIGHTS ──────────────────────────────────────────────────────────
RUN_PSNRS = {"run2": 27.83, "run3": 27.84, "run4": 27.76}

psnr_values = np.array(list(RUN_PSNRS.values()))
psnr_exp    = np.exp(psnr_values - psnr_values.max())
weights     = psnr_exp / psnr_exp.sum()
WEIGHTS     = {k: float(w) for k, w in zip(RUN_PSNRS.keys(), weights)}

models: dict = {}


# ─── DOWNLOAD MODELS ───────────────────────────────────────────────────────────
def download_models():
    """Download model files from Google Drive if not already cached."""
    for name, file_id in GDRIVE_IDS.items():
        dest = MODEL_PATHS[name]
        if os.path.exists(dest):
            logger.info(f"✓ {name} already cached at {dest}, skipping download")
            continue
        url = f"https://drive.google.com/uc?id={file_id}"
        logger.info(f"Downloading {name} from Google Drive...")
        try:
            gdown.download(url, dest, quiet=False)
            logger.info(f"✓ Downloaded {name} to {dest}")
        except Exception as e:
            logger.error(f"Failed to download {name}: {e}")


# ─── LOAD ENSEMBLE ─────────────────────────────────────────────────────────────
def load_models():
    """Download then load models — skip gracefully if files are missing (demo mode)."""
    download_models()
    for name, path in MODEL_PATHS.items():
        if not os.path.exists(path):
            logger.warning(f"Model file not found: {path} — running in demo mode")
            continue
        try:
            m = Restormer().to(device)
            m.load_state_dict(torch.load(path, map_location=device))
            m.eval()
            models[name] = m
            logger.info(f"✓ Loaded {name}  (weight: {WEIGHTS[name]:.4f})")
        except Exception as e:
            logger.error(f"Failed to load {name}: {e}")
    if models:
        logger.info(f"✓ Ensemble ready on {device} with {len(models)} model(s)")
    else:
        logger.warning("No models loaded — demo passthrough mode active")


# ─── INFERENCE ─────────────────────────────────────────────────────────────────
def preprocess(image_bytes: bytes) -> tuple[torch.Tensor, np.ndarray]:
    file_bytes = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError("Failed to decode image")
    img = cv2.resize(img, (256, 256))
    img_np = img.astype(np.float32) / 255.0
    tensor = torch.from_numpy(img_np).unsqueeze(0).unsqueeze(0)
    return tensor, img_np


def reconstruct(image_bytes: bytes, use_tta: bool = True) -> np.ndarray:
    tensor, _ = preprocess(image_bytes)
    tensor = tensor.to(device)

    if not models:
        # Demo mode: return input unchanged
        img_float = tensor.cpu().squeeze().numpy()
        return np.clip(img_float, 0.0, 1.0)

    accumulated = torch.zeros_like(tensor)
    with torch.no_grad():
        for name, model in models.items():
            w = WEIGHTS[name]
            residual = model(tensor)
            pred = torch.clamp(tensor + residual, 0.0, 1.0)
            if use_tta:
                flipped = torch.flip(tensor, dims=[-1])
                pred_flipped = torch.clamp(flipped + model(flipped), 0.0, 1.0)
                pred = (pred + torch.flip(pred_flipped, dims=[-1])) / 2.0
            accumulated += w * pred

    img_float = accumulated.cpu().squeeze().numpy()
    return np.clip(img_float, 0.0, 1.0)


def img_to_data_url(img_float: np.ndarray) -> str:
    img_uint8 = (img_float * 255).astype(np.uint8)
    pil_img = Image.fromarray(img_uint8, mode='L')
    buffer = BytesIO()
    pil_img.save(buffer, format='PNG')
    b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    return f"data:image/png;base64,{b64}"


# ─── APP ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NeuroRefine API",
    description="Restormer ensemble inference for motion artifact correction in brain MRI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN] if CORS_ORIGIN != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    load_models()
    load_corruption_classifier()


@app.get("/")
async def root():
    return {
        "name": "NeuroRefine API",
        "version": "1.0.0",
        "device": str(device),
        "models_loaded": list(models.keys()),
        "demo_mode": len(models) == 0,
    }


@app.get("/health")
async def health():
    return {"status": "ok", "models": len(models), "device": str(device)}


@app.post("/reconstruct")
async def reconstruct_endpoint(
    file: UploadFile = File(...),
    use_tta: bool = Form(True),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        image_bytes = await file.read()
        t0 = time.time()

        # Run corruption classification before reconstruction
        tensor, _ = preprocess(image_bytes)
        corruption_info = classify_corruption(tensor)
        logger.info(
            f"Corruption classification: {corruption_info['decision']} "
            f"(confidence: {corruption_info['confidence']}%)"
        )

        img_float = reconstruct(image_bytes, use_tta=use_tta)
        elapsed_ms = round((time.time() - t0) * 1000)

        data_url = img_to_data_url(img_float)

        return JSONResponse({
            "reconstructed_url": data_url,
            "corruption_classification": corruption_info,
            "metrics": {
                "processing_time_ms": elapsed_ms,
                "model_weights": WEIGHTS,
                "tta_enabled": use_tta,
                "models_used": list(models.keys()),
                "demo_mode": len(models) == 0,
            }
        })
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Reconstruction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Reconstruction failed")


@app.post("/classify")
async def classify_endpoint(file: UploadFile = File(...)):
    """Run only the corruption classifier without full reconstruction."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    try:
        image_bytes = await file.read()
        tensor, _   = preprocess(image_bytes)
        result      = classify_corruption(tensor)
        return JSONResponse(result)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Classification failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Classification failed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
