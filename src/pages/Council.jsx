import { HeartPulse, Repeat, Sparkles, MapPin, Landmark } from 'lucide-react'
import Shell from '../components/Shell.jsx'
import { useStore } from '../store.js'
import { CATEGORIES, DOMAINS } from '../data/city.js'
import { AgentMark, CatIcon, Num } from '../components/ui.jsx'
import Health from './Health.jsx'
import RequestDetail from './RequestDetail.jsx'

const HOT = [
  ['pothole', '400 block of Elm St', 'Riverside', 9, 'Patched every 5–6 weeks since March. Resurfacing the block ($38k) costs less than two more years of patching ($44k).'],
  ['graffiti', 'Harbor Way overpass', 'Westbrook', 7, 'Same wall each time. An anti-graffiti coating or a commissioned mural would cut repeat cleanups.'],
  ['flood', 'Riverside Park lower lot', 'Riverside', 6, 'Floods after every heavy rain. The inlet is undersized; Water & Sewer has a capital request pending.'],
  ['tree', 'Cedar Ln, 1–200', 'Westbrook', 5, 'Aging street trees. A forestry survey before winter would reduce emergency calls.'],
  ['streetlight', 'College Ave & Main St', 'Eastfield', 4, 'Same fixture keeps failing. Likely a wiring fault, not the lamp.'],
  ['heat', 'Maple St apartments', 'Downtown', 4, 'Four no-heat complaints from one building in two winters. Code Enforcement recommends a full inspection.'],
]
const BY_CAT = [['pothole', 1840], ['streetlight', 1210], ['trash', 980], ['snow', 760], ['noise', 690], ['sidewalk', 610], ['graffiti', 540], ['dumping', 470], ['flood', 420], ['tree', 310], ['heat', 260], ['rodent', 220]]

export default function Council({ sub, id }) {
  const s = useStore()
  const groups = [{ label: 'City council', items: [
    { to: '/council', label: 'City health', icon: HeartPulse, exact: true },
    { to: '/council/patterns', label: 'Repeat problems', icon: Repeat },
  ] }]
  let page
  if (sub === 'requests' && id) page = <RequestDetail id={id} role="council" />
  else if (sub === 'patterns') page = <Patterns />
  else page = <Health s={s} base="/council/requests/" title="City health · council view" />
  return <Shell role="council" groups={groups} agent={false}>{page}</Shell>
}

function Patterns() {
  return (
    <div className="page" style={{ maxWidth: 1300 }}>
      <div className="pagehead"><div><div className="eyebrow"><Repeat size={13} />Repeat problems</div><h1>Where fixing the cause beats fixing the symptom</h1><p>The AI looks across a year of requests for spots that keep coming back, and estimates what a lasting fix would save. These are suggestions for budget talks, not decisions.</p></div></div>
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card kpi spot"><div className="l"><Landmark size={14} />Requests this year</div><div className="v"><Num value={6840} /></div><div className="d">across 19 kinds of problems</div></div>
        <div className="card kpi spot"><div className="l">Median days to fix</div><div className="v"><Num value={2.9} decimals={1} /></div><div className="d good">4.6 before the PCC pilot</div></div>
        <div className="card kpi spot agentk"><div className="l"><Sparkles size={14} />Reports that were duplicates</div><div className="v"><Num value={41} />%</div><div className="d">merged by the AI, not by staff</div></div>
        <div className="card kpi spot agentk"><div className="l">Staff hours saved since August</div><div className="v"><Num value={1240} /></div><div className="d">about $52,000 at $42/hour</div></div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', alignItems: 'start' }}>
        <div className="card">
          <div className="cardhead"><AgentMark size="sm" /><h3>Spots that keep coming back</h3></div>
          {HOT.map(([c, where, dist, n, note], i) => (
            <div key={where} className="row rowin" style={{ padding: '14px 18px', borderTop: '1px solid var(--line)', gap: 14, alignItems: 'flex-start', animationDelay: `${i * 50}ms` }}>
              <CatIcon c={c} size={36} />
              <div style={{ flex: 1 }}>
                <div className="row" style={{ gap: 8 }}><b>{where}</b><span className="tiny muted"><MapPin size={11} style={{ verticalAlign: -1 }} /> {dist}</span></div>
                <p className="small dim" style={{ marginTop: 4, lineHeight: 1.5 }}>{note}</p>
              </div>
              <div style={{ textAlign: 'right' }}><b className="mono" style={{ fontSize: 20, color: 'var(--amber)' }}>{n}×</b><div className="tiny muted">this year</div></div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="cardhead"><h3>What residents report most</h3><span className="sub">this year</span></div>
          <div style={{ padding: '10px 18px 16px' }}>
            {BY_CAT.map(([c, n]) => (
              <div key={c} className="row" style={{ gap: 10, padding: '5px 0' }}>
                <CatIcon c={c} size={22} />
                <span className="small" style={{ width: 130 }}>{CATEGORIES[c].label}</span>
                <span className="hbar" style={{ flex: 1 }}><i style={{ width: `${(n / 1840) * 100}%`, background: 'var(--tx)' }} /></span>
                <span className="small mono" style={{ width: 46, textAlign: 'right', fontWeight: 650 }}>{n.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
