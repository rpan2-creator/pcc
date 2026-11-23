import { useEffect, useRef, useState } from 'react'
import { Building2, Smartphone, ChevronDown, Search, PanelRightClose, PanelRightOpen, Snowflake, CloudSnow, Clock3, RotateCcw, PlayCircle, Truck, FastForward, Wrench, FlaskConical, X, ArrowRight, Sparkles, Check } from 'lucide-react'
import { useStore, dismissToast, undo, reset, triggerStorm, breakPlows, advance, repairPlows, setGuided, isOpen } from '../store.js'
import { navigate, Link, usePath } from '../router.jsx'
import { ROLES, Avatar, AgentMark, FeedIcon } from './ui.jsx'
import { time, day, ago } from '../format.js'
import { GUIDE } from '../guide.js'

export function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#1F4D36" />
      <path d="M9 10h14M9 16h9M9 22h5" stroke="#F6F4EE" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="22.5" cy="21.5" r="3.6" fill="#EE9A66" />
    </svg>
  )
}

export function RoleSwitcher({ role }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const f = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const k = e => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return
      if (e.altKey && /^[1-5]$/.test(e.key)) { navigate(Object.values(ROLES)[+e.key - 1].home); setOpen(false) }
    }
    window.addEventListener('mousedown', f); window.addEventListener('keydown', k)
    return () => { window.removeEventListener('mousedown', f); window.removeEventListener('keydown', k) }
  }, [])
  const r = ROLES[role]
  return (
    <div className="roleswitch" ref={ref}>
      <button className="rs-btn" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}>
        <Avatar role={role} />
        <span className="who"><small>Viewing as</small><b>{r.name}</b></span>
        <ChevronDown size={15} style={{ color: 'var(--ink-3)' }} />
      </button>
      {open && (
        <div className="rs-menu" role="menu">
          <div className="h">City staff and residents share the same live data.</div>
          {Object.values(ROLES).map((x, i) => (
            <button key={x.key} className={`rs-item ${x.key === role ? 'on' : ''}`} onClick={() => { navigate(x.home); setOpen(false) }} role="menuitem">
              <Avatar role={x.key} size={34} />
              <span><b>{x.name}</b><span>{x.title}</span></span>
              {x.key === role ? <Check size={16} color="var(--green-2)" /> : <kbd>Alt {i + 1}</kbd>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function PortalSwitch({ role }) {
  const staff = role !== 'resident'
  return (
    <nav className="portal" aria-label="Switch portal">
      <Link to={staff ? location.pathname : '/ops'} className={staff ? 'on' : ''}><Building2 size={17} />City staff console</Link>
      <Link to="/resident" className={!staff ? 'on res' : ''}><Smartphone size={17} />Resident app</Link>
    </nav>
  )
}

export function TopBar({ role }) {
  const now = useStore(s => s.now)
  const storm = useStore(s => s.storm)
  return (
    <header className="topbar">
      <Link to="/" className="brand"><Logo /><span>PCC<small>Public Complaint Coordinator</small></span><span className="city">City of Riverton</span></Link>
      <div className="spacer" />
      <PortalSwitch role={role} />
      <div className="spacer" />
      {storm && <span className="pill agent" style={{ height: 26 }}><CloudSnow size={13} /> Snow emergency</span>}
      <span className="clock"><Clock3 size={14} />{day(now)} · {time(now)}</span>
      <RoleSwitcher role={role} />
    </header>
  )
}

export function SideNav({ role, items }) {
  const path = usePath()
  const r = ROLES[role]
  return (
    <nav className="sidenav">
      <div className="role"><b>{r.short}</b><span>{r.title}</span></div>
      {items.map(it => {
        const on = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + '/')
        const I = it.icon
        return (
          <Link key={it.to} to={it.to} className={`navitem ${on ? 'on' : ''}`}>
            <I size={16} strokeWidth={2} />{it.label}
            {it.count > 0 && <span className={`count ${it.agent ? 'agent' : ''}`}>{it.count}</span>}
          </Link>
        )
      })}
      <div className="foot">Simulated agent · demo data for the fictional City of Riverton · <Link to="/credits" style={{ textDecoration: 'underline' }}>Photo credits</Link></div>
    </nav>
  )
}

export function AgentPanel({ role }) {
  const feed = useStore(s => s.feed)
  const stats = useStore(s => s.stats)
  const now = useStore(s => s.now)
  const running = useStore(s => s.running)
  const audit = useStore(s => s.audit)
  const reviewN = useStore(s => s.requests.filter(q => q.status === 'review' || (q.flags.includes('escalated') && isOpen(q))).length)
  const props = useStore(s => s.proposals.filter(p => p.status === 'pending').length)
  const openN = useStore(s => s.requests.filter(isOpen).length)
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState('all')
  const [why, setWhy] = useState(null)
  const seen = useRef(new Set(feed.map(f => f.id)))
  useEffect(() => { const t = setTimeout(() => feed.forEach(f => seen.current.add(f.id)), 1700); return () => clearTimeout(t) }, [feed])
  if (!open) return (
    <aside className="agentpanel closed">
      <button className="iconbtn" onClick={() => setOpen(true)} aria-label="Open agent panel"><PanelRightOpen size={17} /></button>
      <div style={{ marginTop: 10 }}><AgentMark /></div>
    </aside>
  )
  const list = feed.filter(f => tab === 'all' || (tab === 'comms' ? f.kind === 'notify' : ['merge', 'route', 'priority', 'plan', 'storm', 'nudge', 'escalate', 'proposal', 'review'].includes(f.kind)))
  const base = role === 'dept' ? '/dept/request/' : '/ops/requests/'
  return (
    <aside className="agentpanel">
      <div className="ap-head">
        <div className="ap-title">
          <AgentMark />
          <div style={{ flex: 1 }}><b>PCC agent</b><div className="live"><i />Coordinating {openN} open requests</div></div>
          <button className="iconbtn" onClick={() => setOpen(false)} aria-label="Collapse"><PanelRightClose size={17} /></button>
        </div>
        <div className="ap-stats">
          <div><b>{stats.merged}</b><span>reports merged</span></div>
          <div><b>{stats.routed}</b><span>requests routed</span></div>
          <div><b>{stats.notified}</b><span>residents updated</span></div>
        </div>
        {role === 'ops' && (reviewN > 0 || props > 0) && (
          <Link to={props ? '/ops/proposals' : '/ops/review'} className="callout" style={{ marginTop: 10, padding: '9px 12px', alignItems: 'center' }}>
            <span style={{ flex: 1 }}><b>{reviewN + props} decisions</b> are waiting for you</span><ArrowRight size={15} />
          </Link>
        )}
      </div>
      {running && (
        <div className="run">
          <h4><Sparkles size={14} />{running.finished ? 'Finished a new report' : 'Working on a new report'}</h4>
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
        {[['all', 'All activity'], ['decisions', 'Decisions'], ['comms', 'Messages']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      <div className="ap-feed">
        {list.map(f => {
          const a = audit.find(x => x.id === 'A' + f.id.slice(1))
          const canUndo = a?.before && !a.undone && role === 'ops'
          return (
            <div key={f.id} className={`fe ${f.undone ? 'undone' : ''} ${!seen.current.has(f.id) ? 'fresh' : ''}`}>
              <span className={`ic ${['nudge', 'escalate', 'proposal'].includes(f.kind) ? 'warn' : ''}`}><FeedIcon kind={f.kind} /></span>
              <div>
                <div className="t">{f.text}</div>
                {why === f.id && <div className="why">{f.why}</div>}
                <div className="meta">
                  <span>{time(f.at)}</span>
                  {f.tool && <span className="toolchip">{f.tool}</span>}
                  <button onClick={() => setWhy(why === f.id ? null : f.id)}>{why === f.id ? 'Hide' : 'Why'}</button>
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
      <span className="agentmark sm"><Sparkles size={12} /></span>
      <span>{t.text}</span>
      {t.link && <button onClick={() => { dismissToast(t.id); navigate(t.link) }}>View</button>}
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
    { icon: PlayCircle, label: 'Play the guided demo', sub: '12 steps across both portals', fn: () => { setGuided(0); navigate(GUIDE[0].path) } },
    { icon: CloudSnow, label: 'Start a snowstorm', sub: storm ? 'Storm already active' : 'Residents report unplowed streets', fn: () => { triggerStorm(); navigate('/dept/snow') }, off: !!storm },
    { icon: Truck, label: 'Break 2 plows', sub: storm ? 'Agent proposes a new route plan' : 'Start a snowstorm first', fn: () => { breakPlows(2); navigate('/ops/proposals') }, off: !storm || broken },
    { icon: Wrench, label: 'Repair all plows', sub: 'Fleet back to 8', fn: repairPlows, off: !broken },
    { icon: FastForward, label: 'Advance the clock 12 hours', sub: 'Overdue requests get reminded, then escalated', fn: () => advance(12) },
    { icon: RotateCcw, label: 'Reset the city', sub: 'Back to Monday 9:12 AM', fn: () => { reset(); navigate('/') } },
  ]
  return (
    <div className="demofab" ref={ref}>
      {open && (
        <div className="demopanel">
          <div className="h">Demo controls (not part of the product)</div>
          {items.map(it => (
            <button key={it.label} className="it" disabled={it.off} style={it.off ? { opacity: .45 } : null} onClick={() => { it.fn(); setOpen(false) }}>
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
  const [doneSteps, setDone] = useState({})
  if (g === null || g === undefined) return null
  const st = GUIDE[g]
  const go = i => { setGuided(i); navigate(GUIDE[i].path) }
  const run = async () => { setBusy(true); try { await st.action() } finally { setBusy(false); setDone(d => ({ ...d, [g]: true })) } }
  return (
    <div className="guided" role="dialog" aria-label="Guided demo">
      <span className="n">{g + 1}</span>
      <div>
        <span className="gwho">{st.who}</span>
        <b>{st.title}</b>
        <p>{st.text}</p>
        <div className="dots">{GUIDE.map((_, i) => <i key={i} className={i <= g ? 'on' : ''} />)}</div>
      </div>
      <div className="row">
        {st.action && <button className="btn sm" disabled={busy || (doneSteps[g] && !st.repeat)} onClick={run}>{busy ? 'Working…' : st.actionLabel}</button>}
        {g > 0 && <button className="btn sm" onClick={() => go(g - 1)}>Back</button>}
        {g < GUIDE.length - 1 ? <button className="btn sm go" onClick={() => go(g + 1)}>Next <ArrowRight size={14} /></button> : <button className="btn sm go" onClick={() => setGuided(null)}>Finish</button>}
        <button className="iconbtn" style={{ color: '#fff' }} onClick={() => setGuided(null)} aria-label="Close guide"><X size={16} /></button>
      </div>
    </div>
  )
}

export default function Shell({ role, nav, children, agent = true }) {
  return (
    <div className="app">
      <TopBar role={role} />
      <div className="body" style={!agent ? { gridTemplateColumns: '228px 1fr' } : null}>
        <SideNav role={role} items={nav} />
        <main className="main">{children}</main>
        {agent && <AgentPanel role={role} />}
      </div>
    </div>
  )
}
