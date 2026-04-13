'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logoNeuroRefine.png"
            alt="NeuroRefine Logo"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#023e8a', letterSpacing: '-0.02em' }}>
            Neuro<span style={{ color: '#0077b6' }}>Refine</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'How It Works', href: '/how-it-works' },
            { label: 'Reconstruct', href: '/demo' },
            { label: 'Features', href: '/features' },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#4a5568' }}>
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex">
          <Link href="/demo" className="btn-primary text-sm px-5 py-2">Reconstruct</Link>
        </div>

        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {[0, 1, 2].map(i => (
            <span key={i} className="block w-6 h-0.5 rounded transition-all duration-300"
              style={{
                background: '#0077b6',
                opacity: menuOpen && i === 1 ? 0 : 1,
                transform: menuOpen ? i === 0 ? 'rotate(45deg) translateY(8px)' : i === 2 ? 'rotate(-45deg) translateY(-8px)' : '' : '',
              }} />
          ))}
        </button>
      </div>

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
          <Link href="/demo" className="btn-primary text-sm text-center mt-2" onClick={() => setMenuOpen(false)}>
            Reconstruct
          </Link>
        </div>
      )}
    </nav>
  )
}
