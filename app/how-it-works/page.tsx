import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8' }}>
      <Navbar />

      {/* Header */}
      <div className="pt-20" style={{ background: 'linear-gradient(135deg, #023e8a 0%, #001219 100%)', paddingBottom: '3rem' }}>
        <div className="max-w-5xl mx-auto px-6 pt-10">
          <div className="badge-live mb-4 inline-flex"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}>
            <span className="dot" style={{ background: '#48cae4' }} />
            Methodology
          </div>
          <h1 className="text-4xl font-bold text-white mb-3"
            style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}>
            How It Works
          </h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
            NeuroRefine uses a weighted ensemble of Restormer transformers trained with residual learning on synthetic motion artifact data.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Pipeline steps — only 1-3 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a' }}>
            Pipeline
          </h2>
          <div className="space-y-5">
            {[
              {
                step: '01',
                title: 'Clean MRI Dataset',
                detail: 'Training begins with a curated dataset of clean brain MRI scans covering axial, coronal, and sagittal orientations.',
                tag: 'Data',
              },
              {
                step: '02',
                title: 'Artifact Simulation',
                detail: 'Realistic motion artifacts are synthetically injected into the clean images to create corrupted training pairs — mimicking patient movement during acquisition.',
                tag: 'Preprocessing',
              },
              {
                step: '03',
                title: 'Residual Learning Framework',
                detail: 'Instead of predicting the clean image directly, the model learns to predict the artifact itself. The clean image is recovered by subtracting the predicted artifact from the corrupted input.',
                tag: 'Training',
              },
            ].map(({ step, title, detail, tag }, i) => (
              <div key={step} className="flex gap-5">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="step-number">{step}</div>
                  {i < 2 && (
                    <div className="w-px flex-1 mt-2"
                      style={{ background: 'linear-gradient(180deg, #e2e8f0, transparent)', minHeight: '2rem' }} />
                  )}
                </div>
                <div className="card p-6 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold" style={{ color: '#023e8a', fontFamily: 'DM Sans, sans-serif' }}>
                      {title}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,119,182,0.08)', color: '#0077b6', fontFamily: 'DM Mono, monospace', border: '1px solid rgba(0,119,182,0.15)' }}>
                      {tag}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#4a5568' }}>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation metrics — kept simple, no table */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a' }}>
            Evaluation
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#4a5568' }}>
            Performance is measured using four standard image quality metrics to ensure the reconstruction meets diagnostic standards.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { metric: 'PSNR', desc: 'Peak signal-to-noise ratio' },
              { metric: 'SSIM', desc: 'Structural similarity index' },
              { metric: 'LPIPS', desc: 'Perceptual image quality' },
              { metric: 'NRMSE', desc: 'Normalized reconstruction error' },
            ].map(({ metric, desc }) => (
              <div key={metric} className="rounded-lg p-4 text-center"
                style={{ background: 'rgba(0,119,182,0.04)', border: '1px solid rgba(0,119,182,0.12)' }}>
                <div className="text-lg font-bold mb-1 metric-value">{metric}</div>
                <div className="text-xs" style={{ color: '#718096', fontFamily: 'DM Sans, sans-serif' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
