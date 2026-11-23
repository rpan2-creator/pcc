import { Plug, Inbox, ClipboardList, Database, Truck, Map as MapIcon, MessageSquare, Globe, ArrowRight, ArrowLeftRight } from 'lucide-react'
import Shell from '../components/Shell.jsx'
import { useStore } from '../store.js'
import { AgentMark, FeedIcon } from '../components/ui.jsx'
import { time } from '../format.js'

const SYSTEMS = [
  { id: '311 intake', icon: Inbox, name: '311 intake', vendor: 'Existing city system', reads: 'New reports from app, web, phone and scanned mail', writes: 'Merge links, categories' },
  { id: 'Work order system', icon: ClipboardList, name: 'Work order system', vendor: 'Existing city system', reads: 'Work orders, crew assignments, status', writes: 'New work orders, routing, reminders' },
  { id: 'Asset registry', icon: Database, name: 'Asset registry', vendor: 'Existing city system', reads: 'Streets, lights, signals, trees and their history', writes: 'Nothing' },
  { id: 'Fleet tracker', icon: Truck, name: 'Fleet tracker', vendor: 'Existing city system', reads: 'Plow and truck status, faults, location', writes: 'Route order for drivers' },
  { id: 'GIS', icon: MapIcon, name: 'GIS map', vendor: 'Existing city system', reads: 'Addresses, districts, schools, hospitals', writes: 'Nothing' },
  { id: 'SMS / email', icon: MessageSquare, name: 'SMS and email', vendor: 'Existing city system', reads: 'Resident contact preferences', writes: 'Status updates to residents' },
  { id: 'Public map', icon: Globe, name: 'Public issue map', vendor: 'Part of PCC', reads: 'Upvotes', writes: 'Open issues, status, plow times' },
]

export default function Systems() {
  const s = useStore()
  const nav = [{ to: '/systems', label: 'Connected systems', icon: Plug, exact: true }]
  const log = s.feed.filter(f => f.tool).slice(0, 40)
  return (
    <Shell role="systems" nav={nav} agent={false}>
      <div className="page wide">
        <div className="pagehead"><div><div className="eyebrow">Integrations</div><h1>PCC works on top of the city's existing systems</h1><p>Nothing is replaced. The agent reads from these systems, coordinates, and writes the result back where staff already work.</p></div></div>
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="row" style={{ gap: 0, justifyContent: 'space-between', alignItems: 'stretch' }}>
            {['Residents', 'PCC agent', 'City systems', 'Departments'].map((x, i) => (
              <div key={x} className="row" style={{ flex: 1, gap: 0 }}>
                <div className="card" style={{ flex: 1, padding: '14px 16px', textAlign: 'center', background: i === 1 ? 'var(--agent-soft)' : 'var(--paper-2)', borderColor: i === 1 ? '#CFDDEF' : undefined }}>
                  {i === 1 && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><AgentMark /></div>}
                  <b>{x}</b>
                  <div className="tiny muted" style={{ marginTop: 3 }}>{['report, upvote, follow', 'merge, route, prioritize, follow up', 'tickets, assets, fleet, messages', 'accept, schedule, fix'][i]}</div>
                </div>
                {i < 3 && <ArrowLeftRight size={18} style={{ margin: '0 10px', color: 'var(--ink-3)', alignSelf: 'center' }} />}
              </div>
            ))}
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 1fr)', alignItems: 'start' }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            {SYSTEMS.map(x => {
              const last = s.feed.find(f => f.tool === x.id)
              return (
                <div key={x.id} className="card pad">
                  <div className="row" style={{ gap: 10, marginBottom: 10 }}>
                    <span className="agentmark" style={{ background: 'var(--bg)', color: 'var(--ink-2)' }}><x.icon size={15} /></span>
                    <div style={{ flex: 1 }}><b>{x.name}</b><div className="tiny muted">{x.vendor}</div></div>
                    <span className="live"><i />Connected</span>
                  </div>
                  <dl className="kv" style={{ gridTemplateColumns: '70px 1fr', fontSize: 12.5 }}>
                    <dt>PCC reads</dt><dd>{x.reads}</dd>
                    <dt>PCC writes</dt><dd>{x.writes}</dd>
                    <dt>Last sync</dt><dd>{last ? time(last.at) : 'Today, 7:02 AM'}</dd>
                  </dl>
                </div>
              )
            })}
          </div>
          <div className="card">
            <div className="cardhead"><h3>Live sync log</h3><span className="sub">agent calls to city systems</span></div>
            <div style={{ maxHeight: 640, overflowY: 'auto' }}>
              {log.map(f => (
                <div key={f.id} className="row small" style={{ padding: '10px 16px', borderTop: '1px solid var(--line-2)', alignItems: 'flex-start', gap: 10 }}>
                  <span className="muted mono" style={{ width: 62, flex: 'none' }}>{time(f.at)}</span>
                  <span style={{ flex: 1 }}><span className="toolchip" style={{ marginRight: 6 }}>{f.tool}</span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
