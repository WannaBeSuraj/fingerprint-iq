'use client'
import { useEffect, useRef, useState } from 'react'
import { collectSignals } from '@/lib/fingerprint/collector'
import { calculatePLS } from '@/lib/fingerprint/pls-calculator'

interface TerminalLine { text: string; color?: string; delay: number }

export default function HeroSection() {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [scanning, setScanning] = useState(true)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    async function runTerminal() {
      await new Promise(r => setTimeout(r, 800))
      if (cancelled) return

      const initial: TerminalLine[] = [
        { text: '> Initializing FingerprintIQ v1.0...', delay: 0 },
        { text: '> Collecting browser signals...', delay: 500 },
      ]
      for (const line of initial) {
        if (cancelled) return
        await new Promise(r => setTimeout(r, line.delay + 300))
        setLines(prev => [...prev, line])
      }

      try {
        const signals = await collectSignals()
        const pls = calculatePLS(signals)
        if (cancelled) return

        const dataLines: TerminalLine[] = [
          { text: `> Canvas fingerprint:    [CAPTURED] ✓`, color: 'var(--accent)', delay: 0 },
          { text: `> WebGL renderer:        ${signals.webgl.renderer.substring(0, 40)}`, color: 'var(--text)', delay: 350 },
          { text: `> Audio context:         [CAPTURED] ✓`, color: 'var(--accent)', delay: 700 },
          { text: `> Timezone:              ${signals.timezone.zone}`, color: 'var(--text)', delay: 1050 },
          { text: `> Platform:              ${signals.navigator.platform}`, color: 'var(--text)', delay: 1400 },
          { text: `> Screen:                ${signals.screen.width}×${signals.screen.height} @${signals.screen.pixelRatio}x`, color: 'var(--text)', delay: 1750 },
          { text: `> CPU cores:             ${signals.navigator.hardwareConcurrency || 'unknown'}`, color: 'var(--text)', delay: 2100 },
          { text: `> RAM:                   ${signals.navigator.deviceMemory || '?'}GB`, color: 'var(--text)', delay: 2450 },
          { text: `> Fonts detected:        ${signals.fonts.length} / ~50 tested`, color: 'var(--text)', delay: 2800 },
          { text: `> Incognito mode:        ${signals.privacy.incognito ? '⚠ DETECTED' : 'not detected'}`, color: signals.privacy.incognito ? 'var(--warn)' : 'var(--muted2)', delay: 3150 },
          { text: `> VPN / proxy:           ${signals.network.isVPN ? '⚠ DETECTED — ' + signals.network.vpnReason.substring(0, 30) : 'not detected'}`, color: signals.network.isVPN ? 'var(--warn)' : 'var(--muted2)', delay: 3500 },
          { text: `> Ad blocker:            ${signals.privacy.adBlocker ? 'detected ✓' : 'not detected'}`, color: signals.privacy.adBlocker ? 'var(--accent2)' : 'var(--muted2)', delay: 3500 },
          { text: `> WebRTC IP leak:        ${signals.webrtc.leaked ? '⚠ LEAKING — ' + signals.webrtc.publicIp : 'secure'}`, color: signals.webrtc.leaked ? 'var(--danger)' : 'var(--accent)', delay: 3850 },
          { text: `> ─────────────────────────────────────`, color: 'var(--border2)', delay: 4200 },
          { text: `> Privacy Leakage Score: [ ${pls.score} / 100 ] ${pls.tier}`, color: pls.color, delay: 4600 },
          { text: `> Threat classification: ${pls.threatTag}`, color: pls.threatColor, delay: 5000 },
          { text: `> Fingerprint ID:        fp_${signals.canvas.hash.substring(0, 12)}...`, color: 'var(--accent3)', delay: 5400 },
        ]

        for (const line of dataLines) {
          if (cancelled) return
          await new Promise(r => setTimeout(r, line.delay === 0 ? 200 : 350))
          setLines(prev => [...prev, line])
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
          }
        }
        setScanning(false)
      } catch {
        if (!cancelled) {
          setLines(prev => [...prev, { text: '> Error: Could not complete scan', color: 'var(--danger)', delay: 0 }])
          setScanning(false)
        }
      }
    }
    runTerminal()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="min-h-screen flex items-center pt-28 pb-12 px-5 md:px-10 max-w-[1300px] mx-auto gap-12 md:gap-16 flex-wrap md:flex-nowrap">
      {/* Left — Copy */}
      <div className="flex-1 min-w-0" style={{ flexBasis: '480px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.5rem', opacity: 0.9 }}>
          ◈ Adaptive Privacy Intelligence Platform
        </div>

        <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text)' }}>
          Your Browser<br />
          Is <span style={{ color: 'var(--accent)', textShadow: '0 0 20px rgba(5,150,105,0.2)' }}>Talking.</span><br />
          Are You<br />
          Listening?
        </h1>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', color: 'var(--muted2)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '480px' }}>
          Every website you visit collects 50+ invisible signals from your browser —
          without cookies, without consent, and without you knowing.
          FingerprintIQ reveals exactly what you leak in real time.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <a href="#scan" style={{
            fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: '0.85rem',
            background: 'var(--accent)', color: '#ffffff',
            padding: '14px 32px', borderRadius: '6px', textDecoration: 'none',
            letterSpacing: '0.04em', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}>
            Scan My Browser Free →
          </a>
          <a href="#how-it-works" style={{
            fontFamily: "'Space Mono', monospace", fontWeight: 400, fontSize: '0.85rem',
            background: 'transparent', color: 'var(--text)',
            padding: '14px 28px', borderRadius: '6px', textDecoration: 'none',
            border: '1px solid var(--border2)', letterSpacing: '0.04em', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}>
            How It Works
          </a>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {['No cookies used', 'No data stored', 'Runs in your browser', '100% free'].map(t => (
            <span key={t} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>✓</span> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Right — Terminal */}
      <div className="float flex-1 w-full max-w-lg md:max-w-[520px] min-w-0">
        <div className="gradient-border" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          {/* Terminal header */}
          <div style={{ background: 'var(--panel2)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', color: 'var(--muted)', marginLeft: '8px' }}>
              fingerprintiq — live scan
            </span>
            {scanning && (
              <span style={{ marginLeft: 'auto', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: 'var(--accent)', animation: 'pulse 1.5s ease-in-out infinite' }}>
                ● SCANNING
              </span>
            )}
          </div>

          {/* Terminal body */}
          <div ref={terminalRef} style={{ background: '#f1f5f9', padding: '20px', fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', lineHeight: 1.8, minHeight: '380px', maxHeight: '420px', overflowY: 'auto' }}>
            {lines.map((line, i) => (
              <div key={i} style={{ color: line.color || 'var(--muted2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {line.text}
              </div>
            ))}
            {scanning && <span className="cursor" style={{ color: 'var(--accent)' }}>█</span>}
          </div>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', marginTop: '0.75rem' }}>
          ↑ These are your actual browser signals — collected live right now
        </p>
      </div>
    </section>
  )
}
