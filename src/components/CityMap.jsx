import { useTheme } from '../theme.js'
import { useMemo, useState } from 'react'
import { MAP_W, MAP_H, RIVER, DISTRICTS, STREETS, BRIDGES, LANDMARKS, PARKS, CATEGORIES, districtPolygon, riverY } from '../data/city.js'
import { priorityOf, getState } from '../store.js'
import { CAT_ICON } from './ui.jsx'
import { Cross, School, Landmark, Flame } from 'lucide-react'

const LEVEL_COL = { high: '#FF7C69', medium: '#FFC461', low: '#8E8E9C' }
const riverPath = (off = 0) => 'M' + RIVER.map(([x, y]) => `${x} ${y + off}`).join(' L')
function rng(seed) { let a = seed; return () => { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296 } }

const DARK = { bg: '#09090B', block: '#101013', block2: '#131317', blockLine: '#18181D', minor: '#16161B', water: '#0C1220', waterEdge: '#1A2540', park: '#101511', label: '#5E5E6A', district: '#3A3A45', em: ['#26262F', '#CFCBEA'], art: ['#1D1D23', '#383842'], res: ['#16161B', '#2A2A31'] }
const LIGHT = { bg: '#E8EBF1', block: '#DDE1E9', block2: '#D5DAE3', blockLine: '#CED4DE', minor: '#FFFFFF', water: '#BCD4EC', waterEdge: '#A6C4E4', park: '#D2E6D4', label: '#7A8292', district: '#A2A9B7', em: ['#C9CEDC', '#FFFFFF'], art: ['#CDD2DC', '#FFFFFF'], res: ['#D8DDE6', '#FFFFFF'] }

function useBlocks() {
  return useMemo(() => {
    const r = rng(11)
    const xs = [0, 60, 120, 190, 262, 330, 402, 470, 540, 615, 690, 760, 830, 885, 940, 1000]
    const ys = [0, 40, 78, 115, 150, 188, 224, 262, 300, 340, 380, 430, 468, 505, 540, 575, 620]
    const out = []
    for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i] + 4, x1 = xs[i + 1] - 4, y0 = ys[j] + 4, y1 = ys[j + 1] - 4
      if (x1 - x0 < 14 || y1 - y0 < 12) continue
      const ry = riverY((x0 + x1) / 2)
      if (y1 > ry - 28 && y0 < ry + 28) continue
      const n = 2 + Math.floor(r() * 3)
      for (let k = 0; k < n; k++) {
        const w = (x1 - x0) / n
        const bh = (y1 - y0) * (0.4 + r() * 0.55)
        out.push({ x: x0 + k * w + 1.2, y: r() < 0.5 ? y0 : y1 - bh, w: w - 2.4, h: bh, s: r() })
      }
    }
    return out
  }, [])
}

export default function CityMap({ requests = [], selected, onSelect, colorBy = 'priority', snow, now, height, legend = true, labels = true, aspect, theme: themeProp, flow = true, home }) {
  const [tip, setTip] = useState(null)
  const blocks = useBlocks()
  const s = getState()
  const appTheme = useTheme()
  const theme = themeProp || appTheme
  const P = theme === 'light' ? LIGHT : DARK
  const snowCol = r => { const hrs = (r.end - now) / 3600e3; return hrs <= 2 ? '#7BD88F' : hrs <= 5 ? '#FFC461' : '#FF7C69' }
  const tall = aspect === 'tall'
  const ox = tall ? 250 : 0, oy = tall ? 230 : 0, vbw = tall ? 520 : MAP_W, vbh = tall ? 390 : MAP_H
  const road = st => st.kind === 'emergency' ? { c: P.em, w: 7 } : st.kind === 'arterial' ? { c: P.art, w: 5.5 } : { c: P.res, w: 4 }
  const fid = `glow-${theme}`
  return (
    <div className={`map ${theme === 'light' ? 'light' : ''}`} style={height ? { height } : null}>
      <svg viewBox={`${ox} ${oy} ${vbw} ${vbh}`} preserveAspectRatio="xMidYMid slice" style={height ? { height: '100%' } : null} onMouseLeave={() => setTip(null)}>
        <defs>
          <filter id={fid} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id={`${fid}-soft`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        <rect x="0" y="0" width={MAP_W} height={MAP_H} fill={P.bg} />
        <g stroke={P.minor} strokeWidth="2.2">
          {[60, 190, 330, 470, 615, 760, 885].map(x => <line key={'v' + x} x1={x} y1="0" x2={x} y2={MAP_H} />)}
          {[40, 115, 188, 262, 380, 468, 540].map(y => <line key={'h' + y} x1="0" y1={y} x2={MAP_W} y2={y} />)}
        </g>
        <g>{blocks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="1.5" fill={b.s > .72 ? P.block2 : P.block} stroke={P.blockLine} strokeWidth=".6" />)}</g>
        {PARKS.map(p => <polygon key={p.name} points={p.pts} fill={P.park} />)}
        <path d={riverPath()} stroke={P.waterEdge} strokeWidth="46" fill="none" strokeLinecap="round" />
        <path d={riverPath()} stroke={P.water} strokeWidth="42" fill="none" strokeLinecap="round" />
        {STREETS.map(st => {
          const r = snow?.routes.find(r => r.street === st.id)
          const rd = road(st)
          const pts = st.pts.map(p => p.join(',')).join(' ')
          if (r) return (
            <g key={st.id}>
              <polyline points={pts} fill="none" stroke={snowCol(r)} strokeWidth={rd.w + 6} opacity=".35" filter={`url(#${fid}-soft)`} />
              <polyline points={pts} fill="none" stroke={snowCol(r)} strokeWidth={rd.w} strokeLinecap="round" />
            </g>
          )
          return (
            <g key={st.id}>
              <polyline points={pts} fill="none" stroke={rd.c[0]} strokeWidth={rd.w + 2.4} strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={pts} fill="none" stroke={rd.c[1]} strokeWidth={rd.w} strokeLinecap="round" strokeLinejoin="round" opacity={theme === 'dark' && st.kind === 'emergency' ? .22 : 1} />
              {theme === 'dark' && st.kind !== 'residential' && flow && <polyline className="flowline" points={pts} fill="none" stroke={st.kind === 'emergency' ? '#9B8CFF' : '#55556A'} strokeWidth="1.6" strokeLinecap="round" opacity=".8" style={{ animationDuration: `${1.4 + (st.id.length % 5) * 0.3}s` }} />}
            </g>
          )
        })}
        {BRIDGES.map(x => <rect key={x} x={x - 9} y={riverY(x) - 26} width="18" height="52" fill={theme === 'dark' ? '#1D1D23' : '#FFFFFF'} stroke={theme === 'dark' ? '#2A3632' : '#BDB6A6'} />)}
        {labels && STREETS.map(st => {
          const [a, b] = st.pts
          const vertical = Math.abs(b[0] - a[0]) < Math.abs(b[1] - a[1])
          const x = vertical ? a[0] + 3 : a[0] + 30 + (st.id === 'elm' ? 250 : st.id === 'harbor' ? 140 : st.id === 'main' ? 80 : 0)
          const y = vertical ? a[1] + 70 + (st.id === 'maple' ? 40 : st.id === 'washington' ? 380 : 0) : a[1] + 3.5
          return <text key={st.id} x={x} y={y} fontSize="9.5" fontWeight="600" fill={P.label} stroke={P.bg} strokeWidth="3" paintOrder="stroke" transform={vertical ? `rotate(90 ${x} ${y})` : undefined}>{st.name}</text>
        })}
        {labels && DISTRICTS.map(d => <text key={d.id} x={d.label[0]} y={d.label[1] + (d.north ? 8 : -4)} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={P.district} stroke={P.bg} strokeWidth="4" paintOrder="stroke" style={{ letterSpacing: '.22em' }}>{d.name.toUpperCase()}</text>)}
        {LANDMARKS.map(l => {
          const I = l.kind === 'hospital' ? Cross : l.kind === 'school' ? School : l.kind === 'fire' ? Flame : Landmark
          const c = theme === 'dark' ? '#9A9AA6' : '#55605A'
          return (
            <g key={l.id} opacity=".9">
              <circle cx={l.x} cy={l.y} r="9" fill={theme === 'dark' ? '#18181D' : '#fff'} stroke={c} strokeWidth="1" />
              <I x={l.x - 5.5} y={l.y - 5.5} width="11" height="11" color={l.kind === 'hospital' ? '#FF7C69' : c} strokeWidth={2.4} />
              {labels && <text x={l.x + 13} y={l.y + 3.5} fontSize="9.5" fontWeight="600" fill={P.label} stroke={P.bg} strokeWidth="3" paintOrder="stroke">{l.name}</text>}
            </g>
          )
        })}
        {requests.map(q => {
          const p = priorityOf(q, s)
          const col = colorBy === 'category' ? CATEGORIES[q.category].color : LEVEL_COL[p.level]
          const n = q.reports.length
          const sel = selected === q.id
          const dim = q.status === 'resolved' || q.status === 'closed'
          const I = CAT_ICON[q.category]
          const R = 8.5 + Math.min(4, n * 0.4)
          return (
            <g key={q.id} className="pin" opacity={dim ? 0.4 : 1} onClick={() => onSelect?.(q.id)}
              onMouseEnter={e => { const box = e.currentTarget.ownerSVGElement.getBoundingClientRect(); setTip({ x: (q.x - ox) * (box.width / vbw), y: (q.y - oy) * (box.height / vbh), q }) }}
              onMouseLeave={() => setTip(null)}>
              {theme === 'dark' && <circle cx={q.x} cy={q.y} r={R + 4} fill={col} opacity=".22" filter={`url(#${fid}-soft)`} />}
              {sel && <circle cx={q.x} cy={q.y} r={R + 6} fill="none" stroke={col} strokeWidth="2" opacity=".7"><animate attributeName="r" values={`${R + 3};${R + 13};${R + 3}`} dur="1.8s" repeatCount="indefinite" /><animate attributeName="opacity" values=".8;0;.8" dur="1.8s" repeatCount="indefinite" /></circle>}
              <circle cx={q.x} cy={q.y} r={R} fill={col} stroke={theme === 'dark' ? '#09090B' : '#fff'} strokeWidth="1.8" />
              <I x={q.x - R * 0.55} y={q.y - R * 0.55} width={R * 1.1} height={R * 1.1} color={theme === 'dark' ? '#0B0B0E' : '#fff'} strokeWidth={2.5} />
              {n > 2 && <g><circle cx={q.x + R * 0.85} cy={q.y - R * 0.85} r="6" fill={theme === 'dark' ? '#EDEDF2' : '#132019'} /><text x={q.x + R * 0.85} y={q.y - R * 0.85 + 2.8} textAnchor="middle" fontSize="7.5" fontWeight="800" fill={theme === 'dark' ? '#09090B' : '#fff'} style={{ pointerEvents: 'none' }}>{n}</text></g>}
            </g>
          )
        })}
        {home && <g style={{ pointerEvents: 'none' }}>
          <circle cx={home.x} cy={home.y} r="10" fill="#1F6FD1" opacity=".25"><animate attributeName="r" values="8;20;8" dur="2.4s" repeatCount="indefinite" /><animate attributeName="opacity" values=".35;0;.35" dur="2.4s" repeatCount="indefinite" /></circle>
          <circle cx={home.x} cy={home.y} r="6.5" fill="#1F6FD1" stroke="#fff" strokeWidth="2.5" />
        </g>}
      </svg>
      {tip && (
        <div className="maptip" style={{ left: tip.x, top: tip.y }}>
          <b>{CATEGORIES[tip.q.category].label}</b>
          <span>{tip.q.address} · {tip.q.reports.length} report{tip.q.reports.length === 1 ? '' : 's'} · {tip.q.upvotes} votes</span>
        </div>
      )}
      {legend && !snow && colorBy === 'priority' && (
        <div className="maplegend"><span><i style={{ background: LEVEL_COL.high, color: LEVEL_COL.high }} />High</span><span><i style={{ background: LEVEL_COL.medium, color: LEVEL_COL.medium }} />Medium</span><span><i style={{ background: LEVEL_COL.low, color: LEVEL_COL.low }} />Low</span><span style={{ opacity: .7 }}>Badge = merged reports</span></div>
      )}
      {legend && snow && (
        <div className="maplegend"><span><i style={{ background: '#7BD88F' }} />Plowed within 2 h</span><span><i style={{ background: '#FFC461' }} />2–5 h</span><span><i style={{ background: '#FF7C69' }} />Over 5 h</span></div>
      )}
    </div>
  )
}
