import { LineChart as LineIcon, Scale, Wallet, TrendingUp, Sparkles, MapPin } from 'lucide-react'
import Shell from '../components/Shell.jsx'
import CityMap from '../components/CityMap.jsx'
import { useStore, isOpen } from '../store.js'
import { DISTRICTS, CATEGORIES } from '../data/city.js'
import { AgentMark } from '../components/ui.jsx'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']
const CITY = [4.9, 5.3, 4.7, 4.5, 4.4, 4.6, 4.5, 3.9, 3.4, 3.1, 2.9]
const WORST = [7.1, 7.8, 6.9, 6.6, 6.4, 6.7, 6.5, 5.2, 4.3, 3.9, 3.7]
const BEST = [3.6, 3.9, 3.5, 3.3, 3.2, 3.3, 3.3, 3.0, 2.7, 2.5, 2.4]
const DIST = { northgate: 2.4, eastfield: 2.5, downtown: 2.8, riverside: 3.2, westbrook: 3.6, southport: 3.7 }
const BY_CAT = [['pothole', 1840], ['streetlight', 1210], ['trash', 980], ['snow', 760], ['sidewalk', 610], ['graffiti', 540], ['drain', 420], ['tree', 310], ['leak', 110], ['signal', 60]]
const SPEND = [
  ['Streets & Sanitation', 3580, 1.42, 610],
  ['Transportation', 1270, 0.61, 240],
  ['Public Works', 1150, 0.48, 180],
  ['Water', 530, 0.39, 120],
  ['Parks & Forestry', 310, 0.22, 90],
]
const HOT = [
  ['400 block of Elm St', 'Riverside', 'Pothole', 9, 'Patching repeats every 5 to 6 weeks. Resurfacing the block may cost less over two years.'],
  ['Harbor Way overpass', 'Westbrook', 'Graffiti', 7, 'Same wall each time. A mural or anti-graffiti coating would cut repeat cleanups.'],
  ['Cedar Ln, 1–200', 'Westbrook', 'Fallen tree', 5, 'Old street trees. A forestry survey before winter would reduce emergency calls.'],
  ['College Ave & Main St', 'Eastfield', 'Streetlight', 4, 'Same fixture. Likely a wiring fault, not the bulb.'],
]
const FORECAST = [['pothole', 520, 380, 640], ['snow', 410, 220, 690], ['streetlight', 300, 250, 350], ['drain', 120, 80, 170], ['tree', 90, 60, 140]]

export default function Council() {
  const s = useStore()
  const nav = [{ to: '/council', label: 'City health', icon: LineIcon, exact: true }]
  const open = s.requests.filter(isOpen).length
  const cityMed = 2.9
  const guard = cityMed + s.rules.equityGap
  return (
    <Shell role="council" nav={nav} agent={false}>
      <div className="page wide" style={{ maxWidth: 1320 }}>
        <div className="pagehead">
          <div><div className="eyebrow">City health · January to November 2026</div><h1>How Riverton's services are doing</h1><p>Built from every complaint and work order PCC coordinates. Demo data for a fictional city.</p></div>
        </div>
        <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="card kpi"><div className="l">Requests this year</div><div className="v">6,840</div><div className="d">{open} open today</div></div>
          <div className="card kpi"><div className="l">Median days to resolve</div><div className="v">2.9</div><div className="d good">4.6 before the PCC pilot</div></div>
          <div className="card kpi agentk"><div className="l">Reports that were duplicates</div><div className="v">41%</div><div className="d">merged by the agent instead of by staff</div></div>
          <div className="card kpi agentk"><div className="l">Staff hours saved since August</div><div className="v">1,240</div><div className="d">about $52,000 at $42 per hour</div></div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)' }}>
          <div className="card">
            <div className="cardhead"><TrendingUp size={16} /><h3>Days to resolve a request, by month</h3></div>
            <div style={{ padding: '12px 18px 6px' }}><TimeChart /></div>
            <Means>Since the pilot started in August, the city median fell from 4.5 to 2.9 days, and the slowest district improved most: from 6.5 to 3.7 days.</Means>
          </div>
          <div className="card">
            <div className="cardhead"><Scale size={16} /><h3>Equity: median days by district</h3><span className="right tiny muted">guardrail {guard.toFixed(1)} days</span></div>
            <div style={{ padding: '14px 18px 6px' }}>
              {DISTRICTS.map(d => {
                const v = DIST[d.id], over = v > guard
                return (
                  <div key={d.id} className="row" style={{ gap: 12, padding: '6px 0' }}>
                    <span className="small" style={{ width: 84, fontWeight: 600 }}>{d.name}</span>
                    <span style={{ flex: 1, position: 'relative', height: 14 }}>
                      <i style={{ position: 'absolute', inset: '3px auto 3px 0', width: `${(v / 5) * 100}%`, borderRadius: 5, background: over ? 'var(--red)' : v > cityMed ? 'var(--amber)' : 'var(--green-2)' }} />
                      <i style={{ position: 'absolute', top: -3, bottom: -3, left: `${(guard / 5) * 100}%`, width: 0, borderLeft: '2px dashed var(--ink-3)' }} />
                    </span>
                    <span className="small mono" style={{ width: 36, textAlign: 'right', fontWeight: 700 }}>{v.toFixed(1)}</span>
                  </div>
                )
              })}
            </div>
            <Means>Westbrook and Southport are still slower than the city median, but inside the {s.rules.equityGap.toFixed(1)}-day guardrail set in the ops console. The agent gives their requests an equity boost until the gap closes.</Means>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', marginTop: 16 }}>
          <div className="card">
            <div className="cardhead"><h3>What residents report</h3><span className="sub">requests this year</span></div>
            <div style={{ padding: '12px 18px 4px' }}>
              {BY_CAT.map(([c, n]) => (
                <div key={c} className="row" style={{ gap: 10, padding: '4px 0' }}>
                  <span className="small" style={{ width: 140 }}>{CATEGORIES[c].label}</span>
                  <span style={{ flex: 1, height: 10, borderRadius: 4, background: 'var(--line-2)', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: `${(n / 1840) * 100}%`, background: CATEGORIES[c].color, opacity: .85 }} /></span>
                  <span className="small mono" style={{ width: 48, textAlign: 'right', fontWeight: 650 }}>{n.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Means>Potholes are 27% of all requests, and a third of them are repeats at the same spots.</Means>
          </div>
          <div className="card">
            <div className="cardhead"><MapPin size={16} /><h3>Repeat problems</h3><span className="sub">same place, 12 months</span></div>
            <table className="table">
              <thead><tr><th>Place</th><th>Type</th><th style={{ textAlign: 'right' }}>Requests</th><th>Agent's note</th></tr></thead>
              <tbody>{HOT.map(h => (
                <tr key={h[0]}><td><b className="small">{h[0]}</b><div className="tiny muted">{h[1]}</div></td><td className="small">{h[2]}</td><td className="mono" style={{ textAlign: 'right', fontWeight: 750 }}>{h[3]}</td><td className="small" style={{ color: 'var(--ink-2)' }}>{h[4]}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', marginTop: 16 }}>
          <div className="card">
            <div className="cardhead"><Wallet size={16} /><h3>Where the money goes</h3><span className="sub">estimated repair cost this year</span></div>
            <table className="table">
              <thead><tr><th>Department</th><th style={{ textAlign: 'right' }}>Requests</th><th style={{ textAlign: 'right' }}>Est. cost</th><th style={{ textAlign: 'right' }}>Staff hours saved</th></tr></thead>
              <tbody>{SPEND.map(r => (
                <tr key={r[0]}><td style={{ fontWeight: 600 }}>{r[0]}</td><td className="mono" style={{ textAlign: 'right' }}>{r[1].toLocaleString()}</td><td className="mono" style={{ textAlign: 'right' }}>${r[2].toFixed(2)}M</td><td className="mono" style={{ textAlign: 'right' }}>{r[3]}</td></tr>
              ))}</tbody>
            </table>
            <Means>Streets & Sanitation carries half the cost. Cutting repeat pothole patches on 4 blocks would save more than the PCC subscription costs.</Means>
          </div>
          <div className="card">
            <div className="cardhead"><h3>Next quarter forecast</h3><span className="sub">Dec–Feb, estimated range</span></div>
            <div style={{ padding: '12px 18px 4px' }}>
              {FORECAST.map(([c, mid, lo, hi]) => (
                <div key={c} className="row" style={{ gap: 10, padding: '6px 0' }}>
                  <span className="small" style={{ width: 120 }}>{CATEGORIES[c].label}</span>
                  <span style={{ flex: 1, position: 'relative', height: 14 }}>
                    <i style={{ position: 'absolute', top: 6, height: 2, left: `${(lo / 700) * 100}%`, width: `${((hi - lo) / 700) * 100}%`, background: 'var(--ink-3)' }} />
                    <i style={{ position: 'absolute', top: 2, width: 10, height: 10, borderRadius: '50%', left: `calc(${(mid / 700) * 100}% - 5px)`, background: CATEGORIES[c].color }} />
                  </span>
                  <span className="small mono" style={{ width: 80, textAlign: 'right', fontWeight: 650 }}>{lo}–{hi}</span>
                </div>
              ))}
            </div>
            <Means>Snow is the most uncertain line. The plan assumes 8 working plows; last winter 3 broke in January, so budget for repairs before the season.</Means>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function Means({ children }) {
  return <div className="row small" style={{ gap: 10, padding: '12px 18px 16px', alignItems: 'flex-start', color: 'var(--ink-2)' }}><AgentMark size="sm" /><span style={{ lineHeight: 1.5 }}>{children}</span></div>
}

function TimeChart() {
  const W = 620, H = 220, L = 34, R = 12, T = 14, B = 26
  const X = i => L + (i / (MONTHS.length - 1)) * (W - L - R)
  const Y = v => T + (1 - v / 8) * (H - T - B)
  const line = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(v)}`).join(' ')
  const band = `${WORST.map((v, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(v)}`).join(' ')} ${[...BEST].reverse().map((v, j) => `L${X(BEST.length - 1 - j)} ${Y(v)}`).join(' ')} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="Median days to resolve fell from 4.5 to 2.9 after August">
      {[0, 2, 4, 6, 8].map(v => <g key={v}><line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="#ECE9E0" /><text x={L - 8} y={Y(v) + 4} textAnchor="end" fontSize="11" fill="#7C887F">{v}</text></g>)}
      <rect x={X(7)} y={T} width={X(10) - X(7) + 6} height={H - T - B} fill="#E8F0FA" opacity=".7" />
      <text x={X(7) + 6} y={T + 14} fontSize="11" fontWeight="700" fill="#2B5E9E">PCC pilot</text>
      <path d={band} fill="#C9C3B3" opacity=".35" />
      <path d={line(WORST)} fill="none" stroke="#C4462C" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d={line(CITY)} fill="none" stroke="#1F4D36" strokeWidth="2.6" />
      {CITY.map((v, i) => <circle key={i} cx={X(i)} cy={Y(v)} r="3" fill="#1F4D36" />)}
      <text x={X(10) - 4} y={Y(CITY[10]) + 16} textAnchor="end" fontSize="11.5" fontWeight="700" fill="#1F4D36">City median 2.9</text>
      <text x={X(10) - 4} y={Y(WORST[10]) - 22} textAnchor="end" fontSize="11.5" fontWeight="650" fill="#C4462C">Slowest district 3.7</text>
      {MONTHS.map((m, i) => <text key={m} x={X(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="#7C887F">{m}</text>)}
    </svg>
  )
}
