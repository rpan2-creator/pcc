import { useState } from 'react'
import { MAP_W, MAP_H, RIVER, DISTRICTS, STREETS, BRIDGES, LANDMARKS, PARKS, CATEGORIES, districtPolygon, riverY } from '../data/city.js'
import { priorityOf, getState } from '../store.js'

const LEVEL_COL = { high: '#C4462C', medium: '#D08A22', low: '#3C7A55' }
const KIND_W = { emergency: 7, arterial: 5, residential: 3.2 }
const riverPath = (off) => 'M' + RIVER.map(([x, y]) => `${x} ${y + off}`).join(' L')

export default function CityMap({ requests = [], selected, onSelect, colorBy = 'priority', snow, now, districtTint, height, highlight, legend = true, labels = true, aspect }) {
  const [tip, setTip] = useState(null)
  const s = getState()
  const snowCol = r => {
    const hrs = (r.end - now) / 3600e3
    return hrs <= 2 ? '#3C7A55' : hrs <= 5 ? '#D08A22' : '#C4462C'
  }
  const vb = aspect === 'tall' ? `120 0 760 ${MAP_H}` : `0 0 ${MAP_W} ${MAP_H}`
  return (
    <div className="map" style={height ? { height } : null}>
      <svg viewBox={vb} preserveAspectRatio="xMidYMid slice" style={height ? { height: '100%' } : null} onMouseLeave={() => setTip(null)}>
        <defs>
          <pattern id="blocks" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#EDEBE3" /><rect x="3" y="3" width="28" height="28" rx="3" fill="#E6E3D9" /></pattern>
        </defs>
        <rect width={MAP_W} height={MAP_H} fill="url(#blocks)" />
        {DISTRICTS.map(d => (
          <polygon key={d.id} points={districtPolygon(d)} fill={districtTint ? districtTint(d.id) : 'transparent'} stroke="#CFCABC" strokeWidth="1.5" strokeDasharray="6 5" />
        ))}
        {PARKS.map(p => <polygon key={p.name} points={p.pts} fill="#CFE0C4" stroke="#B9D0AC" />)}
        <path d={riverPath(0)} stroke="#AFCFDF" strokeWidth="30" fill="none" strokeLinecap="round" />
        <path d={riverPath(0)} stroke="#C5DDEA" strokeWidth="20" fill="none" strokeLinecap="round" />
        {STREETS.map(st => {
          const r = snow?.routes.find(r => r.street === st.id)
          const col = r ? snowCol(r) : st.kind === 'emergency' ? '#FFFFFF' : '#FBFAF6'
          return (
            <g key={st.id}>
              <polyline points={st.pts.map(p => p.join(',')).join(' ')} fill="none" stroke={r ? 'rgba(0,0,0,.08)' : '#D6D1C4'} strokeWidth={KIND_W[st.kind] + 3} strokeLinecap="round" />
              <polyline points={st.pts.map(p => p.join(',')).join(' ')} fill="none" stroke={col} strokeWidth={KIND_W[st.kind] + (r ? 1.5 : 0)} strokeLinecap="round" opacity={r ? 0.95 : 1} />
            </g>
          )
        })}
        {BRIDGES.map(x => <rect key={x} x={x - 9} y={riverY(x) - 20} width="18" height="40" rx="3" fill="#F7F5EF" stroke="#C9C3B3" />)}
        {labels && STREETS.map(st => {
          const [a, b] = st.pts
          const vertical = Math.abs(b[0] - a[0]) < Math.abs(b[1] - a[1])
          const x = vertical ? a[0] + 8 : a[0] + 18 + (st.id === 'elm' ? 250 : st.id === 'harbor' ? 120 : 0)
          const y = vertical ? a[1] + 70 + (st.id === 'maple' ? 30 : 0) : a[1] - 7
          return <text key={st.id} x={x} y={y} fontSize="11" fontWeight="600" fill="#8C8676" transform={vertical ? `rotate(90 ${x} ${y})` : undefined} style={{ letterSpacing: '.02em' }}>{st.name}</text>
        })}
        {labels && DISTRICTS.map(d => <text key={d.id} x={d.label[0]} y={d.label[1]} textAnchor="middle" fontSize="12.5" fontWeight="750" fill="#A39D8C" style={{ letterSpacing: '.14em' }}>{d.name.toUpperCase()}</text>)}
        {LANDMARKS.map(l => (
          <g key={l.id}>
            <rect x={l.x - 11} y={l.y - 11} width="22" height="22" rx="6" fill="#fff" stroke="#D3CEC1" />
            <text x={l.x} y={l.y + 4.5} textAnchor="middle" fontSize="12" fontWeight="800" fill={l.kind === 'hospital' ? '#C4462C' : '#55605A'}>{l.kind === 'hospital' ? '+' : l.kind === 'school' ? 'S' : l.kind === 'fire' ? 'F' : 'C'}</text>
            {labels && <text x={l.x + 16} y={l.y + 4} fontSize="10.5" fontWeight="600" fill="#7A7464">{l.name}</text>}
          </g>
        ))}
        {requests.map(q => {
          const p = priorityOf(q, s)
          const col = colorBy === 'category' ? CATEGORIES[q.category].color : LEVEL_COL[p.level]
          const n = q.reports.length
          const r = 6 + Math.min(8, n * 0.9)
          const sel = selected === q.id || highlight?.includes(q.id)
          const dim = q.status === 'resolved'
          return (
            <g key={q.id} className="pin" onClick={() => onSelect?.(q.id)}
              onMouseEnter={e => { const box = e.currentTarget.ownerSVGElement.getBoundingClientRect(); const vbW = aspect === 'tall' ? 760 : MAP_W; const ox = aspect === 'tall' ? 120 : 0; const sc = box.width / vbW; setTip({ x: (q.x - ox) * sc, y: q.y * (box.height / MAP_H), q, p }) }}
              onMouseLeave={() => setTip(null)}>
              {sel && <circle cx={q.x} cy={q.y} r={r + 7} fill="none" stroke={col} strokeWidth="2.5" opacity=".5"><animate attributeName="r" values={`${r + 4};${r + 11};${r + 4}`} dur="1.8s" repeatCount="indefinite" /></circle>}
              <circle cx={q.x} cy={q.y} r={r} fill={col} stroke="#fff" strokeWidth="2" opacity={dim ? 0.35 : 1} />
              {n > 2 && <text x={q.x} y={q.y + 3.8} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#fff" style={{ pointerEvents: 'none' }}>{n}</text>}
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
        <div className="maplegend"><span><i style={{ background: LEVEL_COL.high }} />High</span><span><i style={{ background: LEVEL_COL.medium }} />Medium</span><span><i style={{ background: LEVEL_COL.low }} />Low</span><span className="muted">Number = merged reports</span></div>
      )}
      {legend && snow && (
        <div className="maplegend"><span><i style={{ background: '#3C7A55' }} />Within 2 h</span><span><i style={{ background: '#D08A22' }} />2–5 h</span><span><i style={{ background: '#C4462C' }} />Over 5 h</span></div>
      )}
    </div>
  )
}
