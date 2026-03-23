'use client'
import { useEffect, useRef, useState } from 'react'

interface GraphNode { id: number; label: string; threat: string; detail: string; x?: number; y?: number; vx?: number; vy?: number; fx?: number | null; fy?: number | null }
interface GraphLink { source: number; target: number; confidence: number }
interface SelectedNode { label: string; threat: string; detail: string; confidence?: number }

const NODES: GraphNode[] = [
  { id: 1, label: 'Session #1', threat: 'clean', detail: 'Chrome · Kolkata · PLS 68' },
  { id: 2, label: 'Session #2', threat: 'incognito', detail: 'Chrome Incognito · Delhi · PLS 65' },
  { id: 3, label: 'Session #3', threat: 'clean', detail: 'Mobile Safari · Mumbai · PLS 71' },
  { id: 4, label: 'Session #4', threat: 'bot', detail: 'Headless Chrome · AWS · PLS 22' },
  { id: 5, label: 'Session #5', threat: 'fraud', detail: 'Firefox · VPN · Known fraud fp' },
  { id: 6, label: 'Session #6', threat: 'clean', detail: 'Edge · Pune · PLS 74' },
]

const LINKS: GraphLink[] = [
  { source: 1, target: 2, confidence: 0.92 },
  { source: 1, target: 3, confidence: 0.84 },
  { source: 1, target: 6, confidence: 0.71 },
  { source: 4, target: 5, confidence: 0.58 },
]

const threatColor = (t: string) => ({
  clean: '#00ffb4', incognito: '#ffd700', bot: '#ff4444', fraud: '#ff0066',
}[t] || '#64748b')

export default function IdentityGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selected, setSelected] = useState<SelectedNode | null>(null)
  const [d3Loaded, setD3Loaded] = useState(false)
  const simRef = useRef<unknown>(null)

  useEffect(() => {
    let cancelled = false
    import('d3').then(d3 => {
      if (cancelled || !svgRef.current) return
      setD3Loaded(true)
      const svg = d3.select(svgRef.current)
      const W = svgRef.current.clientWidth || 600
      const H = 380

      svg.selectAll('*').remove()

      const nodes: GraphNode[] = NODES.map(n => ({ ...n }))
      const links = LINKS.map(l => ({ ...l }))

      const sim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d: unknown) => (d as GraphNode).id).distance(120).strength(0.6))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(W / 2, H / 2))
        .force('collision', d3.forceCollide(40))

      simRef.current = sim

      // Links
      const link = svg.append('g').selectAll('line').data(links).enter().append('line')
        .attr('stroke', 'rgba(0,255,180,0.35)')
        .attr('stroke-width', (d: GraphLink) => d.confidence * 5)
        .attr('stroke-dasharray', (d: GraphLink) => d.confidence > 0.8 ? 'none' : '6 3')

      // Confidence labels on links
      const linkLabel = svg.append('g').selectAll('text').data(links).enter().append('text')
        .attr('font-size', '10px')
        .attr('font-family', 'Space Mono, monospace')
        .attr('fill', 'rgba(0,255,180,0.6)')
        .attr('text-anchor', 'middle')
        .text((d: GraphLink) => `${Math.round(d.confidence * 100)}%`)

      // Node groups
      const node = svg.append('g').selectAll('g').data(nodes).enter().append('g')
        .style('cursor', 'pointer')
        .call(d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
          .on('end', (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
        )
        .on('click', (_event, d: GraphNode) => {
          const linkConf = links.find(l => (l.source as unknown as GraphNode).id === d.id || (l.target as unknown as GraphNode).id === d.id)
          setSelected({ label: d.label, threat: d.threat, detail: d.detail, confidence: linkConf?.confidence })
        })

      // Outer glow ring
      node.append('circle')
        .attr('r', 22)
        .attr('fill', 'none')
        .attr('stroke', (d: GraphNode) => threatColor(d.threat))
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.3)

      // Main circle
      node.append('circle')
        .attr('r', 16)
        .attr('fill', (d: GraphNode) => threatColor(d.threat) + '22')
        .attr('stroke', (d: GraphNode) => threatColor(d.threat))
        .attr('stroke-width', 2)

      // Node labels
      node.append('text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-family', 'Space Mono, monospace')
        .attr('fill', (d: GraphNode) => threatColor(d.threat))
        .text((d: GraphNode) => `#${d.id}`)

      node.append('text')
        .attr('dy', '2.8em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-family', 'DM Sans, sans-serif')
        .attr('fill', 'rgba(148,163,184,0.8)')
        .text((d: GraphNode) => d.label)

      sim.on('tick', () => {
        link
          .attr('x1', (d: unknown) => ((d as {source: GraphNode}).source.x ?? 0))
          .attr('y1', (d: unknown) => ((d as {source: GraphNode}).source.y ?? 0))
          .attr('x2', (d: unknown) => ((d as {target: GraphNode}).target.x ?? 0))
          .attr('y2', (d: unknown) => ((d as {target: GraphNode}).target.y ?? 0))

        linkLabel
          .attr('x', (d: unknown) => (((d as {source: GraphNode}).source.x ?? 0) + ((d as {target: GraphNode}).target.x ?? 0)) / 2)
          .attr('y', (d: unknown) => (((d as {source: GraphNode}).source.y ?? 0) + ((d as {target: GraphNode}).target.y ?? 0)) / 2 - 6)

        node.attr('transform', (d: GraphNode) => `translate(${d.x ?? 0},${d.y ?? 0})`)
      })
    })
    return () => { cancelled = true }
  }, [])

  return (
    <section id="graph" style={{ padding: '6rem 2.5rem', background: 'var(--bg2)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-fade" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            ◈ Adaptive Identity Graph
          </div>
          <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            One Person. Six Sessions.
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', color: 'var(--muted2)', maxWidth: '560px', margin: '0 auto' }}>
            Sessions linked across browsers, devices, and incognito — without a single cookie.
            Click any node to inspect it. Drag to rearrange.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          {/* Graph */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
            {!d3Loaded && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', color: 'var(--muted)' }}>Loading graph...</span>
              </div>
            )}
            <svg ref={svgRef} width="100%" height="380" />
          </div>

          {/* Legend + detail panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Legend */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Legend</div>
              {[
                { color: '#00ffb4', label: 'Human verified session' },
                { color: '#ffd700', label: 'Incognito / privacy tool' },
                { color: '#ff4444', label: 'Bot / automation detected' },
                { color: '#ff0066', label: 'Fraud risk fingerprint' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'var(--muted2)' }}>{label}</span>
                </div>
              ))}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: 'var(--muted)' }}>
                Line thickness = match confidence
              </div>
            </div>

            {/* Selected node detail */}
            {selected ? (
              <div style={{ background: 'var(--panel)', border: `1px solid ${threatColor(selected.threat)}40`, borderRadius: '12px', padding: '1.25rem', transition: 'all 0.3s' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Session Detail</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: threatColor(selected.threat), boxShadow: `0 0 8px ${threatColor(selected.threat)}` }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.88rem', fontWeight: 700, color: threatColor(selected.threat) }}>{selected.label}</span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.5rem' }}>{selected.detail}</p>
                {selected.confidence && (
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', color: 'var(--accent)' }}>Match: {Math.round(selected.confidence * 100)}% confidence</p>
                )}
                <button onClick={() => setSelected(null)} style={{ marginTop: '0.75rem', fontFamily: "'Space Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕ close</button>
              </div>
            ) : (
              <div style={{ background: 'rgba(0,255,180,0.04)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: 'var(--muted2)', lineHeight: 1.65 }}>
                  <strong style={{ color: 'var(--accent)' }}>Sessions 1, 2, 3 & 6</strong> all belong to the same person — Chrome, incognito, mobile, and Edge sessions linked by canvas + audio + font signals.
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
                  Click any node to inspect it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
