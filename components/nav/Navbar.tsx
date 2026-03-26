'use client'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
    backdropFilter: scrolled ? 'blur(16px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    transition: 'all 0.3s ease',
  }

  return (
    <nav style={navStyle} className="px-5 md:px-10">
      {/* Logo */}
      <a href="#" style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.04em' }}>
        Fingerprint<span style={{ color: 'var(--accent2)' }}>IQ</span>
      </a>

      {/* Desktop Links */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="hidden md:flex">
        {['#scan', '#how-it-works', '#graph', '#use-cases'].map((href, i) => (
          <a key={href} href={href} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: 'var(--muted2)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted2)')}>
            {['Scanner', 'How It Works', 'Identity Graph', 'Use Cases'][i]}
          </a>
        ))}
      </div>

      {/* CTA */}
      <a href="#scan" style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '0.78rem',
        fontWeight: 700,
        background: 'var(--accent)',
        color: '#ffffff',
        padding: '10px 22px',
        borderRadius: '6px',
        textDecoration: 'none',
        letterSpacing: '0.04em',
        transition: 'opacity 0.15s, transform 0.15s',
        whiteSpace: 'nowrap',
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}>
        Scan My Browser →
      </a>
    </nav>
  )
}
