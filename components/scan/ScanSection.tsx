'use client'
import { useScan } from '@/hooks/useScan'
import ScanIdle from './ScanIdle'
import ScanProgress from './ScanProgress'
import ScanResults from './ScanResults'

export default function ScanSection() {
  const scanData = useScan()

  return (
    <section id="scan" style={{ padding: '6rem 2.5rem', background: 'var(--bg2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="section-fade" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            ◈ Live Browser Scanner
          </div>
          <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            What Does Your Browser Leak?
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', color: 'var(--muted2)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            Click the button below. In 8 seconds you'll see every signal your browser
            broadcasts — and a score for how trackable you are.
          </p>
        </div>

        {/* Scanner */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {scanData.state === 'IDLE' && <ScanIdle onStart={scanData.startScan} />}
          {scanData.state === 'SCANNING' && <ScanProgress steps={scanData.completedSteps} currentStep={scanData.currentStep} />}
          {scanData.state === 'RESULTS' && scanData.signals && scanData.pls && (
            <ScanResults signals={scanData.signals} pls={scanData.pls} fingerprintId={scanData.fingerprintId} onReset={scanData.reset} />
          )}
        </div>
      </div>
    </section>
  )
}
