import { useState } from 'react'
import { KanbanSquare, Users, Snowflake, ThumbsUp, MessagesSquare, Info, CalendarCheck, UserCheck, Truck, AlertTriangle, ArrowRight, CloudSnow, Sparkles, Wrench } from 'lucide-react'
import Shell from '../components/Shell.jsx'
import CityMap from '../components/CityMap.jsx'
import { useStore, deptQueue, etaOf, priorityOf, accept, schedule, triggerStorm, breakPlows, repairPlows } from '../store.js'
import { CATEGORIES, DEPARTMENTS, districtName } from '../data/city.js'
import { Priority, Cat, WhyModal, AgentMark, LEVEL } from '../components/ui.jsx'
import { navigate, Link } from '../router.jsx'
import { ago, time } from '../format.js'
import RequestDetail from './RequestDetail.jsx'

const DEPT = 'streets'

export default function Dept({ sub, id }) {
  const s = useStore()
  const newN = s.requests.filter(q => q.dept === DEPT && q.status === 'new' && q.category !== 'snow').length
  const nav = [
    { to: '/dept', label: 'My queue', icon: KanbanSquare, exact: true, count: newN, agent: true },
    { to: '/dept/crews', label: 'Crews & equipment', icon: Users },
    { to: '/dept/snow', label: 'Snow operations', icon: Snowflake, count: s.storm ? 1 : 0 },
  ]
  let page
  if (sub === 'request') page = <RequestDetail id={id} role="dept" />
  else if (sub === 'crews') page = <Crews s={s} />
  else if (sub === 'snow') page = <Snow s={s} />
  else page = <Queue s={s} />
  return <Shell role="dept" nav={nav}>{page}</Shell>
}

const COLS = [['new', 'New from agent'], ['accepted', 'Accepted'], ['scheduled', 'Scheduled or on site']]

function Queue({ s }) {
  const q = deptQueue(s, DEPT).filter(x => x.q.category !== 'snow')
  const fixed = s.requests.filter(r => r.dept === DEPT && r.status === 'resolved' && r.resolvedAt && s.now - r.resolvedAt < 24 * 3600e3)
  const [why, setWhy] = useState(null)
  const free = s.crews.filter(c => c.dept === DEPT && c.status === 'available')
  return (
    <div className="page wide">
      <div className="pagehead">
        <div><div className="eyebrow">Streets & Sanitation</div><h1>Your queue, Marcus</h1><p>The agent sorted, merged and ranked these. {free.length} of 4 crews are free right now.</p></div>
        <div className="actions"><Link to="/dept/crews" className="btn"><Users size={15} />Crews</Link></div>
      </div>
      <div className="callout" style={{ marginBottom: 16 }}>
        <Sparkles size={16} style={{ flex: 'none', marginTop: 1 }} />
        <span>Since yesterday the agent merged <b>{s.stats.merged}</b> duplicate reports and routed <b>{q.filter(x => x.q.status === 'new').length}</b> new requests to you. Each card has full details, photos, a priority score you can question, and a draft reply for residents.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 14, alignItems: 'start' }}>
        {COLS.map(([st, label]) => {
          const items = q.filter(x => x.q.status === st || (st === 'scheduled' && x.q.status === 'in_progress'))
          return (
            <div key={st} style={{ background: 'rgba(23,37,29,.035)', borderRadius: 14, padding: 10 }}>
              <div className="row" style={{ padding: '4px 6px 10px' }}><b style={{ fontSize: 13 }}>{label}</b><span className="pill" style={{ marginLeft: 6 }}>{items.length}</span>{st === 'new' && <span className="spacer" />}{st === 'new' && <AgentMark size="sm" />}</div>
              <div className="col" style={{ gap: 8 }}>
                {items.slice(0, 9).map(({ q: r, p }) => <QCard key={r.id} r={r} p={p} s={s} onWhy={() => setWhy({ q: r, p })} free={free} />)}
                {items.length > 9 && <div className="tiny muted" style={{ padding: 6, textAlign: 'center' }}>+{items.length - 9} more, lower priority</div>}
              </div>
            </div>
          )
        })}
      </div>
      {fixed.length > 0 && <p className="small muted" style={{ marginTop: 14 }}>Fixed in the last 24 hours: {fixed.map(f => f.id).join(', ')}</p>}
      {why && <WhyModal q={why.q} p={why.p} onClose={() => setWhy(null)} />}
    </div>
  )
}

function QCard({ r, p, s, onWhy, free }) {
  const eta = etaOf(r, s)
  return (
    <div className="card" style={{ padding: 12, cursor: 'pointer', borderLeft: `3px solid ${p.level === 'high' ? 'var(--red)' : p.level === 'medium' ? 'var(--amber)' : 'var(--green-2)'}` }} onClick={() => navigate(`/dept/request/${r.id}`)}>
      <div className="row" style={{ marginBottom: 6 }}><span className="id">{r.id}</span><span className="spacer" />{r.status === 'in_progress' && <span className="pill st-in_progress">On site</span>}{r.flags.includes('nudged') && <span className="pill warn">Overdue</span>}</div>
      <div className="row" style={{ fontWeight: 650, fontSize: 13.5, lineHeight: 1.3, gap: 7 }}><span className="catdot" style={{ background: CATEGORIES[r.category].color }} />{CATEGORIES[r.category].label}</div>
      <div className="small muted" style={{ marginTop: 2 }}>{r.address} · {districtName(r.district)}</div>
      <div className="row" style={{ marginTop: 10, gap: 10 }}>
        <Priority p={p} />
      </div>
      <div className="row tiny muted" style={{ marginTop: 8, gap: 10, whiteSpace: 'nowrap' }}>
        <span className="row" style={{ gap: 4 }}><MessagesSquare size={12} />{r.reports.length}</span>
        <span className="row" style={{ gap: 4 }}><ThumbsUp size={12} />{r.upvotes}</span>
        <span>{r.status === 'scheduled' ? eta.short : ago(r.createdAt, s.now).replace(' ago', '')}</span>
        <span className="spacer" />
        <button className="btn sm ghost" style={{ height: 24, padding: '0 6px' }} onClick={e => { e.stopPropagation(); onWhy() }}><Info size={12} />Why</button>
      </div>
      {r.status === 'new' && (
        <div className="row" style={{ marginTop: 10, gap: 6 }} onClick={e => e.stopPropagation()}>
          <button className="btn sm primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => accept(r.id)}><UserCheck size={13} />Accept</button>
        </div>
      )}
      {r.status === 'accepted' && free.length > 0 && (
        <div className="row" style={{ marginTop: 10 }} onClick={e => e.stopPropagation()}>
          <button className="btn sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => schedule(r.id, free[0].id, 1)}><CalendarCheck size={13} />Book {free[0].name.replace('Streets ', '')} tomorrow</button>
        </div>
      )}
    </div>
  )
}

function Crews({ s }) {
  const crews = s.crews.filter(c => c.dept === DEPT)
  return (
    <div className="page">
      <div className="pagehead"><div><div className="eyebrow">Streets & Sanitation</div><h1>Crews & equipment</h1><p>The agent reads this from the fleet tracker and uses it to estimate times and plan snow routes.</p></div></div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cardhead"><h3>Repair crews</h3><span className="sub">{crews.filter(c => c.status === 'available').length} free</span></div>
        <table className="table">
          <thead><tr><th>Crew</th><th>Lead</th><th>Status</th><th>Working on</th></tr></thead>
          <tbody>{crews.map(c => (
            <tr key={c.id}><td style={{ fontWeight: 600 }}>{c.name}</td><td className="small">{c.lead}</td><td><span className={`pill ${c.status === 'available' ? 'ok' : 'warn'}`}>{c.status === 'available' ? 'Free' : 'Assigned'}</span></td><td className="small">{c.on ? <Link to={`/dept/request/${c.on}`} style={{ color: 'var(--agent)', fontWeight: 600 }}>{c.on}</Link> : <span className="muted">—</span>}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <div className="card">
        <div className="cardhead"><h3>Snowplows</h3><span className="sub">{s.plows.filter(p => p.status !== 'broken').length} of {s.plows.length} working</span>
          <span className="right">{s.storm && <button className="btn sm" onClick={() => breakPlows(1)}><AlertTriangle size={13} />Report a plow fault</button>}{s.plows.some(p => p.status === 'broken') && <button className="btn sm" onClick={repairPlows}><Wrench size={13} />Repair all</button>}</span></div>
        <table className="table">
          <thead><tr><th>Plow</th><th>Driver</th><th>Status</th><th>Routes in the current plan</th></tr></thead>
          <tbody>{s.plows.map(p => {
            const routes = s.storm?.plan.routes.filter(r => r.plow === p.id) || []
            return (
              <tr key={p.id}><td style={{ fontWeight: 600 }}><span className="row" style={{ gap: 7 }}><Truck size={15} />{p.id}</span></td><td className="small">{p.driver}</td>
                <td><span className={`pill ${p.status === 'broken' ? 'high' : 'ok'}`}>{p.status === 'broken' ? 'Hydraulic fault' : 'Ready'}</span></td>
                <td className="small">{routes.length ? routes.map(r => r.name).join(' → ') : <span className="muted">{s.storm ? 'Not assigned' : 'No snow emergency'}</span>}</td></tr>
            )
          })}</tbody>
        </table>
      </div>
    </div>
  )
}

function Snow({ s }) {
  const H = 3600e3
  if (!s.storm) return (
    <div className="page">
      <div className="pagehead"><div><div className="eyebrow">Snow operations</div><h1>No snow emergency</h1><p>When snow reports start arriving, the agent merges them by street and builds a plow plan from the plows that work.</p></div></div>
      <div className="card pad row" style={{ gap: 16 }}>
        <span className="agentmark" style={{ width: 44, height: 44, borderRadius: 12 }}><Snowflake size={20} /></span>
        <div style={{ flex: 1 }}><b>Last winter, 3 of 8 plows broke during the January storm.</b><div className="small muted">PCC plans around the fleet you actually have and tells every resident when their street will be plowed.</div></div>
        <button className="btn primary" onClick={triggerStorm}><CloudSnow size={15} />Start the demo storm</button>
      </div>
    </div>
  )
  const plan = s.storm.plan
  const pending = s.proposals.find(p => p.status === 'pending' && p.kind === 'replan')
  const working = s.plows.filter(p => p.status !== 'broken').length
  const routes = [...plan.routes].sort((a, b) => a.order - b.order)
  const snowReqs = s.requests.filter(q => q.category === 'snow')
  return (
    <div className="page wide">
      <div className="pagehead">
        <div><div className="eyebrow">Snow operations</div><h1>Snow emergency plan</h1><p>{plan.routes.length} routes · plan for {plan.plows} plows · {working} of 8 plows working now · {snowReqs.reduce((a, q) => a + q.reports.length, 0)} resident reports merged into {snowReqs.length} streets</p></div>
        <div className="actions">{!pending && working === 8 && <button className="btn" onClick={() => breakPlows(2)}><AlertTriangle size={15} />Two plows break (demo)</button>}</div>
      </div>
      {pending && (
        <Link to="/ops/proposals" className="callout warn" style={{ marginBottom: 16, alignItems: 'center' }}>
          <AlertTriangle size={17} /><span style={{ flex: 1 }}><b>{8 - working} plows are down.</b> The agent proposed a new plan for {working} plows. It is waiting for Dana Reyes to approve it; drivers keep the current order until then.</span><ArrowRight size={16} />
        </Link>
      )}
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.15fr) minmax(360px, 1fr)', alignItems: 'start' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="cardhead"><h3>When each street gets plowed</h3><span className="sub">colored by finish time</span></div>
          <div style={{ padding: 12 }}><CityMap requests={snowReqs} snow={plan} now={s.now} onSelect={id => navigate(`/dept/request/${id}`)} /></div>
        </div>
        <div className="card">
          <div className="cardhead"><AgentMark size="sm" /><h3 style={{ whiteSpace: 'nowrap' }}>Route order</h3><span className="sub">emergency first, then arterial, then residential</span></div>
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            <table className="table">
              <thead><tr><th style={{ width: 36 }}>#</th><th>Street</th><th>Plow</th><th style={{ textAlign: 'right' }}>Done by</th></tr></thead>
              <tbody>{routes.map(r => (
                <tr key={r.street}>
                  <td className="mono muted">{r.order}</td>
                  <td><b className="small">{r.name}</b><div className="tiny muted">{r.kind} · {districtName(r.district)}{r.reports ? ` · ${r.reports} reports` : ''}</div></td>
                  <td className="small" style={{ whiteSpace: 'nowrap' }}>{r.plow}</td>
                  <td className="small mono" style={{ textAlign: 'right', fontWeight: 650, whiteSpace: 'nowrap' }}>{time(r.end)}<div className="tiny muted">{Math.max(0, (r.end - s.now) / H).toFixed(1)} h</div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
