'use client'
import { useEffect, useState, useRef } from 'react'
import type { FingerprintSignals } from '@/lib/fingerprint/collector'
import type { PLSResult } from '@/lib/fingerprint/pls-calculator'

interface Props {
  signals:       FingerprintSignals
  pls:           PLSResult
  fingerprintId: string
  onReset:       () => void
}

// Animated counter 0 → target
function AnimatedScore({ target, color }: { target: number; color: string }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let cur = 0
    const step = Math.max(1, Math.ceil(target / 45))
    const id = setInterval(() => {
      cur = Math.min(target, cur + step)
      setV(cur)
      if (cur >= target) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [target])
  return (
    <span style={{ color, textShadow: `0 0 24px ${color}55` }}>{v}</span>
  )
}

// Reusable flag row
function FlagRow({
  label, value, yesText = 'YES', noText = 'NO',
  yesColor, noColor, detail,
}: {
  label: string; value: boolean
  yesText?: string; noText?: string
  yesColor: string; noColor: string
  detail?: string
}) {
  return (
    <div style={{ padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.83rem', color: 'var(--muted2)' }}>
          {label}
        </span>
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', fontWeight: 700,
          color: value ? yesColor : noColor, flexShrink: 0, marginLeft: '8px',
        }}>
          {value ? yesText : noText}
        </span>
      </div>
      {detail && (
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.62rem', color: 'var(--muted)', marginTop: '3px', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {detail}
        </div>
      )}
    </div>
  )
}

// Small data card
function DataCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.58rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.76rem', color: accent || 'var(--accent2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        title={value}>
        {value || '—'}
      </div>
    </div>
  )
}

export default function ScanResults({ signals, pls, fingerprintId, onReset }: Props) {
  const [showFonts, setShowFonts] = useState(false)
  const [mounted,   setMounted  ] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  const n = signals.network

  const tierMsg: Record<string, string> = {
    LOW:      'Your browser is well protected. Tracking is limited.',
    MODERATE: 'Some signals exposed. Privacy extensions would help.',
    ELEVATED: 'Significant leakage. Sites can track you across sessions.',
    HIGH:     'Highly identifiable. Cross-site tracking is reliable.',
    CRITICAL: 'Maximum exposure. You are uniquely trackable across the web.',
  }

  // Build tailored advice
  const advice: string[] = []
  if (!signals.canvas.blocked)
    advice.push('Use Brave Browser or install "Canvas Fingerprint Defender" — blocks the #1 tracking signal')
  if (signals.webrtc.leaked)
    advice.push('Your real IP leaks via WebRTC even with a VPN. Fix: enable WebRTC protection in uBlock Origin settings')
  if (!signals.privacy.adBlocker)
    advice.push('Install uBlock Origin — it blocks Meta Pixel, DoubleClick, and other fingerprinting scripts')
  if (n.isVPN)
    advice.push('VPN detected — it hides your IP but NOT canvas, WebGL, fonts, or hardware. Your fingerprint is still fully active')
  if (signals.privacy.incognito)
    advice.push('Incognito hides cookies and history but NOT your fingerprint. GPU, screen, fonts, and timezone are identical')
  if (!n.timezoneMatch && n.ipTimezone)
    advice.push(`Your IP places you in ${n.ipTimezone} but your browser reports ${n.browserTimezone} — VPN timezone mismatch detected`)
  if (advice.length === 0)
    advice.push('Great privacy posture! For maximum anonymity consider Tor Browser, which normalises all fingerprint signals')

  return (
    <div ref={reportRef} style={{
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.55s ease',
      padding: '20px',
      margin: '-20px',
      borderRadius: '16px',
    }}>

      {/* ── Row 1: Score + Threat ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* PLS Score card */}
        <div className="gradient-border" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Privacy Leakage Score
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '3.6rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.5rem' }}>
            <AnimatedScore target={pls.score} color={pls.color} />
            <span style={{ fontSize: '1.2rem', color: 'var(--muted)', fontWeight: 400 }}>/100</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', margin: '0.75rem 0' }}>
            <div style={{
              height: '100%', width: `${pls.score}%`,
              background: pls.color, borderRadius: '3px',
              transition: 'width 1.3s ease',
              boxShadow: `0 0 8px ${pls.color}`,
            }} />
          </div>
          <span style={{ display: 'inline-block', padding: '4px 18px', borderRadius: '20px', background: pls.bgColor, border: `1px solid ${pls.color}40`, fontFamily: "'Space Mono', monospace", fontSize: '0.73rem', fontWeight: 700, color: pls.color }}>
            {pls.tier}
          </span>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'var(--muted2)', lineHeight: 1.55, marginTop: '0.75rem' }}>
            {tierMsg[pls.tier]}
          </p>
        </div>

        {/* Threat + ID */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Threat classification */}
          <div style={{ background: 'var(--panel)', border: `1px solid ${pls.threatColor}30`, borderRadius: '12px', padding: '1.25rem', flex: 1 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Threat Classification
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 14px', borderRadius: '8px', background: `${pls.threatColor}15`, border: `1px solid ${pls.threatColor}35`, marginBottom: '0.75rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: pls.threatColor, flexShrink: 0, boxShadow: `0 0 6px ${pls.threatColor}` }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.74rem', fontWeight: 700, color: pls.threatColor }}>
                {pls.threatTag}
              </span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: 'var(--muted2)', lineHeight: 1.55, marginBottom: '0.75rem' }}>
              {pls.threatDescription}
            </p>

            <FlagRow label="Incognito / Private Mode"
              value={signals.privacy.incognito}
              yesColor="var(--warn)" noColor="var(--accent)"
              detail={signals.privacy.incognito ? `Method: ${signals.privacy.incognitoMethod}` : undefined} />

            <FlagRow label="VPN Detected"
              value={n.isVPN}
              yesColor="var(--warn)" noColor="var(--accent)"
              detail={n.isVPN ? n.vpnReason : undefined} />

            <FlagRow label="Proxy Detected"
              value={n.isProxy}
              yesColor="var(--danger)" noColor="var(--accent)" />

            <FlagRow label="Tor Exit Node"
              value={n.isTor}
              yesColor="var(--danger)" noColor="var(--accent)" />

            <FlagRow label="Ad Blocker Active"
              value={signals.privacy.adBlocker}
              yesText="ACTIVE" noText="NONE"
              yesColor="var(--accent)" noColor="var(--muted2)" />

            <FlagRow label="WebRTC IP Leak"
              value={signals.webrtc.leaked}
              yesColor="var(--danger)" noColor="var(--accent)"
              detail={signals.webrtc.leaked
                ? `Leaked IP via STUN: ${signals.webrtc.publicIp || signals.webrtc.localIp}`
                : undefined} />

            <FlagRow label="Canvas Blocked"
              value={signals.canvas.blocked}
              yesText="BLOCKED" noText="EXPOSED"
              yesColor="var(--accent)" noColor="var(--muted2)" />

            <FlagRow label="Browser Automation"
              value={signals.privacy.webdriver}
              yesText="DETECTED" noText="HUMAN"
              yesColor="var(--danger)" noColor="var(--accent)" />
          </div>

          {/* Fingerprint ID */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Fingerprint ID
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.9rem', color: 'var(--accent3)', letterSpacing: '0.05em' }}>
              {fingerprintId}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'var(--muted)', marginTop: '4px' }}>
              Stable across cookie clears, incognito & browser restarts
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Network Intelligence ──────────────────────────────── */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
          Network Intelligence
          {!n.apiAvailable && (
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 400, color: 'var(--warn)', marginLeft: '12px' }}>
              ⚠ IP API unavailable — check connection
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
          <DataCard label="Your IP"           value={n.ip || 'unavailable'}        accent={n.ip ? 'var(--accent)' : 'var(--muted)'} />
          <DataCard label="Country"           value={n.country || '—'} />
          <DataCard label="City"              value={n.city || '—'} />
          <DataCard label="Region"            value={n.region || '—'} />
          <DataCard label="ISP / Org"         value={n.isp || '—'} />
          <DataCard label="IP Timezone"       value={n.ipTimezone || '—'} />
          <DataCard label="Browser Timezone"  value={n.browserTimezone} />
          <DataCard
            label="TZ Match"
            value={n.apiAvailable ? (n.timezoneMatch ? '✓ Match' : '⚠ Mismatch') : 'n/a'}
            accent={!n.apiAvailable ? 'var(--muted)' : n.timezoneMatch ? 'var(--accent)' : 'var(--warn)'} />
          <DataCard label="EU Visitor"        value={n.isEU ? 'Yes (GDPR applies)' : 'No'} />
          <DataCard
            label="Threat Score"
            value={n.apiAvailable ? `${n.threatScore} / 100` : 'key not set'}
            accent={n.threatScore > 50 ? 'var(--danger)' : n.threatScore > 20 ? 'var(--warn)' : 'var(--accent)'} />
        </div>
      </div>

      {/* ── Row 3: Signal Breakdown ───────────────────────────────────── */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
          Signal Breakdown
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
          {pls.breakdown.map(item => (
            <div key={item.name} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', borderRadius: '8px',
              background: item.active ? 'rgba(0,255,180,0.05)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${item.active ? 'rgba(0,255,180,0.15)' : 'rgba(255,255,255,0.04)'}`,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: item.active ? 'var(--accent)' : 'var(--muted)', boxShadow: item.active ? '0 0 6px rgba(0,255,180,0.5)' : 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 500, color: item.active ? 'var(--text)' : 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.description}
                </div>
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', flexShrink: 0, color: item.active ? 'var(--accent)' : 'var(--muted)' }}>
                {item.active ? `+${item.points}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 4: Device Signals ─────────────────────────────────────── */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
          Device & Browser Signals
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
          <DataCard label="Platform"    value={signals.navigator.platform || '—'} />
          <DataCard label="CPU Cores"   value={signals.navigator.hardwareConcurrency ? `${signals.navigator.hardwareConcurrency} cores` : '—'} />
          <DataCard label="RAM"         value={signals.navigator.deviceMemory ? `${signals.navigator.deviceMemory} GB` : '—'} />
          <DataCard label="Screen"      value={`${signals.screen.width}×${signals.screen.height}`} />
          <DataCard label="Pixel Ratio" value={`${signals.screen.pixelRatio}×`} />
          <DataCard label="Color Depth" value={`${signals.screen.colorDepth}-bit`} />
          <DataCard label="Touch Points" value={`${signals.navigator.maxTouchPoints}`} />
          <DataCard label="Language"    value={signals.navigator.language} />
          <DataCard label="GPU Vendor"  value={signals.webgl.vendor.substring(0, 24)} />
          <DataCard label="GPU Renderer" value={signals.webgl.renderer.substring(0, 24)} />
          <DataCard label="Fonts Found" value={`${signals.fonts.length} detected`} />
          <DataCard label="Plugins"     value={`${signals.plugins.length} found`} />
        </div>

        {/* Font list toggle */}
        {signals.fonts.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => setShowFonts(f => !f)}
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.71rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {showFonts ? '▲ Hide' : '▼ Show'} {signals.fonts.length} detected fonts
            </button>
            {showFonts && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
                {signals.fonts.map(f => (
                  <span key={f} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', padding: '3px 10px', background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.2)', borderRadius: '20px', color: 'var(--accent2)' }}>
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Row 5: Privacy Advice ────────────────────────────────────── */}
      <div style={{ background: 'rgba(123,79,255,0.07)', border: '1px solid rgba(123,79,255,0.22)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent3)', marginBottom: '0.75rem' }}>
          Privacy Recommendations
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {advice.map((a, i) => (
            <li key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.88rem', color: 'var(--text)', display: 'flex', gap: '8px', lineHeight: 1.55 }}>
              <span style={{ color: 'var(--accent3)', flexShrink: 0 }}>→</span>
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onReset}
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', fontWeight: 700, padding: '12px 28px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text)', cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)' }}>
          ↺ Scan Again
        </button>
        <button
          onClick={() => {
            const lines = [
              `FingerprintIQ Scan Results`,
              `Score: ${pls.score}/100 — ${pls.tier}`,
              `Threat: ${pls.threatTag}`,
              `IP: ${n.ip || 'unknown'} · ${n.city}, ${n.country}`,
              `VPN: ${n.isVPN ? 'Detected' : 'Not detected'}`,
              `Incognito: ${signals.privacy.incognito ? 'Yes' : 'No'}`,
              `WebRTC Leak: ${signals.webrtc.leaked ? 'YES — ' + signals.webrtc.publicIp : 'No'}`,
              `Fingerprint ID: ${fingerprintId}`,
            ]
            navigator.clipboard?.writeText(lines.join('\n'))
          }}
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', fontWeight: 700, padding: '12px 28px', borderRadius: '6px', background: 'var(--accent)', border: 'none', color: '#050810', cursor: 'pointer', letterSpacing: '0.04em', transition: 'opacity 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
          Copy Full Report
        </button>
        <button
          disabled={downloading}
          onClick={async () => {
            if (!reportRef.current || downloading) return
            setDownloading(true)
            try {
              const html2canvas = (await import('html2canvas')).default
              const { jsPDF } = await import('jspdf')
              const canvas = await html2canvas(reportRef.current, { backgroundColor: '#050810', scale: 2 })
              const imgData = canvas.toDataURL('image/png')
              const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
              const pdfW = pdf.internal.pageSize.getWidth()
              const pdfH = (canvas.height * pdfW) / canvas.width
              
              // If height exceeds page, it will overflow natively in a simple PDF, 
              // but for this length it should just fit or naturally extend.
              pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
              pdf.save(`FingerprintIQ_${fingerprintId.substring(0,8)}.pdf`)
            } catch (err) {
              console.error('Failed to generate PDF:', err)
            } finally {
              setDownloading(false)
            }
          }}
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', fontWeight: 700, padding: '12px 28px', borderRadius: '6px', background: 'transparent', border: '1px solid var(--accent3)', color: 'var(--accent3)', flexShrink: 0, cursor: downloading ? 'wait' : 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent3)'; e.currentTarget.style.color = '#050810' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent3)' }}>
          {downloading ? 'Generating...' : '↓ Download PDF'}
        </button>
      </div>
    </div>
  )
}
