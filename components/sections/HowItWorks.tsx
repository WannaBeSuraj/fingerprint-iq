'use client'
export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: '📡',
      title: 'Signals Collected',
      desc: 'The moment you visit a site, your browser broadcasts canvas hashes, GPU renderer strings, audio entropy, font lists, hardware specs, and behavioral patterns — all without any cookies.',
      color: 'var(--accent)',
    },
    {
      number: '02',
      icon: '#️⃣',
      title: 'Fingerprint Generated',
      desc: 'These signals are combined into a stable SHA-256 hash that uniquely identifies your browser. It survives cookie clears, incognito mode, and browser restarts.',
      color: 'var(--accent2)',
    },
    {
      number: '03',
      icon: '🔗',
      title: 'Sessions Linked',
      desc: 'Even when some signals change (new browser, OS update), a probabilistic matching algorithm links sessions with a confidence score — no login required.',
      color: 'var(--accent3)',
    },
    {
      number: '04',
      icon: '🧠',
      title: 'Intelligence Computed',
      desc: 'A Privacy Leakage Score (0–100) measures your exposure. A threat classifier determines if you\'re a human, bot, privacy-tool user, or fraud risk.',
      color: 'var(--warn)',
    },
    {
      number: '05',
      icon: '⚡',
      title: 'Results in Real Time',
      desc: 'All of this happens in under 200ms. Website owners see it in their dashboard. Visitors see it right here — everything your browser tells the world, revealed.',
      color: '#ff9500',
    },
  ]

  return (
    <section id="how-it-works" style={{ padding: '6rem 2.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-fade" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            ◈ Under The Hood
          </div>
          <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            How Fingerprinting Works
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', color: 'var(--muted2)', maxWidth: '560px', margin: '0 auto' }}>
            Five steps from browser open to being uniquely identified — happening right now on almost every site you visit.
          </p>
        </div>

        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', position: 'relative' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.75rem', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = step.color + '60'; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              {/* Background number */}
              <div style={{ position: 'absolute', top: '-10px', right: '16px', fontFamily: "'Space Mono', monospace", fontSize: '5rem', fontWeight: 700, color: step.color, opacity: 0.06, userSelect: 'none', lineHeight: 1 }}>
                {step.number}
              </div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.icon}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: step.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Step {step.number}
              </div>
              <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>
                {step.title}
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'var(--muted2)', lineHeight: 1.65 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Explainer callout */}
        <div className="section-fade" style={{ marginTop: '3rem', background: 'rgba(0,255,180,0.05)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.75rem' }}>
              The Incognito Myth
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', color: 'var(--muted2)', lineHeight: 1.7 }}>
              Most people think incognito mode makes them anonymous. It doesn't. Incognito only deletes cookies and history after the session. Your canvas fingerprint, WebGL renderer, fonts, timezone, and hardware all remain completely unchanged. Try it — scan in normal mode, then scan in incognito. Your score barely moves.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent2)', marginBottom: '0.75rem' }}>
              The VPN Myth
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem', color: 'var(--muted2)', lineHeight: 1.7 }}>
              VPNs change your IP address — but your browser fingerprint has nothing to do with your IP. Your GPU, fonts, and screen are exactly the same whether you're on a VPN or not. Worse, many VPNs don't block WebRTC, which leaks your real local IP address anyway. A VPN alone is not privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
