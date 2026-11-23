import { useEffect, useState } from 'react'
import { Sparkles, GitMerge, Route, Bell, Flag, ArrowUpRight, RefreshCcw, ShieldAlert, Snowflake, Map as MapIcon, UserCheck, CalendarCheck, Wrench, CheckCircle2, Undo2, SlidersHorizontal, Truck, Lightbulb, FileCheck2, X, Hand, Split, Send, BrainCircuit, Ban, Construction, LightbulbOff, TrafficCone, TreeDeciduous, Waves, Droplets, Footprints, SprayCan, Trash2, Building2, HardHat, Smartphone, Landmark, Plug, BadgeCheck, RotateCw } from 'lucide-react'
import { photoFor } from '../data/photos.js'
import { CATEGORIES, DEPARTMENTS } from '../data/city.js'
import { STAGES, STAGE_IX } from '../store.js'

export const ROLES = {
  ops: { key: 'ops', icon: Building2, portal: 'staff', name: 'Dana Reyes', title: 'City coordination manager', short: 'Ops console', color: '#1F4D36', initials: 'DR', home: '/ops', desc: 'Oversees citywide work and reviews AI decisions' },
  dept: { key: 'dept', icon: HardHat, portal: 'staff', name: 'Marcus Lee', title: 'Streets & Sanitation manager', short: 'Department', color: '#B4602A', initials: 'ML', home: '/dept', desc: 'Accepts, schedules and closes requests' },
  resident: { key: 'resident', icon: Smartphone, portal: 'resident', name: 'Priya Shah', title: 'Resident, Riverside', short: 'Resident app', color: '#2B5E9E', initials: 'PS', home: '/resident', desc: 'Reports problems, upvotes and tracks them' },
  council: { key: 'council', icon: Landmark, portal: 'staff', name: 'James Ortiz', title: 'City council member', short: 'City health', color: '#6B4F8A', initials: 'JO', home: '/council', desc: 'Reads trends, spending and equity' },
  systems: { key: 'systems', icon: Plug, portal: 'staff', name: 'Integrations', title: 'Connected city systems', short: 'Systems', color: '#55605A', initials: 'IT', home: '/systems', desc: 'Shows PCC on top of existing systems' },
}

export function Avatar({ role, size = 30 }) {
  const r = ROLES[role]
  const I = r.icon
  return <span className="avatar" style={{ background: r.color, width: size, height: size }}><I size={Math.round(size * 0.52)} strokeWidth={2} /></span>
}
export const CAT_ICON = { pothole: Construction, streetlight: LightbulbOff, signal: TrafficCone, tree: TreeDeciduous, drain: Waves, leak: Droplets, sidewalk: Footprints, graffiti: SprayCan, trash: Trash2, snow: Snowflake }
export function CatIcon({ c, size = 34, radius = 10 }) {
  const I = CAT_ICON[c]
  return <span className="caticon" style={{ width: size, height: size, borderRadius: radius, background: CATEGORIES[c].color }}><I size={Math.round(size * 0.52)} color="#fff" strokeWidth={2.2} /></span>
}
export function AgentMark({ size = 'md' }) {
  return <span className={`agentmark ${size === 'sm' ? 'sm' : ''}`}><Sparkles size={size === 'sm' ? 12 : 15} strokeWidth={2.2} /></span>
}

export const LEVEL = { high: 'High', medium: 'Medium', low: 'Low' }
export function Priority({ p, showScore = true }) {
  const c = p.level === 'high' ? 'var(--red)' : p.level === 'medium' ? 'var(--amber)' : 'var(--green-2)'
  return (
    <span className="row" style={{ gap: 8 }}>
      <span className={`pill ${p.level}`}><span className="dot" />{LEVEL[p.level]}{p.overridden ? ' · set by hand' : ''}</span>
      {showScore && <span className="score"><span className="bar"><i style={{ width: `${p.score}%`, background: c }} /></span><span className="mono" style={{ color: 'var(--ink-2)' }}>{p.score}</span></span>}
    </span>
  )
}
export const STATUS = { review: 'Needs review', new: 'Assigned by agent', accepted: 'Accepted', scheduled: 'Crew scheduled', in_progress: 'Crew on site', resolved: 'Fixed, awaiting resident', closed: 'Closed', merged: 'Merged' }
export function Status({ s }) { return <span className={`pill st-${s}`}>{STATUS[s]}</span> }
export function Cat({ c, label = true }) {
  const cat = CATEGORIES[c]
  const I = CAT_ICON[c]
  return <span className="row" style={{ gap: 7 }}><span className="catchip" style={{ background: cat.color }}><I size={12} color="#fff" strokeWidth={2.4} /></span>{label && <span>{cat.label}</span>}</span>
}
export function Conf({ v }) {
  const pct = Math.round(v * 100)
  const col = pct >= 80 ? 'var(--green-2)' : pct >= 70 ? 'var(--amber)' : 'var(--red)'
  return <span className="conf" style={{ color: col }}><span className="ring" style={{ background: `conic-gradient(${col} ${pct * 3.6}deg, var(--line-2) 0)` }} />{pct}%</span>
}

const FEED_ICON = { merge: GitMerge, route: Route, notify: Bell, review: Flag, priority: ArrowUpRight, sync: RefreshCcw, escalate: ShieldAlert, storm: Snowflake, plan: MapIcon, proposal: Lightbulb, nudge: Bell, accept: UserCheck, schedule: CalendarCheck, start: Wrench, resolve: CheckCircle2, undo: Undo2, rules: SlidersHorizontal, fleet: Truck, approve: FileCheck2, reject: Ban, override: Hand, reroute: Route, unmerge: Split, learn: BrainCircuit, send: Send, confirm: BadgeCheck, reopen: RotateCw }
export function FeedIcon({ kind, size = 14 }) { const I = FEED_ICON[kind] || Sparkles; return <I size={size} strokeWidth={2} /> }

export function Modal({ onClose, children, width }) {
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  return (
    <div className="scrim" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={width ? { width } : null}>{children}</div>
    </div>
  )
}
export function ModalHead({ icon, title, sub, onClose }) {
  return (
    <div className="mh">
      {icon}
      <div style={{ flex: 1 }}><h3>{title}</h3>{sub && <p className="muted small" style={{ marginTop: 3 }}>{sub}</p>}</div>
      <button className="iconbtn" onClick={onClose} aria-label="Close"><X size={16} /></button>
    </div>
  )
}

export function WhyModal({ q, p, onClose }) {
  const top = [...p.factors].sort((a, b) => b.contrib - a.contrib)
  return (
    <Modal onClose={onClose}>
      <ModalHead icon={<AgentMark />} title={`Why ${q.id} is ${LEVEL[p.level]} priority`} sub={`Score ${p.score} of 100. The agent combines five factors using the weights the coordination manager set.`} onClose={onClose} />
      <div className="mb">
        {top.map(f => (
          <div className="factor" key={f.key}>
            <div><b>{f.label}</b><span>weight {f.weight}</span></div>
            <div><div className="fb"><i style={{ width: `${f.value}%` }} /></div><div className="tiny muted" style={{ marginTop: 5 }}>{f.note}</div></div>
            <div style={{ textAlign: 'right', fontWeight: 700 }} className="mono">+{f.contrib.toFixed(0)}</div>
          </div>
        ))}
        {p.overridden && <div className="callout warn" style={{ marginTop: 12 }}><Hand size={16} />Priority was set by hand. The agent keeps scoring it so you can compare.</div>}
        <div className="callout" style={{ marginTop: 14 }}><Sparkles size={16} style={{ flex: 'none', marginTop: 1 }} /><span>Main reasons: {top.slice(0, 2).map(f => f.note.toLowerCase()).join('; ')}.</span></div>
      </div>
    </Modal>
  )
}

export function Photo({ c, seed = 0, style, src, label }) {
  const [bad, setBad] = useState(false)
  const ph = src ? { src } : photoFor(c, seed)
  return (
    <div className="photo" style={style}>
      {!bad ? <img src={ph.src} alt={label || `${CATEGORIES[c]?.label || 'Report'} photo`} loading="lazy" onError={() => setBad(true)} referrerPolicy="no-referrer" />
        : <div className="photofallback"><CatIcon c={c} size={40} /></div>}
      {label && <span className="photolabel">{label}</span>}
    </div>
  )
}

export function Workflow({ q, compact }) {
  const ix = STAGE_IX[q.status] ?? 0
  return (
    <div className={`wf ${compact ? 'compact' : ''}`}>
      {STAGES.map((st, i) => {
        const state = i < ix ? 'done' : i === ix ? 'cur' : 'todo'
        const agent = st.who === 'PCC agent'
        return (
          <div key={st.key} className={`wf-st ${state} ${agent ? 'agent' : ''}`}>
            <span className="wf-dot">{state === 'done' ? <CheckCircle2 size={14} strokeWidth={2.6} /> : i + 1}</span>
            <b>{st.label}</b>
            <span className="wf-who">{state === 'cur' ? `Waiting on ${st.who === 'Department' || st.who === 'Crew' ? DEPARTMENTS[q.dept].short : st.who === 'PCC agent' ? 'a coordinator' : 'the resident'}` : st.who}</span>
          </div>
        )
      })}
    </div>
  )
}
