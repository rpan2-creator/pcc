import { useEffect } from 'react'
import { Sparkles, GitMerge, Route, Bell, Flag, ArrowUpRight, RefreshCcw, ShieldAlert, Snowflake, Map as MapIcon, UserCheck, CalendarCheck, Wrench, CheckCircle2, Undo2, SlidersHorizontal, Truck, Lightbulb, FileCheck2, X, Hand, Split, Send, BrainCircuit, Ban } from 'lucide-react'
import { CATEGORIES } from '../data/city.js'

export const ROLES = {
  ops: { key: 'ops', name: 'Dana Reyes', title: 'City coordination manager', short: 'Ops console', color: '#1F4D36', initials: 'DR', home: '/ops', desc: 'Oversees citywide work and reviews AI decisions' },
  dept: { key: 'dept', name: 'Marcus Lee', title: 'Streets & Sanitation manager', short: 'Department', color: '#B4602A', initials: 'ML', home: '/dept', desc: 'Accepts, schedules and closes requests' },
  resident: { key: 'resident', name: 'Priya Shah', title: 'Resident, Riverside', short: 'Resident app', color: '#2B5E9E', initials: 'PS', home: '/resident', desc: 'Reports problems, upvotes and tracks them' },
  council: { key: 'council', name: 'James Ortiz', title: 'City council member', short: 'City health', color: '#6B4F8A', initials: 'JO', home: '/council', desc: 'Reads trends, spending and equity' },
  systems: { key: 'systems', name: 'Integrations', title: 'Connected city systems', short: 'Systems', color: '#55605A', initials: 'IT', home: '/systems', desc: 'Shows PCC on top of existing systems' },
}

export function Avatar({ role, size = 30 }) {
  const r = ROLES[role]
  return <span className="avatar" style={{ background: r.color, width: size, height: size }}>{r.initials}</span>
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
export const STATUS = { review: 'Needs review', new: 'New from agent', accepted: 'Accepted', scheduled: 'Scheduled', in_progress: 'In progress', resolved: 'Fixed', merged: 'Merged' }
export function Status({ s }) { return <span className={`pill st-${s}`}>{STATUS[s]}</span> }
export function Cat({ c, label = true }) {
  const cat = CATEGORIES[c]
  return <span className="row" style={{ gap: 7 }}><span className="catdot" style={{ background: cat.color }} />{label && <span>{cat.label}</span>}</span>
}
export function Conf({ v }) {
  const pct = Math.round(v * 100)
  const col = pct >= 80 ? 'var(--green-2)' : pct >= 70 ? 'var(--amber)' : 'var(--red)'
  return <span className="conf" style={{ color: col }}><span className="ring" style={{ background: `conic-gradient(${col} ${pct * 3.6}deg, var(--line-2) 0)` }} />{pct}%</span>
}

const FEED_ICON = { merge: GitMerge, route: Route, notify: Bell, review: Flag, priority: ArrowUpRight, sync: RefreshCcw, escalate: ShieldAlert, storm: Snowflake, plan: MapIcon, proposal: Lightbulb, nudge: Bell, accept: UserCheck, schedule: CalendarCheck, start: Wrench, resolve: CheckCircle2, undo: Undo2, rules: SlidersHorizontal, fleet: Truck, approve: FileCheck2, reject: Ban, override: Hand, reroute: Route, unmerge: Split, learn: BrainCircuit, send: Send }
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

// Illustrated stand-ins for resident photos.
export function Photo({ c, seed = 0, style }) {
  const sky = '#CFD8DC', road = '#7B7F82', road2 = '#6C7073', walk = '#B9B4A8'
  const v = ((seed * 37) % 5) * 9 - 18, rx = 26 + ((seed * 13) % 4) * 5, ang = ((seed * 7) % 5) - 2
  const art = {
    pothole: <g transform={`rotate(${ang * 3} 80 60)`}><rect x="-20" y="-20" width="200" height="160" fill={road} /><path d={`M-20 ${60 + ang * 6} L180 ${54 + ang * 4}`} stroke="#E9E3B4" strokeWidth="3" strokeDasharray="14 10" /><ellipse cx={80 + v} cy="86" rx={rx + 8} ry={rx / 2.4} fill="#3E4144" /><ellipse cx={78 + v} cy="84" rx={rx} ry={rx / 3.6} fill="#55595C" /><ellipse cx={86 + v} cy="88" rx={rx / 2.4} ry="3" fill="#7FA3B3" opacity=".6" /></g>,
    snow: <><rect width="160" height="120" fill="#E9EEF1" /><path d="M0 76 Q40 64 80 74 T160 70 V120 H0z" fill="#fff" /><rect x="20" y="40" width="30" height="20" rx="4" fill="#8B9BA6" /><rect x="18" y="56" width="36" height="12" rx="6" fill="#fff" /></>,
    streetlight: <><rect width="160" height="120" fill="#2B3440" /><rect x={74 + v / 3} y="20" width="5" height="100" fill="#59636E" /><path d={`M${76 + v / 3} 22 h28`} stroke="#59636E" strokeWidth="5" /><rect x={98 + v / 3} y="20" width="16" height="8" rx="3" fill="#3A434D" /><rect y="100" width="160" height="20" fill="#3A434D" /></>,
    signal: <><rect width="160" height="120" fill={sky} /><rect x="70" y="20" width="22" height="58" rx="5" fill="#2E3338" /><circle cx="81" cy="34" r="6" fill="#444" /><circle cx="81" cy="49" r="6" fill="#444" /><circle cx="81" cy="64" r="6" fill="#444" /><rect x="78" y="78" width="6" height="42" fill="#2E3338" /></>,
    tree: <><rect width="160" height="120" fill={walk} /><rect y="86" width="160" height="34" fill={road} /><path d={`M10 ${70 + v / 3} L140 92`} stroke="#6B4E33" strokeWidth="9" strokeLinecap="round" /><circle cx="40" cy="62" r="18" fill="#5C7F4E" /><circle cx="64" cy="70" r="14" fill="#6E9460" /><circle cx="28" cy="78" r="12" fill="#4D6E41" /></>,
    drain: <><rect width="160" height="120" fill={road2} /><rect x="56" y="50" width="48" height="28" rx="3" fill="#3B3F42" />{[0, 1, 2, 3, 4].map(i => <rect key={i} x={60 + i * 9} y="54" width="4" height="20" fill="#25282A" />)}<ellipse cx="80" cy="66" rx="64" ry="20" fill="#86A9B8" opacity=".45" /><path d="M64 56 l14 8 l10 -6" stroke="#5C7F4E" strokeWidth="4" fill="none" /></>,
    leak: <><rect width="160" height="120" fill={road} /><path d="M0 92 Q80 82 160 96 V120 H0z" fill="#8FB6C6" opacity=".7" /><circle cx="76" cy="66" r="10" fill="#8FB6C6" opacity=".8" /></>,
    sidewalk: <><rect width="160" height="120" fill={walk} /><path d="M0 40 H160 M0 80 H160 M53 0 V120 M106 0 V120" stroke="#9E998D" strokeWidth="2" /><path d="M53 40 L106 34 L106 80 L53 80z" fill="#C8C3B7" /><path d="M60 50 l12 10 l-6 8 l14 6" stroke="#6E6A61" strokeWidth="2" fill="none" /></>,
    graffiti: <><rect width="160" height="120" fill="#B8A99A" /><path d="M0 30 H160 M0 60 H160 M0 90 H160" stroke="#A89A8B" strokeWidth="2" /><path d={`M26 74 q16 -30 30 0 t30 -6 q12 -20 26 4`} stroke="#B5577E" strokeWidth="7" fill="none" strokeLinecap="round" /><path d="M40 52 l20 -10 l10 16" stroke="#2D63A6" strokeWidth="5" fill="none" strokeLinecap="round" /></>,
    trash: <><rect width="160" height="120" fill={walk} /><rect x="40" y="40" width="34" height="50" rx="4" fill="#3F6B4E" /><rect x="80" y="54" width="28" height="36" rx="10" fill="#2C2F31" /><rect x="108" y="62" width="24" height="28" rx="10" fill="#3A3D40" /></>,
  }
  return (
    <div className="photo" style={style}>
      <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>{art[c] || art.pothole}</svg>
    </div>
  )
}
