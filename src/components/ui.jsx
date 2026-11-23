import { useEffect, useRef, useState } from 'react'
import { Sparkles, GitMerge, Route, Bell, Flag, ArrowUpRight, RefreshCcw, ShieldAlert, Snowflake, Map as MapIcon, UserCheck, CalendarCheck, Wrench, CheckCircle2, Undo2, SlidersHorizontal, Truck, Lightbulb, FileCheck2, X, Hand, Split, Send, BrainCircuit, Ban, Construction, LightbulbOff, TrafficCone, TreeDeciduous, Waves, Droplets, Footprints, SprayCan, Trash2, Building2, HardHat, Smartphone, Landmark, Plug, BadgeCheck, RotateCw, Signpost, Car, Toilet, PackageX, Armchair, Building, Thermometer, Volume2, Rat, Check } from 'lucide-react'
import { photoFor } from '../data/photos.js'
import { CATEGORIES, DEPARTMENTS } from '../data/city.js'
import { STAGES, STAGE_IX, STATUS_LABEL } from '../store.js'

export const ROLES = {
  ops: { key: 'ops', icon: Building2, name: 'Dana Reyes', title: 'City operations manager', short: 'Operations', color: '#5A4BD1', home: '/ops', desc: 'Watches the whole city, decides what the AI is unsure about, approves big plans' },
  dept: { key: 'dept', icon: HardHat, name: 'Marcus Lee', title: 'Public Works manager', short: 'Public Works', color: '#B2662E', home: '/dept', desc: 'Accepts work, books crews, closes jobs with proof' },
  council: { key: 'council', icon: Landmark, name: 'James Ortiz', title: 'City council member', short: 'City council', color: '#A8693A', home: '/council', desc: 'Reads city health, equity and where money goes' },
  systems: { key: 'systems', icon: Plug, name: 'IT administrator', title: 'Connected city systems', short: 'Integrations', color: '#4A4A55', home: '/systems', desc: 'Sees how PCC connects to existing city software' },
  resident: { key: 'resident', icon: Smartphone, name: 'Priya Shah', title: 'Resident of Riverside', short: 'Resident app', color: '#2C73D2', home: '/resident', desc: 'Reports problems, votes, follows them to the fix' },
}

export function Avatar({ role, size = 30 }) {
  const r = ROLES[role]
  const I = r.icon
  return <span className="avatar" style={{ background: r.color, width: size, height: size, borderRadius: size * 0.3 }}><I size={Math.round(size * 0.5)} strokeWidth={2} /></span>
}
export function AgentMark({ size = 'md', busy }) {
  return <span className={`agentmark ${size === 'sm' ? 'sm' : ''} ${busy ? 'busy' : ''}`}><Sparkles size={size === 'sm' ? 12 : 15} strokeWidth={2.4} /></span>
}

export const CAT_ICON = { pothole: Construction, sidewalk: Footprints, sign: Signpost, signal: TrafficCone, streetlight: LightbulbOff, vehicle: Car, leak: Droplets, flood: Waves, sewer: Toilet, trash: Trash2, dumping: PackageX, graffiti: SprayCan, tree: TreeDeciduous, park: Armchair, building: Building, heat: Thermometer, noise: Volume2, rodent: Rat, snow: Snowflake }
export function CatIcon({ c, size = 34, radius }) {
  const I = CAT_ICON[c] || Wrench
  const col = CATEGORIES[c]?.color || '#55556A'
  return <span className="caticon" style={{ width: size, height: size, borderRadius: radius ?? size * 0.3, background: `linear-gradient(140deg, ${col}, ${col}B3)` }}><I size={Math.round(size * 0.52)} color="#fff" strokeWidth={2.2} /></span>
}
export function Cat({ c, label = true, size = 22 }) {
  return <span className="row" style={{ gap: 8 }}><CatIcon c={c} size={size} radius={7} />{label && <span>{CATEGORIES[c].label}</span>}</span>
}

export const LEVEL = { high: 'High', medium: 'Medium', low: 'Low' }
export function Priority({ p, showScore = true }) {
  const c = p.level === 'high' ? 'var(--red)' : p.level === 'medium' ? 'var(--amber)' : 'var(--green)'
  return (
    <span className="row" style={{ gap: 8 }}>
      <span className={`pill ${p.level}`}><span className="dot" />{LEVEL[p.level]}{p.overridden ? ' · set by hand' : ''}</span>
      {showScore && <span className="score"><span className="bar"><i style={{ width: `${p.score}%`, background: c }} /></span><span className="mono">{p.score}</span></span>}
    </span>
  )
}
export function Status({ s }) { return <span key={s} className={`pill st st-${s}`}>{STATUS_LABEL[s]}</span> }
export function Conf({ v }) {
  const pct = Math.round(v * 100)
  const col = pct >= 80 ? 'var(--green)' : pct >= 70 ? 'var(--amber)' : 'var(--red)'
  return <span className="conf" style={{ color: col }}><span className="ring" style={{ background: `conic-gradient(${col} ${pct * 3.6}deg, rgba(var(--ink), .1) 0)` }} />{pct}%</span>
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
      <div style={{ flex: 1 }}><h3>{title}</h3>{sub && <p className="muted small" style={{ marginTop: 4, lineHeight: 1.5 }}>{sub}</p>}</div>
      <button className="iconbtn" onClick={onClose} aria-label="Close"><X size={16} /></button>
    </div>
  )
}

export function WhyModal({ q, p, onClose }) {
  const top = [...p.factors].sort((a, b) => b.contrib - a.contrib)
  return (
    <Modal onClose={onClose}>
      <ModalHead icon={<AgentMark />} title={`Why ${q.id} is ${LEVEL[p.level]} priority`} sub={`Score ${p.score} out of 100. The AI adds up five factors using the weights set in Priority settings.`} onClose={onClose} />
      <div className="mb">
        {top.map((f, i) => (
          <div className="factor" key={f.key} style={{ animationDelay: `${i * 60}ms` }}>
            <div><b>{f.label}</b><span>weight {f.weight}</span></div>
            <div><div className="fb"><i style={{ width: `${f.value}%`, animationDelay: `${i * 80}ms` }} /></div><div className="tiny muted" style={{ marginTop: 6 }}>{f.note}</div></div>
            <div style={{ textAlign: 'right', fontWeight: 750 }} className="mono">+{f.contrib.toFixed(0)}</div>
          </div>
        ))}
        {p.overridden && <div className="callout warn" style={{ marginTop: 12 }}><Hand size={16} />Priority was set by hand. The AI keeps scoring it so you can compare.</div>}
      </div>
    </Modal>
  )
}

export function Photo({ c, seed = 0, style, src, label }) {
  const [bad, setBad] = useState(false)
  const ph = src ? { src } : photoFor(c, seed)
  return (
    <div className="photo" style={style}>
      {ph && !bad ? <img src={ph.src} alt={label || `${CATEGORIES[c]?.label || 'Report'} photo`} loading="lazy" onError={() => setBad(true)} referrerPolicy="no-referrer" />
        : <div className="photofallback" style={{ background: `radial-gradient(circle at 50% 40%, ${CATEGORIES[c]?.color}55, ${CATEGORIES[c]?.color}18)` }}><CatIcon c={c} size={42} /></div>}
      {label && <span className="photolabel">{label}</span>}
    </div>
  )
}

const WHO = q => ({ Resident: 'the resident', 'PCC agent': 'a city decision', Department: DEPARTMENTS[q.dept].short, Crew: `the ${DEPARTMENTS[q.dept].short} crew` })
export function Workflow({ q }) {
  const ix = STAGE_IX[q.status] ?? 0
  return (
    <div className="wf">
      {STAGES.map((st, i) => {
        const state = i < ix ? 'done' : i === ix ? 'cur' : 'todo'
        return (
          <div key={st.key} className={`wf-st ${state}`} style={{ transitionDelay: `${i * 80}ms` }}>
            <span className="wf-dot">{state === 'done' ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
            <b>{st.label}</b>
            <span className="wf-who">{state === 'cur' ? `Waiting on ${WHO(q)[st.who]}` : st.who === 'PCC agent' ? 'AI' : st.who === 'Department' || st.who === 'Crew' ? DEPARTMENTS[q.dept].short : 'Resident'}</span>
          </div>
        )
      })}
    </div>
  )
}

// What happens next, in one plain sentence, for any role.
export function nextStepOf(q) {
  const d = DEPARTMENTS[q.dept].name
  switch (q.status) {
    case 'review': return { who: 'Operations manager', text: 'The AI was not sure who should handle this. A person picks the department.' }
    case 'new': return { who: d, text: `The AI sent this to ${d}. They need to accept it.` }
    case 'accepted': return { who: d, text: 'Accepted. Next, book a crew and a date. Residents are told automatically.' }
    case 'scheduled': return { who: `${d} crew`, text: 'A crew is booked. They check in on site, fix it and upload an after photo.' }
    case 'in_progress': return { who: `${d} crew`, text: 'The crew is on site. They close it out with an after photo.' }
    case 'resolved': return { who: 'Resident', text: 'Fixed. Waiting for a resident to confirm, or it closes on its own in 3 days.' }
    case 'closed': return { who: 'Nobody', text: 'Done. A resident confirmed the fix.' }
    default: return { who: '', text: '' }
  }
}

export function Num({ value, decimals = 0, duration = 900 }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = performance.now(), a = from.current, b = value
    if (a === b) return
    let raf
    const tick = t => {
      const k = Math.min(1, (t - start) / duration)
      const e = 1 - Math.pow(1 - k, 3)
      setShown(a + (b - a) * e)
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = b
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); from.current = b }
  }, [value])
  return <>{Number(shown).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>
}

export const healthColor = v => v >= 80 ? 'var(--green)' : v >= 65 ? 'var(--mint)' : v >= 50 ? 'var(--amber)' : 'var(--red)'
export function HealthRing({ value, size = 160, stroke = 12, label = 'City health', sub }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  const [v, setV] = useState(0)
  useEffect(() => { const t = setTimeout(() => setV(value), 60); return () => clearTimeout(t) }, [value])
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(var(--ink), .08)" strokeWidth={stroke} />
        <circle className="ringarc" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={healthColor(value)} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ filter: `drop-shadow(0 0 8px ${healthColor(value)})` }} />
      </svg>
      <div className="rv"><b style={{ fontSize: size * 0.24 }}><Num value={value} /></b><span>{label}</span>{sub && <span style={{ display: 'block' }}>{sub}</span>}</div>
    </div>
  )
}
