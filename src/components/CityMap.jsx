import { useTheme } from '../theme.js'
import { useMemo, useState } from 'react'
import { MAP_W, MAP_H, RIVER, DISTRICTS, STREETS, BRIDGES, LANDMARKS, PARKS, CATEGORIES, districtPolygon, riverY } from '../data/city.js'
import { priorityOf, getState } from '../store.js'
import { Photo } from './ui.jsx'
import { Cross, School, Landmark, Flame, X } from 'lucide-react'
import { ago } from '../format.js'

export const LEVEL_COL = { high: '#FF453A', medium: '#FF9F0A', low: '#C7CBD1' }
const LEVEL_COL_LIGHT = { high: '#E5372C', medium: '#E88600', low: '#5C6370' }
const riverPath = (off = 0) => 'M' + RIVER.map(([x, y]) => `${x} ${y + off}`).join(' L')
function rng(seed) { let a = seed; return () => { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296 } }

// Citizen-style base maps: quiet, low-contrast streets so incidents carry the colour.
const DARK = { bg: '#0D0F12', block: '#13161A', block2: '#16191E', blockLine: '#13161A', minor: '#171A1F', water: '#0B1118', waterEdge: '#0F1720', park: '#111713', label: '#5A6069', district: '#363B43', em: ['#1E2228', '#3A4049'], art: ['#1C2026', '#30353D'], res: ['#171A1F', '#252A31'], bridge: '#1E2228', lm: '#6B717B', ring: '#0D0F12' }
const LIGHT = { bg: '#EEF0F3', block: '#E4E7EC', block2: '#DFE3E9', blockLine: '#E4E7EC', minor: '#FFFFFF', water: '#CADCEE', waterEdge: '#BCD2EA', park: '#DCE9DD', label: '#8A909B', district: '#AEB4BE', em: ['#D3D8E0', '#FFFFFF'], art: ['#D9DDE4', '#FFFFFF'], res: ['#E0E4EA', '#FAFBFC'], bridge: '#FFFFFF', lm: '#7B818C', ring: '#FFFFFF' }

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

export default function CityMap({ requests = [], selected, onSelect, colorBy = 'priority', snow, now, height, legend = true, labels = true, aspect, theme: themeProp, home, live = true, tags = true }) {
  const [tip, setTip] = useState(null)
  const [pick, setPick] = useState(null)
  const blocks = useBlocks()
  const s = getState()
  const appTheme = useTheme()
  const theme = themeProp || appTheme
  const P = theme === 'light' ? LIGHT : DARK
  const LC = theme === 'light' ? LEVEL_COL_LIGHT : LEVEL_COL
  const snowCol = r => { const hrs = (r.end - now) / 3600e3; return hrs <= 2 ? '#30D158' : hrs <= 5 ? LC.medium : LC.high }
  const tall = aspect === 'tall'
  const ox = tall ? 250 : 0, oy = tall ? 230 : 0, vbw = tall ? 520 : MAP_W, vbh = tall ? 390 : MAP_H
  const road = st => st.kind === 'emergency' ? { c: P.em, w: 7 } : st.kind === 'arterial' ? { c: P.art, w: 5.5 } : { c: P.res, w: 4 }
  const ranked = useMemo(() => requests.map(q => ({ q, p: priorityOf(q, s) })), [requests, s])
  const tagged = tags && !snow ? new Set(ranked.filter(x => x.p.level === 'high' && !['resolved', 'closed'].includes(x.q.status)).sort((a, b) => b.p.score - a.p.score).reduce((acc, x) => { if (acc.length < (tall ? 2 : 4) && acc.every(y => Math.hypot(y.q.x - x.q.x, y.q.y - x.q.y) > 110)) acc.push(x); return acc }, []).map(x => x.q.id)) : new Set()
  const card = ranked.find(x => x.q.id === pick)
  const toPx = (q, el) => { const box = el.getBoundingClientRect(); return { x: (q.x - ox) * (box.width / vbw), y: (q.y - oy) * (box.height / vbh) } }
  return (
    <div className={`map ${theme === 'light' ? 'light' : ''}`} style={height ? { height } : null}>
      <svg viewBox={`${ox} ${oy} ${vbw} ${vbh}`} preserveAspectRatio="xMidYMid slice" style={height ? { height: '100%' } : null} onMouseLeave={() => setTip(null)} onClick={e => { if (e.target.tagName === 'rect' || e.target.tagName === 'svg') setPick(null) }}>
        <rect x="0" y="0" width={MAP_W} height={MAP_H} fill={P.bg} />
        <g stroke={P.minor} strokeWidth="2.2">
          {[60, 190, 330, 470, 615, 760, 885].map(x => <line key={'v' + x} x1={x} y1="0" x2={x} y2={MAP_H} />)}
          {[40, 115, 188, 262, 380, 468, 540].map(y => <line key={'h' + y} x1="0" y1={y} x2={MAP_W} y2={y} />)}
        </g>
        <g>{blocks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill={b.s > .72 ? P.block2 : P.block} />)}</g>
        {PARKS.map(p => <polygon key={p.name} points={p.pts} fill={P.park} />)}
        <path d={riverPath()} stroke={P.waterEdge} strokeWidth="46" fill="none" strokeLinecap="round" />
        <path d={riverPath()} stroke={P.water} strokeWidth="42" fill="none" strokeLinecap="round" />
        {STREETS.map(st => {
          const r = snow?.routes.find(r => r.street === st.id)
          const rd = road(st)
          const pts = st.pts.map(p => p.join(',')).join(' ')
          if (r) return (
            <g key={st.id}>
              <polyline points={pts} fill="none" stroke={snowCol(r)} strokeWidth={rd.w + 8} opacity=".18" strokeLinecap="round" />
              <polyline className="snowline" points={pts} fill="none" stroke={snowCol(r)} strokeWidth={rd.w - 1} strokeLinecap="round" />
            </g>
          )
          return (
            <g key={st.id}>
              <polyline points={pts} fill="none" stroke={rd.c[0]} strokeWidth={rd.w + 2} strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={pts} fill="none" stroke={rd.c[1]} strokeWidth={rd.w} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )
        })}
        {BRIDGES.map(x => <rect key={x} x={x - 9} y={riverY(x) - 26} width="18" height="52" rx="2" fill={P.bridge} />)}
        {labels && STREETS.map(st => {
          const [a, b] = st.pts
          const vertical = Math.abs(b[0] - a[0]) < Math.abs(b[1] - a[1])
          const x = vertical ? a[0] + 3 : a[0] + 30 + (st.id === 'elm' ? 250 : st.id === 'harbor' ? 140 : st.id === 'main' ? 80 : 0)
          const y = vertical ? a[1] + 70 + (st.id === 'maple' ? 40 : st.id === 'washington' ? 380 : 0) : a[1] + 3.5
          return <text key={st.id} x={x} y={y} fontSize="9" fontWeight="600" fill={P.label} stroke={P.bg} strokeWidth="3" paintOrder="stroke" transform={vertical ? `rotate(90 ${x} ${y})` : undefined}>{st.name}</text>
        })}
        {labels && DISTRICTS.map(d => <text key={d.id} x={d.label[0]} y={d.label[1] + (d.north ? 8 : -4)} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={P.district} stroke={P.bg} strokeWidth="4" paintOrder="stroke" style={{ letterSpacing: '.24em' }}>{d.name.toUpperCase()}</text>)}
        {LANDMARKS.map(l => {
          const I = l.kind === 'hospital' ? Cross : l.kind === 'school' ? School : l.kind === 'fire' ? Flame : Landmark
          return (
            <g key={l.id} opacity=".85" style={{ pointerEvents: 'none' }}>
              <circle cx={l.x} cy={l.y} r="8" fill={P.bridge} />
              <I x={l.x - 5} y={l.y - 5} width="10" height="10" color={P.lm} strokeWidth={2.4} />
              {labels && <text x={l.x + 12} y={l.y + 3.5} fontSize="9" fontWeight="600" fill={P.label} stroke={P.bg} strokeWidth="3" paintOrder="stroke">{l.name}</text>}
            </g>
          )
        })}
        {ranked.map(({ q, p }, i) => {
          const col = colorBy === 'category' ? CATEGORIES[q.category].color : LC[p.level]
          const n = q.reports.length
          const sel = (pick || selected) === q.id
          const dim = q.status === 'resolved' || q.status === 'closed'
          const R = (p.level === 'high' ? 6 : p.level === 'medium' ? 5 : 4) + Math.min(3, n * 0.3)
          return (
            <g key={q.id} className="pin" opacity={dim ? 0.35 : 1} style={{ animationDelay: `${Math.min(i, 60) * 12}ms` }}
              onClick={e => { e.stopPropagation(); setPick(q.id) }}
              onMouseEnter={e => setTip({ ...toPx(q, e.currentTarget.ownerSVGElement), q })}
              onMouseLeave={() => setTip(null)}>
              <circle cx={q.x} cy={q.y} r={R * 2.6} fill={col} opacity=".14" />
              {p.level === 'high' && !dim && <circle className="pulse" cx={q.x} cy={q.y} r={R * 2} fill="none" stroke={col} strokeWidth="1.5" style={{ animationDelay: `${(i % 7) * 0.3}s` }} />}
              {sel && <circle cx={q.x} cy={q.y} r={R + 7} fill="none" stroke={theme === 'light' ? '#12141B' : '#fff'} strokeWidth="2" />}
              <circle cx={q.x} cy={q.y} r={R} fill={col} stroke={P.ring} strokeWidth="2" />
              {n > 2 && <text x={q.x} y={q.y + 2.6} textAnchor="middle" fontSize="7" fontWeight="800" fill={p.level === 'low' && theme !== 'light' ? '#0D0F12' : '#fff'} style={{ pointerEvents: 'none' }}>{n}</text>}
            </g>
          )
        })}
        {ranked.filter(x => tagged.has(x.q.id)).map(({ q }) => {
          const label = `${CATEGORIES[q.category].label} · ${q.reports.length}`
          const w = label.length * 6.5 + 22
          const left = q.x + w + 22 > ox + vbw
          const tx = left ? q.x - 12 - w : q.x + 12
          return (
            <g key={'t' + q.id} className="maptag" style={{ pointerEvents: 'none' }}>
              <rect x={tx} y={q.y - 12} width={w} height="24" rx="12" fill={theme === 'light' ? 'rgba(255,255,255,.92)' : 'rgba(24,27,32,.88)'} stroke={theme === 'light' ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.1)'} />
              <circle cx={tx + 11} cy={q.y} r="3.5" fill={LC.high} />
              <text x={tx + 19} y={q.y + 4} fontSize="11.5" fontWeight="700" fill={theme === 'light' ? '#12141B' : '#EEF0F3'}>{label}</text>
            </g>
          )
        })}
        {home && <g style={{ pointerEvents: 'none' }}>
          <circle className="pulse blue" cx={home.x} cy={home.y} r="14" fill="#0A84FF" opacity=".2" />
          <circle cx={home.x} cy={home.y} r="6.5" fill="#0A84FF" stroke="#fff" strokeWidth="2.5" />
        </g>}
      </svg>
      {live && !snow && <div className="maplive"><i />Live · {ranked.filter(x => !['resolved', 'closed'].includes(x.q.status)).length} open</div>}
      {tip && !card && (
        <div className="maptip" style={{ left: tip.x, top: tip.y }}>
          <b>{CATEGORIES[tip.q.category].label}</b>
          <span>{tip.q.address} · {tip.q.reports.length} report{tip.q.reports.length === 1 ? '' : 's'}</span>
        </div>
      )}
      {card && (
        <div className="mapcard" key={card.q.id}>
          <div className="mc-photo"><Photo c={card.q.category} seed={card.q.id.charCodeAt(6)} style={{ aspectRatio: '1', borderRadius: 10 }} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row" style={{ gap: 6 }}><i className="lvl" style={{ background: LC[card.p.level] }} /><b>{CATEGORIES[card.q.category].label}</b></div>
            <div className="mc-sub">{card.q.address} · {ago(card.q.createdAt, s.now)}</div>
            <div className="mc-sub">{card.q.reports.length} report{card.q.reports.length === 1 ? '' : 's'} · {card.q.upvotes} votes</div>
          </div>
          {onSelect && <button className="btn sm primary" onClick={() => onSelect(card.q.id)}>Open</button>}
          <button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => setPick(null)} aria-label="Close"><X size={14} /></button>
        </div>
      )}
      {legend && !snow && colorBy === 'priority' && !card && (
        <div className="maplegend"><span><i style={{ background: LC.high }} />High</span><span><i style={{ background: LC.medium }} />Medium</span><span><i style={{ background: LC.low }} />Low</span><span style={{ opacity: .7 }}>Number = merged reports</span></div>
      )}
      {legend && snow && (
        <div className="maplegend"><span><i style={{ background: '#30D158' }} />Plowed within 2 h</span><span><i style={{ background: LC.medium }} />2–5 h</span><span><i style={{ background: LC.high }} />Over 5 h</span></div>
      )}
    </div>
  )
}
