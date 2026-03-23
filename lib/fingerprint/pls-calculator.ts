import type { FingerprintSignals } from './collector'

export type PLSTier = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL'

export interface PLSBreakdownItem {
  name: string
  points: number
  active: boolean
  description: string
}

export interface PLSResult {
  score: number
  tier: PLSTier
  color: string
  bgColor: string
  breakdown: PLSBreakdownItem[]
  threatTag: string
  threatColor: string
  threatDescription: string
}

export function calculatePLS(s: FingerprintSignals): PLSResult {
  const items: PLSBreakdownItem[] = [
    {
      name: 'Canvas Fingerprint',
      points: 14,
      active: !s.canvas.blocked,
      description: s.canvas.blocked
        ? 'Blocked by privacy tool'
        : `Hash: ${s.canvas.hash.substring(0, 14)}…`,
    },
    {
      name: 'WebGL Renderer',
      points: 12,
      active: !s.webgl.blocked,
      description: s.webgl.blocked ? 'Blocked' : s.webgl.renderer.substring(0, 44),
    },
    {
      name: 'Audio Context',
      points: 10,
      active: !s.audio.blocked,
      description: s.audio.blocked
        ? 'Blocked / silent'
        : `Hash: ${s.audio.hash.substring(0, 14)}…`,
    },
    {
      name: 'WebRTC IP Leak',
      points: 10,
      active: s.webrtc.leaked,
      description: s.webrtc.leaked
        ? `Public IP exposed: ${s.webrtc.publicIp || s.webrtc.localIp}`
        : 'No leak detected',
    },
    {
      name: 'Hardware Fingerprint',
      points: 8,
      active: s.navigator.hardwareConcurrency > 0 || s.navigator.deviceMemory > 0,
      description: `${s.navigator.hardwareConcurrency || '?'} CPU cores · ${s.navigator.deviceMemory || '?'} GB RAM`,
    },
    {
      name: 'Font Detection',
      points: 8,
      active: s.fonts.length > 3,
      description: `${s.fonts.length} fonts identified`,
    },
    {
      name: 'Screen Resolution',
      points: 6,
      active: s.screen.width > 0,
      description: `${s.screen.width}×${s.screen.height} @ ${s.screen.pixelRatio}× DPR`,
    },
    {
      name: 'Timezone',
      points: 6,
      active: !!s.timezone.zone && s.timezone.zone !== 'unknown',
      description: s.timezone.zone || 'unknown',
    },
    {
      name: 'Language & Locale',
      points: 5,
      active: s.navigator.languages.length > 0,
      description: s.navigator.languages.slice(0, 3).join(', '),
    },
    {
      name: 'Platform String',
      points: 5,
      active: !!s.navigator.platform,
      description: s.navigator.platform || 'unknown',
    },
    {
      name: 'Plugin List',
      points: 4,
      active: s.plugins.length > 0,
      description: `${s.plugins.length} plugin(s) detected`,
    },
    {
      name: 'Color Depth',
      points: 4,
      active: s.screen.colorDepth > 0,
      description: `${s.screen.colorDepth}-bit`,
    },
  ]

  let score = items
    .filter(i => i.active)
    .reduce((sum, i) => sum + i.points, 0)

  // Protective measures reduce score
  if (s.privacy.adBlocker) score = Math.max(0, score - 4)
  score = Math.min(100, Math.max(0, score))

  const tier: PLSTier =
    score >= 80 ? 'CRITICAL' :
    score >= 60 ? 'HIGH' :
    score >= 40 ? 'ELEVATED' :
    score >= 20 ? 'MODERATE' : 'LOW'

  const colors: Record<PLSTier, string> = {
    LOW:      '#00ffb4',
    MODERATE: '#ffd700',
    ELEVATED: '#ff9500',
    HIGH:     '#ff4444',
    CRITICAL: '#ff0066',
  }
  const bgColors: Record<PLSTier, string> = {
    LOW:      'rgba(0,255,180,0.1)',
    MODERATE: 'rgba(255,215,0,0.1)',
    ELEVATED: 'rgba(255,149,0,0.1)',
    HIGH:     'rgba(255,68,68,0.1)',
    CRITICAL: 'rgba(255,0,102,0.1)',
  }

  // ── Threat classification (priority order) ────────────────────────────────
  let threatTag = 'HUMAN_VERIFIED'
  let threatColor = '#00ffb4'
  let threatDescription = 'Normal human browser session. No threats detected.'

  if (s.privacy.webdriver) {
    threatTag = 'BOT DETECTED'
    threatColor = '#ff4444'
    threatDescription = 'navigator.webdriver = true — browser automation tool detected (Selenium / Playwright / Puppeteer)'
  } else if (s.network.isTor) {
    threatTag = 'TOR EXIT NODE'
    threatColor = '#ff0066'
    threatDescription = 'Connection originates from a Tor exit node'
  } else if (s.network.isProxy && s.network.isVPN) {
    threatTag = 'VPN + PROXY'
    threatColor = '#ff6b35'
    threatDescription = s.network.vpnReason
  } else if (s.network.isProxy) {
    threatTag = 'PROXY DETECTED'
    threatColor = '#ff6b35'
    threatDescription = s.network.vpnReason
  } else if (s.network.isVPN) {
    threatTag = 'VPN DETECTED'
    threatColor = '#ff9500'
    threatDescription = s.network.vpnReason
  } else if (!s.network.timezoneMatch && s.network.ipTimezone) {
    threatTag = 'TIMEZONE MISMATCH'
    threatColor = '#ffd700'
    threatDescription = `IP timezone: ${s.network.ipTimezone} · Browser timezone: ${s.network.browserTimezone}`
  } else if (s.privacy.incognito) {
    threatTag = 'INCOGNITO MODE'
    threatColor = '#ffd700'
    threatDescription = `Private browsing detected (${s.privacy.incognitoMethod}). Your fingerprint is still fully active.`
  } else if (s.canvas.blocked || score < 15) {
    threatTag = 'PRIVACY TOOL'
    threatColor = '#00c8ff'
    threatDescription = 'Canvas blocked or very low score — Brave browser or a privacy extension is active'
  } else if (s.webrtc.leaked) {
    threatTag = 'IP LEAK'
    threatColor = '#ff6b35'
    threatDescription = `Real public IP exposed via WebRTC STUN: ${s.webrtc.publicIp}`
  }

  return {
    score, tier,
    color: colors[tier],
    bgColor: bgColors[tier],
    breakdown: items,
    threatTag,
    threatColor,
    threatDescription,
  }
}
