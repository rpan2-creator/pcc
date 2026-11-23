import { useMemo, useState } from 'react'
import { MAP_W, MAP_H, RIVER, DISTRICTS, STREETS, BRIDGES, LANDMARKS, PARKS, CATEGORIES, districtPolygon, riverY } from '../data/city.js'
import { priorityOf, getState } from '../store.js'
import { CAT_ICON } from './ui.jsx'
import { Cross, School, Landmark, Flame } from 'lucide-react'

const LEVEL_COL = { high: '#C4462C', medium: '#D08A22', low: '#3C7A55' }
const riverPath = (off = 0) => 'M' + RIVER.map(([x, y]) => `${x} ${y + off}`).join(' L')
const VX = [120, 262, 402, 540, 690, 830, 940]
const HY = [78, 150, 224, 300, 430, 505, 575]

function rng(seed) { let a = seed; return () => { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296 } }

// Building footprints, generated once, kept out of the river and parks.
function useBlocks() {
  return useMemo(() => {
    const r = rng(7)
    const xs = [0, 60, 120, 190, 262, 330, 402, 470, 540, 615, 690, 760, 830, 885, 940, 1000]
    const ys = [0, 40, 78, 115, 150, 188, 224, 262, 300, 340, 380, 430, 468, 505, 540, 575, 620]
    const out = []
    for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i] + 5, x1 = xs[i + 1] - 5, y0 = ys[j] + 5, y1 = ys[j + 1] - 5
      if (x1 - x0 < 14 || y1 - y0 < 12) continue
      const mx = (x0 + x1) / 2, ry = riverY(mx)
      if (y1 > ry - 26 && y0 < ry + 26) continue
      const n = 2 + Math.floor(r() * 3)
      for (let k = 0; k < n; k++) {
        const w = (x1 - x0) / n
        const bx = x0 + k * w + 1.5, bw = w - 3
        const bh = (y1 - y0) * (0.45 + r() * 0.5)
        const top = r() < 0.5
        out.push({ x: bx, y: top ? y0 : y1 - bh, w: bw, h: bh, shade: r() })
      }
    }
    return out
  }, [])
}

export default function CityMap({ requests = [], selected, onSelect, colorBy = 'priority', snow, now, districtTint, height, highlight, legend = true, labels = true, aspect }) {
  const [tip, setTip] = useState(null)
  const blocks = useBlocks()
  const s = getState()
  const snowCol = r => {
    const hrs = (r.end - now) / 3600e3
    return hrs <= 2 ? '#3C7A55' : hrs <= 5 ? '#D08A22' : '#C4462C'
  }
  const vb = aspect === 'tall' ? `250 230 520 390` : `0 0 ${MAP_W} ${MAP_H}`
  const ox = aspect === 'tall' ? 250 : 0, oy = aspect === 'tall' ? 230 : 0, vbw = aspect === 'tall' ? 520 : MAP_W, vbh = aspect === 'tall' ? 390 : MAP_H
  const roadStyle = st => st.kind === 'emergency' ? { casing: '#E3B653', fill: '#FCD68A', w: 8 } : st.kind === 'arterial' ? { casing: '#CFC8B8', fill: '#FFFFFF', w: 6.5 } : { casing: '#D9D3C5', fill: '#FFFFFF', w: 4.5 }
  return (
    <div className="map" style={height ? { height } : null}>
      <svg viewBox={vb} preserveAspectRatio="xMidYMid slice" style={height ? { height: '100%' } : null} onMouseLeave={() => setTip(null)}>
        <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#F2EFE9" />
        {DISTRICTS.map(d => <polygon key={d.id} points={districtPolygon(d)} fill={districtTint ? districtTint(d.id) : 'transparent'} />)}
        {/* minor street grid */}
        <g stroke="#FFFFFF" strokeWidth="2.4">
          {[60, 190, 330, 470, 615, 760, 885].map(x => <line key={'v' + x} x1={x} y1="0" x2={x} y2={MAP_H} />)}
          {[40, 115, 188, 262, 380, 468, 540].map(y => <line key={'h' + y} x1="0" y1={y} x2={MAP_W} y2={y} />)}
        </g>
        <g>{blocks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="1.5" fill={b.shade > .7 ? '#DDD8CE' : '#E5E1D8'} stroke="#D6D0C4" strokeWidth=".6" />)}</g>
        {PARKS.map(p => <polygon key={p.name} points={p.pts} fill="#CDE6B8" stroke="#B5D59D" />)}
        <path d={riverPath()} stroke="#9CC6DA" strokeWidth="44" fill="none" strokeLinecap="round" />
        <path d={riverPath()} stroke="#AAD3DF" strokeWidth="40" fill="none" strokeLinecap="round" />
        <text fontSize="12" fontStyle="italic" fill="#5F8FA8" fontWeight="600"><textPath href="#rivertext" startOffset="14%">Riverton River</textPath></text>
        <path id="rivertext" d={riverPath(4)} fill="none" />
        {STREETS.map(st => {
          const r = snow?.routes.find(r => r.street === st.id)
          const rs = roadStyle(st)
          const pts = st.pts.map(p => p.join(',')).join(' ')
          return (
            <g key={st.id}>
              <polyline points={pts} fill="none" stroke={r ? 'rgba(0,0,0,.18)' : rs.casing} strokeWidth={rs.w + 2.5} strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={pts} fill="none" stroke={r ? snowCol(r) : rs.fill} strokeWidth={rs.w} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )
        })}
        {BRIDGES.map(x => <g key={x}><rect x={x - 10} y={riverY(x) - 26} width="20" height="52" fill="#FFFFFF" stroke="#BDB6A6" /></g>)}
        {labels && STREETS.map(st => {
          const [a, b] = st.pts
          const vertical = Math.abs(b[0] - a[0]) < Math.abs(b[1] - a[1])
          const x = vertical ? a[0] + 3 : a[0] + 30 + (st.id === 'elm' ? 250 : st.id === 'harbor' ? 140 : st.id === 'main' ? 80 : 0)
          const y = vertical ? a[1] + 70 + (st.id === 'maple' ? 40 : st.id === 'washington' ? 380 : 0) : a[1] + 3.5
          return <text key={st.id} x={x} y={y} fontSize="10" fontWeight="600" fill="#6E685B" stroke="#fff" strokeWidth="3" paintOrder="stroke" transform={vertical ? `rotate(90 ${x} ${y})` : undefined}>{st.name}</text>
        })}
        {labels && DISTRICTS.map(d => <text key={d.id} x={d.label[0]} y={d.label[1] + (d.north ? 8 : -4)} textAnchor="middle" fontSize="12" fontWeight="700" fill="#9A9282" stroke="#F2EFE9" strokeWidth="4" paintOrder="stroke" style={{ letterSpacing: '.16em' }}>{d.name.toUpperCase()}</text>)}
        {LANDMARKS.map(l => {
          const I = l.kind === 'hospital' ? Cross : l.kind === 'school' ? School : l.kind === 'fire' ? Flame : Landmark
          const c = l.kind === 'hospital' ? '#C4462C' : l.kind === 'school' ? '#B9772B' : l.kind === 'fire' ? '#C4462C' : '#55605A'
          return (
            <g key={l.id}>
              <circle cx={l.x} cy={l.y} r="10" fill="#fff" stroke={c} strokeWidth="1.5" />
              <I x={l.x - 6} y={l.y - 6} width="12" height="12" color={c} strokeWidth={2.4} />
              {labels && <text x={l.x + 14} y={l.y + 3.5} fontSize="10" fontWeight="600" fill="#5E584C" stroke="#fff" strokeWidth="3" paintOrder="stroke">{l.name}</text>}
            </g>
          )
        })}
        {requests.map(q => {
          const p = priorityOf(q, s)
          const col = colorBy === 'category' ? CATEGORIES[q.category].color : LEVEL_COL[p.level]
          const n = q.reports.length
          const sel = selected === q.id || highlight?.includes(q.id)
          const dim = q.status === 'resolved' || q.status === 'closed'
          const I = CAT_ICON[q.category]
          const R = 9 + Math.min(4, n * 0.4)
          return (
            <g key={q.id} className="pin" opacity={dim ? 0.45 : 1} onClick={() => onSelect?.(q.id)}
              onMouseEnter={e => { const box = e.currentTarget.ownerSVGElement.getBoundingClientRect(); setTip({ x: (q.x - ox) * (box.width / vbw), y: (q.y - oy) * (box.height / vbh), q }) }}
              onMouseLeave={() => setTip(null)}>
              {sel && <circle cx={q.x} cy={q.y} r={R + 6} fill="none" stroke={col} strokeWidth="2.5" opacity=".55"><animate attributeName="r" values={`${R + 3};${R + 11};${R + 3}`} dur="1.8s" repeatCount="indefinite" /></circle>}
              <circle cx={q.x} cy={q.y + 1.2} r={R} fill="rgba(0,0,0,.18)" />
              <circle cx={q.x} cy={q.y} r={R} fill={col} stroke="#fff" strokeWidth="2" />
              <I x={q.x - R * 0.55} y={q.y - R * 0.55} width={R * 1.1} height={R * 1.1} color="#fff" strokeWidth={2.4} />
              {n > 1 && <g><circle cx={q.x + R * 0.8} cy={q.y - R * 0.8} r="6.5" fill="#17251D" stroke="#fff" strokeWidth="1.2" /><text x={q.x + R * 0.8} y={q.y - R * 0.8 + 3} textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff" style={{ pointerEvents: 'none' }}>{n}</text></g>}
            </g>
          )
        })}
      </svg>
      {tip && (
        <div className="maptip" style={{ left: tip.x, top: tip.y }}>
          <b>{CATEGORIES[tip.q.category].label} · {tip.q.address}</b>
          {tip.q.id} · {tip.q.reports.length} report{tip.q.reports.length === 1 ? '' : 's'} · {tip.q.upvotes} upvotes
        </div>
      )}
      {legend && !snow && colorBy === 'priority' && (
        <div className="maplegend"><span><i style={{ background: LEVEL_COL.high }} />High</span><span><i style={{ background: LEVEL_COL.medium }} />Medium</span><span><i style={{ background: LEVEL_COL.low }} />Low</span><span className="muted">Badge = merged reports</span></div>
      )}
      {legend && snow && (
        <div className="maplegend"><span><i style={{ background: '#3C7A55' }} />Plowed within 2 h</span><span><i style={{ background: '#D08A22' }} />2–5 h</span><span><i style={{ background: '#C4462C' }} />Over 5 h</span></div>
      )}
    </div>
  )
}
