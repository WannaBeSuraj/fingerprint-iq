'use client'
import { useState } from 'react'

export default function ScanIdle({ onStart }: { onStart: () => void }) {
  const [hovered, setHovered] = useState(false)

  const signals = [
    'Canvas & WebGL fingerprint', 'Audio context hash',
    'CPU cores & RAM', 'Installed fonts (50+ tested)',
    'Screen resolution & pixel ratio', 'Timezone & locale',
    'Incognito mode detection', 'Ad blocker detection',
    'WebRTC IP leak test', 'Browser plugins',
  ]

  return (
    <div className="scan-idle-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
      {/* Left */}
      <div>
        <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
          What we collect:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '2rem' }}>
          {signals.map(s => (
            <div key={s} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'var(--muted2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--accent)', fontSize: '0.65rem', flexShrink: 0 }}>◆</span>
              {s}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'var(--muted)', padding: '12px 16px', background: 'rgba(0,255,180,0.06)', borderRadius: '8px', border: '1px solid var(--border)', lineHeight: 1.6 }}>
          🔒 All analysis happens in your browser. Nothing is sent to any server. No data is stored.
        </div>
      </div>

      {/* Right — big scan button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <button
          onClick={onStart}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '200px', height: '200px',
            borderRadius: '50%',
            background: hovered ? 'rgba(0,255,180,0.15)' : 'rgba(0,255,180,0.08)',
            border: `2px solid ${hovered ? 'var(--accent)' : 'var(--border2)'}`,
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s',
            animation: 'scan-pulse 3s ease-in-out infinite',
            outline: 'none',
          }}>
          <span style={{ fontSize: '2.5rem' }}>🔍</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em' }}>
            START SCAN
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'var(--muted2)' }}>
            ~8 seconds
          </span>
        </button>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'var(--muted)', textAlign: 'center' }}>
          No account needed · Free forever
        </p>
      </div>
    </div>
  )
}
