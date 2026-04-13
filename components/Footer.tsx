import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer style={{ background: 'white', borderTop: '1px solid #e2e8f0' }}>
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logoNeuroRefine.png"
                alt="NeuroRefine Logo"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#023e8a' }}>
                Neuro<span style={{ color: '#0077b6' }}>Refine</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#718096', fontFamily: 'DM Sans, sans-serif' }}>
              Advanced motion mitigation for axial, coronal, and sagittal MRI brain slices reconstruction.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: '#0077b6', fontFamily: 'DM Mono, monospace' }}>
              Product
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Reconstruct', href: '/demo' },
                { label: 'Features', href: '/features' },
              ].map(({ label, href }) => (
                <Link key={href} href={href}
                  className="text-sm transition-colors hover:text-blue-600"
                  style={{ color: '#718096', fontFamily: 'DM Sans, sans-serif' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: '#0077b6', fontFamily: 'DM Mono, monospace' }}>
              Clinical Use
            </h4>
            <div className="stats-tag text-sm">
              Motion artifacts impact up to <strong>59%</strong> of MRI scans, causing diagnostic delays and increased costs.
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid #e2e8f0' }}>
          <p className="text-xs" style={{ color: '#a0aec0', fontFamily: 'DM Mono, monospace' }}>
            © 2026 NeuroRefine Team · TamDai
          </p>
          <p className="text-xs" style={{ color: '#a0aec0', fontFamily: 'DM Mono, monospace' }}>
            B2B SaaS · Advanced MRI Artifact Reconstruction
          </p>
        </div>
      </div>
    </footer>
  )
}
