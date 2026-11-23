import { submitReport, decideReview, accept, schedule, triggerStorm, breakPlows, decideProposal, advance, getState, undo } from './store.js'
import { navigate } from './router.jsx'

const wait = ms => new Promise(r => setTimeout(r, ms))

export const PRIYA_REPORT = { category: 'pothole', street: 'elm', t: 0.475, text: 'Huge pothole in front of 418 Elm St. My tire hit it this morning and kids walk around it to get to school.' }

export const GUIDE = [
  { path: '/resident/report', title: 'A resident reports a pothole', text: 'Priya photographs the pothole on Elm St. Watch the agent read it, find the duplicates and reply.', actionLabel: 'Send Priya\'s report',
    action: async () => { const r = await submitReport(PRIYA_REPORT); await wait(1700); if (r) navigate(`/resident/issue/${r.reqId}`) } },
  { path: '/ops', title: 'The agent did the coordination', text: 'In the ops console, the activity feed shows each step: merged with 6 earlier reports, priority raised, Priya told the ETA.' },
  { path: '/ops/review', title: 'Unsure cases wait for a person', text: 'Below the 80% confidence threshold the agent does not act. Dana confirms that the branch in the drain goes to Parks.', actionLabel: 'Route REQ-2056 to Parks',
    action: async () => { decideReview('REQ-2056', 'parks') } },
  { path: '/dept/request/REQ-2041', title: 'The department acts', text: 'Marcus sees why the pothole is first in his queue, accepts it and books a crew for tomorrow.', actionLabel: 'Accept and schedule',
    action: async () => { const q = getState().requests.find(x => x.id === 'REQ-2041'); if (q.status === 'new') { accept('REQ-2041'); await wait(500) } const crew = getState().crews.find(c => c.dept === 'streets' && c.status === 'available'); if (crew) schedule('REQ-2041', crew.id, 1) } },
  { path: '/resident/issue/REQ-2041', title: 'The resident sees the result', text: 'Priya gets the update without calling 311: scheduled for tomorrow, with the reason it moved up.' },
  { path: '/dept/snow', title: 'A snowstorm hits', text: 'Dozens of residents report unplowed streets. The agent merges them by street and builds a plow plan for 8 plows.', actionLabel: 'Start the snowstorm',
    action: async () => { triggerStorm() } },
  { path: '/ops/proposals', title: 'Two plows break down', text: 'With 6 plows left, the agent proposes a new route order. Emergency routes keep their times; residential streets move later.', actionLabel: 'Break 2 plows',
    action: async () => { if (!getState().storm) triggerStorm(); breakPlows(2) } },
  { path: '/ops/proposals', title: 'A person approves the big change', text: 'Dana checks the before and after, then approves. Residents on affected streets get their new times.', actionLabel: 'Approve the plan',
    action: async () => { const p = getState().proposals.find(x => x.status === 'pending'); if (p) decideProposal(p.id, true) } },
  { path: '/ops/requests/REQ-1877', title: 'Overdue work gets followed up', text: 'A fallen tree on Cedar Ln passes its 3-day target. The agent reminds Parks first, then escalates to Dana.', actionLabel: 'Advance 12 hours', repeat: true,
    action: async () => { advance(12) } },
  { path: '/council', title: 'The city sees the bigger picture', text: 'Council reads repeat problems, resolution time by district against the equity guardrail, and staff hours saved.' },
  { path: '/ops/audit', title: 'Every action can be undone', text: 'The audit log keeps the agent\'s and people\'s actions with reasons. Undo restores the earlier state.', actionLabel: 'Undo the latest merge',
    action: async () => { const a = getState().audit.find(x => x.kind === 'merge' && x.before && !x.undone); if (a) undo(a.id) } },
]
