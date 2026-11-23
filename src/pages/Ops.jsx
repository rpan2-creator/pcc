import { useMemo, useRef, useState } from 'react'
import { Radar, ListChecks, Inbox, HeartPulse, SlidersHorizontal, History, ArrowRight, Check, X, Info, ShieldAlert, Undo2, Sparkles, ArrowUp, ArrowDown, Minus, CheckCircle2, Search, Lightbulb, AlertTriangle, Clock, Gauge, Bot, Users } from 'lucide-react'
import Shell from '../components/Shell.jsx'
import CityMap from '../components/CityMap.jsx'
import { useStore, priorityOf, etaOf, isOpen, decideReview, decideProposal, setWeight, commitWeights, setRule, undo, FACTOR_LABEL, healthOf } from '../store.js'
import { CATEGORIES, DEPARTMENTS, DISTRICTS, DOMAINS, districtName } from '../data/city.js'
import { Priority, Status, Cat, Conf, WhyModal, AgentMark, FeedIcon, Num, HealthRing, healthColor, CatIcon, Photo } from '../components/ui.jsx'
import { navigate, Link } from '../router.jsx'
import { ago, time, dayTime } from '../format.js'
import RequestDetail from './RequestDetail.jsx'
import Health from './Health.jsx'

const D = 864e5
export function opsGroups(s) {
  const decisions = s.requests.filter(q => q.status === 'review' || (q.flags.includes('escalated') && isOpen(q))).length + s.proposals.filter(p => p.status === 'pending').length
  return [
    { label: 'Operations', items: [
      { to: '/ops', label: 'Command center', icon: Radar, exact: true },
      { to: '/ops/decisions', label: 'Decisions', icon: Inbox, count: decisions },
      { to: '/ops/requests', label: 'All requests', icon: ListChecks },
    ] },
    { label: 'City', items: [
      { to: '/ops/health', label: 'City health', icon: HeartPulse },
      { to: '/ops/settings', label: 'Priority settings', icon: SlidersHorizontal },
      { to: '/ops/history', label: 'Activity history', icon: History },
    ] },
  ]
}

export default function Ops({ sub, id }) {
  const s = useStore()
  let page
  if (sub === 'decisions') page = <Decisions s={s} />
  else if (sub === 'requests' && id) page = <RequestDetail id={id} role="ops" />
  else if (sub === 'requests') page = <Requests s={s} />
  else if (sub === 'health') page = <Health s={s} />
  else if (sub === 'settings') page = <Settings s={s} />
  else if (sub === 'history') page = <HistoryPage s={s} />
  else page = <Command s={s} />
  return <Shell role="ops" groups={opsGroups(s)}>{page}</Shell>
}

export function liveKpis(s) {
  const open = s.requests.filter(isOpen)
  const dayStart = s.now - ((s.now - Date.parse('2026-12-07T00:00:00-05:00')) % D)
  const today = s.reports.filter(r => r.at >= dayStart).length
  const overdue = open.filter(q => s.now - q.createdAt > CATEGORIES[q.category].target * D).length
  const closed = s.requests.filter(q => q.status === 'closed' && q.closedAt).map(q => (q.closedAt - q.createdAt) / D).sort((a, b) => a - b)
  const median = closed.length ? closed[Math.floor(closed.length / 2)] : 0
  const human = s.audit.filter(a => a.kind === 'review' && a.actor !== 'agent').length + s.requests.filter(q => q.status === 'review').length
  const auto = s.stats.merged + s.stats.routed
  return { open: open.length, today, overdue, median, autoPct: Math.round((auto / (auto + human)) * 100), hours: Math.round(auto * 0.18 + s.stats.notified * 0.05) }
}

function Command({ s }) {
  const k = liveKpis(s)
  const h = healthOf(s)
  const [dom, setDom] = useState('all')
  const open = s.requests.filter(isOpen)
  const shown = open.filter(q => dom === 'all' || CATEGORIES[q.category].domain === dom)
  const review = s.requests.filter(q => q.status === 'review')
  const esc = open.filter(q => q.flags.includes('escalated'))
  const props = s.proposals.filter(p => p.status === 'pending')
  const top = open.filter(q => q.status !== 'review').map(q => ({ q, p: priorityOf(q, s) })).sort((a, b) => b.p.score - a.p.score).slice(0, 6)
  const [why, setWhy] = useState(null)
  const nDec = review.length + esc.length + props.length
  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <div className="pagehead">
        <div><div className="eyebrow"><Radar size={13} />Command center</div><h1>Good morning, Dana</h1><p>Everything residents reported across Riverton, sorted and routed by the AI. You only need to look at what it could not decide.</p></div>
        <div className="actions"><Link to="/ops/decisions" className="btn primary">{nDec} decision{nDec === 1 ? '' : 's'} for you <ArrowRight size={15} /></Link></div>
      </div>
      <div className="kpis">
        <Kpi icon={ListChecks} l="Open requests" v={k.open} d={`${k.today} new reports today`} />
        <Kpi icon={Clock} l="Past their target" v={k.overdue} d={k.overdue ? 'AI sends reminders first' : 'Everything on time'} tone={k.overdue ? 'bad' : 'good'} />
        <Kpi icon={Gauge} l="Median days to fix" v={k.median} dec={1} d="down from 4.6 before PCC" tone="good" />
        <Kpi icon={Bot} l="Handled by AI alone" v={k.autoPct} suffix="%" d={`${s.stats.merged} duplicates merged`} agent />
        <Kpi icon={Users} l="Staff hours saved" v={k.hours} d="sorting, routing, replying" agent />
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.75fr) minmax(300px, 1fr)', alignItems: 'start' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="cardhead"><h3>Live city map</h3><span className="sub"><Num value={shown.length} /> open</span>
            <span className="right hscrollw">
              <div className="seg">{[['all', 'All']].concat(Object.entries(DOMAINS).map(([k, d]) => [k, d.label.split(' ')[0].replace('&', '')])).map(([k2, l]) => <button key={k2} className={dom === k2 ? 'on' : ''} onClick={() => setDom(k2)}>{l}</button>)}</div>
            </span>
          </div>
          <div style={{ padding: 10 }}><CityMap requests={shown} onSelect={id => navigate(`/ops/requests/${id}`)} now={s.now} /></div>
        </div>
        <div className="grid">
          <Link to="/ops/health" className="card spot lift" style={{ padding: 18, display: 'flex', gap: 18, alignItems: 'center' }}>
            <HealthRing value={h.index} size={116} stroke={10} label="City health" />
            <div style={{ flex: 1, minWidth: 0 }}>
              {h.domains.slice().sort((a, b) => a.score - b.score).slice(0, 4).map(d => (
                <div key={d.key} style={{ marginBottom: 9 }}>
                  <div className="row tiny" style={{ marginBottom: 4 }}><span className="dim" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span><b className="mono">{d.score}</b></div>
                  <div className="hbar"><i style={{ width: `${d.score}%`, background: healthColor(d.score) }} /></div>
                </div>
              ))}
              <span className="tiny link">Lowest 4 areas · see all <ArrowRight size={11} style={{ verticalAlign: -1 }} /></span>
            </div>
          </Link>
          <div className="card">
            <div className="cardhead"><Inbox size={15} /><h3>Waiting for you</h3><span className="right"><Link to="/ops/decisions" className="tiny link">Open all</Link></span></div>
            {props.map(p => <DecisionRow key={p.id} icon={<Lightbulb size={14} />} title={p.title} sub="Plan to approve · changes many residents' times" to="/ops/decisions" warn />)}
            {esc.map(q => <DecisionRow key={q.id} icon={<ShieldAlert size={14} />} title={`${CATEGORIES[q.category].label} at ${q.address} is late`} sub={`${DEPARTMENTS[q.dept].short} did not act after a reminder`} to={`/ops/requests/${q.id}`} warn />)}
            {review.map(q => <DecisionRow key={q.id} icon={<Sparkles size={14} />} title={q.reviewNote} sub={`${q.id} · AI confidence ${Math.round(q.confidence * 100)}%`} to="/ops/decisions" />)}
            {!nDec && <div className="empty small"><CheckCircle2 size={22} color="var(--green)" /><div style={{ marginTop: 8 }}>Nothing waiting. The AI is handling the rest.</div></div>}
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="cardhead"><h3>Most urgent right now</h3><span className="sub">ranked by the AI using your priority settings</span><span className="right"><Link to="/ops/requests" className="btn sm">All requests</Link></span></div>
        <RequestTable rows={top} s={s} onWhy={setWhy} />
      </div>
      {why && <WhyModal q={why.q} p={why.p} onClose={() => setWhy(null)} />}
    </div>
  )
}

function Kpi({ icon: I, l, v, d, tone, agent, dec = 0, suffix = '' }) {
  return (
    <div className={`card kpi spot ${agent ? 'agentk' : ''}`}>
      <div className="l"><I size={14} />{l}</div>
      <div className="v"><Num value={v} decimals={dec} />{suffix}</div>
      <div className={`d ${tone || ''}`}>{d}</div>
    </div>
  )
}

function DecisionRow({ icon, title, sub, to, warn }) {
  return (
    <Link to={to} className="row" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', gap: 12, alignItems: 'flex-start', transition: 'background .15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(210,255,230,.03)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
      <span className="agentmark sm" style={warn ? { background: 'var(--amber)', boxShadow: 'none' } : null}>{icon}</span>
      <span style={{ flex: 1 }}><b className="small" style={{ fontWeight: 600, display: 'block', lineHeight: 1.4 }}>{title}</b><span className="tiny muted">{sub}</span></span>
      <ArrowRight size={14} style={{ color: 'var(--tx3)', marginTop: 3 }} />
    </Link>
  )
}

export function RequestTable({ rows, s, onWhy, base = '/ops/requests/' }) {
  return (
    <table className="table">
      <thead><tr><th>Problem</th><th>Where</th><th>Department</th><th>Priority</th><th>Reports</th><th>Status</th><th>Expected</th><th /></tr></thead>
      <tbody>
        {rows.map(({ q, p }, i) => (
          <tr key={q.id} className="click rowin" style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }} onClick={() => navigate(base + q.id)}>
            <td><div className="row" style={{ gap: 10 }}><CatIcon c={q.category} size={30} /><div><b className="small" style={{ fontWeight: 650 }}>{CATEGORIES[q.category].label}</b><div className="id">{q.id}</div></div></div></td>
            <td className="small">{q.address}<div className="tiny muted">{districtName(q.district)}</div></td>
            <td className="small dim">{DEPARTMENTS[q.dept].short}</td>
            <td><Priority p={p} /></td>
            <td className="small mono dim">{q.reports.length} · {q.upvotes}<span className="muted"> votes</span></td>
            <td><Status s={q.status} /></td>
            <td className="small dim">{etaOf(q, s).text}</td>
            <td onClick={e => e.stopPropagation()}><button className="btn sm ghost" onClick={() => onWhy({ q, p })}><Info size={13} />Why</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Decisions({ s }) {
  const review = s.requests.filter(q => q.status === 'review')
  const esc = s.requests.filter(q => q.flags.includes('escalated') && isOpen(q))
  const props = s.proposals
  const [tab, setTab] = useState(props.some(p => p.status === 'pending') ? 'plans' : 'unsure')
  const done = s.audit.filter(a => ['review', 'approve', 'reject'].includes(a.kind) && a.actor !== 'agent').slice(0, 6)
  const tabs = [['unsure', 'AI is unsure', review.length], ['late', 'Late work', esc.length], ['plans', 'Plans to approve', props.filter(p => p.status === 'pending').length]]
  return (
    <div className="page">
      <div className="pagehead"><div><div className="eyebrow"><Inbox size={13} />Decisions</div><h1>Only the calls that need a person</h1><p>The AI acts on its own when it is at least {s.rules.threshold}% sure. Everything else lands here with its best guess and the reason it stopped.</p></div></div>
      <div className="seg" style={{ marginBottom: 16 }}>{tabs.map(([k, l, n]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}{n > 0 && <span className="pill" style={{ marginLeft: 6, height: 18, padding: '0 6px', background: 'var(--mintbg)', color: 'var(--mint)' }}>{n}</span>}</button>)}</div>
      {tab === 'unsure' && <div className="grid">{review.map(q => <ReviewCard key={q.id} q={q} s={s} />)}{!review.length && <Empty text="The AI is confident about everything right now." />}</div>}
      {tab === 'late' && <div className="grid">{esc.map(q => (
        <div key={q.id} className="card pad row spot" style={{ gap: 14 }}>
          <CatIcon c={q.category} size={40} />
          <div style={{ flex: 1 }}><b>{CATEGORIES[q.category].label} at {q.address}</b><div className="small muted" style={{ marginTop: 3 }}>{DEPARTMENTS[q.dept].name} has not scheduled it after {((s.now - q.createdAt) / D).toFixed(1)} days and one reminder. Target: {CATEGORIES[q.category].target} days.</div></div>
          <Link to={`/ops/requests/${q.id}`} className="btn primary">Open and act</Link>
        </div>
      ))}{!esc.length && <Empty text="Nothing is late. The AI reminds departments before anything reaches you." />}</div>}
      {tab === 'plans' && <div className="grid">{props.map(p => <ProposalCard key={p.id} p={p} s={s} />)}{!props.length && <Empty text="No plans waiting. During a snowstorm, the AI proposes route plans here." />}</div>}
      {done.length > 0 && (
        <div className="card" style={{ marginTop: 22 }}>
          <div className="cardhead"><h3>Decided recently</h3></div>
          {done.map(a => <div key={a.id} className="row small" style={{ padding: '10px 16px', borderTop: '1px solid var(--line)' }}><Check size={14} color="var(--green)" /><span style={{ flex: 1 }}>{a.text}</span><span className="muted">{time(a.at)}</span>{a.before && !a.undone && <button className="btn sm ghost" onClick={() => undo(a.id)}><Undo2 size={13} />Undo</button>}</div>)}
        </div>
      )}
    </div>
  )
}
const Empty = ({ text }) => <div className="card empty"><CheckCircle2 size={24} color="var(--green)" /><div style={{ marginTop: 10, color: 'var(--tx2)' }}>{text}</div></div>

function ReviewCard({ q, s }) {
  const rep = s.reports.find(r => q.reports.includes(r.id))
  const opts = q.reviewKind === 'route'
    ? [[q.guess, `Send to ${DEPARTMENTS[q.guess].name}`, true], [q.alt, `Send to ${DEPARTMENTS[q.alt].name}`]]
    : q.reviewKind === 'category'
      ? [[q.guess, `It is a ${CATEGORIES[q.guess].label.toLowerCase()}`, true], [q.alt, `It is a ${CATEGORIES[q.alt].label.toLowerCase()} (urgent)`]]
      : [['merge', `Same problem as ${q.guess}: merge`, true], ['new', 'Different problem: keep separate']]
  return (
    <div className="card spot" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr) minmax(0, 1.15fr)' }}>
        <Photo c={q.category} seed={2} style={{ borderRadius: 0, aspectRatio: 'auto', height: '100%', minHeight: 200 }} />
        <div style={{ padding: 18, borderRight: '1px solid var(--line)' }}>
          <div className="row" style={{ marginBottom: 10, gap: 8, flexWrap: 'wrap' }}><span className="id" style={{ whiteSpace: 'nowrap' }}>{q.id}</span><span className="tiny muted">{q.address} · {ago(q.createdAt, s.now)}</span></div>
          <div className="small muted" style={{ marginBottom: 6 }}>Resident wrote</div>
          <p style={{ fontSize: 15, lineHeight: 1.5 }}>“{rep?.text}”</p>
          <div className="tiny muted" style={{ marginTop: 8 }}>{rep?.residentName} · {rep?.channel}</div>
        </div>
        <div style={{ padding: 18 }}>
          <div className="row small" style={{ marginBottom: 8, color: 'var(--mint)', fontWeight: 700 }}><Sparkles size={14} />Why the AI stopped<span className="spacer" /><Conf v={q.confidence} /></div>
          <p className="small dim" style={{ lineHeight: 1.55 }}>{q.reviewNote}</p>
          <div className="col" style={{ gap: 8, marginTop: 14 }}>
            {opts.map(([v, l, best]) => (
              <button key={v} className={`btn ${best ? 'primary' : ''}`} style={{ justifyContent: 'flex-start' }} onClick={() => decideReview(q.id, v)}>
                {best ? <Sparkles size={14} /> : <ArrowRight size={14} />}<span style={{ flex: 1, textAlign: 'left' }}>{l}</span>{best && <span style={{ fontSize: 11, opacity: .75 }}>AI's best guess</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProposalCard({ p, s }) {
  const H = 3600e3
  const max = Math.max(...p.diff.map(d => (d.after - p.at) / H))
  const rows = [...p.diff].sort((a, b) => (a.after - b.after))
  const pending = p.status === 'pending'
  return (
    <div className="card" style={pending ? { borderColor: 'rgba(126,240,193,.35)', boxShadow: '0 0 40px -20px var(--mintglow)' } : null}>
      <div className="cardhead">
        <AgentMark size="sm" /><h3>{p.title}</h3>
        <span className="right">{pending ? <span className="pill agent"><span className="dot" />Waiting for your approval</span> : <span className={`pill ${p.status === 'approved' ? 'ok' : ''}`}>{p.status === 'approved' ? `Approved by ${p.decidedBy}` : `Rejected by ${p.decidedBy}`}</span>}</span>
      </div>
      <div style={{ padding: 18 }}>
        <p style={{ fontSize: 14.5, lineHeight: 1.55 }}>{p.summary}</p>
        <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>{p.checks.map((c, i) => <span key={i} className="pill ok" style={{ height: 26 }}><Check size={13} />{c.text}</span>)}</div>
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', marginTop: 18, gap: 24 }}>
          <div>
            <div className="row small" style={{ marginBottom: 10 }}><b>When each street will be plowed</b><span className="spacer" /><span className="row tiny muted" style={{ gap: 10 }}><span className="row" style={{ gap: 4 }}><i style={{ width: 10, height: 3, background: 'rgba(210,255,230,.25)', borderRadius: 2 }} />current</span><span className="row" style={{ gap: 4 }}><i style={{ width: 10, height: 3, background: 'var(--mint)', borderRadius: 2 }} />proposed</span></span></div>
            {rows.map((d, i) => {
              const b = (d.before - p.at) / H, a = (d.after - p.at) / H
              const late = d.delta > 0.25
              return (
                <div key={d.street} className="row rowin" style={{ gap: 10, padding: '3px 0', animationDelay: `${i * 30}ms` }}>
                  <span className="small" style={{ width: 118, fontWeight: late ? 650 : 500, color: late ? 'var(--tx)' : 'var(--tx2)' }}>{d.name}</span>
                  <span style={{ flex: 1, position: 'relative', height: 14 }}>
                    <i style={{ position: 'absolute', top: 2, left: 0, height: 3, borderRadius: 2, width: `${(b / max) * 100}%`, background: 'rgba(210,255,230,.22)' }} />
                    <i style={{ position: 'absolute', top: 8, left: 0, height: 3, borderRadius: 2, width: `${(a / max) * 100}%`, background: late ? 'var(--amber)' : 'var(--mint)' }} />
                  </span>
                  <span className="tiny mono" style={{ width: 60, textAlign: 'right', color: late ? 'var(--amber)' : 'var(--tx3)', fontWeight: 700 }}>{late ? `+${d.delta.toFixed(1)} h` : 'same'}</span>
                </div>
              )
            })}
          </div>
          <div>
            <div className="small" style={{ marginBottom: 10 }}><b>Longest wait by district</b></div>
            {DISTRICTS.map(dd => { const hh = p.byDistrict[dd.id] || 0; return (
              <div key={dd.id} className="row" style={{ gap: 10, padding: '4px 0' }}>
                <span className="small dim" style={{ width: 84 }}>{dd.name}</span>
                <span className="hbar" style={{ flex: 1 }}><i style={{ width: `${(hh / max) * 100}%`, background: 'var(--mint)' }} /></span>
                <span className="tiny mono" style={{ width: 40, textAlign: 'right', fontWeight: 700 }}>{hh.toFixed(1)} h</span>
              </div>
            ) })}
            <div className="callout" style={{ marginTop: 14, fontSize: 12.5 }}><Info size={15} style={{ flex: 'none', marginTop: 1 }} />Within each road type, districts that waited longest this year go first, so the delay is shared instead of landing on one neighborhood.</div>
          </div>
        </div>
      </div>
      {pending && (
        <div className="row" style={{ padding: '14px 18px', borderTop: '1px solid var(--line)', gap: 8 }}>
          <span className="small muted" style={{ marginRight: 'auto' }}>Approving texts new times to residents on {p.diff.filter(d => d.delta > 0.25).length} streets and sends the new order to drivers.</span>
          <button className="btn" onClick={() => decideProposal(p.id, false)}><X size={14} />Keep current plan</button>
          <button className="btn primary" onClick={() => decideProposal(p.id, true)}><Check size={14} />Approve new plan</button>
        </div>
      )}
    </div>
  )
}

function Requests({ s }) {
  const [f, setF] = useState({ status: 'open', dept: 'all', domain: 'all', q: '' })
  const [why, setWhy] = useState(null)
  const rows = s.requests.filter(q => q.status !== 'merged')
    .filter(q => f.status === 'all' ? true : f.status === 'open' ? isOpen(q) : f.status === 'done' ? ['resolved', 'closed'].includes(q.status) : q.status === f.status)
    .filter(q => f.dept === 'all' || q.dept === f.dept)
    .filter(q => f.domain === 'all' || CATEGORIES[q.category].domain === f.domain)
    .filter(q => !f.q || (q.id + q.address + CATEGORIES[q.category].label).toLowerCase().includes(f.q.toLowerCase()))
    .map(q => ({ q, p: priorityOf(q, s) })).sort((a, b) => b.p.score - a.p.score)
  const set = (k, v) => setF(x => ({ ...x, [k]: v }))
  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <div className="pagehead"><div><div className="eyebrow"><ListChecks size={13} />All requests</div><h1>Every problem residents reported</h1><p><Num value={rows.length} /> shown, most urgent first.</p></div></div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <button className={`chip`} style={f.domain === 'all' ? { background: 'var(--mintbg)', color: 'var(--mint)' } : null} onClick={() => set('domain', 'all')}>All types</button>
        {Object.entries(DOMAINS).map(([k, d]) => <button key={k} className="chip" style={{ border: 0, cursor: 'pointer', ...(f.domain === k ? { background: 'var(--mintbg)', color: 'var(--mint)' } : null) }} onClick={() => set('domain', k)}><i style={{ width: 8, height: 8, borderRadius: 3, background: d.color }} />{d.label}</button>)}
      </div>
      <div className="card">
        <div className="cardhead" style={{ gap: 8, flexWrap: 'wrap' }}>
          <div className="row input" style={{ height: 34, padding: '0 10px', width: 260 }}><Search size={14} className="muted" /><input style={{ border: 0, background: 'transparent', outline: 'none', flex: 1 }} placeholder="Search ID, street or type" value={f.q} onChange={e => set('q', e.target.value)} /></div>
          <div className="seg">{[['open', 'Open'], ['review', 'Needs a decision'], ['new', 'Waiting for dept.'], ['scheduled', 'Scheduled'], ['done', 'Fixed'], ['all', 'All']].map(([k, l]) => <button key={k} className={f.status === k ? 'on' : ''} onClick={() => set('status', k)}>{l}</button>)}</div>
          <select className="select" style={{ padding: '6px 8px', fontSize: 12.5 }} value={f.dept} onChange={e => set('dept', e.target.value)}><option value="all">All departments</option>{Object.entries(DEPARTMENTS).map(([k, d]) => <option key={k} value={k}>{d.name}</option>)}</select>
        </div>
        <RequestTable rows={rows.slice(0, 120)} s={s} onWhy={setWhy} />
        {!rows.length && <div className="empty">No requests match these filters.</div>}
      </div>
      {why && <WhyModal q={why.q} p={why.p} onClose={() => setWhy(null)} />}
    </div>
  )
}

function Settings({ s }) {
  const w = s.rules.weights
  const base = useRef(null)
  const ranked = s.requests.filter(q => ['new', 'accepted'].includes(q.status)).map(q => ({ q, p: priorityOf(q, s) })).sort((a, b) => b.p.score - a.p.score)
  if (!base.current) base.current = ranked.map(x => x.q.id)
  const [dirty, setDirty] = useState(false)
  const totalW = Object.values(w).reduce((a, b) => a + b, 0) || 1
  const HELP = { safety: 'How dangerous it is, plus schools and hospitals nearby', community: 'Votes and number of reports from residents', age: 'Time open compared with the target for that type', resources: 'Whether the department has crews free', equity: 'Boost for districts that waited longer than the city median' }
  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <div className="pagehead"><div><div className="eyebrow"><SlidersHorizontal size={13} />Priority settings</div><h1>Decide how the AI ranks work</h1><p>Move a slider and watch the queue re-rank live. Nothing changes for departments until you apply it.</p></div>
        <div className="actions"><button className="btn" onClick={() => { Object.entries({ safety: 35, community: 15, age: 20, resources: 15, equity: 15 }).forEach(([k, v]) => setWeight(k, v)); setDirty(true) }}>Restore defaults</button><button className="btn primary" disabled={!dirty} onClick={() => { commitWeights(base.current.slice(0, 5)); base.current = ranked.map(x => x.q.id); setDirty(false) }}>Apply to the city</button></div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, .85fr) minmax(0, 1.15fr)', alignItems: 'start' }}>
        <div className="grid">
          <div className="card pad">
            <h3 style={{ fontSize: 14.5, marginBottom: 4 }}>What matters most</h3>
            <p className="small muted" style={{ marginBottom: 16 }}>Each factor's share of the 0–100 score.</p>
            {Object.keys(w).map(k => (
              <div key={k} style={{ marginBottom: 18 }}>
                <div className="row small"><b>{FACTOR_LABEL[k]}</b><span className="spacer" /><span className="mono" style={{ fontWeight: 750, color: 'var(--mint)' }}>{Math.round((w[k] / totalW) * 100)}%</span></div>
                <div className="tiny muted" style={{ margin: '2px 0 8px' }}>{HELP[k]}</div>
                <input type="range" min="0" max="60" value={w[k]} onChange={e => { setWeight(k, +e.target.value); setDirty(true) }} aria-label={FACTOR_LABEL[k]} />
              </div>
            ))}
          </div>
          <div className="card pad">
            <h3 style={{ fontSize: 14.5, marginBottom: 16 }}>Guardrails</h3>
            <div style={{ marginBottom: 20 }}>
              <div className="row small"><b>AI acts alone above</b><span className="spacer" /><span className="mono" style={{ fontWeight: 750, color: 'var(--mint)' }}>{s.rules.threshold}% sure</span></div>
              <div className="tiny muted" style={{ margin: '2px 0 8px' }}>Below this, the decision comes to you.</div>
              <input type="range" min="60" max="98" value={s.rules.threshold} onChange={e => setRule('threshold', +e.target.value)} aria-label="Confidence threshold" />
            </div>
            <div>
              <div className="row small"><b>Fairness gap between districts</b><span className="spacer" /><span className="mono" style={{ fontWeight: 750, color: 'var(--mint)' }}>{s.rules.equityGap.toFixed(1)} days</span></div>
              <div className="tiny muted" style={{ margin: '2px 0 8px' }}>If a district waits this much longer than the city median, the AI boosts its requests and tells you.</div>
              <input type="range" min="0.5" max="3" step="0.1" value={s.rules.equityGap} onChange={e => setRule('equityGap', +e.target.value)} aria-label="Equity gap" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="cardhead"><AgentMark size="sm" /><h3>Live preview: next 12 jobs to schedule</h3></div>
          <table className="table">
            <thead><tr><th style={{ width: 54 }}>Rank</th><th>Problem</th><th>Priority</th><th style={{ width: 70 }}>Moved</th></tr></thead>
            <tbody>
              {ranked.slice(0, 12).map(({ q, p }, i) => {
                const d = base.current.indexOf(q.id) - i
                return (
                  <tr key={q.id} style={{ transition: 'background .4s', background: d ? 'rgba(126,240,193,.04)' : undefined }}>
                    <td className="mono" style={{ fontWeight: 750 }}>{i + 1}</td>
                    <td><div className="row" style={{ gap: 9 }}><CatIcon c={q.category} size={26} /><div style={{ minWidth: 0 }}><b className="small">{CATEGORIES[q.category].label}</b><div className="tiny muted">{q.address} · {districtName(q.district)}</div></div></div></td>
                    <td><Priority p={p} /></td>
                    <td className="small" style={{ fontWeight: 750, color: d > 0 ? 'var(--green)' : d < 0 ? 'var(--red)' : 'var(--tx3)' }}>{d > 0 ? <span className="row" style={{ gap: 2 }}><ArrowUp size={13} />{d}</span> : d < 0 ? <span className="row" style={{ gap: 2 }}><ArrowDown size={13} />{-d}</span> : <Minus size={13} />}</td>
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

function HistoryPage({ s }) {
  const [who, setWho] = useState('all')
  const rows = s.audit.filter(a => who === 'all' || (who === 'agent' ? a.actor === 'agent' : a.actor !== 'agent'))
  return (
    <div className="page" style={{ maxWidth: 1400 }}>
      <div className="pagehead"><div><div className="eyebrow"><History size={13} />Activity history</div><h1>Everything that happened, and why</h1><p>Every action by the AI or a person is kept with its reason and the state before it, so it can be checked or undone.</p></div>
        <div className="actions"><div className="seg">{[['all', 'Everyone'], ['agent', 'AI only'], ['people', 'People only']].map(([k, l]) => <button key={k} className={who === k ? 'on' : ''} onClick={() => setWho(k)}>{l}</button>)}</div></div>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th style={{ width: 130 }}>When</th><th style={{ width: 160 }}>Who</th><th>What happened</th><th>Why</th><th style={{ width: 100 }} /></tr></thead>
          <tbody>
            {rows.slice(0, 150).map((a, i) => (
              <tr key={a.id} className="rowin" style={{ opacity: a.undone ? .5 : 1, animationDelay: `${Math.min(i, 15) * 20}ms` }}>
                <td className="small muted">{dayTime(a.at)}</td>
                <td className="small">{a.actor === 'agent' ? <span className="row" style={{ gap: 7 }}><AgentMark size="sm" />PCC agent</span> : <span className="row" style={{ gap: 7, fontWeight: 600 }}><span className="agentmark sm" style={{ background: 'var(--bluebg)', color: 'var(--blue)', boxShadow: 'none' }}><Users size={11} /></span>{a.actor}</span>}</td>
                <td className="small" style={{ fontWeight: 550, textDecoration: a.undone ? 'line-through' : 'none' }}><span className="row" style={{ gap: 7 }}><span style={{ color: 'var(--tx3)' }}><FeedIcon kind={a.kind} size={13} /></span>{a.text}</span>{a.tool && <span className="toolchip" style={{ marginTop: 5 }}>{a.tool}</span>}</td>
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
