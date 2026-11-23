import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Building2, Smartphone, ChevronDown, PanelRightClose, PanelRightOpen, CloudSnow, Clock3, RotateCcw, PlayCircle, Truck, FastForward, Wrench, FlaskConical, X, ArrowRight, Sparkles, Check, ChevronLeft } from 'lucide-react'
import { useStore, dismissToast, undo, reset, triggerStorm, breakPlows, advance, repairPlows, setGuided, isOpen } from '../store.js'
import { navigate, Link, usePath } from '../router.jsx'
import { ROLES, Avatar, AgentMark, FeedIcon } from './ui.jsx'
import { time, day } from '../format.js'
import { GUIDE } from '../guide.js'

export function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs><radialGradient id="lg" cx="30%" cy="25%" r="90%"><stop offset="0" stopColor="#DCD6FF" /><stop offset=".55" stopColor="#7B6CF6" /><stop offset="1" stopColor="#3A2D99" /></radialGradient></defs>
      <rect width="32" height="32" rx="9" fill="url(#lg)" />
      <circle cx="16" cy="16" r="4.2" fill="#15103A" />
      <circle cx="16" cy="16" r="9" fill="none" stroke="#15103A" strokeWidth="2" strokeDasharray="4 3.2" />
    </svg>
  )
}

export function PortalSwitch({ role }) {
  const staff = role !== 'resident'
  const ref = useRef(), [knob, setKnob] = useState(null)
  useLayoutEffect(() => {
    const el = ref.current?.querySelector('a.on')
    if (el) setKnob({ left: el.offsetLeft, width: el.offsetWidth })
  }, [role])
  return (
    <nav className="portal" ref={ref} aria-label="Switch portal">
      {knob && <span className={`knob ${staff ? '' : 'res'}`} style={knob} />}
      <Link to={staff ? location.pathname : '/ops'} className={staff ? 'on' : ''}><Building2 size={16} />City staff console</Link>
      <Link to="/resident" className={!staff ? 'on res' : ''}><Smartphone size={16} />Resident app</Link>
    </nav>
  )
}

export function RoleSwitcher({ role }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const f = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', f); return () => window.removeEventListener('mousedown', f)
  }, [])
  const r = ROLES[role]
  const group = (keys, title) => (
    <>
      <div className="h">{title}</div>
      {keys.map(k => { const x = ROLES[k]; return (
        <button key={k} className={`mi ${k === role ? 'on' : ''}`} onClick={() => { navigate(x.home); setOpen(false) }}>
          <Avatar role={k} size={34} />
          <span><b>{x.name}</b><span>{x.title}</span></span>
          {k === role ? <Check size={16} color="var(--mint)" /> : <span />}
        </button>
      ) })}
    </>
  )
  return (
    <div className="roleswitch" ref={ref}>
      <button className="rs-btn" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}>
        <Avatar role={role} />
        <span className="who"><small>Signed in as</small><b>{r.name}</b></span>
        <ChevronDown size={15} style={{ color: 'var(--tx3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && <div className="menu" role="menu">{group(['ops', 'dept', 'council', 'systems'], 'City staff')}{group(['resident'], 'Residents')}</div>}
    </div>
  )
}

export function TopBar({ role }) {
  const now = useStore(s => s.now)
  const storm = useStore(s => s.storm)
  return (
    <header className="topbar">
      <Link to="/" className="brand"><Logo /><span>PCC<small>City of Riverton</small></span></Link>
      <div className="spacer" />
      <PortalSwitch role={role} />
      <div className="spacer" />
      {storm && <span className="pill blue" style={{ height: 28 }}><CloudSnow size={13} /> Snow emergency</span>}
      <span className="clock"><Clock3 size={14} />{day(now)} · {time(now)}</span>
      <RoleSwitcher role={role} />
    </header>
  )
}

export function SideNav({ role, groups }) {
  const path = usePath()
  const r = ROLES[role]
  return (
    <nav className="sidenav">
      <div className="sn-who"><Avatar role={role} size={36} /><div><b>{r.name}</b><span>{r.title}</span></div></div>
      {groups.map(g => (
        <div key={g.label}>
          <div className="sn-label">{g.label}</div>
          {g.items.map(it => {
            const on = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + '/')
            const I = it.icon
            return (
              <Link key={it.to} to={it.to} className={`navitem ${on ? 'on' : ''}`}>
                <I size={17} strokeWidth={2} />{it.label}
                {it.count > 0 && <span key={it.count} className={`count ${it.agent ? 'agent' : ''}`}>{it.count}</span>}
              </Link>
            )
          })}
        </div>
      ))}
      <div className="foot">PCC prototype · simulated AI agent · fictional City of Riverton · <Link to="/credits" style={{ textDecoration: 'underline' }}>Photo credits</Link></div>
    </nav>
  )
}

export function AgentPanel({ role }) {
  const feed = useStore(s => s.feed)
  const stats = useStore(s => s.stats)
  const running = useStore(s => s.running)
  const audit = useStore(s => s.audit)
  const openN = useStore(s => s.requests.filter(isOpen).length)
  const decisions = useStore(s => s.requests.filter(q => q.status === 'review' || (q.flags.includes('escalated') && isOpen(q))).length + s.proposals.filter(p => p.status === 'pending').length)
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState('all')
  const [why, setWhy] = useState(null)
  const seen = useRef(new Set(feed.map(f => f.id)))
  useEffect(() => { const t = setTimeout(() => feed.forEach(f => seen.current.add(f.id)), 2300); return () => clearTimeout(t) }, [feed])
  if (!open) return (
    <aside className="agentpanel closed">
      <button className="iconbtn" onClick={() => setOpen(true)} aria-label="Open AI activity"><PanelRightOpen size={17} /></button>
      <div style={{ marginTop: 10 }}><AgentMark busy={!!running} /></div>
    </aside>
  )
  const list = feed.filter(f => tab === 'all' || (tab === 'comms' ? f.kind === 'notify' : ['merge', 'route', 'priority', 'plan', 'storm', 'nudge', 'escalate', 'proposal', 'review', 'reopen', 'resolve'].includes(f.kind)))
  const base = role === 'dept' ? '/dept/request/' : '/ops/requests/'
  return (
    <aside className="agentpanel">
      <div className="ap-head">
        <div className="row" style={{ gap: 10 }}>
          <AgentMark busy={!!running} />
          <div style={{ flex: 1 }}><b style={{ fontSize: 14 }}>PCC agent</b><div className="live"><i />{running ? 'Working on a new report' : `Watching ${openN} open requests`}</div></div>
          <button className="iconbtn" onClick={() => setOpen(false)} aria-label="Collapse"><PanelRightClose size={17} /></button>
        </div>
        <div className="ap-stats">
          <div><b>{stats.merged}</b><span>duplicates merged</span></div>
          <div><b>{stats.routed}</b><span>requests routed</span></div>
          <div><b>{stats.notified}</b><span>residents updated</span></div>
        </div>
        {role === 'ops' && decisions > 0 && (
          <Link to="/ops/decisions" className="callout" style={{ marginTop: 10, padding: '9px 12px', alignItems: 'center' }}>
            <span style={{ flex: 1 }}><b>{decisions} decision{decisions === 1 ? '' : 's'}</b> waiting for you</span><ArrowRight size={15} />
          </Link>
        )}
      </div>
      {running && (
        <div className={`run ${running.finished ? 'done' : ''}`}>
          <h4><Sparkles size={14} />{running.finished ? 'Done: new report handled' : 'Handling a new report…'}</h4>
          {running.steps.map((st, i) => {
            const cur = !st.done && (i === 0 || running.steps[i - 1].done)
            return (
              <div key={i} className={`step ${st.done ? 'done' : cur ? 'cur' : 'wait'}`}>
                <span className="b">{st.done && <Check size={11} strokeWidth={3} />}</span>
                <div><div style={{ fontWeight: 600 }}>{st.label} {st.tool && st.done && <span className="toolchip">{st.tool}</span>}</div>{st.done && <div className="d">{st.detail}</div>}</div>
              </div>
            )
          })}
        </div>
      )}
      <div className="ap-tabs">
        {[['all', 'Everything'], ['decisions', 'Decisions'], ['comms', 'Messages sent']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      <div className="ap-feed">
        {list.map(f => {
          const a = audit.find(x => x.id === 'A' + f.id.slice(1))
          const canUndo = a?.before && !a.undone && role === 'ops'
          return (
            <div key={f.id} className={`fe ${f.undone ? 'undone' : ''} ${!seen.current.has(f.id) ? 'fresh' : ''}`}>
              <span className={`ic ${['nudge', 'escalate', 'proposal', 'reopen'].includes(f.kind) ? 'warn' : ''}`}><FeedIcon kind={f.kind} /></span>
              <div>
                <div className="t">{f.text}</div>
                {why === f.id && <div className="why">{f.why}</div>}
                <div className="meta">
                  <span>{time(f.at)}</span>
                  {f.tool && <span className="toolchip">{f.tool}</span>}
                  <button onClick={() => setWhy(why === f.id ? null : f.id)}>{why === f.id ? 'Hide reason' : 'Why?'}</button>
                  {f.reqId && <button onClick={() => navigate(base + f.reqId)}>Open</button>}
                  {canUndo && <button onClick={() => undo(a.id)}>Undo</button>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function ToastItem({ t }) {
  useEffect(() => { const x = setTimeout(() => dismissToast(t.id), 5000); return () => clearTimeout(x) }, [t.id])
  return (
    <div className={`toast ${t.kind}`}>
      <AgentMark size="sm" />
      <span>{t.text}</span>
      {t.link && <button onClick={() => { dismissToast(t.id); navigate(t.link) }}>View</button>}
      <i className="bar" />
    </div>
  )
}
export function Toasts() {
  const toasts = useStore(s => s.toasts)
  return <div className="toasts" aria-live="polite">{toasts.slice(-3).map(t => <ToastItem key={t.id} t={t} />)}</div>
}

export function DemoControls() {
  const [open, setOpen] = useState(false)
  const storm = useStore(s => s.storm)
  const broken = useStore(s => s.plows.some(p => p.status === 'broken'))
  const ref = useRef()
  useEffect(() => {
    const f = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', f); return () => window.removeEventListener('mousedown', f)
  }, [])
  const items = [
    { icon: PlayCircle, label: 'Play the guided demo', sub: `${GUIDE.length} steps across both portals`, fn: () => { reset(); setGuided(0); navigate(GUIDE[0].path) } },
    { icon: CloudSnow, label: 'Start a snowstorm', sub: storm ? 'Storm already active' : 'Residents report unplowed streets', fn: () => { triggerStorm(); navigate('/dept/winter') }, off: !!storm },
    { icon: Truck, label: 'Break 2 plows', sub: storm ? 'The AI proposes a new route plan' : 'Start a snowstorm first', fn: () => { breakPlows(2); navigate('/ops/decisions') }, off: !storm || broken },
    { icon: Wrench, label: 'Repair all plows', sub: 'Fleet back to 8', fn: repairPlows, off: !broken },
    { icon: FastForward, label: 'Move the clock 12 hours', sub: 'Late work gets a reminder, then an escalation', fn: () => advance(12) },
    { icon: RotateCcw, label: 'Reset the city', sub: 'Back to Monday 9:12 AM', fn: () => { reset(); navigate('/') } },
  ]
  return (
    <div className="demofab" ref={ref}>
      {open && (
        <div className="demopanel">
          <div className="h">Presenter controls (not part of the product)</div>
          {items.map(it => (
            <button key={it.label} className="it" disabled={it.off} style={it.off ? { opacity: .4 } : null} onClick={() => { it.fn(); setOpen(false) }}>
              <it.icon size={17} /><div>{it.label}<span>{it.sub}</span></div>
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}><FlaskConical size={15} />Demo</button>
    </div>
  )
}

export function Guided() {
  const g = useStore(s => s.guided)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState({})
  if (g === null || g === undefined) return null
  const st = GUIDE[g]
  const go = i => { setGuided(i); navigate(GUIDE[i].path) }
  const run = async () => { setBusy(true); try { await st.action() } finally { setBusy(false); setDone(d => ({ ...d, [g]: true })) } }
  const res = st.who.startsWith('Resident')
  return (
    <div className="guided" role="dialog" aria-label="Guided demo" key={g}>
      <span className="n">{g + 1}</span>
      <div>
        <span className={`gwho ${res ? 'res' : ''}`}>{res ? <Smartphone size={11} /> : <Building2 size={11} />}{st.who}</span>
        <b>{st.title}</b>
        <p>{st.text}</p>
        <div className="dots">{GUIDE.map((_, i) => <i key={i} className={i <= g ? 'on' : ''} />)}</div>
      </div>
      <div className="row">
        {st.action && <button className="btn sm primary" disabled={busy || (done[g] && !st.repeat)} onClick={run}>{busy ? 'Working…' : done[g] && !st.repeat ? <><Check size={13} />Done</> : st.actionLabel}</button>}
        {g > 0 && <button className="btn sm" onClick={() => go(g - 1)} aria-label="Previous step"><ChevronLeft size={14} /></button>}
        {g < GUIDE.length - 1 ? <button className="btn sm go" onClick={() => go(g + 1)}>Next <ArrowRight size={14} /></button> : <button className="btn sm" onClick={() => setGuided(null)}>Finish</button>}
        <button className="iconbtn" onClick={() => setGuided(null)} aria-label="Close guide"><X size={16} /></button>
      </div>
    </div>
  )
}

export default function Shell({ role, groups, children, agent = true }) {
  return (
    <div className={`app ${agent ? '' : 'noagent'}`}>
      <TopBar role={role} />
      <SideNav role={role} groups={groups} />
      <main className="main">{children}</main>
      {agent && <AgentPanel role={role} />}
    </div>
  )
}
