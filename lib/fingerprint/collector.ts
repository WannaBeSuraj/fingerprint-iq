// FingerprintIQ — Signal Collector
// IP Geolocation : ipwho.is → ipapi.co → freeipapi.com (fallback chain, no key)
// VPN/Proxy      : ipdata.co (NEXT_PUBLIC_IPDATA_KEY env var)
// Raw IP backup  : api.ipify.org (no key)

export interface NetworkInfo {
  ip: string
  country: string
  countryCode: string
  city: string
  region: string
  isp: string
  isEU: boolean
  ipTimezone: string
  browserTimezone: string
  timezoneMatch: boolean
  isVPN: boolean
  isProxy: boolean
  isDatacenter: boolean
  isTor: boolean
  threatScore: number
  vpnReason: string
  apiAvailable: boolean
}

export interface FingerprintSignals {
  canvas:    { hash: string; blocked: boolean }
  webgl:     { vendor: string; renderer: string; blocked: boolean }
  audio:     { hash: string; blocked: boolean }
  navigator: {
    userAgent: string; platform: string; language: string
    languages: string[]; hardwareConcurrency: number
    deviceMemory: number; maxTouchPoints: number
    cookieEnabled: boolean; doNotTrack: string | null
  }
  screen: {
    width: number; height: number; availWidth: number
    availHeight: number; colorDepth: number; pixelRatio: number
  }
  timezone:   { zone: string; offset: number }
  fonts:      string[]
  plugins:    string[]
  connection: { effectiveType: string; downlink: number; rtt: number } | null
  privacy: {
    incognito: boolean; incognitoMethod: string
    canvasBlocked: boolean; adBlocker: boolean
    webdriver: boolean; touchDevice: boolean; doNotTrack: boolean
  }
  network:    NetworkInfo
  webrtc: { leaked: boolean; localIp: string; publicIp: string }
}

async function sha256(str: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    let h = 5381
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i)
    return (h >>> 0).toString(16).padStart(8, '0').repeat(4)
  }
}

async function getCanvas(): Promise<{ hash: string; blocked: boolean }> {
  try {
    const c = document.createElement('canvas')
    c.width = 300; c.height = 150
    const ctx = c.getContext('2d')
    if (!ctx) return { hash: 'ctx_unavailable', blocked: true }
    ctx.textBaseline = 'top'; ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'; ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'; ctx.fillText('FingerprintIQ 1.0', 2, 15)
    ctx.fillStyle = 'rgba(102,204,0,0.7)'; ctx.fillText('FingerprintIQ 1.0', 4, 17)
    ctx.beginPath(); ctx.arc(50, 50, 25, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,0,0,0.5)'; ctx.fill()
    const url = c.toDataURL()
    if (!url || url === 'data:,' || url.length < 200) return { hash: 'blocked_blank', blocked: true }
    return { hash: await sha256(url), blocked: false }
  } catch { return { hash: 'blocked_error', blocked: true } }
}

function getWebGL(): { vendor: string; renderer: string; blocked: boolean } {
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl') || c.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return { vendor: 'unavailable', renderer: 'unavailable', blocked: true }
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    return {
      vendor:   (ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)   : gl.getParameter(gl.VENDOR))   || 'unknown',
      renderer: (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) || 'unknown',
      blocked: false,
    }
  } catch { return { vendor: 'blocked', renderer: 'blocked', blocked: true } }
}

async function getAudio(): Promise<{ hash: string; blocked: boolean }> {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return { hash: 'unavailable', blocked: true }
    const ctx = new AC(); const osc = ctx.createOscillator()
    const analyser = ctx.createAnalyser(); const gain = ctx.createGain()
    gain.gain.value = 0
    osc.connect(analyser); analyser.connect(gain); gain.connect(ctx.destination)
    osc.start(0)
    const data = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(data)
    osc.stop(); await ctx.close()
    const finite = data.filter(v => isFinite(v))
    if (finite.length === 0) return { hash: 'blocked_silent', blocked: true }
    const sum = finite.slice(0, 50).reduce((a, b) => a + Math.abs(b), 0)
    return { hash: await sha256(sum.toFixed(10)), blocked: false }
  } catch { return { hash: 'blocked_error', blocked: true } }
}

// Uses detectincognitojs — the only library that actually works across Chrome/Firefox/Safari in 2025
// Supports Chrome 50-137, Firefox 44-138, Safari ≤18.4, Edge, Opera
async function detectIncognito(): Promise<{ detected: boolean; method: string }> {
  try {
    const { detectIncognito: detect } = await import('detectincognitojs')
    const result = await detect()
    return { detected: result.isPrivate, method: result.browserName ?? 'unknown' }
  } catch {
    try {
      const est = await navigator.storage?.estimate()
      if (est?.quota && est.quota < 120_000_000) return { detected: true, method: 'storage_quota_fallback' }
    } catch { /* not available */ }
    return { detected: false, method: 'detection_unavailable' }
  }
}

async function detectAdBlocker(): Promise<boolean> {
  try {
    const bait = document.createElement('div')
    bait.setAttribute('id', 'google_ads_iframe_0')
    bait.className = 'adsbox pub_300x250 ad-placement advertisement'
    bait.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:300px;height:250px;pointer-events:none;'
    document.body.appendChild(bait)
    await new Promise(r => setTimeout(r, 200))
    const s = window.getComputedStyle(bait)
    const blocked = bait.offsetHeight === 0 || bait.offsetWidth === 0 ||
      s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0'
    document.body.removeChild(bait)
    return blocked
  } catch { return false }
}

async function detectWebRTC(): Promise<{ leaked: boolean; localIp: string; publicIp: string }> {
  return new Promise(resolve => {
    try {
      if (!window.RTCPeerConnection) { resolve({ leaked: false, localIp: '', publicIp: '' }); return }
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
      pc.createDataChannel('')
      const localIps: string[] = []; const publicIps: string[] = []
      const finish = () => { try { pc.close() } catch { /* */ }; resolve({ leaked: publicIps.length > 0, localIp: localIps[0] || '', publicIp: publicIps[0] || '' }) }
      const timeout = setTimeout(finish, 5000)
      pc.onicecandidate = e => {
        if (!e.candidate) return
        const m = /([0-9]{1,3}(?:\.[0-9]{1,3}){3})/.exec(e.candidate.candidate)
        if (!m) return
        const ip = m[1]
        if (e.candidate.type === 'host' && !localIps.includes(ip)) localIps.push(ip)
        if (e.candidate.type === 'srflx' && !publicIps.includes(ip)) { publicIps.push(ip); clearTimeout(timeout); finish() }
      }
      pc.createOffer().then(o => pc.setLocalDescription(o)).catch(() => { clearTimeout(timeout); finish() })
    } catch { resolve({ leaked: false, localIp: '', publicIp: '' }) }
  })
}

interface GeoResult { ip: string; country: string; countryCode: string; city: string; region: string; isp: string; isEU: boolean; timezone: string; success: boolean }
const GEO_EMPTY: GeoResult = { ip: '', country: '', countryCode: '', city: '', region: '', isp: '', isEU: false, timezone: '', success: false }

async function tryIPWhoIs(): Promise<GeoResult> {
  const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('ipwho.is not ok')
  const d = await res.json()
  if (!d.success || !d.ip) throw new Error('bad payload')
  return { ip: d.ip || '', country: d.country || '', countryCode: d.country_code || '', city: d.city || '', region: d.region || '', isp: d.connection?.isp || d.org || '', isEU: d.is_eu === true, timezone: d.timezone?.id || '', success: true }
}

async function tryIPAPI(): Promise<GeoResult> {
  const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('ipapi.co not ok')
  const d = await res.json()
  if (!d.ip) throw new Error('bad payload')
  return { ip: d.ip || '', country: d.country_name || '', countryCode: d.country_code || '', city: d.city || '', region: d.region || '', isp: d.org || '', isEU: d.in_eu === true, timezone: d.timezone || '', success: true }
}

async function tryFreeIPAPI(): Promise<GeoResult> {
  const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('freeipapi not ok')
  const d = await res.json()
  if (!d.ipAddress) throw new Error('bad payload')
  return { ip: d.ipAddress || '', country: d.countryName || '', countryCode: d.countryCode || '', city: d.cityName || '', region: d.regionName || '', isp: '', isEU: false, timezone: d.timeZone || '', success: true }
}

async function tryIPData(): Promise<GeoResult> {
  const key = process.env.NEXT_PUBLIC_IPDATA_KEY
  if (!key || key === 'YOUR_KEY_HERE') throw new Error('No IPData key')
  const res = await fetch(`https://api.ipdata.co?api-key=${key}`, { signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('ipdata not ok')
  const d = await res.json()
  if (!d.ip) throw new Error('bad payload')
  return { ip: d.ip || '', country: d.country_name || '', countryCode: d.country_code || '', city: d.city || '', region: d.region || '', isp: d.asn?.name || '', isEU: d.is_eu === true, timezone: d.time_zone?.name || '', success: true }
}

async function fetchIPGeo(): Promise<GeoResult> {
  for (const attempt of [tryIPData, tryIPWhoIs, tryIPAPI, tryFreeIPAPI]) {
    try { const r = await attempt(); if (r.success && r.ip) return r } catch { continue }
  }
  return GEO_EMPTY
}

async function fetchThreat(ip: string): Promise<{ isVPN: boolean; isProxy: boolean; isDatacenter: boolean; isTor: boolean; available: boolean }> {
  const none = { isVPN: false, isProxy: false, isDatacenter: false, isTor: false, available: false }
  const key = process.env.NEXT_PUBLIC_IPDATA_KEY
  if (!key || key === 'YOUR_KEY_HERE' || !ip) return none
  try {
    const res = await fetch(`https://api.ipdata.co/${ip}?api-key=${key}&fields=is_datacenter,threat`, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return none
    const d = await res.json()
    return { isVPN: d.threat?.is_vpn === true, isProxy: d.threat?.is_proxy === true, isDatacenter: d.is_datacenter === true || d.threat?.is_datacenter === true, isTor: d.threat?.is_tor === true, available: true }
  } catch { return none }
}

async function getNetworkInfo(): Promise<NetworkInfo> {
  const browserTZ = Intl.DateTimeFormat().resolvedOptions().timeZone
  const [geo, rawIp] = await Promise.all([
    fetchIPGeo(),
    fetch('https://api.ipify.org?format=text', { signal: AbortSignal.timeout(4000) }).then(r => r.text()).catch(() => ''),
  ])
  const resolvedIP = (geo.success && geo.ip) ? geo.ip : (rawIp?.trim() || '')
  const threat = resolvedIP ? await fetchThreat(resolvedIP) : { isVPN: false, isProxy: false, isDatacenter: false, isTor: false, available: false }
  const ipTZ = geo.timezone
  const tzMatch = ipTZ === browserTZ || ipTZ.split('/')[0] === browserTZ.split('/')[0]
  const reasons: string[] = []
  if (threat.isVPN)          reasons.push('IP flagged as VPN endpoint')
  if (threat.isProxy)        reasons.push('IP flagged as proxy server')
  if (threat.isDatacenter)   reasons.push('IP belongs to a datacenter / hosting ASN')
  if (threat.isTor)          reasons.push('IP is a Tor exit node')
  if (!tzMatch && ipTZ && browserTZ) reasons.push(`Timezone mismatch — IP: ${ipTZ}, Browser: ${browserTZ}`)
  let tScore = 0
  if (threat.isVPN) tScore += 40; if (threat.isProxy) tScore += 35
  if (threat.isDatacenter) tScore += 25; if (threat.isTor) tScore += 50
  if (!tzMatch && ipTZ) tScore += 20
  return {
    ip: resolvedIP, country: geo.country || '', countryCode: geo.countryCode || '',
    city: geo.city || '', region: geo.region || '', isp: geo.isp || '', isEU: geo.isEU,
    ipTimezone: ipTZ || '', browserTimezone: browserTZ, timezoneMatch: tzMatch,
    isVPN: threat.isVPN || threat.isDatacenter || (!tzMatch && !!ipTZ && !!browserTZ),
    isProxy: threat.isProxy, isDatacenter: threat.isDatacenter, isTor: threat.isTor,
    threatScore: Math.min(100, tScore), vpnReason: reasons.join(' · ') || 'none',
    apiAvailable: !!(geo.success || resolvedIP),
  }
}

function detectFonts(): string[] {
  const list = ['Arial','Arial Black','Calibri','Cambria','Comic Sans MS','Courier New','Georgia','Helvetica','Impact','Lucida Console','Lucida Sans Unicode','Microsoft Sans Serif','Palatino Linotype','Segoe UI','Tahoma','Times New Roman','Trebuchet MS','Verdana','Gill Sans','Optima','Futura','Garamond','Didot','Rockwell','Baskerville','Copperplate','Apple Chancery','Bradley Hand','Brush Script MT','Marker Felt','American Typewriter','Andale Mono','Menlo','Monaco','Consolas','Fira Code','JetBrains Mono','Noto Sans','Roboto','Open Sans','Lato','Montserrat','Ubuntu','Droid Sans','Source Code Pro']
  const c = document.createElement('canvas'); const ctx = c.getContext('2d')
  if (!ctx) return []
  const TEST = 'mmmmmmmmmmlli'; const SIZE = '72px'
  const bases = ['monospace', 'sans-serif', 'serif']
  const bw = bases.map(b => { ctx.font = `${SIZE} ${b}`; return ctx.measureText(TEST).width })
  return list.filter(font => bases.some((b, i) => { ctx.font = `${SIZE} '${font}',${b}`; return ctx.measureText(TEST).width !== bw[i] }))
}

export async function collectSignals(onProgress?: (step: string) => void): Promise<FingerprintSignals> {
  const p = (s: string) => onProgress?.(s)
  p('Canvas fingerprint');       const canvas  = await getCanvas()
  p('WebGL renderer');           const webgl   = getWebGL()
  p('Audio context');            const audio   = await getAudio()
  p('Navigator & hardware')
  const connNav = (navigator as unknown as { connection?: { effectiveType: string; downlink: number; rtt: number } }).connection
  const nav = { userAgent: navigator.userAgent, platform: navigator.platform, language: navigator.language, languages: Array.from(navigator.languages || [navigator.language]), hardwareConcurrency: navigator.hardwareConcurrency || 0, deviceMemory: (navigator as unknown as { deviceMemory?: number }).deviceMemory || 0, maxTouchPoints: navigator.maxTouchPoints || 0, cookieEnabled: navigator.cookieEnabled, doNotTrack: navigator.doNotTrack }
  p('Screen & display')
  const scr = { width: screen.width, height: screen.height, availWidth: screen.availWidth, availHeight: screen.availHeight, colorDepth: screen.colorDepth, pixelRatio: window.devicePixelRatio || 1 }
  p('Timezone');                 const tz = { zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown', offset: new Date().getTimezoneOffset() }
  p('Font detection');           const fonts = detectFonts()
  p('Plugin detection');         const plugins = Array.from(navigator.plugins || []).map(p => p.name).filter(Boolean)
  p('Incognito detection');      const incog = await detectIncognito()
  p('Ad blocker check');         const adBlocker = await detectAdBlocker()
  p('WebRTC leak test');         const webrtc = await detectWebRTC()
  p('Fetching IP & location');   const network = await getNetworkInfo()
  p('Complete!')
  return {
    canvas, webgl, audio, navigator: nav, screen: scr, timezone: tz, fonts, plugins,
    connection: connNav ? { effectiveType: connNav.effectiveType, downlink: connNav.downlink, rtt: connNav.rtt } : null,
    privacy: { incognito: incog.detected, incognitoMethod: incog.method, canvasBlocked: canvas.blocked, adBlocker, webdriver: !!navigator.webdriver, touchDevice: navigator.maxTouchPoints > 0, doNotTrack: navigator.doNotTrack === '1' },
    network, webrtc,
  }
}
