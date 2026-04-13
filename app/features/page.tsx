import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function FeaturesPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8' }}>
      <Navbar />

      {/* Header */}
      <div className="pt-20" style={{ background: 'linear-gradient(135deg, #023e8a 0%, #001219 100%)', paddingBottom: '3rem' }}>
        <div className="max-w-5xl mx-auto px-6 pt-10">
          <div className="badge-live mb-4 inline-flex"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}>
            <span className="dot" style={{ background: '#48cae4' }} />
            Capabilities
          </div>
          <h1 className="text-4xl font-bold text-white mb-3"
            style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}>
            Key Features
          </h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
            What NeuroRefine does and where it's headed.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Core features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a' }}>
            Current Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: '⚡',
                title: 'AI Image Enhancement',
                desc: 'Automatically improves MRI brain images by reducing motion blur, noise, and scanning artifacts using an ensemble of Restormer transformer models.',
                tag: 'Core',
              },
              {
                icon: '🔬',
                title: 'Detail Preservation',
                desc: 'Residual learning framework ensures diagnostic structures are preserved — the model subtracts predicted artifacts rather than regenerating anatomy.',
                tag: 'Clinical',
              },
              {
                icon: '⏱',
                title: 'Fast Processing',
                desc: 'Ensemble inference completes in seconds, not minutes — compatible with clinical workflow timing.',
                tag: 'Performance',
              },
              {
                icon: '⟨⟩',
                title: 'Side-by-Side Comparison',
                desc: 'Interactive drag-slider lets radiologists directly compare the motion-corrupted original with the reconstructed scan for immediate quality assessment.',
                tag: 'UX',
              },
              {
                icon: '🏥',
                title: 'Vendor Independent',
                desc: 'Post-acquisition correction works with any MRI scanner brand — no hardware modifications or protocol changes required.',
                tag: 'Compatibility',
              },
              {
                icon: '📤',
                title: 'Multi-Format Export',
                desc: 'Download reconstructed scans in PNG, JPEG, or JPG formats, ready for PACS systems, reports, or further analysis.',
                tag: 'Integration',
              },
            ].map(({ icon, title, desc, tag }) => (
              <div key={title} className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg flex-shrink-0 flex items-center justify-center text-xl"
                    style={{ background: 'rgba(0,119,182,0.08)', border: '1px solid rgba(0,119,182,0.15)' }}>
                    {icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold" style={{ color: '#023e8a', fontFamily: 'DM Sans, sans-serif' }}>
                        {title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,119,182,0.08)', color: '#0077b6', fontFamily: 'DM Mono, monospace', border: '1px solid rgba(0,119,182,0.15)' }}>
                        {tag}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#4a5568' }}>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Future roadmap */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a' }}>
            Future Improvements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Real-Time MRI Enhancement', desc: 'Integrate NeuroRefine directly into MRI scanners to improve image quality during the scanning process.', phase: 'Phase 2' },
              { title: 'More Imaging Modalities', desc: 'Expand beyond brain MRI to support spine MRI, CT scans, and other medical imaging types.', phase: 'Phase 2' },
              { title: 'Advanced Artifact Correction', desc: 'Improve the model to handle more complex artifacts and severe motion distortions.', phase: 'Phase 3' },
              { title: 'PACS Integration', desc: 'Connect directly with hospital Picture Archiving and Communication Systems to streamline radiology workflows.', phase: 'Phase 3' },
              { title: 'Continuous Model Training', desc: 'Improve accuracy by training on larger and more diverse medical imaging datasets.', phase: 'Ongoing' },
            ].map(({ title, desc, phase }) => (
              <div key={title} className="card-accent">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: '#023e8a', fontFamily: 'DM Sans, sans-serif' }}>
                      {title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#718096' }}>{desc}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(0,119,182,0.08)', color: '#0077b6', fontFamily: 'DM Mono, monospace', border: '1px solid rgba(0,119,182,0.15)', whiteSpace: 'nowrap' }}>
                    {phase}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/demo" className="btn-primary text-base px-10 py-3 inline-block">
            Reconstruct
          </Link>
        </div>

      </div>
      <Footer />
    </div>
  )
}
