# NeuroRefine

**Advanced Motion Mitigation for Axial, Coronal, and Sagittal MRI Brain Slices Reconstruction**

AI-powered MRI artifact reconstruction using a PSNR-weighted ensemble of three Restormer transformer models.

---

## Architecture

```
neurorefine/
├── app/                    # Next.js 14 App Router (Vercel frontend)
│   ├── page.tsx            # Landing page
│   ├── demo/page.tsx       # Upload + reconstruction demo
│   ├── how-it-works/       # Methodology page
│   ├── features/           # Features & roadmap
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   └── Footer.tsx
├── backend/                # FastAPI Python backend (Railway / Render)
│   ├── main.py             # FastAPI server + inference
│   ├── requirements.txt
│   └── Procfile
├── vercel.json
└── .env.example
```

---

## Deployment

### 1. Deploy the Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From project root
vercel

# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_API_URL = https://your-backend.railway.app
```

Or connect your GitHub repo directly at vercel.com → New Project.

**Required environment variable in Vercel:**
| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | URL of your deployed Python backend |

---

### 2. Deploy the Backend to Railway

The Python backend is too heavy for Vercel serverless (PyTorch models). Use Railway, Render, or Fly.io.

#### Railway (recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

cd backend
railway login
railway init
railway up
```

In Railway dashboard → Variables, add:
| Key | Value |
|-----|-------|
| `MODEL_DIR` | Path to directory containing `.pth` files |
| `CORS_ORIGIN` | Your Vercel frontend URL (e.g. `https://neurorefine.vercel.app`) |

Upload your model files:
```bash
# Using Railway volumes or include in repo (if files are small enough)
# Recommended: use Railway persistent storage or an S3 bucket
```

#### Render

1. Create a new Web Service from your repo
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

### 3. Add Your Model Files

Place these three files in the `backend/` directory (or the `MODEL_DIR` path):
- `Restormer_run2_best.pth`
- `Restormer_run3_best.pth`
- `Restormer_run4_best.pth`

> If model files are not present, the backend runs in **demo/passthrough mode** — it returns the input image unchanged so the frontend still works for testing.

---

## Local Development

```bash
# 1. Install frontend dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Start frontend
npm run dev
# → http://localhost:3000

# 4. In another terminal — start backend
cd backend
pip install -r requirements.txt

# Copy your .pth model files into backend/
# Then:
python main.py
# → http://localhost:8000
```

---

## Backend API

### `POST /reconstruct`

Upload a brain MRI image for reconstruction.

**Request:** `multipart/form-data`
- `file` — image file (PNG, JPG, JPEG)
- `use_tta` — boolean, default `true`

**Response:**
```json
{
  "reconstructed_url": "data:image/png;base64,...",
  "metrics": {
    "processing_time_ms": 312,
    "model_weights": {
      "run2": 0.3332,
      "run3": 0.3336,
      "run4": 0.3332
    },
    "tta_enabled": true,
    "models_used": ["run2", "run3", "run4"],
    "demo_mode": false
  }
}
```

### `GET /health`
```json
{ "status": "ok", "models": 3, "device": "cuda" }
```

---

## Model Performance

| Metric | Value | Interpretation |
|--------|-------|----------------|
| PSNR   | 31.80 dB | Within 31–37 dB "good quality" range |
| SSIM   | 0.889 | Strong structural preservation |
| LPIPS  | 0.033 | Minimal perceptual difference |
| NRMSE  | 0.027 | Low reconstruction error |

**Ensemble weights** (PSNR-softmax normalized):
- Run 2: 27.83 dB → 33.3%
- Run 3: 27.84 dB → 33.5%  
- Run 4: 27.76 dB → 33.2%

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Hosting | Vercel |
| Backend | FastAPI, Python |
| ML | PyTorch, Restormer transformer |
| Backend hosting | Railway / Render / Fly.io |

---

## Team

NeuroRefine Team · TamDai  
Validated by Dr. Julinthip Vitipariwat, M.D. — Chiang Mai Ram Hospital
