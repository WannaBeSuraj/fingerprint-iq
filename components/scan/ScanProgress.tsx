'use client'
import { useEffect, useState } from 'react'

export default function ScanProgress({ steps, currentStep }: { steps: string[]; currentStep: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const total = 12
    setProgress(Math.min(95, Math.round((steps.length / total) * 100)))
  }, [steps])

  const circumference = 2 * Math.PI * 70
  const offset = circumference - (progress / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', padding: '2rem' }}>
      {/* Ring */}
      <div style={{ position: 'relative', width: '180px', height: '180px' }}>
        <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(0,255,180,0.1)" strokeWidth="6" />
          <circle
            cx="90" cy="90" r="70"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease', filter: 'drop-shadow(0 0 6px rgba(0,255,180,0.6))' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
            {progress}%
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: 'var(--muted2)' }}>
            scanning
          </span>
        </div>
      </div>

      {/* Current step */}
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.82rem', color: 'var(--accent2)', textAlign: 'center', minHeight: '24px' }}>
        {currentStep && `> ${currentStep}`}
        <span className="cursor" style={{ color: 'var(--accent)' }}>_</span>
      </div>

      {/* Completed steps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem', maxWidth: '500px', width: '100%' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0, animation: `fadeInUp 0.3s ease ${i * 0.05}s forwards` }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.7rem', flexShrink: 0 }}>✓</span>
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}
