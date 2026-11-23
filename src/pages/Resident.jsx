import { useState } from 'react'
import { Map as MapIcon, PlusCircle, ListChecks, Snowflake, ThumbsUp, Camera, MapPin, ChevronLeft, Check, Sparkles, Bell, BellOff, Phone, Mail, Search, Clock3, ChevronRight } from 'lucide-react'
import { TopBar } from '../components/Shell.jsx'
import CityMap from '../components/CityMap.jsx'
import { useStore, upvote, follow, submitReport, clearRun, etaOf, isOpen, confirmFix } from '../store.js'
import { EXTRA } from '../data/photos.js'
import { CATEGORIES, STREETS, districtName } from '../data/city.js'
import { Photo, AgentMark, Cat, CatIcon } from '../components/ui.jsx'
import { navigate, Link, usePath } from '../router.jsx'
import { ago, time, day } from '../format.js'
import { PRIYA_REPORT } from '../guide.js'

const HOME = { x: 497, y: 430 }
const STEPS = [['new', 'Received and sorted'], ['accepted', 'Accepted by the city'], ['scheduled', 'Crew scheduled'], ['in_progress', 'Crew working'], ['resolved', 'Fixed']]
const STEP_IX = { review: 0, new: 0, accepted: 1, scheduled: 2, in_progress: 3, resolved: 4, closed: 5, merged: 0 }

export default function Resident({ sub, id }) {
  const s = useStore()
  let screen
  if (sub === 'report') screen = <Report s={s} />
  else if (sub === 'issue') screen = <Issue s={s} id={id} />
  else if (sub === 'mine') screen = <Mine s={s} />
  else if (sub === 'snow') screen = <SnowStatus s={s} />
  else screen = <Home s={s} />
  return (
    <div className="app">
      <TopBar role="resident" />
      <div style={{ overflowY: 'auto', background: 'radial-gradient(#E1DCCF 1px, transparent 1px) 0 0 / 22px 22px, var(--bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) auto minmax(220px, 300px)', gap: 40, justifyContent: 'center', padding: '28px 24px 60px', alignItems: 'start' }}>
          <aside style={{ paddingTop: 30 }}>
            <div className="eyebrow">Resident app</div>
            <h2 style={{ fontSize: 22, fontWeight: 750, letterSpacing: '-0.02em', lineHeight: 1.2 }}>What Priya sees on her phone</h2>
            <p className="muted" style={{ marginTop: 10, lineHeight: 1.55 }}>Residents report problems, find issues already reported nearby, upvote them, and get updates with real time estimates. The same agent that coordinates city staff answers here.</p>
            <div className="col" style={{ gap: 8, marginTop: 18 }}>
              <span className="chip"><Phone size={13} />Calls to 311 land in the same queue</span>
              <span className="chip"><Mail size={13} />Paper mail is scanned in too</span>
            </div>
          </aside>
          <div className="phone">
            <div className="notch" />
            <div className="screen">{screen}</div>
            <TabBar />
          </div>
          <aside style={{ paddingTop: 30 }}>
            <Inbox s={s} />
          </aside>
        </div>
      </div>
    </div>
  )
}

function TabBar() {
  const path = usePath()
  const tabs = [['/resident', 'Nearby', MapIcon], ['/resident/report', 'Report', PlusCircle], ['/resident/mine', 'My reports', ListChecks], ['/resident/snow', 'Snow', Snowflake]]
  return (
    <nav className="tabbar">
      {tabs.map(([to, l, I]) => {
        const on = to === '/resident' ? path === to : path.startsWith(to)
        return <Link key={to} to={to} className={on ? 'on' : ''}><I size={20} strokeWidth={on ? 2.3 : 1.9} />{l}</Link>
      })}
    </nav>
  )
}

function Inbox({ s }) {
  const msgs = (s.inbox || []).slice(0, 6)
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="cardhead"><Bell size={15} /><h3>Priya's notifications</h3></div>
      {msgs.map(m => (
        <Link key={m.id} to={`/resident/issue/${m.reqId}`} style={{ display: 'block', padding: '11px 14px', borderTop: '1px solid var(--line-2)' }}>
          <div className="row tiny muted" style={{ gap: 6, marginBottom: 3 }}><AgentMark size="sm" />City of Riverton · {ago(m.at, s.now)}</div>
          <div className="small" style={{ lineHeight: 1.45 }}>{m.text}</div>
        </Link>
      ))}
    </div>
  )
}

function AppHeader({ title, back, right }) {
  return (
    <div className="apphead">
      {back ? <Link to={back} className="iconbtn" aria-label="Back"><ChevronLeft size={20} /></Link> : <span style={{ width: 4 }} />}
      <b>{title}</b>
      <span style={{ marginLeft: 'auto' }}>{right}</span>
    </div>
  )
}

function Home({ s }) {
  const [cat, setCat] = useState('all')
  const near = s.requests.filter(q => isOpen(q) && q.status !== 'review' && (cat === 'all' || q.category === cat))
    .map(q => ({ q, d: Math.hypot(q.x - HOME.x, q.y - HOME.y) * 2.2 })).sort((a, b) => a.d - b.d).slice(0, 12)
  return (
    <>
      <div style={{ padding: '18px 18px 10px' }}>
        <div className="tiny muted" style={{ fontWeight: 600 }}>Riverside · near 418 Elm St</div>
        <h2 style={{ fontSize: 22, fontWeight: 750, letterSpacing: '-0.02em', marginTop: 2 }}>Hi Priya</h2>
      </div>
      <div style={{ padding: '0 14px' }}>
        <Link to="/resident/report" className="reportcta"><Camera size={20} /><span><b>Report a problem</b><span>Pothole, streetlight, snow, trash and more</span></span><ChevronRight size={18} /></Link>
      </div>
      <div style={{ padding: '14px 14px 0' }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)' }}>
          <CityMap requests={near.map(x => x.q)} colorBy="category" legend={false} labels={false} aspect="tall" height={210} onSelect={id => navigate(`/resident/issue/${id}`)} now={s.now} />
        </div>
      </div>
      <div className="hscroll" style={{ padding: '12px 14px 4px' }}>
        {[['all', 'All'], ['pothole', 'Potholes'], ['streetlight', 'Lights'], ['trash', 'Trash'], ['tree', 'Trees'], ['sidewalk', 'Sidewalks']].map(([k, l]) => <button key={k} className={`fchip ${cat === k ? 'on' : ''}`} onClick={() => setCat(k)}>{l}</button>)}
      </div>
      <div style={{ padding: '6px 14px 90px' }}>
        <div className="tiny muted" style={{ fontWeight: 650, margin: '6px 4px 8px' }}>Already reported near you · upvote instead of reporting again</div>
        {near.map(({ q, d }) => <IssueRow key={q.id} q={q} d={d} s={s} />)}
      </div>
    </>
  )
}

function IssueRow({ q, d, s }) {
  const up = s.upvoted.includes(q.id)
  return (
    <div className="issuerow" onClick={() => navigate(`/resident/issue/${q.id}`)}>
      <div style={{ position: 'relative', flex: 'none' }}><Photo c={q.category} seed={q.reports.length} style={{ width: 56, height: 56, aspectRatio: 'auto', borderRadius: 12 }} /><span style={{ position: 'absolute', right: -4, bottom: -4 }}><CatIcon c={q.category} size={22} radius={7} /></span></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b>{CATEGORIES[q.category].label}</b>
        <div className="tiny muted">{q.address} · {d < 1000 ? `${Math.round(d / 10) * 10} m` : `${(d / 1000).toFixed(1)} km`}</div>
        <div className="tiny" style={{ marginTop: 3, color: 'var(--ink-2)', fontWeight: 600 }}>{q.status === 'closed' ? 'Closed' : STEPS[Math.min(4, STEP_IX[q.status])][1]}{['resolved', 'closed'].includes(q.status) ? '' : ` · ${etaOf(q, s).text}`}</div>
      </div>
      <button className={`upbtn ${up ? 'on' : ''}`} onClick={e => { e.stopPropagation(); upvote(q.id) }} aria-pressed={up}><ThumbsUp size={15} />{q.upvotes}</button>
    </div>
  )
}

function Report({ s }) {
  const guided = s.guided === 0
  const [photo, setPhoto] = useState(false)
  const [text, setText] = useState(guided ? PRIYA_REPORT.text : '')
  const [street, setStreet] = useState('elm')
  const run = s.running
  const [sent, setSent] = useState(false)
  const detected = /pothole|hole/i.test(text) ? 'pothole' : /light/i.test(text) ? 'streetlight' : /tree|branch/i.test(text) ? 'tree' : /trash|garbage|bin/i.test(text) ? 'trash' : /snow|plow/i.test(text) ? 'snow' : /sidewalk/i.test(text) ? 'sidewalk' : /graffiti|paint/i.test(text) ? 'graffiti' : /drain|flood/i.test(text) ? 'drain' : null
  if (run && (sent || !run.finished || s.guided === 0)) return <Thinking s={s} run={run} />
  return (
    <>
      <AppHeader title="Report a problem" back="/resident" />
      <div style={{ padding: '4px 16px 100px' }} className="col">
        <button className="photodrop" onClick={() => setPhoto(true)}>
          {photo || guided ? <Photo c={detected || 'pothole'} style={{ width: '100%', borderRadius: 12 }} /> : <><Camera size={26} /><b>Add a photo</b><span>Tap to take one</span></>}
        </button>
        <div className="field" style={{ marginTop: 14 }}>
          <label>Where is it?</label>
          <div className="row input" style={{ gap: 8 }}><MapPin size={16} color="var(--agent)" /><select style={{ border: 0, outline: 'none', background: 'transparent', flex: 1 }} value={street} onChange={e => setStreet(e.target.value)}>{STREETS.map(st => <option key={st.id} value={st.id}>{st.id === 'elm' ? '418 Elm St (your location)' : st.name}</option>)}</select></div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label>What's wrong?</label>
          <textarea className="textarea" placeholder="For example: deep pothole in the right lane" value={text} onChange={e => setText(e.target.value)} />
        </div>
        {detected && (
          <div className="callout" style={{ marginTop: 12, fontSize: 12.5, padding: '10px 12px' }}>
            <Sparkles size={15} style={{ flex: 'none', marginTop: 1 }} /><span>Looks like a <b>{CATEGORIES[detected].label.toLowerCase()}</b>. I will check if your neighbors already reported it.</span>
          </div>
        )}
        <button className="btn primary lg" style={{ marginTop: 16, justifyContent: 'center' }} disabled={!text.trim()} onClick={async () => {
          setSent(true)
          const r = await submitReport({ category: detected || 'pothole', street, t: street === 'elm' ? PRIYA_REPORT.t : 0.5, text })
          if (r) setTimeout(() => { clearRun(); navigate(`/resident/issue/${r.reqId}`) }, 1600)
        }}>Send report</button>
        <p className="tiny muted" style={{ marginTop: 10, textAlign: 'center' }}>Your name and phone stay private. Only the city sees them.</p>
      </div>
    </>
  )
}

function Thinking({ s, run }) {
  const res = run.result
  return (
    <>
      <AppHeader title="Report sent" />
      <div style={{ padding: '6px 16px 100px' }}>
        <div className="bubble me">{run.text}</div>
        <div className="row tiny muted" style={{ gap: 6, margin: '16px 0 8px' }}><AgentMark size="sm" />City of Riverton assistant</div>
        <div className="bubble bot">
          {run.steps.map((st, i) => {
            const cur = !st.done && (i === 0 || run.steps[i - 1].done)
            return (
              <div key={i} className={`step ${st.done ? 'done' : cur ? 'cur' : 'wait'}`}>
                <span className="b">{st.done && <Check size={11} strokeWidth={3} />}</span>
                <div><div style={{ fontWeight: 600 }}>{st.label}</div>{st.done && <div className="d">{st.detail}</div>}</div>
              </div>
            )
          })}
        </div>
        {res && (
          <div className="bubble bot" style={{ marginTop: 10, animation: 'rise .3s' }}>
            {res.kind === 'merged'
              ? <>Thanks, Priya. <b>{res.count - 1} neighbors</b> already reported this, so I added your report and your upvote to <b>{res.reqId}</b>. It is <b>High priority</b> because it is on a school bus route. Estimated repair: <b>{res.eta.text.toLowerCase()}</b>.</>
              : <>Thanks, Priya. I opened <b>{res.reqId}</b> and sent it to the right team. Estimated time: <b>{res.eta.text.toLowerCase()}</b>.</>}
          </div>
        )}
      </div>
    </>
  )
}

function Issue({ s, id }) {
  const q = s.requests.find(x => x.id === id)
  if (!q) return <><AppHeader title="Issue" back="/resident" /><div className="empty">Not found</div></>
  const real = q.status === 'merged' ? s.requests.find(x => x.id === q.mergedInto) : q
  const eta = etaOf(real, s)
  const ix = STEP_IX[real.status]
  const up = s.upvoted.includes(real.id), fol = s.following.includes(real.id)
  const msgs = (s.inbox || []).filter(m => m.reqId === real.id)
  return (
    <>
      <AppHeader title={real.id} back="/resident" />
      <div style={{ padding: '0 16px 100px' }}>
        {real.afterPhoto ? (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}><Photo c={real.category} label="Before" style={{ borderRadius: 12 }} /><Photo src={EXTRA.crew.src} c={real.category} label="After" style={{ borderRadius: 12 }} /></div>
        ) : <Photo c={real.category} style={{ borderRadius: 14 }} />}
        <h2 style={{ fontSize: 20, fontWeight: 750, marginTop: 14, letterSpacing: '-0.01em' }}>{CATEGORIES[real.category].label}</h2>
        <div className="small muted">{real.address} · {districtName(real.district)}</div>
        <div className="row" style={{ gap: 8, marginTop: 12 }}>
          <button className={`upbtn big ${up ? 'on' : ''}`} onClick={() => upvote(real.id)}><ThumbsUp size={16} />{up ? 'Upvoted' : 'Upvote'} · {real.upvotes}</button>
          <button className="upbtn big" onClick={() => follow(real.id)}>{fol ? <Bell size={16} /> : <BellOff size={16} />}{fol ? 'Following' : 'Follow'}</button>
        </div>
        {real.status === 'resolved' && (
          <div className="confirmcard">
            <b>The crew says this is fixed. Is it?</b>
            <p>{real.fixNote}</p>
            <div className="row" style={{ gap: 8, marginTop: 10 }}>
              <button className="btn primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => confirmFix(real.id, true)}><Check size={15} />Yes, it's fixed</button>
              <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => confirmFix(real.id, false)}>Still a problem</button>
            </div>
          </div>
        )}
        {real.status === 'closed' && <div className="confirmcard ok"><b>Closed. Thanks for confirming.</b><p>Fixed {((real.closedAt - real.createdAt) / 864e5).toFixed(1)} days after the first report.</p></div>}
        {!['resolved', 'closed'].includes(real.status) && <div className="etacard">
          <div className="row" style={{ gap: 8 }}><Clock3 size={16} /><b>{real.status === 'resolved' ? 'Fixed' : eta.text}</b></div>
          <p>{eta.reason}</p>
          <p className="tiny" style={{ opacity: .75, marginTop: 6 }}>{real.reports.length} residents reported this · {real.upvotes} upvotes help the city decide what comes first</p>
        </div>}
        <div className="stepper">
          {STEPS.map(([k, l], i) => (
            <div key={k} className={`st ${i < ix ? 'done' : i === ix ? 'cur' : ''}`}><span className="b">{i < ix ? <Check size={11} strokeWidth={3} /> : null}</span><span>{l}</span></div>
          ))}
        </div>
        {msgs.length > 0 && <>
          <div className="tiny muted" style={{ fontWeight: 650, margin: '18px 4px 8px' }}>Updates</div>
          {msgs.map(m => <div key={m.id} className="bubble bot" style={{ marginBottom: 8 }}><div className="tiny muted" style={{ marginBottom: 3 }}>{day(m.at)}, {time(m.at)}</div>{m.text}</div>)}
        </>}
      </div>
    </>
  )
}

function Mine({ s }) {
  const mine = s.requests.filter(q => s.reports.some(r => r.reqId === q.id && r.residentId === s.priya))
  const fol = s.requests.filter(q => s.following.includes(q.id) && !mine.includes(q))
  return (
    <>
      <AppHeader title="My reports" />
      <div style={{ padding: '0 14px 100px' }}>
        <div className="tiny muted" style={{ fontWeight: 650, margin: '6px 4px 8px' }}>Reported by you</div>
        {mine.map(q => <IssueRow key={q.id} q={q} d={Math.hypot(q.x - HOME.x, q.y - HOME.y) * 2.2} s={s} />)}
        {!mine.length && <div className="empty small">No reports yet</div>}
        {fol.length > 0 && <div className="tiny muted" style={{ fontWeight: 650, margin: '16px 4px 8px' }}>Following</div>}
        {fol.map(q => <IssueRow key={q.id} q={q} d={Math.hypot(q.x - HOME.x, q.y - HOME.y) * 2.2} s={s} />)}
      </div>
    </>
  )
}

function SnowStatus({ s }) {
  const [st, setSt] = useState('elm')
  if (!s.storm) return (<><AppHeader title="Snow" /><div style={{ padding: 24, textAlign: 'center' }} className="muted"><Snowflake size={30} /><p style={{ marginTop: 10 }}>No snow emergency right now. During a storm you can look up when your street will be plowed.</p></div></>)
  const plan = s.storm.plan
  const r = plan.routes.find(x => x.street === st)
  const hrs = r ? Math.max(0, (r.end - s.now) / 3600e3) : null
  return (
    <>
      <AppHeader title="Snow emergency" />
      <div style={{ padding: '0 16px 100px' }}>
        <div className="callout" style={{ fontSize: 12.5 }}><Snowflake size={15} style={{ flex: 'none', marginTop: 1 }} /><span>{s.plows.filter(p => p.status !== 'broken').length} plows are working. Emergency routes and the hospital come first, then main roads, then side streets.</span></div>
        <div className="field" style={{ marginTop: 14 }}><label>Your street</label>
          <div className="row input" style={{ gap: 8 }}><Search size={15} /><select style={{ border: 0, outline: 'none', background: 'transparent', flex: 1 }} value={st} onChange={e => setSt(e.target.value)}>{STREETS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
        </div>
        {r && (
          <div className="etacard" style={{ marginTop: 14 }}>
            <div className="tiny" style={{ opacity: .8, fontWeight: 650 }}>{r.name}</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: '4px 0' }}>{hrs < 1 ? 'Within the hour' : `About ${Math.round(hrs)} hours`}</div>
            <p>Expected by {time(r.end)}. {r.name} is a {r.kind} street, number {r.order} of {plan.routes.length} in the plan.</p>
          </div>
        )}
        <div style={{ borderRadius: 14, overflow: 'hidden', marginTop: 14, border: '1px solid var(--line)' }}>
          <CityMap requests={[]} snow={plan} now={s.now} legend={false} labels={false} aspect="tall" height={230} />
        </div>
      </div>
    </>
  )
}
