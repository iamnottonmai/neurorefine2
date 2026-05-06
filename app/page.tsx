'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const step = (ts: number) => {
          if (!start) start = ts
          const p = Math.min((ts - start) / 1800, 1)
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target))
          if (p < 1) requestAnimationFrame(step)
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

/* ── Hero MRI before/after slider ── */
const MRI_CORRUPTED = '/test-images/tuT23f3t7dkbP7bk9tf23P7t7f8BXF4FdZ8IqwAAAAAASUVORK5CYII.png'
const MRI_CLEAN     = '/test-images/wHAeqcBVrVtZwAAAABJRU5ErkJggg.png'

function HeroSlider() {
  const [pos, setPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const move = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const r = containerRef.current.getBoundingClientRect()
    setPos(Math.max(5, Math.min(95, ((clientX - r.left) / r.width) * 100)))
  }, [])

  useEffect(() => {
    const up   = () => { dragging.current = false }
    const drag = (e: MouseEvent) => { if (dragging.current) move(e.clientX) }
    window.addEventListener('mouseup', up)
    window.addEventListener('mousemove', drag)
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('mousemove', drag) }
  }, [move])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-ew-resize select-none overflow-hidden"
      style={{ background: '#000' }}
      onMouseDown={() => { dragging.current = true }}
      onTouchMove={e => move(e.touches[0].clientX)}
    >
      {/* Clean / reconstructed (right side base) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MRI_CLEAN}
        alt="Reconstructed MRI"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'grayscale(100%) brightness(1.08) contrast(1.1)' }}
      />

      {/* Corrupted (left, clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MRI_CORRUPTED}
          alt="Corrupted MRI"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(100%) brightness(0.9) contrast(0.85)' }}
        />
      </div>

      {/* Scanner info overlay — top left */}
      <div className="absolute top-4 left-4 text-xs leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'DM Mono, monospace', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
        Brain MRI · Axial T2<br />
        1.5T · 256×256
      </div>

      {/* Stats badge — top right */}
      <div className="absolute top-4 right-4 flex flex-col items-center justify-center rounded-full"
        style={{
          width: 80, height: 80,
          border: '2px solid #2dd4bf',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
        }}>
        <span className="text-xl font-bold leading-none" style={{ color: '#2dd4bf', fontFamily: 'DM Mono, monospace' }}>59%</span>
        <span className="text-xs text-center leading-tight mt-0.5" style={{ color: '#2dd4bf', fontFamily: 'DM Sans, sans-serif' }}>
          Scans<br />Affected
        </span>
      </div>

      {/* Bottom labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-4 pt-8"
        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
        <div>
          <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Mono, monospace' }}>Motion-Corrupted</div>
          <div className="text-sm font-bold" style={{ color: 'white', fontFamily: 'DM Mono, monospace' }}>Original</div>
        </div>
        <div className="text-right">
          <div className="text-xs mb-0.5" style={{ color: '#2dd4bf', fontFamily: 'DM Mono, monospace' }}>NeuroRefine™</div>
          <div className="text-sm font-bold" style={{ color: '#2dd4bf', fontFamily: 'DM Mono, monospace' }}>Reconstructed</div>
        </div>
      </div>

      {/* Divider handle */}
      <div className="absolute top-0 bottom-0 z-10 pointer-events-none"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '50%',
          width: '2px', background: '#2dd4bf',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 12px rgba(45,212,191,0.8)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 36, height: 36, borderRadius: '50%',
          background: '#2dd4bf',
          boxShadow: '0 0 16px rgba(45,212,191,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0d1b2a', fontSize: 13, fontWeight: 700,
          pointerEvents: 'none',
          fontFamily: 'DM Sans, sans-serif',
        }}>
          ⟨⟩
        </div>
      </div>
    </div>
  )
}

/* ── Page ── */
export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8' }}>
      {/* Navbar override for dark hero */}
      <Navbar dark />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#0d1b2a', minHeight: '100vh', display: 'flex', alignItems: 'center' }}
      >
        {/* Subtle background texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(45,212,191,0.06) 0%, transparent 60%)',
          }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 lg:py-0 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center min-h-screen">

          {/* Left — text */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-8"
              style={{
                background: 'rgba(45,212,191,0.1)',
                border: '1px solid rgba(45,212,191,0.3)',
                borderRadius: 100,
                padding: '5px 14px',
                width: 'fit-content',
              }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#2dd4bf' }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: '#2dd4bf', fontFamily: 'DM Mono, monospace' }}>
                AI-Powered Medical Imaging
              </span>
            </div>

            <h1 style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'white',
              marginBottom: '1.5rem',
            }}>
              Neuro<span style={{ color: '#2dd4bf' }}>Refine™</span>
            </h1>

            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.35,
              marginBottom: '2.5rem',
            }}>
              Stunning MRI Clarity.<br />
              <span style={{ color: '#2dd4bf' }}>Unprecedented Reconstruction.</span>
            </p>

            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '1rem',
              lineHeight: 1.7,
              maxWidth: 420,
              marginBottom: '3rem',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 300,
            }}>
              Automatically recover diagnostic-quality brain MRI scans from motion artifacts — without repeating the scan or changing hardware.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/demo" style={{
                display: 'inline-block',
                padding: '0.9rem 2.4rem',
                borderRadius: 8,
                background: '#2dd4bf',
                color: '#0d1b2a',
                fontWeight: 700,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1rem',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(45,212,191,0.35)',
                transition: 'all 0.2s ease',
              }}>
                Reconstruct
              </Link>
              <Link href="/how-it-works" style={{
                display: 'inline-block',
                padding: '0.9rem 2.4rem',
                borderRadius: 8,
                border: '2px solid rgba(45,212,191,0.5)',
                color: '#2dd4bf',
                fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1rem',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}>
                How It Works →
              </Link>
            </div>
          </div>

          {/* Right — MRI slider */}
          <div className="relative w-full rounded-2xl overflow-hidden"
            style={{
              aspectRatio: '1 / 1',
              border: '1px solid rgba(45,212,191,0.2)',
              boxShadow: '0 0 60px rgba(45,212,191,0.1), 0 25px 50px rgba(0,0,0,0.5)',
              maxWidth: 540,
              margin: '0 auto',
            }}>
            <HeroSlider />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: 0.4 }}>
          <span className="text-xs" style={{ fontFamily: 'DM Mono, monospace', color: '#2dd4bf' }}>scroll</span>
          <div className="w-px h-8 overflow-hidden rounded-full" style={{ background: 'rgba(45,212,191,0.2)' }}>
            <div className="w-full h-4 rounded-full animate-bounce" style={{ background: '#2dd4bf', marginTop: '50%' }} />
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATS ── */}
      <section className="py-24" style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="badge-live mb-5 inline-flex">The Problem</div>
            <h2 className="text-4xl font-bold mb-4"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a', letterSpacing: '-0.02em' }}>
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
                detail: 'AI hemorrhage detection fell from 88% to 67% when motion artifacts were present',
                source: 'Krag et al., 2026',
                color: '#023e8a',
              },
              {
                stat: 20000, suffix: ' THB',
                label: 'per MRI brain scan',
                detail: 'Repeated scans can double patient costs and hospital resource usage',
                source: 'Vibhavadi Hospital',
                color: '#0d9488',
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

      {/* ── SOLUTION ── */}
      <section className="py-24" style={{ background: '#f7fafc' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge-live mb-5 inline-flex">The Solution</div>
              <h2 className="text-4xl font-bold mb-6"
                style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a', letterSpacing: '-0.02em' }}>
                Recover Diagnostic Quality<br />From Corrupted Scans
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: '#4a5568' }}>
                NeuroRefine uses a weighted ensemble of Restormer models trained with residual learning to predict and subtract motion artifacts. No hardware changes, no workflow disruption.
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

      {/* ── QUOTE ── */}
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

      {/* ── MARKET ── */}
      <section className="py-24" style={{ background: '#f7fafc' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="badge-live mb-5 inline-flex">Market</div>
            <h2 className="text-4xl font-bold"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#023e8a', letterSpacing: '-0.02em' }}>
              Global Opportunity
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'TAM', title: 'Total Addressable Market', value: '~216,000', desc: 'Hospitals & imaging centers worldwide', color: '#023e8a' },
              { label: 'SAM', title: 'Serviceable Market', value: '180–220', desc: 'Facilities in Thailand', color: '#0077b6' },
              { label: 'SOM', title: 'Initial Target', value: '~7', desc: 'Facilities in Chiang Mai', color: '#0d9488' },
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
                <div className="rounded-xl p-6 relative" style={{ border: '2px solid #0077b6', background: 'rgba(0,119,182,0.03)' }}>
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

      {/* ── CTA ── */}
      <section className="py-24" style={{ background: '#0d1b2a' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white"
            style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}>
            Ready to Reconstruct?
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Upload a corrupted MRI scan and see the reconstruction in seconds.
          </p>
          <Link href="/demo" style={{
            display: 'inline-block',
            padding: '1rem 3rem',
            borderRadius: 8,
            background: '#2dd4bf',
            color: '#0d1b2a',
            fontWeight: 700,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '1.05rem',
            boxShadow: '0 4px 24px rgba(45,212,191,0.35)',
          }}>
            Reconstruct
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
