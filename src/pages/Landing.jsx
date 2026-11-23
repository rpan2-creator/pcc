import { PlayCircle, ArrowRight, GitMerge, ListOrdered, BellRing, ShieldCheck, Sparkles, Building2, Smartphone, Camera, Bot, UserCheck, CalendarCheck, HardHat, BadgeCheck, CheckCircle2 } from 'lucide-react'
import { EXTRA, PHOTOS } from '../data/photos.js'
import { Logo } from '../components/Shell.jsx'
import { ROLES, Avatar } from '../components/ui.jsx'
import { Link, navigate } from '../router.jsx'
import { setGuided } from '../store.js'
import { GUIDE } from '../guide.js'

const REPORTS = [
  ['Deep pothole in front of 412 Elm', 'App · 4 days ago'],
  ['Kids walk around it into the road', 'App · 3 days ago'],
  ['Huge hole outside 412 Elm St', '311 call · 3 days ago'],
  ['Water inside the pothole now', 'App · 2 days ago'],
  ['Same pothole as last week', 'Web · yesterday'],
  ['My tire hit it this morning', 'App · just now'],
]

export default function Landing() {
  const start = () => { setGuided(0); navigate(GUIDE[0].path) }
  return (
    <div className="landing">
      <header className="lhead">
        <div className="brand"><Logo size={32} /><span>PCC<small>Public Complaint Coordinator</small></span></div>
        <span className="spacer" />
        <Link to="/ops" className="btn ghost">Ops console</Link>
        <Link to="/resident" className="btn ghost">Resident app</Link>
        <button className="btn primary" onClick={start}><PlayCircle size={16} />Guided demo</button>
      </header>

      <section className="hero">
        <div>
          <span className="pill agent" style={{ height: 26, marginBottom: 18 }}><Sparkles size={13} />An AI agent for city operations</span>
          <h1>One pothole.<br />Dozens of reports.<br /><span>One clear response.</span></h1>
          <p className="lede">PCC sits on top of the systems your city already uses. The agent merges duplicate complaints, routes them to the right department, recommends what to fix first, and keeps every resident updated. Managers review, correct or override it at any point.</p>
          <div className="row" style={{ gap: 10, marginTop: 26 }}>
            <button className="btn primary lg" onClick={start}><PlayCircle size={18} />Play the guided demo</button>
            <Link to="/ops" className="btn lg">Explore on your own <ArrowRight size={16} /></Link>
          </div>
          <p className="tiny muted" style={{ marginTop: 14 }}>Group 1 · Surabhi, Adi, Lavanya Munjal, Zareen Tasnim, Richard</p>
        </div>
        <div className="portals">
          <Link to="/ops" className="portalcard staff">
            <div className="pc-img"><img src={EXTRA.crew.src} alt="City road crew repairing a pothole" referrerPolicy="no-referrer" /></div>
            <div className="pc-body">
              <span className="pc-ic"><Building2 size={22} /></span>
              <div><b>City staff console</b><span>Coordination manager, department managers, council and connected systems</span></div>
              <ArrowRight size={20} className="pc-go" />
            </div>
          </Link>
          <Link to="/resident" className="portalcard res">
            <div className="pc-img"><img src={PHOTOS.pothole[0].src} alt="Pothole on a city street" referrerPolicy="no-referrer" /></div>
            <div className="pc-body">
              <span className="pc-ic"><Smartphone size={22} /></span>
              <div><b>Resident app</b><span>Report a problem, upvote what is already reported and follow it to the fix</span></div>
              <ArrowRight size={20} className="pc-go" />
            </div>
          </Link>
        </div>
      </section>

      <section className="lsec">
        <h2>How one complaint moves through PCC</h2>
        <p className="muted">The agent does the sorting and follow-up. People make the calls that matter.</p>
        <div className="flow">
          {[
            [Camera, 'Resident reports', 'Photo, place, a few words. App, web, 311 call or mail.', 'res'],
            [Bot, 'Agent sorts it', 'Classifies, merges duplicates, routes, sets priority, replies with a time.', 'agent'],
            [UserCheck, 'Department accepts', 'Manager sees why it ranks where it does. Accepts or reroutes.', 'staff'],
            [CalendarCheck, 'Crew scheduled', 'Residents get the date automatically.', 'staff'],
            [HardHat, 'Crew fixes it', 'Checks in on site, closes out with an after photo.', 'staff'],
            [BadgeCheck, 'Resident confirms', 'Closed only when a resident agrees it is fixed.', 'res'],
          ].map(([I, t, d, k], i) => (
            <div key={t} className={`flowst ${k}`}>
              <span className="fi"><I size={20} /></span>
              <span className="fn">{i + 1}</span>
              <b>{t}</b><p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lsec">
        <h2>Pick a role. They all share one city.</h2>
        <p className="muted">Switch any time from the top-right menu, or with Alt + 1 to 5.</p>
        <div className="rolegrid">
          {Object.values(ROLES).map(r => (
            <Link key={r.key} to={r.home} className="rolecard">
              <Avatar role={r.key} size={40} />
              <b>{r.name}</b>
              <span className="t">{r.title}</span>
              <span className="d">{r.desc}</span>
              <span className="go">{r.short} <ArrowRight size={14} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="lsec three">
        {[
          [GitMerge, 'Coordinate', 'Categorizes complaints, merges duplicate reports and routes each request to the right department, with the photos and details it needs.'],
          [ListOrdered, 'Prioritize', 'Recommends an order from safety risk, upvotes, time open, crews and plows available, and fairness across districts. Every score explains itself.'],
          [BellRing, 'Follow through', 'Tracks progress, reminds departments about overdue work, escalates when needed and tells residents what is happening and when.'],
        ].map(([I, t, d]) => (
          <div key={t} className="pillar"><span className="pi"><I size={18} /></span><b>{t}</b><p>{d}</p></div>
        ))}
      </section>

      <section className="authority">
        <ShieldCheck size={22} />
        <div><b>AI handles coordination. People keep authority.</b><span>Below a confidence threshold the agent asks first. Big changes are proposals. Every action is logged with its reason and can be undone.</span></div>
      </section>
      <footer className="lfoot">PCC prototype · the agent is simulated and all data belongs to the fictional City of Riverton · <Link to="/credits" style={{ textDecoration: 'underline' }}>Photo credits</Link></footer>
    </div>
  )
}
