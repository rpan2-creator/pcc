import { usePath } from './router.jsx'
import Landing from './pages/Landing.jsx'
import Ops from './pages/Ops.jsx'
import Dept from './pages/Dept.jsx'
import Resident from './pages/Resident.jsx'
import Council from './pages/Council.jsx'
import Systems from './pages/Systems.jsx'
import Credits from './pages/Credits.jsx'
import { Toasts, DemoControls, Guided } from './components/Shell.jsx'

import { useEffect } from 'react'
import './theme.js'
import Backdrop from './components/Backdrop.jsx'

export default function App() {
  useEffect(() => {
    const move = e => { const el = e.target.closest?.('.spot'); if (el) { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`) } }
    const down = e => {
      const b = e.target.closest?.('.btn, .lbtn'); if (!b) return
      const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height)
      const sp = document.createElement('span'); sp.className = 'ripple'
      sp.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`
      b.appendChild(sp); setTimeout(() => sp.remove(), 650)
    }
    addEventListener('pointermove', move); addEventListener('pointerdown', down)
    return () => { removeEventListener('pointermove', move); removeEventListener('pointerdown', down) }
  }, [])

  const path = usePath()
  const [, area, sub, id] = path.split('/')
  useEffect(() => { document.querySelector('.main')?.scrollTo?.(0, 0); if (!area) window.scrollTo(0, 0) }, [path])
  let page
  if (area === 'ops') page = <Ops sub={sub} id={id} />
  else if (area === 'dept') page = <Dept sub={sub} id={id} />
  else if (area === 'resident') page = <Resident sub={sub} id={id} />
  else if (area === 'council') page = <Council sub={sub} id={id} />
  else if (area === 'systems') page = <Systems />
  else if (area === 'credits') page = <Credits />
  else page = <Landing />
  return <><Backdrop />{page}<Toasts /><Guided /><DemoControls /></>
}
