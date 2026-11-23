import { HeartPulse, Sparkles, TrendingUp, TrendingDown, MapPin, Wallet, Info, AlertTriangle, ArrowRight } from 'lucide-react'
import { healthOf, isOpen, priorityOf } from '../store.js'
import { CATEGORIES, DOMAINS, DEPARTMENTS, districtName } from '../data/city.js'
import { HealthRing, healthColor, CatIcon, Num, AgentMark } from '../components/ui.jsx'
import { navigate } from '../router.jsx'

const D = 864e5
// Illustrative budget figures for the fictional City of Riverton (FY2026, $M).
export const BUDGET = [
  { key: 'streets', spent: 4.1, budget: 6.0 }, { key: 'traffic', spent: 1.6, budget: 2.2 }, { key: 'water', spent: 5.3, budget: 6.4 },
  { key: 'clean', spent: 3.4, budget: 4.0 }, { key: 'parks', spent: 1.2, budget: 1.9 }, { key: 'housing', spent: 0.9, budget: 1.3 }, { key: 'winter', spent: 0.7, budget: 2.1 },
]
const TREND = [69, 70, 68, 71, 72, 71, 73, 72, 74, 75, 76]

export default function Health({ s, base = '/ops/requests/', title = 'City health' }) {
  const h = healthOf(s)
  const trend = [...TREND, h.index]
  const open = s.requests.filter(isOpen)
  const worst = [...h.domains].sort((a, b) => a.score - b.score)
  const avgWait = h.districts.reduce((a, d) => a + d.wait, 0) / h.districts.length
  const maxWait = Math.max(...h.districts.map(d => d.wait))
  const lagging = h.districts.filter(d => d.wait - avgWait > s.rules.equityGap)
  const hot = open.map(q => ({ q, p: priorityOf(q, s) })).filter(x => x.q.status !== 'review').sort((a, b) => b.p.score - a.p.score).slice(0, 5)
  const w = 520, hgt = 90, min = Math.floor((Math.min(...trend) - 6) / 10) * 10, max = Math.ceil((Math.max(...trend) + 4) / 10) * 10
  const pts = trend.map((v, i) => [i * (w / (trend.length - 1)), hgt - ((v - min) / (max - min)) * hgt])
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <div className="pagehead"><div><div className="eyebrow"><HeartPulse size={13} />{title}</div><h1>How Riverton is doing, right now</h1><p>One score from every open problem in the city: how many there are, how late they are, and whether fixes stick. It moves as crews fix things and residents confirm.</p></div></div>

      <div className="grid" style={{ gridTemplateColumns: '340px minmax(0, 1fr)', alignItems: 'stretch', marginBottom: 14 }}>
        <div className="card spot" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <HealthRing value={h.index} size={210} stroke={14} label="City health index" sub="out of 100" />
          <div className="row small" style={{ gap: 6, color: h.index >= TREND[TREND.length - 1] ? 'var(--green)' : 'var(--red)', fontWeight: 650 }}>{h.index >= TREND[TREND.length - 1] ? <TrendingUp size={15} /> : <TrendingDown size={15} />}{h.index >= TREND[TREND.length - 1] ? '+' : ''}{h.index - TREND[TREND.length - 1]} since last week</div>
          <p className="tiny muted" style={{ textAlign: 'center', lineHeight: 1.5 }}>80+ healthy · 65–79 fair · 50–64 strained · below 50 failing</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="row" style={{ marginBottom: 6 }}><b>Last 12 weeks</b><span className="spacer" /><span className="tiny muted">weekly index; this week is live</span></div>
          <svg viewBox={`-12 -10 ${w + 40} ${hgt + 30}`} style={{ width: '100%', height: 130 }}>
            <defs><linearGradient id="hg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--mint)" stopOpacity=".28" /><stop offset="1" stopColor="var(--mint)" stopOpacity="0" /></linearGradient></defs>
            {[min + 10, max - 10].filter((v, i, a) => a.indexOf(v) === i && v > min && v < max).map(v => <g key={v}><line x1="0" x2={w} y1={hgt - ((v - min) / (max - min)) * hgt} y2={hgt - ((v - min) / (max - min)) * hgt} stroke="rgba(210,255,230,.07)" /><text x={w + 4} y={hgt - ((v - min) / (max - min)) * hgt + 4} fontSize="10" fill="var(--tx3)">{v}</text></g>)}
            <path d={`${path} L ${w} ${hgt} L 0 ${hgt} Z`} fill="url(#hg)" />
            <path d={path} fill="none" stroke="var(--mint)" strokeWidth="2.2" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px var(--mintglow))' }} />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="5" fill="var(--mint)"><animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" /></circle>
            {pts.map((p, i) => i % 2 === 1 && <text key={i} x={p[0]} y={hgt + 18} fontSize="10" fill="var(--tx3)" textAnchor="middle">W{i + 38}</text>)}
          </svg>
          <div className="callout" style={{ marginTop: 10 }}>
            <AgentMark size="sm" />
            <span><b>What the AI sees: </b>{worst[0].label} is the weakest area ({worst[0].score}), with {worst[0].overdue} of {worst[0].open} requests past target. {lagging.length ? `${lagging.map(d => d.name).join(' and ')} wait${lagging.length === 1 ? 's' : ''} noticeably longer than the city average, so their requests get an equity boost.` : 'Wait times are even across districts.'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        {h.domains.map((d, i) => {
          const cats = Object.entries(CATEGORIES).filter(([, c]) => c.domain === d.key)
          return (
            <div key={d.key} className="card spot lift rowin" style={{ padding: 16, animationDelay: `${i * 50}ms` }}>
              <div className="row" style={{ gap: 8 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} /><b className="small" style={{ flex: 1 }}>{d.label}</b><b className="mono" style={{ fontSize: 22, color: healthColor(d.score), letterSpacing: '-.03em' }}><Num value={d.score} /></b></div>
              <div className="hbar" style={{ margin: '12px 0' }}><i style={{ width: `${d.score}%`, background: healthColor(d.score) }} /></div>
              <div className="row tiny muted" style={{ gap: 12 }}><span><b style={{ color: 'var(--tx)' }}>{d.open}</b> open</span><span><b style={{ color: d.overdue ? 'var(--red)' : 'var(--tx)' }}>{d.overdue}</b> late</span><span><b style={{ color: 'var(--tx)' }}>{d.onTime}%</b> fixed on time</span></div>
              <div className="row" style={{ gap: 4, marginTop: 12, flexWrap: 'wrap' }}>{cats.map(([k]) => <span key={k} title={CATEGORIES[k].label}><CatIcon c={k} size={22} /></span>)}</div>
            </div>
          )
        })}
        <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, var(--mintbg), transparent)' }}>
          <Info size={18} color="var(--mint)" />
          <b className="small">How the score works</b>
          <p className="tiny dim" style={{ lineHeight: 1.5 }}>Each area starts at 100 and loses points for late requests, old open work and backlog size, and gains for fixes delivered on time. The city index weights areas by how much work is open.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', alignItems: 'start' }}>
        <div className="card">
          <div className="cardhead"><MapPin size={15} /><h3>Fairness by district</h3><span className="sub">average days waiting</span></div>
          <div style={{ padding: '12px 16px' }}>
            {[...h.districts].sort((a, b) => b.wait - a.wait).map(d => {
              const lag = d.wait - avgWait > s.rules.equityGap
              return (
                <div key={d.id} style={{ padding: '7px 0' }}>
                  <div className="row small" style={{ marginBottom: 5 }}><span style={{ flex: 1, fontWeight: 600 }}>{d.name}</span>{lag && <span className="pill warn" style={{ height: 20, marginRight: 8 }}>boosted</span>}<span className="mono" style={{ fontWeight: 700 }}>{d.wait.toFixed(1)} d</span></div>
                  <div className="hbar"><i style={{ width: `${(d.wait / maxWait) * 100}%`, background: lag ? 'var(--amber)' : 'var(--mint)' }} /></div>
                </div>
              )
            })}
            <div className="tiny muted" style={{ marginTop: 8 }}>City average {avgWait.toFixed(1)} days. A district more than {s.rules.equityGap.toFixed(1)} days above it gets an equity boost.</div>
          </div>
        </div>
        <div className="card">
          <div className="cardhead"><Wallet size={15} /><h3>Where the money goes</h3><span className="sub">FY2026 · illustrative</span></div>
          <div style={{ padding: '12px 16px' }}>
            {BUDGET.map(b => (
              <div key={b.key} style={{ padding: '7px 0' }}>
                <div className="row small" style={{ marginBottom: 5 }}><span style={{ flex: 1, fontWeight: 600 }}>{DOMAINS[b.key].label}</span><span className="mono dim">${b.spent.toFixed(1)}M <span className="muted">/ {b.budget.toFixed(1)}</span></span></div>
                <div className="hbar"><i style={{ width: `${(b.spent / b.budget) * 100}%`, background: DOMAINS[b.key].color }} /></div>
              </div>
            ))}
            <div className="tiny muted" style={{ marginTop: 8 }}>Spend to date against the annual budget for each service area. Demo figures.</div>
          </div>
        </div>
        <div className="card">
          <div className="cardhead"><AlertTriangle size={15} /><h3>Hotspots to watch</h3></div>
          {hot.map(({ q, p }) => (
            <div key={q.id} className="row" style={{ padding: '10px 16px', borderTop: '1px solid var(--line)', gap: 10, cursor: 'pointer' }} onClick={() => navigate(base + q.id)}>
              <CatIcon c={q.category} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}><b className="small" style={{ fontWeight: 600 }}>{CATEGORIES[q.category].label}</b><div className="tiny muted">{q.address} · {districtName(q.district)} · {q.upvotes} votes</div></div>
              <span className="mono small" style={{ fontWeight: 750, color: p.level === 'high' ? 'var(--red)' : 'var(--amber)' }}>{p.score}</span>
            </div>
          ))}
          <div className="tiny muted" style={{ padding: '10px 16px', borderTop: '1px solid var(--line)' }}><Sparkles size={11} style={{ verticalAlign: -1 }} /> Forecast: freezing nights this week usually add 15–20 new potholes. Public Works has 2 crews free.</div>
        </div>
      </div>
    </div>
  )
}
