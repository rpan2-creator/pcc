import { useState } from 'react'
import { ArrowLeft, MapPin, Users, ThumbsUp, Clock3, Sparkles, Split, Hand, Send, Route as RouteIcon, CalendarCheck, Wrench, CheckCircle2, UserCheck, Info, Pencil, ArrowRight } from 'lucide-react'
import { useStore, priorityOf, etaOf, accept, schedule, start, resolve, reroute, unmerge, overridePriority, editMessageAndSend } from '../store.js'
import { EXTRA } from '../data/photos.js'
import { CATEGORIES, DEPARTMENTS, districtName } from '../data/city.js'
import { Priority, Status, Cat, Conf, WhyModal, Photo, AgentMark, LEVEL, Modal, ModalHead, Workflow, CatIcon, nextStepOf } from '../components/ui.jsx'
import CityMap from '../components/CityMap.jsx'
import { Link } from '../router.jsx'
import { ago, dayTime, time } from '../format.js'

export const FIXNOTE = { pothole: 'Cut out the damaged area, filled and compacted hot asphalt.', streetlight: 'Replaced the LED head and photocell; tested at dusk.', signal: 'Replaced the controller board; timing checked.', tree: 'Removed the fallen limb and cleared the sidewalk.', leak: 'Repaired the service line and restored pressure.', trash: 'Collected the missed pickup and logged the route gap.', dumping: 'Removed the dumped items; added the alley to patrols.', graffiti: 'Removed paint and applied anti-graffiti coating.', sidewalk: 'Ground down the lifted slab edge and marked it for replacement.', flood: 'Cleared the storm drain inlet.', heat: 'Inspector confirmed heat restored; landlord cited.' }
export default function RequestDetail({ id, role }) {
  const s = useStore()
  const q = s.requests.find(x => x.id === id)
  const [why, setWhy] = useState(false)
  const [rr, setRR] = useState(false)
  const [sched, setSched] = useState(false)
  const [edit, setEdit] = useState(false)
  const [fix, setFix] = useState(false)
  if (!q) return <div className="page"><div className="empty">Request {id} not found. It may have been merged.</div></div>
  const p = priorityOf(q, s)
  const eta = etaOf(q, s)
  const cat = CATEGORIES[q.category]
  const reps = s.reports.filter(r => q.reports.includes(r.id)).sort((a, b) => b.at - a.at)
  const actor = role === 'dept' ? 'Marcus Lee' : 'Dana Reyes'
  const back = role === 'dept' ? '/dept' : '/ops/requests'
  const draft = q.status === 'scheduled'
    ? `Update on ${q.id}: a ${DEPARTMENTS[q.dept].short} crew is scheduled ${eta.text.toLowerCase()}. Thanks to everyone who reported it.`
    : `Thanks for reporting the ${cat.label.toLowerCase()} at ${q.address}. ${q.reports.length} residents reported it. Current estimate: ${eta.text.toLowerCase()}. We will message you when a crew is scheduled.`
  const nudged = q.flags.includes('nudged'), escalated = q.flags.includes('escalated')
  return (
    <div className="page">
      <Link to={back} className="row small muted" style={{ marginBottom: 14, fontWeight: 600 }}><ArrowLeft size={15} />Back</Link>
      <div className="pagehead" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="row" style={{ gap: 10, marginBottom: 6 }}><span className="id">{q.id}</span><Status s={q.status} />{escalated ? <span className="pill warn">Escalated to Dana</span> : nudged ? <span className="pill warn">Overdue · reminder sent</span> : null}{q.flags.includes('storm') && <span className="pill agent">Storm</span>}</div>
          <h1 className="row" style={{ gap: 12 }}><CatIcon c={q.category} size={36} />{cat.label} · {q.address}</h1>
          <p className="row" style={{ gap: '6px 16px', marginTop: 8, flexWrap: 'wrap', whiteSpace: 'nowrap' }}>
            <span className="row" style={{ gap: 5 }}><MapPin size={14} />{districtName(q.district)}{q.nearby ? ` · near ${q.nearby}` : ''}</span>
            <span className="row" style={{ gap: 5 }}><Users size={14} />{q.reports.length} reports</span>
            <span className="row" style={{ gap: 5 }}><ThumbsUp size={14} />{q.upvotes} upvotes</span>
            <span className="row" style={{ gap: 5 }}><Clock3 size={14} />opened {ago(q.createdAt, s.now)}</span>
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 10px 0', marginBottom: 16, overflow: 'hidden' }}>
        <Workflow q={q} />
        <div className="nextstep" key={q.status} style={{ margin: '18px 0 0', borderRadius: 0, borderWidth: '1px 0 0' }}>
          <span className="ns-ic"><ArrowRight size={18} /></span>
          <div style={{ flex: 1 }}><b>Next: {nextStepOf(q).who}</b><span>{nextStepOf(q).text}</span></div>
          {q.status !== 'review' && q.status !== 'closed' && <div style={{ textAlign: 'right' }}><span>Residents see</span><b>{eta.text}</b></div>}
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.55fr) minmax(300px, 1fr)', alignItems: 'start' }}>
        <div className="grid">
          <div className="card">
            <div className="cardhead"><AgentMark size="sm" /><h3>What the AI understood</h3><span className="right row" style={{ gap: 6 }}><Conf v={q.confidence} /><span className="muted small">sure</span></span></div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 14.5, lineHeight: 1.55 }}>
                {q.reports.length > 1 ? `${q.reports.length} residents reported the same ${cat.label.toLowerCase()} at ${q.address} between ${dayTime(reps[reps.length - 1].at)} and ${dayTime(reps[0].at)}. ` : `One resident reported a ${cat.label.toLowerCase()} at ${q.address}. `}
                {q.nearby ? `It is next to ${q.nearby}, which raises the safety risk. ` : ''}
                Routed to {DEPARTMENTS[q.dept].name}. {eta.reason}
              </p>
              <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <span className="chip"><Cat c={q.category} /></span>
                <span className="chip">{DEPARTMENTS[q.dept].name}</span>
                <span className="chip">Target: {cat.target} days</span>
                <span className="chip">Estimate: {eta.text}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="cardhead"><h3>Reports</h3><span className="sub">{reps.length} merged into this request</span></div>
            <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {reps.slice(0, q.afterPhoto ? 3 : 4).map((r, i) => <Photo key={r.id} c={q.category} seed={i} label={i === 0 ? 'Before · resident photo' : undefined} />)}
              {q.afterPhoto && <Photo src={(EXTRA.fix?.[q.category] || EXTRA.crew).src} c={q.category} label="After · crew photo" />}
            </div>
            <table className="table">
              <tbody>
                {reps.map(r => (
                  <tr key={r.id}>
                    <td style={{ width: 150 }}><b className="small">{r.residentName}</b><div className="tiny muted">{r.channel} · {ago(r.at, s.now)}</div></td>
                    <td className="small">{r.text}</td>
                    <td style={{ width: 90, textAlign: 'right' }}>{reps.length > 1 && role !== 'resident' && <button className="btn sm ghost" onClick={() => unmerge(q.id, r.id, actor)} title="This is a different problem"><Split size={13} />Split</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="cardhead"><h3>Timeline</h3></div>
            <div style={{ padding: '16px 18px 6px' }}>
              <div className="timeline">
                {[...q.timeline].reverse().map((t, i) => (
                  <div key={i} className={`tl ${t.who === 'agent' ? 'agent' : 'human'}`}><b>{t.text}</b><span>{t.who === 'agent' ? 'PCC agent' : t.who} · {dayTime(t.at)}</span></div>
                ))}
                <div className="tl agent"><b>Prioritized as {LEVEL[p.level]} ({p.score}) and routed to {DEPARTMENTS[q.dept].short}</b><span>PCC agent · {dayTime(q.createdAt + 4 * 60e3)}</span></div>
                <div className="tl"><b>First report received</b><span>{reps[reps.length - 1]?.channel} · {dayTime(q.createdAt)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="card pad">
            <div className="row" style={{ marginBottom: 12 }}><h3 style={{ fontSize: 14.5 }}>Priority</h3><span className="spacer" /><button className="btn sm ghost" onClick={() => setWhy(true)}><Info size={13} />Why</button></div>
            <Priority p={p} />
            <div style={{ marginTop: 14 }}>
              {[...p.factors].sort((a, b) => b.contrib - a.contrib).slice(0, 3).map(f => (
                <div key={f.key} className="row small" style={{ padding: '5px 0', gap: 10 }}>
                  <span style={{ width: 118, color: 'var(--tx2)' }}>{f.label}</span>
                  <span style={{ flex: 1, height: 6, borderRadius: 9, background: 'rgba(210,255,230,.08)', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: `${f.value}%`, background: 'var(--mint)' }} /></span>
                  <span className="mono" style={{ width: 26, textAlign: 'right', fontWeight: 650 }}>+{f.contrib.toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="small muted" style={{ marginBottom: 8 }}>Set priority by hand</div>
            <div className="seg">
              {['high', 'medium', 'low'].map(l => <button key={l} className={q.override?.level === l ? 'on' : ''} onClick={() => overridePriority(q.id, l, actor)}>{LEVEL[l]}</button>)}
              <button className={!q.override ? 'on' : ''} onClick={() => overridePriority(q.id, null, actor)}>Agent</button>
            </div>
          </div>

          {q.status === 'resolved' && <div className="callout ok"><CheckCircle2 size={16} style={{ flex: 'none', marginTop: 1 }} /><span>Fixed. The agent sent the after photo to {q.reports.length} residents and is waiting for one to confirm before closing.</span></div>}
          {q.status === 'closed' && <div className="callout ok"><CheckCircle2 size={16} style={{ flex: 'none', marginTop: 1 }} /><span>Closed. A resident confirmed the fix.</span></div>}
          {role !== 'council' && !['resolved', 'closed', 'merged'].includes(q.status) && (
            <div className="card pad">
              <h3 style={{ fontSize: 14.5, marginBottom: 12 }}>{role === 'dept' ? 'Your next step' : 'Actions'}</h3>
              <div className="col" style={{ gap: 8 }}>
                {q.status === 'new' && <button className="btn primary" onClick={() => accept(q.id, actor)}><UserCheck size={15} />Accept for {DEPARTMENTS[q.dept].short}</button>}
                {['new', 'accepted'].includes(q.status) && <button className="btn" onClick={() => setSched(true)}><CalendarCheck size={15} />Schedule a crew</button>}
                {q.status === 'scheduled' && <button className="btn primary" onClick={() => start(q.id, actor)}><Wrench size={15} />Crew checked in on site</button>}
                {['scheduled', 'in_progress'].includes(q.status) && <button className={`btn ${q.status === 'in_progress' ? 'primary' : ''}`} onClick={() => setFix(true)}><CheckCircle2 size={15} />Mark fixed with after photo</button>}
                <button className="btn" onClick={() => setRR(true)}><RouteIcon size={15} />Reroute to another department</button>
              </div>
            </div>
          )}

          <div className="card pad">
            <div className="row" style={{ marginBottom: 10 }}><AgentMark size="sm" /><h3 style={{ fontSize: 14.5 }}>Draft update to residents</h3></div>
            <p className="small" style={{ background: 'var(--s1)', border: '1px solid var(--line)', padding: 12, borderRadius: 10, lineHeight: 1.5 }}>{draft}</p>
            <div className="row" style={{ marginTop: 10 }}>
              <span className="tiny muted">Goes to {q.reports.length} reporters{s.following.includes(q.id) ? ' and followers' : ''}</span><span className="spacer" />
              <button className="btn sm" onClick={() => setEdit(draft)}><Pencil size={13} />Edit and send</button>
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <CityMap requests={[q]} selected={q.id} legend={false} labels={false} now={s.now} />
          </div>
        </div>
      </div>

      {why && <WhyModal q={q} p={p} onClose={() => setWhy(false)} />}
      {rr && <RerouteModal q={q} onClose={() => setRR(false)} actor={actor} />}
      {sched && <ScheduleModal q={q} s={s} onClose={() => setSched(false)} actor={actor} />}
      {fix && (
        <Modal onClose={() => setFix(false)}>
          <ModalHead title={`Close out ${q.id}`} sub="The after photo and note go to every resident who reported or follows this." onClose={() => setFix(false)} />
          <div className="mb col" style={{ gap: 12 }}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}><Photo c={q.category} label="Before" /><Photo src={(EXTRA.fix?.[q.category] || EXTRA.crew).src} c={q.category} label="After · from crew app" /></div>
            <div className="field"><label>What the crew did</label><input className="input" defaultValue={FIXNOTE[q.category] || 'Repaired and inspected on site.'} id="fixnote" /></div>
          </div>
          <div className="mf"><button className="btn" onClick={() => setFix(false)}>Cancel</button><button className="btn primary" onClick={() => { resolve(q.id, actor, document.getElementById('fixnote').value); setFix(false) }}><CheckCircle2 size={14} />Mark fixed and ask residents</button></div>
        </Modal>
      )}
      {edit !== false && (
        <Modal onClose={() => setEdit(false)}>
          <ModalHead icon={<AgentMark />} title="Edit the update before it goes out" sub="The agent drafted this. You can change anything." onClose={() => setEdit(false)} />
          <div className="mb"><textarea className="textarea" style={{ width: '100%', minHeight: 120 }} value={edit} onChange={e => setEdit(e.target.value)} /></div>
          <div className="mf"><button className="btn" onClick={() => setEdit(false)}>Cancel</button><button className="btn primary" onClick={() => { editMessageAndSend(q.id, edit, actor); setEdit(false) }}><Send size={14} />Send to residents</button></div>
        </Modal>
      )}
    </div>
  )
}

function RerouteModal({ q, onClose, actor }) {
  const [dept, setDept] = useState(Object.keys(DEPARTMENTS).find(d => d !== q.dept))
  const [note, setNote] = useState('')
  return (
    <Modal onClose={onClose}>
      <ModalHead title={`Reroute ${q.id}`} sub="Your reason is saved and the agent uses it to route similar reports better." onClose={onClose} />
      <div className="mb col" style={{ gap: 14 }}>
        <div className="field"><label>Send to</label><select className="select" value={dept} onChange={e => setDept(e.target.value)}>{Object.entries(DEPARTMENTS).filter(([k]) => k !== q.dept).map(([k, d]) => <option key={k} value={k}>{d.name}</option>)}</select></div>
        <div className="field"><label>Reason</label><input className="input" placeholder="For example: the tree is on private property, Parks handles the permit" value={note} onChange={e => setNote(e.target.value)} /></div>
      </div>
      <div className="mf"><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" onClick={() => { reroute(q.id, dept, note, actor); onClose() }}>Reroute</button></div>
    </Modal>
  )
}

function ScheduleModal({ q, s, onClose, actor }) {
  const crews = s.crews.filter(c => c.dept === q.dept)
  const [crew, setCrew] = useState(crews.find(c => c.status === 'available')?.id || crews[0].id)
  const [when, setWhen] = useState(1)
  return (
    <Modal onClose={onClose}>
      <ModalHead title={`Schedule ${q.id}`} sub="Residents who reported or follow this get the date automatically." onClose={onClose} />
      <div className="mb col" style={{ gap: 14 }}>
        <div className="field"><label>Crew</label>
          <div className="col" style={{ gap: 6 }}>
            {crews.map(c => (
              <label key={c.id} className="row card" style={{ padding: '10px 12px', cursor: 'pointer', borderColor: crew === c.id ? 'var(--mint)' : undefined }}>
                <input type="radio" checked={crew === c.id} onChange={() => setCrew(c.id)} /><b className="small">{c.name}</b><span className="tiny muted">{c.lead}</span><span className="spacer" /><span className={`pill ${c.status === 'available' ? 'ok' : 'warn'}`}>{c.status === 'available' ? 'Free' : `On ${c.on || 'another job'}`}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="field"><label>When</label><div className="seg">{[[0.3, 'Today'], [1, 'Tomorrow'], [2, 'In 2 days'], [3, 'In 3 days']].map(([v, l]) => <button key={v} className={when === v ? 'on' : ''} onClick={() => setWhen(v)}>{l}</button>)}</div></div>
      </div>
      <div className="mf"><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" onClick={() => { if (q.status === 'new') accept(q.id, actor); schedule(q.id, crew, when, actor); onClose() }}><CalendarCheck size={14} />Schedule and notify</button></div>
    </Modal>
  )
}
