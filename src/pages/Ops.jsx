import { useMemo, useRef, useState } from 'react'
import { LayoutDashboard, Inbox, Lightbulb, ListChecks, SlidersHorizontal, ScrollText, ArrowRight, Check, X, Info, ShieldAlert, Undo2, Sparkles, ArrowUp, ArrowDown, Minus, CheckCircle2, AlertTriangle, Search } from 'lucide-react'
import Shell from '../components/Shell.jsx'
import CityMap from '../components/CityMap.jsx'
import { useStore, priorityOf, etaOf, isOpen, decideReview, decideProposal, setWeight, commitWeights, setRule, undo, FACTOR_LABEL } from '../store.js'
import { CATEGORIES, DEPARTMENTS, DISTRICTS, districtName, STREETS } from '../data/city.js'
import { Priority, Status, Cat, Conf, WhyModal, AgentMark, FeedIcon, LEVEL } from '../components/ui.jsx'
import { navigate, Link } from '../router.jsx'
import { ago, time, dayTime } from '../format.js'
import RequestDetail from './RequestDetail.jsx'

export default function Ops({ sub, id }) {
  const s = useStore()
  const reviewN = s.requests.filter(q => q.status === 'review' || (q.flags.includes('escalated') && isOpen(q))).length
  const propN = s.proposals.filter(p => p.status === 'pending').length
  const nav = [
    { to: '/ops', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/ops/review', label: 'Needs review', icon: Inbox, count: reviewN },
    { to: '/ops/proposals', label: 'Agent proposals', icon: Lightbulb, count: propN, agent: true },
    { to: '/ops/requests', label: 'All requests', icon: ListChecks },
    { to: '/ops/rules', label: 'Rules & equity', icon: SlidersHorizontal },
    { to: '/ops/audit', label: 'Audit log', icon: ScrollText },
  ]
  let page
  if (sub === 'review') page = <Review s={s} />
  else if (sub === 'proposals') page = <Proposals s={s} />
  else if (sub === 'requests' && id) page = <RequestDetail id={id} role="ops" />
  else if (sub === 'requests') page = <Requests s={s} />
  else if (sub === 'rules') page = <Rules s={s} />
  else if (sub === 'audit') page = <Audit s={s} />
  else page = <Overview s={s} />
  return <Shell role="ops" nav={nav}>{page}</Shell>
}

function Overview({ s }) {
  const open = s.requests.filter(isOpen)
  const [district, setDistrict] = useState('all')
  const shown = open.filter(q => district === 'all' || q.district === district)
  const overdue = open.filter(q => q.flags.includes('nudged')).length
  const review = s.requests.filter(q => q.status === 'review')
  const esc = open.filter(q => q.flags.includes('escalated'))
  const props = s.proposals.filter(p => p.status === 'pending')
  const top = open.filter(q => q.status !== 'review').map(q => ({ q, p: priorityOf(q, s) })).sort((a, b) => b.p.score - a.p.score).slice(0, 7)
  const [why, setWhy] = useState(null)
  const byDept = Object.entries(DEPARTMENTS).map(([k, d]) => ({ k, d, n: open.filter(q => q.dept === k).length, hi: open.filter(q => q.dept === k && priorityOf(q, s).level === 'high').length }))
  const maxDept = Math.max(...byDept.map(x => x.n))
  return (
    <div className="page wide">
      <div className="pagehead">
        <div><div className="eyebrow">Ops console</div><h1>Good morning, Dana</h1><p>{open.length} open requests across Riverton. The agent handled {s.stats.merged + s.stats.routed} coordination steps today.</p></div>
        <div className="actions"><Link to="/ops/review" className="btn primary">Review {review.length + esc.length + props.length} decisions <ArrowRight size={15} /></Link></div>
      </div>
      <div className="kpis">
        <div className="card kpi"><div className="l">Open requests</div><div className="v">{open.length}</div><div className="d">from {s.reports.filter(r => open.some(q => q.id === r.reqId)).length} resident reports</div></div>
        <div className="card kpi agentk"><div className="l">Duplicates merged today</div><div className="v">{s.stats.merged}</div><div className="d">by the agent, 0 undone</div></div>
        <div className="card kpi"><div className="l">Median days to resolve</div><div className="v">2.9</div><div className="d good">down from 4.6 before PCC</div></div>
        <div className="card kpi"><div className="l">Overdue</div><div className="v" style={{ color: overdue ? 'var(--red)' : undefined }}>{overdue}</div><div className="d">{overdue ? 'reminders sent by the agent' : 'nothing past its target'}</div></div>
        <div className="card kpi agentk"><div className="l">Staff hours saved this week</div><div className="v">{s.stats.hoursSaved + Math.round(s.stats.merged / 6)}</div><div className="d">sorting, routing and replies</div></div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.7fr) minmax(280px, 1fr)', alignItems: 'start' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="cardhead"><h3>City map</h3><span className="sub">{shown.length} open requests</span>
            <span className="right"><select className="select" style={{ padding: '5px 8px', fontSize: 12.5 }} value={district} onChange={e => setDistrict(e.target.value)}><option value="all">All districts</option>{DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></span></div>
          <div style={{ padding: 12 }}><CityMap requests={shown} onSelect={id => navigate(`/ops/requests/${id}`)} now={s.now} /></div>
        </div>
        <div className="grid">
          <div className="card">
            <div className="cardhead"><h3>Needs your decision</h3><span className="right"><Link to="/ops/review" className="small" style={{ color: 'var(--agent)', fontWeight: 650 }}>See all</Link></span></div>
            <div>
              {props.map(p => <DecisionRow key={p.id} icon={<Lightbulb size={15} />} title={p.title} sub="Agent proposal · big change" to="/ops/proposals" warn />)}
              {esc.map(q => <DecisionRow key={q.id} icon={<ShieldAlert size={15} />} title={`${q.id} escalated: ${CATEGORIES[q.category].label}, ${q.address}`} sub={`Still not scheduled after a reminder to ${DEPARTMENTS[q.dept].short}`} to={`/ops/requests/${q.id}`} warn />)}
              {review.map(q => <DecisionRow key={q.id} icon={<Inbox size={15} />} title={q.reviewNote} sub={`${q.id} · confidence ${Math.round(q.confidence * 100)}%`} to="/ops/review" />)}
              {!props.length && !esc.length && !review.length && <div className="empty small"><CheckCircle2 size={20} /><div style={{ marginTop: 6 }}>Nothing waiting. The agent is handling the rest.</div></div>}
            </div>
          </div>
          <div className="card pad">
            <h3 style={{ fontSize: 14.5, marginBottom: 12 }}>Open work by department</h3>
            {byDept.map(({ k, d, n, hi }) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div className="row small"><b style={{ fontWeight: 600 }}>{d.name}</b><span className="spacer" /><span className="muted">{n} open · {hi} high</span></div>
                <div style={{ height: 8, borderRadius: 9, background: 'var(--line-2)', marginTop: 5, display: 'flex', overflow: 'hidden' }}>
                  <i style={{ width: `${(hi / maxDept) * 100}%`, background: 'var(--red)' }} /><i style={{ width: `${((n - hi) / maxDept) * 100}%`, background: '#C9C3B3' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="cardhead"><h3>Highest priority right now</h3><span className="sub">ranked by the agent with your weights</span><span className="right"><Link to="/ops/rules" className="btn sm"><SlidersHorizontal size={13} />Weights</Link></span></div>
        <RequestTable rows={top} s={s} onWhy={setWhy} />
      </div>
      {why && <WhyModal q={why.q} p={why.p} onClose={() => setWhy(null)} />}
    </div>
  )
}

function DecisionRow({ icon, title, sub, to, warn }) {
  return (
    <Link to={to} className="row" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line-2)', gap: 12, alignItems: 'flex-start' }}>
      <span className="agentmark sm" style={{ background: warn ? '#C7672F' : 'var(--agent)', marginTop: 1 }}>{icon}</span>
      <span style={{ flex: 1 }}><b className="small" style={{ fontWeight: 600, display: 'block', lineHeight: 1.35 }}>{title}</b><span className="tiny muted">{sub}</span></span>
      <ArrowRight size={14} style={{ color: 'var(--ink-3)', marginTop: 3 }} />
    </Link>
  )
}

function RequestTable({ rows, s, onWhy, base = '/ops/requests/' }) {
  return (
    <table className="table">
      <thead><tr><th>Request</th><th>Category</th><th>District</th><th>Department</th><th>Priority</th><th>Reports</th><th>Status</th><th>Estimate</th><th /></tr></thead>
      <tbody>
        {rows.map(({ q, p }) => (
          <tr key={q.id} className="click" onClick={() => navigate(base + q.id)}>
            <td><span className="id">{q.id}</span><div className="small" style={{ fontWeight: 600 }}>{q.address}</div></td>
            <td className="small"><Cat c={q.category} /></td>
            <td className="small">{districtName(q.district)}</td>
            <td className="small">{DEPARTMENTS[q.dept].short}</td>
            <td><Priority p={p} /></td>
            <td className="small mono">{q.reports.length} · {q.upvotes} up</td>
            <td><Status s={q.status} /></td>
            <td className="small">{etaOf(q, s).text}</td>
            <td onClick={e => e.stopPropagation()}><button className="btn sm ghost" onClick={() => onWhy({ q, p })}><Info size={13} />Why</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Review({ s }) {
  const review = s.requests.filter(q => q.status === 'review')
  const esc = s.requests.filter(q => q.flags.includes('escalated') && isOpen(q))
  const done = s.audit.filter(a => a.kind === 'review' && a.actor !== 'agent').slice(0, 6)
  return (
    <div className="page">
      <div className="pagehead"><div><div className="eyebrow">Needs review</div><h1>Decisions the agent left to you</h1><p>The agent acts alone only above your {s.rules.threshold}% confidence threshold. Everything else waits here with its best guess.</p></div></div>
      {esc.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, margin: '4px 0 10px' }}>Escalations</h3>
          {esc.map(q => (
            <div key={q.id} className="card pad row" style={{ marginBottom: 10, gap: 14, borderColor: '#F0C9AE' }}>
              <span className="agentmark" style={{ background: '#C7672F' }}><ShieldAlert size={15} /></span>
              <div style={{ flex: 1 }}><b>{q.id} · {CATEGORIES[q.category].label}, {q.address}</b><div className="small muted">{DEPARTMENTS[q.dept].name} has not scheduled it {((s.now - q.createdAt) / 864e5).toFixed(1)} days after the report, even after a reminder. Target: {CATEGORIES[q.category].target} days.</div></div>
              <Link to={`/ops/requests/${q.id}`} className="btn primary">Open and act</Link>
            </div>
          ))}
        </>
      )}
      {review.length > 0 && <h3 style={{ fontSize: 14, margin: '18px 0 10px' }}>Low confidence</h3>}
      <div className="grid">
        {review.map(q => <ReviewCard key={q.id} q={q} s={s} />)}
        {!review.length && !esc.length && <div className="card empty"><CheckCircle2 size={22} color="var(--green-2)" /><div style={{ marginTop: 8, fontWeight: 600, color: 'var(--ink)' }}>All clear</div><div className="small">The agent will add items here when it is not sure.</div></div>}
      </div>
      {done.length > 0 && (
        <div className="card" style={{ marginTop: 22 }}>
          <div className="cardhead"><h3>Recently decided</h3></div>
          {done.map(a => <div key={a.id} className="row small" style={{ padding: '10px 16px', borderTop: '1px solid var(--line-2)' }}><Check size={14} color="var(--green-2)" /><span style={{ flex: 1 }}>{a.text}</span><span className="muted">{time(a.at)}</span>{a.before && !a.undone && <button className="btn sm ghost" onClick={() => undo(a.id)}><Undo2 size={13} />Undo</button>}</div>)}
        </div>
      )}
    </div>
  )
}

function ReviewCard({ q, s }) {
  const rep = s.reports.find(r => q.reports.includes(r.id))
  const opts = q.reviewKind === 'route'
    ? [[q.guess, `Send to ${DEPARTMENTS[q.guess].name}`, true], [q.alt, `Send to ${DEPARTMENTS[q.alt].name}`]]
    : q.reviewKind === 'category'
      ? [[q.guess, CATEGORIES[q.guess].label, true], [q.alt, `${CATEGORIES[q.alt].label} (urgent)`]]
      : [['merge', `Merge into ${q.guess}`, true], ['new', 'Keep as a new request']]
  return (
    <div className="card">
      <div className="cardhead"><span className="id">{q.id}</span><span className="sub">{q.address} · {ago(q.createdAt, s.now)}</span><span className="right"><Conf v={q.confidence} /></span></div>
      <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <div className="small muted" style={{ marginBottom: 6 }}>Resident wrote</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.5 }}>“{rep?.text}”</p>
          <div className="tiny muted" style={{ marginTop: 6 }}>{rep?.residentName} · {rep?.channel}</div>
        </div>
        <div>
          <div className="row small" style={{ marginBottom: 6, color: 'var(--agent)', fontWeight: 650 }}><Sparkles size={14} />Why the agent stopped</div>
          <p className="small" style={{ lineHeight: 1.5 }}>{q.reviewNote}</p>
          <div className="col" style={{ gap: 8, marginTop: 14 }}>
            {opts.map(([v, l, best]) => (
              <button key={v} className={`btn ${best ? 'agent' : ''}`} style={{ justifyContent: 'flex-start' }} onClick={() => decideReview(q.id, v)}>
                {best ? <Sparkles size={14} /> : <ArrowRight size={14} />}{l}{best && <span style={{ marginLeft: 'auto', fontSize: 11.5, opacity: .8 }}>agent's guess</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Proposals({ s }) {
  const list = s.proposals
  return (
    <div className="page">
      <div className="pagehead"><div><div className="eyebrow">Agent proposals</div><h1>Big changes wait for your approval</h1><p>When a change would move many residents' times or cross departments, the agent proposes it instead of doing it.</p></div></div>
      {!list.length && (
        <div className="card empty">
          <Lightbulb size={22} /><div style={{ marginTop: 8, fontWeight: 600, color: 'var(--ink)' }}>No proposals right now</div>
          <div className="small">Try the Demo menu: start a snowstorm, then break 2 plows.</div>
        </div>
      )}
      <div className="grid">{list.map(p => <ProposalCard key={p.id} p={p} s={s} />)}</div>
    </div>
  )
}

function ProposalCard({ p, s }) {
  const H = 3600e3
  const max = Math.max(...p.diff.map(d => (d.after - p.at) / H))
  const rows = [...p.diff].sort((a, b) => (a.after - b.after))
  const pending = p.status === 'pending'
  return (
    <div className="card" style={pending ? { borderColor: '#CFDDEF', boxShadow: '0 0 0 3px var(--agent-soft)' } : null}>
      <div className="cardhead">
        <AgentMark size="sm" /><h3>{p.title}</h3>
        <span className="right">{pending ? <span className="pill agent">Waiting for approval</span> : <span className={`pill ${p.status === 'approved' ? 'ok' : ''}`}>{p.status === 'approved' ? `Approved by ${p.decidedBy}` : `Rejected by ${p.decidedBy}`}</span>}</span>
      </div>
      <div style={{ padding: 18 }}>
        <p style={{ fontSize: 14.5, lineHeight: 1.55 }}>{p.summary}</p>
        <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {p.checks.map((c, i) => <span key={i} className="pill ok" style={{ height: 26 }}><Check size={13} />{c.text}</span>)}
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', marginTop: 18, gap: 20 }}>
          <div>
            <div className="row small" style={{ marginBottom: 8 }}><b>Plow finish time by street</b><span className="spacer" /><span className="row tiny muted" style={{ gap: 10 }}><span className="row" style={{ gap: 4 }}><i style={{ width: 10, height: 4, background: '#C9C3B3', borderRadius: 2 }} />current plan</span><span className="row" style={{ gap: 4 }}><i style={{ width: 10, height: 4, background: 'var(--agent)', borderRadius: 2 }} />proposed</span></span></div>
            {rows.map(d => {
              const b = (d.before - p.at) / H, a = (d.after - p.at) / H
              return (
                <div key={d.street} className="row" style={{ gap: 10, padding: '3px 0' }}>
                  <span className="small" style={{ width: 120, fontWeight: d.delta > 0.25 ? 650 : 500, color: d.delta > 0.25 ? 'var(--ink)' : 'var(--ink-2)' }}>{d.name}</span>
                  <span style={{ flex: 1, position: 'relative', height: 14 }}>
                    <i style={{ position: 'absolute', top: 2, left: 0, height: 4, borderRadius: 2, width: `${(b / max) * 100}%`, background: '#C9C3B3' }} />
                    <i style={{ position: 'absolute', top: 8, left: 0, height: 4, borderRadius: 2, width: `${(a / max) * 100}%`, background: d.delta > 0.25 ? 'var(--agent)' : '#7FA7D6' }} />
                  </span>
                  <span className="tiny mono" style={{ width: 70, textAlign: 'right', color: d.delta > 0.25 ? '#A34A12' : 'var(--ink-3)', fontWeight: 650 }}>{d.delta > 0.25 ? `+${d.delta.toFixed(1)} h` : 'same'}</span>
                </div>
              )
            })}
          </div>
          <div>
            <div className="small" style={{ marginBottom: 8 }}><b>Longest wait by district</b></div>
            {DISTRICTS.map(dd => {
              const h = p.byDistrict[dd.id] || 0
              return (
                <div key={dd.id} className="row" style={{ gap: 10, padding: '4px 0' }}>
                  <span className="small" style={{ width: 84 }}>{dd.name}</span>
                  <span style={{ flex: 1, height: 8, background: 'var(--line-2)', borderRadius: 9, overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: `${(h / max) * 100}%`, background: 'var(--agent)' }} /></span>
                  <span className="tiny mono" style={{ width: 40, textAlign: 'right', fontWeight: 650 }}>{h.toFixed(1)} h</span>
                </div>
              )
            })}
            <div className="callout" style={{ marginTop: 14, fontSize: 12.5 }}><Info size={15} style={{ flex: 'none', marginTop: 1 }} />Within each road class, districts that waited longest this year go first, so the delay is shared instead of falling on one neighborhood.</div>
          </div>
        </div>
      </div>
      {pending && (
        <div className="mf" style={{ padding: '14px 18px', borderTop: '1px solid var(--line-2)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <span className="small muted" style={{ marginRight: 'auto', alignSelf: 'center' }}>Approving sends new times to residents on {p.diff.filter(d => d.delta > 0.25).length} streets and the new order to drivers.</span>
          <button className="btn" onClick={() => decideProposal(p.id, false)}><X size={14} />Reject</button>
          <button className="btn primary" onClick={() => decideProposal(p.id, true)}><Check size={14} />Approve plan</button>
        </div>
      )}
    </div>
  )
}

function Requests({ s }) {
  const [f, setF] = useState({ status: 'open', dept: 'all', district: 'all', q: '' })
  const [why, setWhy] = useState(null)
  const rows = s.requests.filter(q => q.status !== 'merged')
    .filter(q => f.status === 'all' ? true : f.status === 'open' ? isOpen(q) : q.status === f.status)
    .filter(q => f.dept === 'all' || q.dept === f.dept)
    .filter(q => f.district === 'all' || q.district === f.district)
    .filter(q => !f.q || (q.id + q.address + CATEGORIES[q.category].label).toLowerCase().includes(f.q.toLowerCase()))
    .map(q => ({ q, p: priorityOf(q, s) })).sort((a, b) => b.p.score - a.p.score)
  const set = (k, v) => setF(x => ({ ...x, [k]: v }))
  return (
    <div className="page wide">
      <div className="pagehead"><div><div className="eyebrow">All requests</div><h1>Every request in Riverton</h1><p>{rows.length} shown, sorted by the agent's priority score.</p></div></div>
      <div className="card">
        <div className="cardhead" style={{ gap: 8, flexWrap: 'wrap' }}>
          <div className="search row" style={{ background: 'var(--bg)', borderRadius: 9, padding: '0 10px', height: 32, width: 240 }}><Search size={14} className="muted" /><input style={{ border: 0, background: 'transparent', outline: 'none', flex: 1 }} placeholder="Filter by ID, street, type" value={f.q} onChange={e => set('q', e.target.value)} /></div>
          <div className="seg">{[['open', 'Open'], ['review', 'Review'], ['new', 'New'], ['scheduled', 'Scheduled'], ['resolved', 'Fixed'], ['all', 'All']].map(([k, l]) => <button key={k} className={f.status === k ? 'on' : ''} onClick={() => set('status', k)}>{l}</button>)}</div>
          <select className="select" style={{ padding: '5px 8px', fontSize: 12.5 }} value={f.dept} onChange={e => set('dept', e.target.value)}><option value="all">All departments</option>{Object.entries(DEPARTMENTS).map(([k, d]) => <option key={k} value={k}>{d.name}</option>)}</select>
          <select className="select" style={{ padding: '5px 8px', fontSize: 12.5 }} value={f.district} onChange={e => set('district', e.target.value)}><option value="all">All districts</option>{DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        </div>
        <RequestTable rows={rows.slice(0, 120)} s={s} onWhy={setWhy} />
      </div>
      {why && <WhyModal q={why.q} p={why.p} onClose={() => setWhy(null)} />}
    </div>
  )
}

function Rules({ s }) {
  const w = s.rules.weights
  const base = useRef(null)
  const ranked = s.requests.filter(q => ['new', 'accepted'].includes(q.status)).map(q => ({ q, p: priorityOf(q, s) })).sort((a, b) => b.p.score - a.p.score)
  if (!base.current) base.current = ranked.map(x => x.q.id)
  const [dirty, setDirty] = useState(false)
  const totalW = Object.values(w).reduce((a, b) => a + b, 0)
  const FACT_HELP = { safety: 'How dangerous the problem is, plus schools and hospitals nearby', community: 'Upvotes and number of reports', age: 'Time open compared with the target for that category', resources: 'Whether the department has crews free', equity: 'Boost for districts that waited longer than the city median this year' }
  return (
    <div className="page wide">
      <div className="pagehead"><div><div className="eyebrow">Rules & equity</div><h1>How the agent decides</h1><p>Change a weight and watch the queue re-rank. The agent explains every ranking with these numbers.</p></div>
        <div className="actions">{dirty && <button className="btn" onClick={() => { Object.entries({ safety: 35, community: 15, age: 20, resources: 15, equity: 15 }).forEach(([k, v]) => setWeight(k, v)); setDirty(true) }}>Restore defaults</button>}<button className="btn primary" disabled={!dirty} onClick={() => { commitWeights(base.current.slice(0, 5)); base.current = ranked.map(x => x.q.id); setDirty(false) }}>Apply to the city</button></div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(280px, .85fr) minmax(0, 1.15fr)', alignItems: 'start' }}>
        <div className="grid">
          <div className="card pad">
            <h3 style={{ fontSize: 14.5, marginBottom: 4 }}>Priority weights</h3>
            <p className="small muted" style={{ marginBottom: 14 }}>Shares of the 0–100 score. Total {totalW}.</p>
            {Object.keys(w).map(k => (
              <div key={k} style={{ marginBottom: 16 }}>
                <div className="row small"><b>{FACTOR_LABEL[k]}</b><span className="spacer" /><span className="mono" style={{ fontWeight: 700 }}>{Math.round((w[k] / totalW) * 100)}%</span></div>
                <div className="tiny muted" style={{ margin: '2px 0 6px' }}>{FACT_HELP[k]}</div>
                <input type="range" min="0" max="60" value={w[k]} onChange={e => { setWeight(k, +e.target.value); setDirty(true) }} aria-label={FACTOR_LABEL[k]} />
              </div>
            ))}
          </div>
          <div className="card pad">
            <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>Guardrails</h3>
            <div style={{ marginBottom: 18 }}>
              <div className="row small"><b>Act alone above this confidence</b><span className="spacer" /><span className="mono" style={{ fontWeight: 700 }}>{s.rules.threshold}%</span></div>
              <div className="tiny muted" style={{ margin: '2px 0 6px' }}>Below it, decisions go to Needs review.</div>
              <input type="range" min="60" max="98" value={s.rules.threshold} onChange={e => setRule('threshold', +e.target.value)} aria-label="Confidence threshold" />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div className="row small"><b>Max gap between districts</b><span className="spacer" /><span className="mono" style={{ fontWeight: 700 }}>{s.rules.equityGap.toFixed(1)} days</span></div>
              <div className="tiny muted" style={{ margin: '2px 0 6px' }}>If a district's median wait drifts more than this above the city median, the agent raises its requests and tells you.</div>
              <input type="range" min="0.5" max="3" step="0.1" value={s.rules.equityGap} onChange={e => setRule('equityGap', +e.target.value)} aria-label="Equity gap" />
            </div>
            {[['autoMerge', 'Merge duplicates without asking', 'Only when confidence is above the threshold'], ['autoNotify', 'Send status updates to residents', 'Staff can edit any message first from the request page']].map(([k, l, d]) => (
              <label key={k} className="row" style={{ padding: '10px 0', borderTop: '1px solid var(--line-2)', cursor: 'pointer' }}>
                <span style={{ flex: 1 }}><b className="small">{l}</b><div className="tiny muted">{d}</div></span>
                <input type="checkbox" checked={s.rules[k]} onChange={e => setRule(k, e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--green)' }} />
              </label>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="cardhead"><AgentMark size="sm" /><h3>Live preview: top 12 waiting to be scheduled</h3></div>
          <table className="table">
            <thead><tr><th style={{ width: 54 }}>Rank</th><th>Request</th><th>Priority</th><th style={{ width: 70 }}>Change</th></tr></thead>
            <tbody>
              {ranked.slice(0, 12).map(({ q, p }, i) => {
                const was = base.current.indexOf(q.id)
                const d = was - i
                return (
                  <tr key={q.id}>
                    <td className="mono" style={{ fontWeight: 700 }}>{i + 1}</td>
                    <td><span className="id">{q.id}</span><div className="row small" style={{ gap: 7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}><span className="catdot" style={{ background: CATEGORIES[q.category].color }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{CATEGORIES[q.category].label} · {q.address}</span></div></td>
                    <td><Priority p={p} /></td>
                    <td className="small" style={{ fontWeight: 700, color: d > 0 ? 'var(--green-2)' : d < 0 ? 'var(--red)' : 'var(--ink-3)' }}>{d > 0 ? <span className="row" style={{ gap: 2 }}><ArrowUp size={13} />{d}</span> : d < 0 ? <span className="row" style={{ gap: 2 }}><ArrowDown size={13} />{-d}</span> : <Minus size={13} />}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Audit({ s }) {
  const [who, setWho] = useState('all')
  const rows = s.audit.filter(a => who === 'all' || (who === 'agent' ? a.actor === 'agent' : a.actor !== 'agent'))
  return (
    <div className="page wide">
      <div className="pagehead"><div><div className="eyebrow">Audit log</div><h1>Every action, by the agent or a person</h1><p>Each entry keeps the reason and the state before it, so it can be checked or undone.</p></div>
        <div className="actions"><div className="seg">{[['all', 'Everyone'], ['agent', 'Agent'], ['people', 'People']].map(([k, l]) => <button key={k} className={who === k ? 'on' : ''} onClick={() => setWho(k)}>{l}</button>)}</div></div>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th style={{ width: 120 }}>Time</th><th style={{ width: 150 }}>Actor</th><th>Action</th><th>Reason</th><th style={{ width: 110 }} /></tr></thead>
          <tbody>
            {rows.slice(0, 150).map(a => (
              <tr key={a.id} style={a.undone ? { opacity: .5 } : null}>
                <td className="small muted">{dayTime(a.at)}</td>
                <td className="small">{a.actor === 'agent' ? <span className="row" style={{ gap: 6 }}><AgentMark size="sm" />PCC agent</span> : <span className="row" style={{ gap: 6, fontWeight: 600 }}>{a.actor}</span>}</td>
                <td className="small" style={{ fontWeight: 550, textDecoration: a.undone ? 'line-through' : 'none' }}><span className="row" style={{ gap: 7 }}><span style={{ color: 'var(--ink-3)' }}><FeedIcon kind={a.kind} size={13} /></span>{a.text}</span>{a.tool && <span className="toolchip" style={{ marginTop: 4 }}>{a.tool}</span>}</td>
                <td className="small muted">{a.why}</td>
                <td>{a.undone ? <span className="pill">Undone</span> : a.before ? <button className="btn sm" onClick={() => undo(a.id)}><Undo2 size={13} />Undo</button> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { RequestTable }
