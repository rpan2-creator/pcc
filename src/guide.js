import { submitReport, decideReview, accept, schedule, crewFix, confirmFix, triggerStorm, breakPlows, decideProposal, advance, getState, undo, clearRun } from './store.js'
import { navigate } from './router.jsx'

const wait = ms => new Promise(r => setTimeout(r, ms))

export const PRIYA_REPORT = { category: 'pothole', street: 'elm', t: 0.475, text: 'Huge pothole in front of 418 Elm St. My tire hit it this morning and kids walk around it to get to school.' }

// who: which portal and person the presenter is in for this step
export const GUIDE = [
  { who: 'Resident app · Priya', path: '/resident/report', title: 'Priya reports a pothole', text: 'She adds a photo and a sentence. Watch the agent classify it, find 6 earlier reports of the same pothole, merge hers and reply with a time.', actionLabel: 'Send Priya\'s report',
    action: async () => { const r = await submitReport(PRIYA_REPORT); await wait(1700); if (r) navigate(`/resident/issue/${r.reqId}`) } },
  { who: 'Staff console · Dana', path: '/ops', title: 'The agent already did the sorting', text: 'Dana did not touch this report. The activity feed shows each step the agent took, with the reason and an undo.' },
  { who: 'Staff console · Marcus', path: '/dept/request/REQ-2041', title: 'Streets accepts and books a crew', text: 'Marcus sees why it is first in his queue (school bus route, 23 upvotes), accepts it and schedules a crew for tomorrow. Residents are told automatically.', actionLabel: 'Accept and schedule',
    action: async () => { clearRun(); const q = getState().requests.find(x => x.id === 'REQ-2041'); if (q.status === 'new') { accept('REQ-2041'); await wait(400) } const crew = getState().crews.find(c => c.dept === 'streets' && c.status === 'available'); if (crew && getState().requests.find(x => x.id === 'REQ-2041').status === 'accepted') schedule('REQ-2041', crew.id, 1) } },
  { who: 'Staff console · Marcus', path: '/dept/request/REQ-2041', title: 'Next morning: the crew fixes it', text: 'The crew checks in on site and closes out with an after photo. The request is not closed yet: a resident has to confirm.', actionLabel: 'Crew fixes it',
    action: async () => { const q = getState().requests.find(x => x.id === 'REQ-2041'); if (['scheduled', 'accepted', 'new'].includes(q.status)) crewFix('REQ-2041') } },
  { who: 'Resident app · Priya', path: '/resident/issue/REQ-2041', title: 'Priya confirms the fix', text: 'She sees before and after photos and confirms. Only then does the agent close the request.', actionLabel: 'Yes, it\'s fixed',
    action: async () => { const q = getState().requests.find(x => x.id === 'REQ-2041'); if (q.status === 'resolved') confirmFix('REQ-2041', true) } },
  { who: 'Staff console · Dana', path: '/ops/review', title: 'When the agent is unsure, it asks', text: 'Below the 80% confidence threshold it does not act. A branch blocking a storm drain: Parks or Water? Dana decides.', actionLabel: 'Route REQ-2056 to Parks',
    action: async () => { decideReview('REQ-2056', 'parks') } },
  { who: 'Staff console · Marcus', path: '/dept/snow', title: 'A snowstorm hits', text: 'Dozens of residents report unplowed streets. The agent merges them by street and plans routes for all 8 plows.', actionLabel: 'Start the snowstorm',
    action: async () => { triggerStorm() } },
  { who: 'Staff console · Dana', path: '/ops/proposals', title: 'Two plows break down', text: 'With 6 plows left, the agent proposes a new route order. Emergency routes and the hospital keep their times; side streets move later.', actionLabel: 'Break 2 plows',
    action: async () => { if (!getState().storm) triggerStorm(); breakPlows(2) } },
  { who: 'Staff console · Dana', path: '/ops/proposals', title: 'A person approves the big change', text: 'Dana checks the before and after, then approves. Residents on affected streets get their new times.', actionLabel: 'Approve the plan',
    action: async () => { const p = getState().proposals.find(x => x.status === 'pending'); if (p) decideProposal(p.id, true) } },
  { who: 'Staff console · Dana', path: '/ops/requests/REQ-1877', title: 'Overdue work gets followed up', text: 'A fallen tree passes its 3-day target. The agent reminds Parks first, then escalates to Dana 12 hours later.', actionLabel: 'Advance 12 hours', repeat: true,
    action: async () => { advance(12) } },
  { who: 'Staff console · Council', path: '/council', title: 'Council sees the bigger picture', text: 'Repeat problems, resolution time by district against the equity guardrail, and where the money goes.' },
  { who: 'Staff console · Dana', path: '/ops/audit', title: 'Every action can be undone', text: 'The audit log keeps every agent and staff action with its reason. Undo restores the earlier state.', actionLabel: 'Undo the REQ-2056 routing',
    action: async () => { const a = getState().audit.find(x => x.reqId === 'REQ-2056' && x.before && !x.undone); if (a) undo(a.id) } },
]
