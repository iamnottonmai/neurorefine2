'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar({ dark = false }: { dark?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // On dark pages: transparent until scrolled, then white
  // On light pages: always white
  const bg = dark
    ? scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(13,27,42,0.6)'
    : 'rgba(255,255,255,0.97)'

  const textColor = dark && !scrolled ? 'rgba(255,255,255,0.85)' : '#4a5568'
  const logoColor = dark && !scrolled ? 'white' : '#023e8a'
  const accentColor = dark && !scrolled ? '#2dd4bf' : '#0077b6'
  const borderColor = dark && !scrolled ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
  const shadow = scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : 'none'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
      style={{
        background: bg,
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${borderColor}`,
        boxShadow: shadow,
      }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0077b6, #023e8a)' }}>
            <svg viewBox="0 0 32 32" className="w-5 h-5">
              <path d="M8 16 Q12 8 16 16 Q20 24 24 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="16" r="3" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: logoColor, letterSpacing: '-0.02em', transition: 'color 0.3s' }}>
            Neuro<span style={{ color: accentColor, transition: 'color 0.3s' }}>Refine</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'How It Works', href: '/how-it-works' },
            { label: 'Reconstruct', href: '/demo' },
            { label: 'Features', href: '/features' },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: textColor, transition: 'color 0.3s' }}>
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex">
          <Link href="/demo" style={{
            display: 'inline-block',
            padding: '0.5rem 1.4rem',
            borderRadius: 7,
            background: dark && !scrolled ? '#2dd4bf' : '#0077b6',
            color: dark && !scrolled ? '#0d1b2a' : 'white',
            fontWeight: 600,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.875rem',
            transition: 'all 0.3s',
          }}>
            Reconstruct
          </Link>
        </div>

        {/* Mobile burger */}
        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {[0, 1, 2].map(i => (
            <span key={i} className="block w-6 h-0.5 rounded transition-all duration-300"
              style={{
                background: dark && !scrolled ? 'rgba(255,255,255,0.8)' : '#0077b6',
                opacity: menuOpen && i === 1 ? 0 : 1,
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translateY(8px)' : i === 2 ? 'rotate(-45deg) translateY(-8px)' : ''
                  : '',
              }} />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4"
          style={{ background: 'white', borderTop: '1px solid #e2e8f0' }}>
          {[
            { label: 'How It Works', href: '/how-it-works' },
            { label: 'Reconstruct', href: '/demo' },
            { label: 'Features', href: '/features' },
          ].map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="text-sm font-medium py-2" style={{ color: '#4a5568' }}>
              {label}
            </Link>
          ))}
          <Link href="/demo" onClick={() => setMenuOpen(false)}
            style={{
              display: 'block', padding: '0.75rem', borderRadius: 8, textAlign: 'center',
              background: '#0077b6', color: 'white', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
            }}>
            Reconstruct
          </Link>
        </div>
      )}
    </nav>
  )
}
