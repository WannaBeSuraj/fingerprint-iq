'use client'
import { useState } from 'react'

const TABS = [
  {
    id: 'security',
    label: 'Security',
    icon: '🛡️',
    headline: 'Stop Bots Before They Reach Your Login',
    color: 'var(--danger)',
    points: [
      'Detect credential stuffing campaigns in real time — same fingerprint hitting 50+ accounts',
      'Identify headless browsers (Puppeteer, Playwright, Selenium) before they scrape your data',
      'Block bot storms via webhook → Cloudflare firewall rule — automated, zero manual effort',
      'Correlate fingerprint IDs with auth logs to catch account takeover attempts instantly',
    ],
    stat: { value: '94%', label: 'Bot detection accuracy' },
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: '⚖️',
    headline: 'Know Your GDPR Exposure Before Your DPA Does',
    color: 'var(--accent3)',
    points: [
      'Audit every fingerprinting signal your site collects — including third-party scripts you forgot about',
      'Get mapped citations: which GDPR articles, CCPA sections, and ePrivacy clauses you\'re at risk for',
      'Discover Meta Pixel, Hotjar, DoubleClick fingerprinting visitors before your consent banner loads',
      'Export audit-ready compliance reports for DPA inquiries in one click',
    ],
    stat: { value: 'GDPR', label: 'Articles 4, 5, 7 coverage' },
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📊',
    headline: 'True Unique Visitors — Not Session Counts',
    color: 'var(--accent2)',
    points: [
      'Deduplicate users across sessions without cookies — get accurate retention metrics post-cookie',
      'Identify returning visitors in incognito mode — your "new user" numbers are probably wrong',
      'Cross-device matching: same person on mobile, tablet, and desktop — one identity',
      'Build accurate A/B test audiences that aren\'t inflated by repeat sessions from the same person',
    ],
    stat: { value: '89%', label: 'Identity resolution rate' },
  },
  {
    id: 'developers',
    label: 'Developers',
    icon: '⚙️',
    headline: 'Raw API Access. Build Anything.',
    color: 'var(--accent)',
    points: [
      'Full REST API — query sessions, fingerprints, clusters, compliance reports programmatically',
      'Webhook events pushed to your endpoint: BOT_CONFIRMED, FRAUD_MATCH, SCRAPER_ACTIVE',
      'JavaScript SDK (8kb) — drop into any site, listen for results, trigger custom logic',
      'OpenAPI 3.1 docs, SDK examples in Node.js and Python, 99.9% uptime SLA on Pro+',
    ],
    stat: { value: '<50ms', label: 'Average API latency' },
  },
  {
    id: 'visitors',
    label: 'Visitors',
    icon: '👤',
    headline: 'See What Every Website Sees About You',
    color: '#ff9500',
    points: [
      'Free browser scan — no account, no signup, just click and see your Privacy Leakage Score',
      'Understand exactly which signals leak and why incognito doesn\'t protect you',
      'Find out if your VPN is actually leaking your real IP via WebRTC',
      'Get personalized advice: which browser + extensions reduce your fingerprint the most',
    ],
    stat: { value: 'Free', label: 'Always and forever' },
  },
]

export default function UseCaseTabs() {
  const [active, setActive] = useState('security')
  const tab = TABS.find(t => t.id === active)!

  return (
    <section id="use-cases" className="py-24 px-5 md:px-10">
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="section-fade" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            ◈ Built For Everyone
          </div>
          <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: 'var(--text)' }}>
            Who Uses FingerprintIQ?
          </h2>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2.5rem', background: 'var(--panel)', padding: '6px', borderRadius: '10px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              flex: '1 1 auto',
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: active === t.id ? 600 : 400,
              padding: '10px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer',
              background: active === t.id ? t.color + '18' : 'transparent',
              color: active === t.id ? t.color : 'var(--muted2)',
              borderBottom: active === t.id ? `2px solid ${t.color}` : '2px solid transparent',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <span style={{ fontSize: '1rem' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div key={active} className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8 items-start" style={{ animation: 'fadeInUp 0.35s ease' }}>
          <div style={{ background: 'var(--panel)', border: `1px solid ${tab.color}25`, borderRadius: '12px', padding: '2.5rem' }}>
            <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: tab.color, marginBottom: '1.5rem', lineHeight: 1.3 }}>
              {tab.headline}
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tab.points.map((p, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: tab.color, fontSize: '0.75rem', marginTop: '4px', flexShrink: 0 }}>◆</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.65 }}>{p}</span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '2rem' }}>
              <a href="#scan" style={{
                fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', fontWeight: 700,
                padding: '12px 24px', borderRadius: '6px', textDecoration: 'none',
                background: tab.color, color: '#050810', letterSpacing: '0.04em',
                display: 'inline-block', transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}>
                Try It Free →
              </a>
            </div>
          </div>

          {/* Stat card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--panel)', border: `1px solid ${tab.color}30`, borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '3rem', fontWeight: 700, color: tab.color, textShadow: `0 0 20px ${tab.color}40`, lineHeight: 1.1, marginBottom: '0.5rem' }}>
                {tab.stat.value}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'var(--muted2)' }}>
                {tab.stat.label}
              </div>
            </div>

            {/* Mini info cards */}
            {[
              { icon: '🔒', text: 'No data stored on our servers' },
              { icon: '⚡', text: 'Results in under 200ms' },
              { icon: '🌍', text: 'Works in every browser' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'var(--muted2)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
