'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const duration = 1800
        const step = (timestamp: number) => {
          if (!start) start = timestamp
          const progress = Math.min((timestamp - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * target))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        observer.disconnect()
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8' }}>
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-32 pb-24"
        style={{
          background: 'linear-gradient(135deg, #023e8a 0%, #001219 100%)',
          color: 'white',
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="badge-live mb-6 inline-flex"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}>
                <span className="dot" style={{ background: '#48cae4' }} />
                AI-Powered Medical Imaging
              </div>

              <h1 className="mb-6 leading-tight"
                style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', letterSpacing: '-0.03em' }}>
                Advanced MRI<br />
                <span style={{ color: '#48cae4' }}>Artifact</span> Reconstruction
              </h1>

              <p className="mb-10 text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 300 }}>
                Automatically improve MRI images by reducing motion blur and scanning artifacts while preserving diagnostic structures.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/demo"
                  style={{
                    background: '#0077b6',
                    color: 'white',
                    padding: '0.85rem 2.2rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontFamily: 'DM Sans, sans-serif',
                    boxShadow: '0 4px 16px rgba(0,119,182,0.4)',
                    transition: 'all 0.2s ease',
                    display: 'inline-block',
                    textAlign: 'center',
                  }}>
                  Reconstruct
                </Link>
                <Link href="/how-it-works"
                  style={{
                    border: '2px solid rgba(255,255,255,0.4)',
                    color: 'white',
                    padding: '0.85rem 2.2rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.2s ease',
                    display: 'inline-block',
                    textAlign: 'center',
                  }}>
                  How It Works →
                </Link>
              </div>
            </div>

            {/* Right — stats tag */}
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl p-8"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
                <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 300 }}>
                  <strong style={{ color: 'white' }}>Advanced MRI Artifact Reconstruction.</strong><br />
                  Reconstructs clearer scans while preserving diagnostic details, helping radiologists interpret images more accurately and reducing the need for rescans.
                </p>
                <div style={{
                  background: 'rgba(72,202,228,0.12)',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  borderLeft: '4px solid #48cae4',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.85)',
                }}>
                  Motion artifacts impact up to <strong style={{ color: '#48cae4' }}>59%</strong> of MRI scans, causing significant diagnostic delays [1, 2].
                </div>
              </div>

              {/* Quick steps */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { n: '1', label: 'Upload MRI Scan' },
                  { n: '2', label: 'AI Processing' },
                  { n: '3', label: 'View Results' },
                  { n: '4', label: 'Download Image' },
                ].map(({ n, label }) => (
                  <div key={n} className="flex items-center gap-3 rounded-lg px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{ background: '#0077b6', color: 'white', fontFamily: 'DM Mono, monospace' }}>
                      {n}
                    </span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem stats */}
      <section className="py-24" style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="badge-live mb-5 inline-flex">The Problem</div>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a', letterSpacing: '-0.02em' }}>
              Motion Artifacts Impact Patient Care
            </h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: '#718096' }}>
              Patient movement during MRI scans causes image corruption that directly affects clinical decision-making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                stat: 59, suffix: '%',
                label: 'of MRI scans affected',
                detail: 'Motion artifacts are one of the most common quality problems in MRI imaging',
                source: 'Andre et al., 2015',
                color: '#0077b6',
              },
              {
                stat: 21, suffix: '%',
                label: 'AI accuracy drop',
                detail: 'AI hemorrhage detection accuracy fell from 88% to 67% when motion artifacts were present',
                source: 'Krag et al., 2026',
                color: '#023e8a',
              },
              {
                stat: 20000, suffix: ' THB',
                label: 'per MRI brain scan',
                detail: 'Repeated scans can double patient costs — repeated scans mean higher out-of-pocket expenses',
                source: 'Vibhavadi Hospital',
                color: '#48cae4',
              },
            ].map(({ stat, suffix, label, detail, source, color }) => (
              <div key={label} className="card p-8">
                <div className="text-4xl font-bold mb-2" style={{ color, fontFamily: 'DM Mono, monospace' }}>
                  <AnimatedCounter target={stat} suffix={suffix} />
                </div>
                <div className="text-base font-semibold mb-2" style={{ color: '#1a202c' }}>{label}</div>
                <div className="text-sm mb-4 leading-relaxed" style={{ color: '#718096' }}>{detail}</div>
                <div className="text-xs" style={{ color: '#a0aec0', fontFamily: 'DM Mono, monospace' }}>{source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-24" style={{ background: '#f7fafc' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge-live mb-5 inline-flex">The Solution</div>
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a', letterSpacing: '-0.02em' }}>
                Recover Diagnostic Quality<br />From Corrupted Scans
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: '#4a5568' }}>
                NeuroRefine uses a weighted ensemble of Restormer models trained with residual learning to predict and subtract motion artifacts. No hardware changes, no workflow disruption — just clearer images.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  'Vendor-independent post-acquisition correction',
                  'Supports axial, coronal, and sagittal slices',
                  'Results in seconds',
                  'Side-by-side comparison view',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ background: 'rgba(0,119,182,0.1)', border: '1px solid rgba(0,119,182,0.3)' }}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#0077b6" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm" style={{ color: '#4a5568' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works steps */}
            <div className="flex flex-col gap-4">
              {[
                { step: '01', title: 'Upload MRI Image', desc: 'Drop a corrupted brain MRI scan — any orientation supported' },
                { step: '02', title: 'AI Processing', desc: 'The model analyzes the scan and enhances the image automatically' },
                { step: '03', title: 'View Results', desc: 'Compare the original MRI with the enhanced version side-by-side' },
                { step: '04', title: 'Download Image', desc: 'Save the improved scan for further analysis or reporting' },
              ].map(({ step, title, desc }, i) => (
                <div key={step} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="step-number">{step}</div>
                    {i < 3 && <div className="w-px flex-1 mt-2" style={{ background: '#e2e8f0', minHeight: '1.5rem' }} />}
                  </div>
                  <div className="card p-4 flex-1">
                    <h3 className="text-sm font-semibold mb-1" style={{ color: '#023e8a' }}>{title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#718096' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expert validation */}
      <section className="py-24" style={{ background: 'white' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="badge-live mb-6 inline-flex">Clinical Validation</div>
          <blockquote className="text-2xl leading-relaxed mb-8 font-light"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#1a202c', fontStyle: 'italic' }}>
            "Most MRI machines in both private and public hospitals still lack software for image enhancement. NeuroRefine will be beneficial if launched full scale."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0077b6, #023e8a)' }}>
              JV
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold" style={{ color: '#1a202c' }}>JULINTHIP VITIPARIWAT, M.D.</div>
              <div className="text-xs" style={{ color: '#a0aec0', fontFamily: 'DM Mono, monospace' }}>
                Radiologist · Chiang Mai Ram Hospital · March 9, 2026
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market */}
      <section className="py-24" style={{ background: '#f7fafc' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="badge-live mb-5 inline-flex">Market</div>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a', letterSpacing: '-0.02em' }}>
              Global Opportunity
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'TAM', title: 'Total Addressable Market', value: '~216,000', desc: 'Hospitals & imaging centers worldwide', color: '#023e8a' },
              { label: 'SAM', title: 'Serviceable Market', value: '180–220', desc: 'Facilities in Thailand', color: '#0077b6' },
              { label: 'SOM', title: 'Initial Target', value: '~7', desc: 'Facilities in Chiang Mai', color: '#48cae4' },
            ].map(({ label, title, value, desc, color }) => (
              <div key={label} className="card p-8 text-center">
                <div className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ fontFamily: 'DM Mono, monospace', color }}>
                  {label}
                </div>
                <div className="text-sm mb-4" style={{ color: '#718096' }}>{title}</div>
                <div className="text-4xl font-bold mb-2" style={{ fontFamily: 'DM Mono, monospace', color }}>{value}</div>
                <div className="text-sm" style={{ color: '#a0aec0' }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* B2B SaaS */}
          <div className="card p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="badge-live mb-4 inline-flex">Business Model</div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a' }}>
                  B2B SaaS Platform
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#4a5568' }}>
                  Hospitals subscribe monthly or annually — no upfront hardware purchase. Continuous updates, cloud platform access, and dedicated support included.
                </p>
                <div className="flex flex-col gap-3">
                  {['AI MRI Reconstruction', 'Cloud Platform Access', 'Email & Technical Support', 'Regular AI Model Updates'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#4a5568' }}>
                      <span style={{ color: '#0077b6' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="rounded-xl p-6" style={{ border: '1px solid #e2e8f0', background: '#f7fafc' }}>
                  <div className="text-xs uppercase tracking-widest mb-2"
                    style={{ fontFamily: 'DM Mono, monospace', color: '#a0aec0' }}>Monthly Plan</div>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#0077b6' }}>Contact Sales</div>
                  <div className="text-xs" style={{ color: '#a0aec0' }}>Flexible month-to-month subscription</div>
                </div>
                <div className="rounded-xl p-6 relative"
                  style={{ border: '2px solid #0077b6', background: 'rgba(0,119,182,0.03)' }}>
                  <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,119,182,0.1)', color: '#0077b6', fontFamily: 'DM Mono, monospace' }}>
                    RECOMMENDED
                  </div>
                  <div className="text-xs uppercase tracking-widest mb-2"
                    style={{ fontFamily: 'DM Mono, monospace', color: '#a0aec0' }}>Annual Plan</div>
                  <div className="text-2xl font-bold mb-1" style={{ color: '#023e8a' }}>Contact Sales</div>
                  <div className="text-xs mb-3" style={{ color: '#a0aec0' }}>Best value for hospitals</div>
                  {['Priority Processing', 'PACS Integration Support', 'Unlimited Scans', 'Dedicated Account Manager'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs mt-2" style={{ color: '#4a5568' }}>
                      <span style={{ color: '#0077b6' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #023e8a 0%, #001219 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}>
            Ready to Reconstruct?
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Upload a corrupted MRI scan and see the reconstruction in seconds.
          </p>
          <Link href="/demo"
            style={{
              background: '#0077b6',
              color: 'white',
              padding: '1rem 3rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '1.05rem',
              display: 'inline-block',
              boxShadow: '0 4px 20px rgba(0,119,182,0.5)',
            }}>
            Reconstruct
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
