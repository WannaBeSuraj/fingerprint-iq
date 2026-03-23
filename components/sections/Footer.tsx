'use client'
export default function Footer() {
  return (
    <footer className="pt-12 pb-8 px-5 md:px-10 border-t border-[var(--border)]" style={{ background: 'var(--bg2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-10">
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              Fingerprint<span style={{ color: 'var(--accent2)' }}>IQ</span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '280px' }}>
              See what your browser tells the world — before someone else does.
              Real-time browser fingerprinting intelligence for everyone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              {['GitHub', 'Twitter', 'LinkedIn'].map(s => (
                <a key={s} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '6px', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Product</div>
            {['Scanner', 'How It Works', 'Identity Graph', 'Use Cases', 'API Docs'].map(l => (
              <a key={l} href="#" style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)' }}>
                {l}
              </a>
            ))}
          </div>

          {/* Signals */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Signals</div>
            {['Canvas Fingerprint', 'WebGL Renderer', 'Audio Context', 'Font Detection', 'WebRTC Leak'].map(l => (
              <div key={l} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>{l}</div>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Legal</div>
            {['Privacy Policy', 'Terms of Service', 'GDPR Compliance', 'Cookie Policy', 'Contact'].map(l => (
              <a key={l} href="#" style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)' }}>
                {l}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'var(--muted)' }}>
            © 2025 FingerprintIQ. College Research Project. All analysis runs client-side — no data is stored.
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px rgba(0,255,180,0.6)' }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', color: 'var(--muted)' }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
