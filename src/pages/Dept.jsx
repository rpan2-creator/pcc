import { useState } from 'react'
import { KanbanSquare, Users, Snowflake, ThumbsUp, Info, CalendarCheck, UserCheck, Truck, AlertTriangle, ArrowRight, CloudSnow, Sparkles, Wrench, CheckCircle2, Clock, Camera, MapPin } from 'lucide-react'
import Shell from '../components/Shell.jsx'
import CityMap from '../components/CityMap.jsx'
import { useStore, deptQueue, etaOf, accept, triggerStorm, breakPlows, repairPlows, crewFix } from '../store.js'
import { CATEGORIES, DEPARTMENTS, districtName } from '../data/city.js'
import { Priority, WhyModal, AgentMark, Photo, CatIcon, Status, Num } from '../components/ui.jsx'
import { EXTRA } from '../data/photos.js'
import { navigate, Link } from '../router.jsx'
import { ago, time } from '../format.js'
import RequestDetail from './RequestDetail.jsx'

export const DEPT = 'publicworks'
const D = 864e5

export default function Dept({ sub, id }) {
  const s = useStore()
  const newN = s.requests.filter(q => q.dept === DEPT && q.status === 'new').length
  const groups = [
    { label: 'Public Works', items: [
      { to: '/dept', label: 'Work queue', icon: KanbanSquare, exact: true, count: newN },
      { to: '/dept/crews', label: 'Crews & fleet', icon: Users },
      { to: '/dept/winter', label: 'Winter operations', icon: Snowflake, count: s.proposals.some(p => p.status === 'pending') ? 1 : 0 },
    ] },
  ]
  let page
  if (sub === 'request') page = <RequestDetail id={id} role="dept" />
  else if (sub === 'crews') page = <Crews s={s} />
  else if (sub === 'winter') page = <Winter s={s} />
  else page = <Queue s={s} />
  return <Shell role="dept" groups={groups}>{page}</Shell>
}

const COLS = [
  ['new', 'From the AI', 'Sorted, merged, ranked. Accept or reroute.'],
  ['accepted', 'Accepted', 'Book a crew and a date.'],
  ['scheduled', 'Scheduled', 'Crew and date set. Residents told.'],
  ['in_progress', 'Crew working', 'On site. Close out with a photo.'],
]

function Queue({ s }) {
  const all = deptQueue(s, DEPT)
  const [why, setWhy] = useState(null)
  const [kind, setKind] = useState('all')
  const list = all.filter(x => kind === 'all' || (kind === 'snow' ? x.q.category === 'snow' : x.q.category !== 'snow'))
  const crews = s.crews.filter(c => c.dept === DEPT)
  const free = crews.filter(c => c.status === 'available')
  const fixed = s.requests.filter(r => r.dept === DEPT && ['resolved', 'closed'].includes(r.status) && (r.resolvedAt || r.closedAt) && s.now - (r.resolvedAt || r.closedAt) < 7 * D)
  const overdue = all.filter(({ q }) => s.now - q.createdAt > CATEGORIES[q.category].target * D).length
  return (
    <div className="page" style={{ maxWidth: 1480 }}>
      <div className="pagehead">
        <div><div className="eyebrow"><KanbanSquare size={13} />Public Works · work queue</div><h1>Morning, Marcus</h1><p>Potholes, sidewalks and snow for Riverton. The AI already merged duplicates and ranked everything by risk, votes and wait time.</p></div>
        <div className="actions">
          <div className="seg">{[['all', 'All work'], ['road', 'Streets'], ['snow', 'Snow']].map(([k, l]) => <button key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{l}</button>)}</div>
        </div>
      </div>
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card kpi spot"><div className="l"><Sparkles size={14} />New from the AI</div><div className="v"><Num value={all.filter(x => x.q.status === 'new').length} /></div><div className="d">{s.stats.merged} duplicate reports already merged</div></div>
        <div className="card kpi spot"><div className="l"><Users size={14} />Crews free now</div><div className="v"><Num value={free.length} /><span style={{ fontSize: 16, color: 'var(--tx3)' }}> / {crews.length}</span></div><div className="d">{free.map(c => c.name.replace('Public Works ', '')).join(', ') || 'All crews busy'}</div></div>
        <div className="card kpi spot"><div className="l"><Clock size={14} />Past target</div><div className="v"><Num value={overdue} /></div><div className={`d ${overdue ? 'bad' : 'good'}`}>{overdue ? 'The AI reminds you before escalating' : 'Everything on time'}</div></div>
        <div className="card kpi spot agentk"><div className="l"><CheckCircle2 size={14} />Fixed this week</div><div className="v"><Num value={fixed.length} /></div><div className="d">residents got the after photo</div></div>
      </div>
      <div className="kanban">
        {COLS.map(([st, label, help]) => {
          const items = list.filter(x => x.q.status === st)
          return (
            <div key={st} className="kcol">
              <div className="kcol-h">
                <div className="row" style={{ gap: 7 }}>{st === 'new' && <AgentMark size="sm" />}<b>{label}</b><span className="n">{items.length}</span></div>
                <small>{help}</small>
              </div>
              {items.slice(0, 8).map(({ q, p }, i) => <QCard key={q.id} q={q} p={p} s={s} i={i} onWhy={() => setWhy({ q, p })} />)}
              {items.length > 8 && <div className="tiny muted" style={{ padding: 8, textAlign: 'center' }}>+{items.length - 8} more, lower priority</div>}
              {!items.length && <div className="tiny muted" style={{ padding: '24px 8px', textAlign: 'center' }}>Nothing here</div>}
            </div>
          )
        })}
      </div>
      {why && <WhyModal q={why.q} p={why.p} onClose={() => setWhy(null)} />}
    </div>
  )
}

function QCard({ q, p, s, i, onWhy }) {
  const eta = etaOf(q, s)
  const crew = s.crews.find(c => c.id === q.crew)
  const late = s.now - q.createdAt > CATEGORIES[q.category].target * D
  return (
    <div className="kcard" style={{ animationDelay: `${i * 40}ms` }} onClick={() => navigate(`/dept/request/${q.id}`)}>
      <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 46, flex: 'none' }}><Photo c={q.category} seed={q.id.charCodeAt(6)} style={{ aspectRatio: '1', borderRadius: 9 }} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 6 }}><CatIcon c={q.category} size={18} /><b className="small" style={{ fontWeight: 650 }}>{CATEGORIES[q.category].label}</b></div>
          <div className="tiny muted" style={{ marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.address} · {districtName(q.district)}</div>
        </div>
      </div>
      <div className="row" style={{ gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
        <Priority p={p} />
        <span className="chip" style={{ height: 22 }}><ThumbsUp size={11} />{q.upvotes}</span>
        {q.reports.length > 1 && <span className="chip" style={{ height: 22 }}>{q.reports.length} reports</span>}
        {late && <span className="pill bad" style={{ height: 22 }}>Late</span>}
        {q.flags.includes('reopened') && <span className="pill warn" style={{ height: 22 }}>Reopened</span>}
      </div>
      {q.nearby && <div className="tiny" style={{ marginTop: 8, color: 'var(--amber)' }}><MapPin size={11} style={{ verticalAlign: -1 }} /> Near {q.nearby}</div>}
      <div className="row" style={{ marginTop: 10, paddingTop: 9, borderTop: '1px solid var(--line)', gap: 6 }} onClick={e => e.stopPropagation()}>
        <span className="tiny muted" style={{ flex: 1, whiteSpace: 'nowrap' }} title={eta.text}><Clock size={11} style={{ verticalAlign: -1 }} /> {eta.short}</span>
        {q.status === 'new' && <button className="btn sm primary" onClick={() => accept(q.id)}><UserCheck size={13} />Accept</button>}
        {q.status === 'accepted' && <button className="btn sm" onClick={() => navigate(`/dept/request/${q.id}`)}><CalendarCheck size={13} />Schedule</button>}
        {['scheduled', 'in_progress'].includes(q.status) && q.category !== 'snow' && <button className="btn sm" onClick={() => crewFix(q.id, crew?.name || 'Public Works crew 2')}><Camera size={13} />Fixed</button>}
      </div>
    </div>
  )
}

function Crews({ s }) {
  const crews = s.crews.filter(c => c.dept === DEPT)
  return (
    <div className="page" style={{ maxWidth: 1300 }}>
      <div className="pagehead"><div><div className="eyebrow"><Users size={13} />Crews & fleet</div><h1>Who is out, and on what</h1><p>Read live from the fleet tracker. The AI uses this to estimate repair times for residents and to plan snow routes.</p></div></div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 14 }}>
        {crews.map((c, i) => {
          const job = s.requests.find(q => q.id === c.on)
          return (
            <div key={c.id} className="card spot lift" style={{ overflow: 'hidden' }}>
              <Photo src={i % 2 ? EXTRA.paving.src : EXTRA.crew.src} style={{ borderRadius: 0, aspectRatio: '16/8' }} />
              <div style={{ padding: 14 }}>
                <div className="row"><b>{c.name}</b><span className="spacer" /><span className={`pill ${c.status === 'available' ? 'ok' : 'warn'}`}><span className="dot" />{c.status === 'available' ? 'Free' : 'On a job'}</span></div>
                <div className="tiny muted" style={{ marginTop: 3 }}>Lead: {c.lead}</div>
                <div className="small" style={{ marginTop: 10, minHeight: 36 }}>{job ? <Link to={`/dept/request/${job.id}`} className="link">{CATEGORIES[job.category].label} · {job.address}</Link> : <span className="muted">Ready for the next job in the queue</span>}</div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="card">
        <div className="cardhead"><Truck size={15} /><h3>Snowplows</h3><span className="sub">{s.plows.filter(p => p.status !== 'broken').length} of {s.plows.length} working</span>
          <span className="right">{s.plows.some(p => p.status === 'broken') ? <button className="btn sm" onClick={repairPlows}><Wrench size={13} />Mark all repaired</button> : s.storm && <button className="btn sm" onClick={() => breakPlows(2)}><AlertTriangle size={13} />Simulate 2 breakdowns</button>}</span>
        </div>
        <table className="table">
          <thead><tr><th>Plow</th><th>Driver</th><th>Status</th><th>Routes in the current plan</th></tr></thead>
          <tbody>{s.plows.map(p => {
            const routes = s.storm?.plan.routes.filter(r => r.plow === p.id) || []
            return (
              <tr key={p.id}><td className="mono small" style={{ fontWeight: 700 }}>{p.id}</td><td className="small">{p.driver}</td>
                <td><span className={`pill ${p.status === 'broken' ? 'bad' : 'ok'}`}><span className="dot" />{p.status === 'broken' ? 'Hydraulic fault' : 'Working'}</span></td>
                <td className="small dim">{routes.length ? routes.map(r => r.name).join(' → ') : <span className="muted">{s.storm ? 'Not assigned' : 'No snow emergency'}</span>}</td></tr>
            )
          })}</tbody>
        </table>
      </div>
    </div>
  )
}

function Winter({ s }) {
  if (!s.storm) return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <div className="pagehead"><div><div className="eyebrow"><Snowflake size={13} />Winter operations</div><h1>No snow emergency right now</h1><p>When snow reports start arriving, the AI merges them by street, builds a plow plan from the plows that actually work, and posts a time for every street.</p></div></div>
      <div className="card" style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <Photo src={EXTRA.plow.src} style={{ borderRadius: 0, aspectRatio: 'auto', height: '100%', minHeight: 260 }} />
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
          <b style={{ fontSize: 20, letterSpacing: '-.02em' }}>Last January, 3 of 8 plows broke mid-storm.</b>
          <p className="dim" style={{ lineHeight: 1.55 }}>Residents called 311 thousands of times because nobody knew when their street would be cleared. PCC re-plans around broken plows and tells every street its new time, after a person approves.</p>
          <div><button className="btn primary lg" onClick={triggerStorm}><CloudSnow size={17} />Start the demo snowstorm</button></div>
        </div>
      </div>
    </div>
  )
  const plan = s.storm.plan
  const pending = s.proposals.find(p => p.status === 'pending' && p.kind === 'replan')
  const working = s.plows.filter(p => p.status !== 'broken').length
  const snowReqs = s.requests.filter(q => q.category === 'snow' && q.status !== 'merged')
  const routes = [...plan.routes].sort((a, b) => a.order - b.order)
  const H = 3600e3
  return (
    <div className="page" style={{ maxWidth: 1480 }}>
      <div className="pagehead">
        <div><div className="eyebrow"><Snowflake size={13} />Winter operations · snow emergency</div><h1>Plow plan for {plan.plows} plows</h1><p>{snowReqs.reduce((a, q) => a + q.reports.length, 0)} resident reports merged into {snowReqs.length} streets. Every street's time is public on the resident map.</p></div>
        <div className="actions">{!pending && working === 8 && <button className="btn" onClick={() => breakPlows(2)}><AlertTriangle size={15} />Simulate 2 plow breakdowns</button>}</div>
      </div>
      {pending && (
        <Link to="/ops/decisions" className="callout warn" style={{ marginBottom: 14, alignItems: 'center' }}>
          <AlertTriangle size={17} style={{ flex: 'none' }} /><span style={{ flex: 1 }}><b>{8 - working} plows are down.</b> The AI proposed a new plan for {working} plows. Drivers keep the current order until Dana Reyes approves it.</span><span className="btn sm">See the proposal <ArrowRight size={13} /></span>
        </Link>
      )}
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.3fr) minmax(360px, 1fr)', alignItems: 'start' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="cardhead"><h3>Route map</h3><span className="sub">brighter = sooner</span></div>
          <div style={{ padding: 10 }}><CityMap requests={snowReqs} snow={plan} now={s.now} onSelect={id => navigate(`/dept/request/${id}`)} /></div>
        </div>
        <div className="card">
          <div className="cardhead"><AgentMark size="sm" /><h3>Order the AI chose</h3></div>
          <table className="table">
            <thead><tr><th>#</th><th>Street</th><th>Type</th><th>Plow</th><th>Done by</th></tr></thead>
            <tbody>{routes.map((r, i) => (
              <tr key={r.street} className="rowin" style={{ animationDelay: `${i * 25}ms` }}>
                <td className="mono small" style={{ fontWeight: 700 }}>{r.order}</td>
                <td className="small"><b style={{ fontWeight: 600 }}>{r.name}</b>{r.critical && <div className="tiny" style={{ color: 'var(--red)' }}>Hospital corridor</div>}{r.reports > 0 && <div className="tiny muted">{r.reports} reports</div>}</td>
                <td><span className={`pill ${r.kind === 'emergency' ? 'bad' : r.kind === 'arterial' ? 'warn' : ''}`}>{r.kind === 'emergency' ? 'Emergency' : r.kind === 'arterial' ? 'Main road' : 'Residential'}</span></td>
                <td className="mono tiny dim">{r.plow}</td>
                <td className="small">{time(r.end)}<div className="tiny muted">in {Math.max(0, (r.end - s.now) / H).toFixed(1)} h</div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
