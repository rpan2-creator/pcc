import { usePath } from './router.jsx'
import Landing from './pages/Landing.jsx'
import Ops from './pages/Ops.jsx'
import Dept from './pages/Dept.jsx'
import Resident from './pages/Resident.jsx'
import Council from './pages/Council.jsx'
import Systems from './pages/Systems.jsx'
import Credits from './pages/Credits.jsx'
import { Toasts, DemoControls, Guided } from './components/Shell.jsx'

export default function App() {
  const path = usePath()
  const [, area, sub, id] = path.split('/')
  let page
  if (area === 'ops') page = <Ops sub={sub} id={id} />
  else if (area === 'dept') page = <Dept sub={sub} id={id} />
  else if (area === 'resident') page = <Resident sub={sub} id={id} />
  else if (area === 'council') page = <Council />
  else if (area === 'systems') page = <Systems />
  else if (area === 'credits') page = <Credits />
  else page = <Landing />
  return <>{page}<Toasts /><Guided /><DemoControls /></>
}
