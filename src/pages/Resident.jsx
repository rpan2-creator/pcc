import { useState } from 'react'
import { Map as MapIcon, Plus, ListChecks, HeartPulse, ChevronUp, ChevronDown, Camera, MapPin, ChevronLeft, Check, Sparkles, Bell, BellRing, Search, Clock3, ChevronRight, Snowflake, X, Phone, Mail, Wallet } from 'lucide-react'
import { TopBar } from '../components/Shell.jsx'
import CityMap from '../components/CityMap.jsx'
import { useStore, upvote, downvote, follow, submitReport, clearRun, etaOf, isOpen, confirmFix, healthOf } from '../store.js'
import { EXTRA } from '../data/photos.js'
import { CATEGORIES, STREETS, DOMAINS, districtName } from '../data/city.js'
import { Photo, AgentMark, CatIcon, healthColor, Num } from '../components/ui.jsx'
import { navigate, Link, usePath } from '../router.jsx'
import { ago, time, day } from '../format.js'
import { PRIYA_REPORT } from '../guide.js'
import { BUDGET } from './Health.jsx'

const HOME = { x: 497, y: 430 }
const D = 864e5
const STEPS = [
  ['Received', 'The AI sorted it and checked for duplicates'],
  ['Accepted by the city', 'The right department has it'],
  ['Crew scheduled', 'You get the date'],
  ['Crew working', 'On site now'],
  ['Fixed', 'Check the after photo and confirm'],
]
const STEP_IX = { review: 0, new: 0, accepted: 1, scheduled: 2, in_progress: 3, resolved: 4, closed: 5, merged: 0 }
const RES_STATUS = { review: 'Received', new: 'Received', accepted: 'Accepted', scheduled: 'Scheduled', in_progress: 'Crew working', resolved: 'Fixed? Confirm', closed: 'Fixed', merged: 'Merged' }
const RES_COLOR = { review: '#7A857F', new: '#7A857F', accepted: '#1F6FD1', scheduled: '#1F6FD1', in_progress: '#C07A12', resolved: '#2E9B68', closed: '#2E9B68' }

const KEYWORDS = [
  [/pothole|hole in the road|crater/i, 'pothole'], [/sidewalk|curb|trip/i, 'sidewalk'], [/stop sign|sign (is )?(down|missing|bent)|street sign/i, 'sign'],
  [/traffic light|signal/i, 'signal'], [/street ?light|lamp|dark street/i, 'streetlight'], [/abandoned|parked|car .*(weeks|days)/i, 'vehicle'],
  [/leak|water main|burst|hydrant/i, 'leak'], [/flood|puddle|drain/i, 'flood'], [/sewer|smell|backup|manhole/i, 'sewer'],
  [/trash|garbage|recycling|pickup|bin/i, 'trash'], [/dump|mattress|couch|tires/i, 'dumping'], [/graffiti|tag|spray/i, 'graffiti'],
  [/tree|branch|limb/i, 'tree'], [/park|playground|bench|swing/i, 'park'], [/building|vacant|unsafe|collapse/i, 'building'],
  [/no heat|heating|cold apartment|radiator/i, 'heat'], [/noise|loud|music|party/i, 'noise'], [/rat|mice|rodent/i, 'rodent'], [/snow|ice|plow|slush/i, 'snow'],
]
const detect = t => (KEYWORDS.find(([re]) => re.test(t)) || [])[1] || null
const distM = q => Math.round(Math.hypot(q.x - HOME.x, q.y - HOME.y) * 2.2)

export default function Resident({ sub, id }) {
  const s = useStore()
  let screen
  if (sub === 'report') screen = <Report s={s} />
  else if (sub === 'issue') screen = <Issue s={s} id={id} />
  else if (sub === 'mine') screen = <Mine s={s} />
  else if (sub === 'city') screen = <City s={s} />
  else screen = <Home s={s} />
  return (
    <div className="app noagent" style={{ gridTemplateColumns: '1fr' }}>
      <TopBar role="resident" />
      <div className="resbg">
        <div className="resgrid">
          <aside className="resside">
            <div className="eyebrow" style={{ color: 'var(--blue)' }}>Resident app · Riverton 311</div>
            <h2>One place to report any city problem, and see it get fixed</h2>
            <p>Potholes, broken lights, missed trash, no heat, flooding, noise. Residents report in a sentence and a photo, see what neighbors already reported, vote on what matters, and get real time estimates from the same AI that coordinates city staff.</p>
            <div className="col" style={{ gap: 8, marginTop: 18 }}>
              <span className="chip"><Phone size={13} />311 phone calls land in the same queue</span>
              <span className="chip"><Mail size={13} />Paper mail is scanned in too</span>
              <span className="chip"><Sparkles size={13} />Duplicates merge into one request with votes</span>
            </div>
          </aside>
          <div className="phone">
            <div className="notch" />
            <div className="screen" key={sub + (id || '')}>{screen}</div>
            <TabBar />
          </div>
          <aside className="resside"><Inbox s={s} /></aside>
        </div>
      </div>
    </div>
  )
}

function TabBar() {
  const path = usePath()
  const tabs = [['/resident', 'Nearby', MapIcon], ['/resident/report', 'Report', Plus], ['/resident/mine', 'My reports', ListChecks], ['/resident/city', 'City health', HeartPulse]]
  return (
    <nav className="tabbar">
      {tabs.map(([to, l, I]) => {
        const on = to === '/resident' ? path === to || path.startsWith('/resident/issue') : path.startsWith(to)
        return <Link key={to} to={to} className={on ? 'on' : ''}><I size={21} strokeWidth={on ? 2.4 : 1.9} />{l}</Link>
      })}
    </nav>
  )
}

function Inbox({ s }) {
  const msgs = (s.inbox || []).slice(0, 6)
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="cardhead"><BellRing size={15} color="var(--blue)" /><h3>Priya's notifications</h3><span className="right tiny muted">text + push</span></div>
      {msgs.map((m, i) => (
        <Link key={m.id} to={`/resident/issue/${m.reqId}`} className="notif rowin" style={{ animationDelay: `${i * 40}ms` }}>
          <div className="row tiny muted" style={{ gap: 6, marginBottom: 4 }}><AgentMark size="sm" />City of Riverton · {ago(m.at, s.now)}</div>
          <div className="small" style={{ lineHeight: 1.5, color: 'var(--tx2)' }}>{m.text}</div>
        </Link>
      ))}
      {!msgs.length && <div className="empty small">No messages yet</div>}
    </div>
  )
}

function AppHeader({ title, back, right }) {
  return (
    <div className="apphead">
      {back ? <Link to={back} className="iconbtn"><ChevronLeft size={22} /></Link> : <span style={{ width: 8 }} />}
      <b style={{ flex: 1 }}>{title}</b>
      {right}
    </div>
  )
}

function Vote({ q, s }) {
  const up = s.upvoted.includes(q.id), down = s.downvoted.includes(q.id)
  const net = q.upvotes - (q.downvotes || 0)
  return (
    <div className="vote" onClick={e => e.stopPropagation()}>
      <button className={`up ${up ? 'on' : ''}`} aria-label="Upvote: this matters to me" onClick={() => upvote(q.id)}><ChevronUp size={17} strokeWidth={2.6} /></button>
      <b key={net} className="bump" style={{ color: up ? '#1F6FD1' : down ? '#C4462C' : '#132019' }}>{net}</b>
      <button className={`down ${down ? 'on' : ''}`} aria-label="Downvote: not a real problem" onClick={() => downvote(q.id)}><ChevronDown size={17} strokeWidth={2.6} /></button>
    </div>
  )
}

function ResStatus({ st }) { return <span className="resst" style={{ color: RES_COLOR[st], background: RES_COLOR[st] + '18' }}>{RES_STATUS[st]}</span> }

function IssueRow({ q, s, i = 0 }) {
  return (
    <div className="issuerow rowin" style={{ animationDelay: `${i * 35}ms` }} onClick={() => navigate(`/resident/issue/${q.id}`)}>
      <div style={{ width: 58, flex: 'none' }}><Photo c={q.category} seed={q.id.charCodeAt(6)} style={{ aspectRatio: '1', borderRadius: 11 }} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 6 }}><CatIcon c={q.category} size={18} /><b style={{ fontSize: 13.5 }}>{CATEGORIES[q.category].label}</b></div>
        <div className="tiny muted" style={{ margin: '3px 0 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.address} · {distM(q)} m</div>
        <div className="row" style={{ gap: 6 }}><ResStatus st={q.status} /><span className="tiny muted">{etaOf(q, s).text}</span></div>
      </div>
      <Vote q={q} s={s} />
    </div>
  )
}

function Home({ s }) {
  const [dom, setDom] = useState('all')
  const [qq, setQ] = useState('')
  const near = s.requests.filter(q => isOpen(q) && q.status !== 'review').filter(q => dom === 'all' || CATEGORIES[q.category].domain === dom)
    .filter(q => !qq || (q.address + CATEGORIES[q.category].label).toLowerCase().includes(qq.toLowerCase()))
    .sort((a, b) => distM(a) - distM(b))
  const elmSnow = s.storm && s.requests.find(q => q.category === 'snow' && q.street === 'elm' && isOpen(q))
  return (
    <>
      <div className="apphead"><span style={{ width: 8 }} /><div style={{ flex: 1 }}><div className="tiny muted">Good morning, Priya</div><b>Around 418 Elm St</b></div><Link to="/resident/mine" className="iconbtn"><Bell size={20} /></Link></div>
      <div style={{ padding: '0 14px 110px' }}>
        <Link to="/resident/report" className="reportcta"><span className="ic"><Camera size={20} /></span><span><b>Report a problem</b><small>A photo and a sentence. The AI does the rest.</small></span><ChevronRight size={18} /></Link>
        {elmSnow && (
          <Link to={`/resident/issue/${elmSnow.id}`} className="snowbanner"><Snowflake size={18} /><span style={{ flex: 1 }}><b>Snow emergency</b><small>Elm St is expected to be plowed {etaOf(elmSnow, s).text.toLowerCase()}</small></span><ChevronRight size={16} /></Link>
        )}
        <div className="lsearch"><Search size={15} /><input placeholder="Search a street or problem" value={qq} onChange={e => setQ(e.target.value)} /></div>
        <div className="lcard" style={{ overflow: 'hidden', marginTop: 10 }}>
          <CityMap requests={near.slice(0, 40)} theme="light" aspect="tall" legend={false} labels={false} now={s.now} onSelect={id => navigate(`/resident/issue/${id}`)} home={HOME} />
        </div>
        <div className="fchips">
          <button className={`fchip ${dom === 'all' ? 'on' : ''}`} onClick={() => setDom('all')}>All</button>
          {Object.entries(DOMAINS).map(([k, d]) => <button key={k} className={`fchip ${dom === k ? 'on' : ''}`} onClick={() => setDom(k)}><i style={{ width: 7, height: 7, borderRadius: 2, background: d.color }} />{d.label.split(' & ')[0]}</button>)}
        </div>
        <div className="row" style={{ margin: '4px 4px 8px' }}><b style={{ fontSize: 14 }}>Already reported nearby</b><span className="spacer" /><span className="tiny muted">{near.length} open</span></div>
        <div className="tiny muted" style={{ margin: '-4px 4px 10px', lineHeight: 1.4 }}>Same problem? Vote it up instead of reporting again. Votes help the city decide what comes first.</div>
        {near.slice(0, 12).map((q, i) => <IssueRow key={q.id} q={q} s={s} i={i} />)}
      </div>
    </>
  )
}

function Report({ s }) {
  const guided = s.guided === 0
  const [photo, setPhoto] = useState(guided)
  const [text, setText] = useState(guided ? PRIYA_REPORT.text : '')
  const [pick, setPick] = useState(null)
  const [street, setStreet] = useState('elm')
  const [sent, setSent] = useState(false)
  const [all, setAll] = useState(false)
  const run = s.running
  const ai = detect(text)
  const cat = pick || ai
  if (run && (sent || !run.finished || guided)) return <Thinking s={s} run={run} />
  const cats = Object.keys(CATEGORIES)
  const shown = all ? cats : cats.slice(0, 8).includes(cat) || !cat ? cats.slice(0, 8) : [...cats.slice(0, 7), cat]
  return (
    <>
      <AppHeader title="Report a problem" back="/resident" />
      <div style={{ padding: '0 16px 110px' }} className="col">
        <button className="photodrop" onClick={() => setPhoto(true)}>
          {photo ? <Photo c={cat || 'pothole'} style={{ width: '100%', borderRadius: 0 }} label="Your photo" /> : <><Camera size={26} /><b>Add a photo</b><span>Optional, but it helps the crew</span></>}
        </button>
        <div className="lfield" style={{ marginTop: 14 }}>
          <label>What's wrong?</label>
          <textarea className="linput" rows={3} placeholder="For example: the streetlight outside my building has been out for a week" value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div className="lfield" style={{ marginTop: 14 }}>
          <label className="row" style={{ gap: 6 }}>Type of problem {ai && !pick && <span className="aitag"><Sparkles size={11} />AI picked this from your words</span>}</label>
          <div className="catgrid">
            {shown.map(k => (
              <button key={k} className={`catbtn ${cat === k ? 'on' : ''}`} onClick={() => setPick(k)}>
                <CatIcon c={k} size={30} />{CATEGORIES[k].label}
              </button>
            ))}
          </div>
          {!all && <button className="linkbtn" onClick={() => setAll(true)}>Show all 19 types</button>}
        </div>
        <div className="lfield" style={{ marginTop: 14 }}>
          <label>Where?</label>
          <div className="linput row" style={{ gap: 8, padding: '0 12px' }}><MapPin size={16} color="#1F6FD1" /><select style={{ border: 0, outline: 'none', background: 'transparent', flex: 1, height: 42 }} value={street} onChange={e => setStreet(e.target.value)}>{STREETS.map(st => <option key={st.id} value={st.id}>{st.id === 'elm' ? '418 Elm St (current location)' : st.name}</option>)}</select></div>
        </div>
        <button className="lbtn primary" style={{ marginTop: 18, height: 50, fontSize: 15 }} disabled={!text.trim() || !cat} onClick={async () => {
          setSent(true)
          const r = await submitReport({ category: cat, street, t: street === 'elm' ? PRIYA_REPORT.t : 0.5, text, photo })
          if (r) setTimeout(() => { clearRun(); navigate(`/resident/issue/${r.reqId}`) }, 2200)
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
      <AppHeader title={res ? 'Report received' : 'Sending…'} />
      <div style={{ padding: '6px 16px 110px' }}>
        <div className="bubble me">{run.text}</div>
        <div className="row tiny muted" style={{ gap: 6, margin: '16px 0 8px' }}><AgentMark size="sm" busy={!res} />City of Riverton assistant {res ? '' : 'is working…'}</div>
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
          <>
            <div className="bubble bot" style={{ marginTop: 10 }}>
              {res.kind === 'merged'
                ? <>Thanks, Priya. <b>{res.count - 1} neighbors</b> already reported this, so I added your report and your vote to <b>{res.reqId}</b> instead of opening a duplicate.</>
                : <>Thanks, Priya. I opened <b>{res.reqId}</b> and sent it to the team that handles it.</>}
            </div>
            <div className="etacard"><div className="row" style={{ gap: 8 }}><Clock3 size={16} /><b>{res.eta.text}</b></div><p>{res.eta.reason}</p></div>
          </>
        )}
      </div>
    </>
  )
}

function Issue({ s, id }) {
  const q0 = s.requests.find(x => x.id === id)
  if (!q0) return <><AppHeader title="Issue" back="/resident" /><div className="empty">Not found</div></>
  const q = q0.status === 'merged' ? s.requests.find(x => x.id === q0.mergedInto) || q0 : q0
  const eta = etaOf(q, s)
  const ix = STEP_IX[q.status]
  const fol = s.following.includes(q.id)
  const msgs = (s.inbox || []).filter(m => m.reqId === q.id)
  return (
    <>
      <AppHeader title={q.id} back="/resident" right={<button className="iconbtn" onClick={() => follow(q.id)} title={fol ? 'Stop following' : 'Follow'}>{fol ? <BellRing size={20} color="#1F6FD1" /> : <Bell size={20} />}</button>} />
      <div style={{ padding: '0 16px 110px' }}>
        {q.afterPhoto ? (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}><Photo c={q.category} label="Before" style={{ borderRadius: 14 }} /><Photo src={EXTRA.crew.src} c={q.category} label="After" style={{ borderRadius: 14 }} /></div>
        ) : <Photo c={q.category} style={{ borderRadius: 16 }} />}
        <div className="row" style={{ gap: 12, marginTop: 14, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 7 }}><CatIcon c={q.category} size={24} /><h2 style={{ fontSize: 19, fontWeight: 750, letterSpacing: '-0.01em' }}>{CATEGORIES[q.category].label}</h2></div>
            <div className="small muted" style={{ marginTop: 4 }}>{q.address} · {districtName(q.district)}</div>
            <div className="tiny muted" style={{ marginTop: 2 }}>{q.reports.length} reports · first {ago(q.createdAt, s.now)}</div>
          </div>
          <Vote q={q} s={s} />
        </div>
        {q.status === 'resolved' && (
          <div className="confirmcard">
            <b>The crew says this is fixed. Is it?</b>
            <p>{q.fixNote}</p>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <button className="lbtn green" style={{ flex: 1 }} onClick={() => confirmFix(q.id, true)}><Check size={15} />Yes, it's fixed</button>
              <button className="lbtn" style={{ flex: 1 }} onClick={() => confirmFix(q.id, false)}><X size={15} />Still a problem</button>
            </div>
          </div>
        )}
        {q.status === 'closed' && <div className="confirmcard ok"><b>Fixed and confirmed</b><p>Closed {((q.closedAt - q.createdAt) / D).toFixed(1)} days after the first report. The city target is {CATEGORIES[q.category].target} days.</p></div>}
        {!['resolved', 'closed'].includes(q.status) && (
          <div className="etacard">
            <div className="tiny" style={{ opacity: .8, fontWeight: 650 }}>Expected fix</div>
            <div className="row" style={{ gap: 8, marginTop: 2 }}><Clock3 size={17} /><b>{eta.text}</b></div>
            <p>{eta.reason}</p>
          </div>
        )}
        <div className="stepper">
          {STEPS.map(([l, sub], i) => (
            <div key={l} className={`s ${i < ix ? 'done' : i === ix ? 'cur' : ''}`}><span className="b">{i < ix && <Check size={12} strokeWidth={3} />}</span><div><b>{l}</b><small>{sub}</small></div></div>
          ))}
        </div>
        {msgs.length > 0 && <>
          <div className="tiny muted" style={{ fontWeight: 700, margin: '6px 4px 8px' }}>Messages from the city</div>
          {msgs.map(m => <div key={m.id} className="bubble bot" style={{ marginBottom: 8 }}><div className="tiny muted" style={{ marginBottom: 3 }}>{day(m.at)}, {time(m.at)}</div>{m.text}</div>)}
        </>}
      </div>
    </>
  )
}

function Mine({ s }) {
  const mine = s.requests.filter(q => q.status !== 'merged' && s.reports.some(r => r.reqId === q.id && r.residentId === s.priya))
  const fol = s.requests.filter(q => q.status !== 'merged' && s.following.includes(q.id) && !mine.includes(q))
  return (
    <>
      <AppHeader title="My reports" />
      <div style={{ padding: '0 14px 110px' }}>
        <div className="tiny muted" style={{ fontWeight: 700, margin: '4px 4px 8px' }}>Reported by you · {mine.length}</div>
        {mine.map((q, i) => <IssueRow key={q.id} q={q} s={s} i={i} />)}
        {!mine.length && <div className="lcard" style={{ padding: 16, textAlign: 'center' }} ><div className="small muted">Nothing yet.</div><Link to="/resident/report" className="lbtn primary" style={{ marginTop: 10 }}>Report a problem</Link></div>}
        <div className="tiny muted" style={{ fontWeight: 700, margin: '18px 4px 8px' }}>Following · {fol.length}</div>
        {fol.map((q, i) => <IssueRow key={q.id} q={q} s={s} i={i} />)}
      </div>
    </>
  )
}

function City({ s }) {
  const h = healthOf(s)
  const closed = s.requests.filter(q => q.status === 'closed' && q.closedAt)
  const r = 54, c = 2 * Math.PI * r
  return (
    <>
      <AppHeader title="How Riverton is doing" />
      <div style={{ padding: '0 14px 110px' }}>
        <div className="lcard" style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
          <svg width="128" height="128" style={{ transform: 'rotate(-90deg)', flex: 'none' }}>
            <circle cx="64" cy="64" r={r} fill="none" stroke="#E8ECE9" strokeWidth="11" />
            <circle className="ringarc" cx="64" cy="64" r={r} fill="none" stroke={healthColor(h.index).replace('var(--mint)', '#2E9B68')} strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - h.index / 100)} />
          </svg>
          <div><div className="tiny muted" style={{ fontWeight: 700 }}>City health index</div><b style={{ fontSize: 40, letterSpacing: '-.04em', lineHeight: 1 }}><Num value={h.index} /></b><span className="muted"> / 100</span><p className="tiny muted" style={{ marginTop: 6, lineHeight: 1.45 }}>Updated live from every open request. Goes up when problems get fixed on time.</p></div>
        </div>
        <div className="tiny muted" style={{ fontWeight: 700, margin: '16px 4px 8px' }}>By service</div>
        <div className="lcard" style={{ padding: '6px 14px' }}>
          {h.domains.map(d => (
            <div key={d.key} style={{ padding: '9px 0', borderBottom: '1px solid #EEF1EE' }}>
              <div className="row" style={{ fontSize: 13, marginBottom: 6 }}><span style={{ flex: 1, fontWeight: 600 }}>{d.label}</span><span className="tiny muted" style={{ marginRight: 8 }}>{d.open} open</span><b>{d.score}</b></div>
              <div style={{ height: 6, borderRadius: 9, background: '#EDF0EE', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: `${d.score}%`, background: d.color, borderRadius: 9, transition: 'width 1s' }} /></div>
            </div>
          ))}
        </div>
        <div className="tiny muted row" style={{ fontWeight: 700, margin: '16px 4px 8px', gap: 5 }}><Wallet size={12} />Where the money goes this year</div>
        <div className="lcard" style={{ padding: '6px 14px' }}>
          {BUDGET.map(b => (
            <div key={b.key} className="row" style={{ padding: '8px 0', borderBottom: '1px solid #EEF1EE', fontSize: 13 }}>
              <span style={{ flex: 1 }}>{DOMAINS[b.key].label}</span><b>${b.spent.toFixed(1)}M</b><span className="tiny muted" style={{ width: 62, textAlign: 'right' }}>of ${b.budget.toFixed(1)}M</span>
            </div>
          ))}
          <div className="tiny muted" style={{ padding: '8px 0' }}>Illustrative figures for a fictional city.</div>
        </div>
        <div className="tiny muted" style={{ textAlign: 'center', marginTop: 14 }}>{closed.length} problems fixed and confirmed by residents recently</div>
      </div>
    </>
  )
}
