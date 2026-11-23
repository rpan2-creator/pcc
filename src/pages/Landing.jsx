import { useEffect, useRef, useState } from 'react'
import { Building2, Smartphone, ArrowRight, Play, Check, Camera, Sparkles, Layers, Route, Wrench, BellRing, Landmark, ShieldCheck, Undo2, Scale, HeartPulse, Users } from 'lucide-react'
import { Logo, ThemeToggle } from '../components/Shell.jsx'
import { useStore, healthOf, reset, setGuided } from '../store.js'
import { CATEGORIES, DOMAINS } from '../data/city.js'
import { VORTEX } from '../data/photos.js'
import { CatIcon, HealthRing, healthColor, Num } from '../components/ui.jsx'
import { Link, navigate } from '../router.jsx'
import { GUIDE } from '../guide.js'

const N = 46
function Vortex() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const cards = [...el.children]
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const items = cards.map((c, i) => ({ c, a: (i / cards.length) * Math.PI * 2 * 3.1, z: (i / cards.length), r: 0.75 + ((i * 37) % 10) / 22 }))
    let mx = 0, my = 0, tx = 0, ty = 0, raf, t0 = performance.now()
    const onMove = e => { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5) }
    addEventListener('mousemove', onMove)
    const frame = now => {
      const t = (now - t0) / 1000
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05
      const W = innerWidth, H = innerHeight
      const spin = t * 0.06
      items.forEach(it => {
        let z = (it.z + (reduce ? 0 : t * 0.035)) % 1           // 0 far -> 1 near
        const depth = -1600 + z * 1900                          // translateZ
        const ang = it.a + spin
        const rad = (0.2 + z * 0.62) * Math.max(W, H) * 0.62 * it.r
        const x = Math.cos(ang) * rad - mx * 120 * z
        const y = Math.sin(ang) * rad * 0.62 - my * 90 * z
        const op = z < 0.12 ? z / 0.12 : z > 0.9 ? (1 - z) / 0.1 : 1
        it.c.style.transform = `translate3d(${x}px, ${y}px, ${depth}px) rotateZ(${Math.sin(ang) * 6}deg)`
        it.c.style.opacity = (op * (0.35 + z * 0.65)).toFixed(3)
        it.c.style.zIndex = Math.round(z * 100)
      })
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); removeEventListener('mousemove', onMove) }
  }, [])
  const pics = Array.from({ length: N }, (_, i) => VORTEX[(i * 7) % VORTEX.length])
  return (
    <div className="vortex" ref={ref} aria-hidden="true">
      {pics.map((p, i) => (
        <div key={i} className="vx-card" style={i % 3 === 0 ? { width: 150, height: 150, margin: '-75px 0 0 -75px' } : null}>
          <img src={p.src} alt="" referrerPolicy="no-referrer" loading={i < 20 ? 'eager' : 'lazy'} onError={e => { e.currentTarget.style.display = 'none' }} />
          {CATEGORIES[p.cat] && <span>{CATEGORIES[p.cat].label}</span>}
        </div>
      ))}
    </div>
  )
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.14 })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

const PIPE = [
  ['res', Camera, 'A resident reports', 'App, web, 311 call or letter. One sentence and a photo.', 'Resident'],
  ['ai', Layers, 'AI sorts and merges', 'Picks the type, finds the spot, folds duplicates into one request with votes.', 'AI agent'],
  ['ai', Route, 'AI routes and ranks', 'Sends it to the right department, scored by safety, votes, wait and fairness.', 'AI agent'],
  ['staff', Wrench, 'The city fixes it', 'The department accepts, books a crew, and closes it with an after photo.', 'City staff'],
  ['ai', BellRing, 'AI keeps everyone told', 'Real time estimates, reminders when work slips, escalation when it slips twice.', 'AI agent'],
  ['res', Check, 'Resident confirms', 'They check the after photo. City health goes up.', 'Resident'],
]

export default function Landing() {
  const s = useStore()
  const h = healthOf(s)
  const [scrolled, setScrolled] = useState(false)
  useReveal()
  useEffect(() => {
    const f = () => setScrolled(scrollY > 40)
    addEventListener('scroll', f); return () => removeEventListener('scroll', f)
  }, [])
  const demo = () => { reset(); setTimeout(() => { setGuided(0); navigate(GUIDE[0].path) }, 50) }
  return (
    <div className="landing">
      <nav className={`lnav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="row" style={{ gap: 10 }}><Logo size={30} /><b style={{ fontSize: 16, letterSpacing: '-.01em' }}>PCC</b><span className="tiny muted" style={{ marginLeft: 2 }}>Public Complaint Coordinator</span></Link>
        <span className="spacer" />
        <a href="#how" className="btn ghost sm">How it works</a>
        <a href="#problems" className="btn ghost sm">What it covers</a>
        <a href="#health" className="btn ghost sm">City health</a>
        <ThemeToggle />
        <Link to="/resident" className="btn sm"><Smartphone size={14} />Resident app</Link>
        <Link to="/ops" className="btn sm primary"><Building2 size={14} />Staff console</Link>
      </nav>

      <header className="hero">
        <Vortex />
        <div className="hero-glow" />
        <div className="hero-fade" />
        <div className="hero-center">
          <span className="hero-tag"><b>AI agent</b>for city services · City of Riverton pilot</span>
          <h1 style={{ marginTop: 22 }}>Every city problem.<br /><span className="glow">One coordinator.</span></h1>
          <p>PCC is an AI agent that sits between residents and city departments. It sorts every complaint, merges duplicates, sends each one to the right team, follows up when work slips, and tells residents when their problem will actually be fixed.</p>
          <div className="hero-portals">
            <Link to="/ops" className="hp spot"><span className="pi"><Building2 size={22} /></span><span><b>City staff console</b><small>Operations, departments, council</small></span><ArrowRight className="go" size={18} /></Link>
            <Link to="/resident" className="hp res spot"><span className="pi"><Smartphone size={22} /></span><span><b>Resident app</b><small>Report, vote, track a fix</small></span><ArrowRight className="go" size={18} /></Link>
          </div>
          <button className="btn ghost" style={{ marginTop: 18, color: 'var(--tx2)' }} onClick={demo}><Play size={14} />Play the 3-minute guided demo</button>
        </div>
        <div className="scrollhint"><i />Scroll</div>
      </header>

      <section className="lsec reveal" id="who">
        <h2>Residents report. Departments fix.<br />PCC does everything in between.</h2>
        <p className="lead">Today a pothole report becomes an email, a spreadsheet row and three phone calls. Six neighbors report the same thing and nobody tells any of them what happens next. PCC takes over that coordination work, and leaves every real decision to people.</p>
        <div className="who3">
          {[
            [Smartphone, 'var(--blue)', 'var(--bluebg)', 'Residents', 'Report anything in a sentence and a photo, see what neighbors already reported, and get a real date.', ['Upvote instead of re-reporting', 'Plain-language status and time estimate', 'Confirm the fix from the after photo'], '/resident', 'Open the resident app'],
            [Building2, 'var(--mint)', 'var(--mintbg)', 'City staff', 'A command center for operations and a clean work queue for each department, already sorted and ranked.', ['Only the unsure calls reach a person', 'Reminders and escalations run themselves', 'Every AI action can be explained and undone'], '/ops', 'Open the staff console'],
            [Landmark, 'var(--violet)', 'rgba(242,181,107,.12)', 'Council & public', 'A live City Health index: what is broken, where, for how long, and where the money goes.', ['Health score for every service area', 'Fairness across districts', 'Repeat problems worth a lasting fix'], '/council', 'Open city health'],
          ].map(([I, c, bg, t, p, li, to, cta]) => (
            <div key={t} className="card whocard spot lift">
              <span className="wi" style={{ background: bg, color: c }}><I size={22} /></span>
              <b>{t}</b><p>{p}</p>
              <ul>{li.map(x => <li key={x}><Check size={14} />{x}</li>)}</ul>
              <Link to={to} className="open" style={{ color: c }}>{cta}<ArrowRight size={14} /></Link>
            </div>
          ))}
        </div>
      </section>

      <section className="lsec reveal" id="how">
        <h2>From a report to a confirmed fix</h2>
        <p className="lead">Six steps. The AI handles the three that used to eat staff time, and every step is visible to the people involved.</p>
        <div className="pipeline">
          <div className="pipe-line"><i /></div>
          {PIPE.map(([k, I, t, p, who], i) => (
            <div key={t} className={`pst ${k}`} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="pic"><I size={28} /></div>
              <b>{t}</b><p>{p}</p>
              <span className="who" style={{ background: k === 'ai' ? 'var(--mintbg)' : k === 'res' ? 'var(--bluebg)' : 'rgba(var(--ink), .06)', color: k === 'ai' ? 'var(--mint)' : k === 'res' ? 'var(--blue)' : 'var(--tx2)' }}>{who}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lsec reveal" id="problems">
        <h2>Not just potholes and snow</h2>
        <p className="lead">PCC covers {Object.keys(CATEGORIES).length} kinds of problems across seven service areas and six departments. Each has its own owner, safety rules and target time.</p>
        <div className="domains">
          {Object.entries(DOMAINS).map(([k, d]) => (
            <div key={k} className="card dom spot lift">
              <div className="dh"><i style={{ background: d.color, boxShadow: `0 0 12px ${d.color}` }} /><b>{d.label}</b></div>
              <div className="cats">{Object.entries(CATEGORIES).filter(([, c]) => c.domain === k).map(([ck, c]) => <span key={ck}><CatIcon c={ck} size={22} />{c.label}</span>)}</div>
            </div>
          ))}
          <div className="card dom" style={{ background: 'linear-gradient(135deg, var(--mintbg), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <b style={{ fontSize: 15 }}>Something else?</b>
            <p className="small dim" style={{ marginTop: 6, lineHeight: 1.5 }}>Residents can just describe it. The AI picks the closest type, and if it is not sure, a coordinator decides.</p>
          </div>
        </div>
      </section>

      <section className="lsec reveal" id="health">
        <h2>The health of the city, in one number</h2>
        <p className="lead">Because every complaint flows through one place, PCC can show how each service is really doing, live, to staff, council and residents alike.</p>
        <div className="card healthband spot">
          <div style={{ display: 'grid', placeItems: 'center' }}><HealthRing value={h.index} size={220} stroke={14} label="City health index" sub="live from the demo" /></div>
          <div>
            {h.domains.map(d => (
              <div key={d.key} className="row" style={{ gap: 12, padding: '7px 0' }}>
                <span className="small" style={{ width: 190, fontWeight: 600 }}>{d.label}</span>
                <span className="hbar" style={{ flex: 1, height: 8 }}><i style={{ width: `${d.score}%`, background: healthColor(d.score) }} /></span>
                <b className="mono" style={{ width: 30, textAlign: 'right' }}><Num value={d.score} /></b>
                <span className="tiny muted" style={{ width: 80, textAlign: 'right' }}>{d.open} open</span>
              </div>
            ))}
            <Link to="/council" className="btn" style={{ marginTop: 16 }}><HeartPulse size={15} />See the full City Health dashboard</Link>
          </div>
        </div>
      </section>

      <section className="lsec reveal">
        <h2>People stay in charge</h2>
        <p className="lead">The AI coordinates. It does not make the calls that matter.</p>
        <div className="principles">
          {[
            [ShieldCheck, 'It stops when it is unsure', 'Below the confidence level the city sets, a report goes to a coordinator with the AI\'s best guess and its reason.'],
            [Users, 'Big changes need approval', 'A new snow plan that changes many residents\' times waits for a manager to approve it.'],
            [Undo2, 'Every action can be undone', 'Each step is logged with what it did, why, and the state before it. One click puts it back.'],
            [Scale, 'Fairness is a setting', 'Districts that wait longer get a boost, and the city decides how strong it is.'],
            [Sparkles, 'It explains every ranking', '"Why" on any request shows the five factors behind its priority score.'],
            [Building2, 'It works with what the city has', 'PCC reads and writes to the existing 311, work order, fleet and GIS systems.'],
          ].map(([I, t, p]) => <div key={t} className="card spot lift"><I size={20} color="var(--mint)" /><b>{t}</b><p>{p}</p></div>)}
        </div>
      </section>

      <section className="lsec reveal" style={{ textAlign: 'center' }}>
        <h2>See it work</h2>
        <p className="lead" style={{ margin: '14px auto 0' }}>Follow one pothole from Priya's phone to a crew and back, then a snowstorm where two plows break down.</p>
        <div className="row" style={{ gap: 10, justifyContent: 'center', marginTop: 26 }}>
          <button className="btn primary lg" onClick={demo}><Play size={16} />Play the guided demo</button>
          <Link to="/ops" className="btn lg">Explore on your own</Link>
        </div>
      </section>

      <footer className="lfoot">
        <span>PCC · Public Complaint Coordinator · a design concept. Riverton is a fictional city; all data is simulated.</span>
        <span className="spacer" />
        <Link to="/systems" className="link">Integrations</Link>
        <Link to="/credits" className="link">Photo credits</Link>
      </footer>
    </div>
  )
}
