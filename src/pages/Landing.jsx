import { PlayCircle, ArrowRight, GitMerge, ListOrdered, BellRing, ShieldCheck, Sparkles } from 'lucide-react'
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
        <div className="mergeart" aria-hidden="true">
          {REPORTS.map((r, i) => (
            <div key={i} className="rcard" style={{ '--i': i, '--r': `${(i % 2 ? 1 : -1) * (2 + i)}deg`, '--x': `${(i % 3) * 26 - 26}px`, '--y': `${i * 64}px` }}>
              <span className="catdot" style={{ background: '#D4553A' }} />
              <div><b>{r[0]}</b><span>{r[1]}</span></div>
            </div>
          ))}
          <div className="ticket">
            <div className="row" style={{ gap: 8 }}><span className="id" style={{ color: 'rgba(255,255,255,.7)' }}>REQ-2041</span><span className="spacer" /><span className="pill high" style={{ background: '#fff' }}><span className="dot" />High</span></div>
            <b>Pothole · 412 Elm St</b>
            <div className="tk-row"><GitMerge size={14} />7 reports merged into one</div>
            <div className="tk-row"><ListOrdered size={14} />School bus route · 23 upvotes</div>
            <div className="tk-row"><BellRing size={14} />7 residents told: crew tomorrow</div>
          </div>
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
      <footer className="lfoot">PCC prototype · the agent is simulated and all data belongs to the fictional City of Riverton.</footer>
    </div>
  )
}
