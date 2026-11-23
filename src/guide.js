import { submitReport, decideReview, accept, schedule, crewFix, confirmFix, triggerStorm, breakPlows, decideProposal, advance, getState, undo, clearRun } from './store.js'
import { navigate } from './router.jsx'

const wait = ms => new Promise(r => setTimeout(r, ms))

export const PRIYA_REPORT = { category: 'pothole', street: 'elm', t: 0.475, text: 'Huge pothole in front of 418 Elm St. My tire hit it this morning and kids walk around it to get to school.' }

// who: which portal and person the presenter is in for this step
export const GUIDE = [
  { who: 'Resident app · Priya', path: '/resident/report', title: 'Priya reports a pothole', text: 'A sentence and a photo. Watch the AI read it, pick the type, find 6 earlier reports of the same pothole, merge hers as a vote, and reply with a real time estimate.', actionLabel: 'Send Priya\'s report',
    action: async () => { const r = await submitReport(PRIYA_REPORT); await wait(2200); clearRun(); if (r) navigate(`/resident/issue/${r.reqId}`) } },
  { who: 'Staff console · Dana, operations', path: '/ops', title: 'Nobody had to sort it', text: 'The command center already shows the merged request near the top. The AI panel on the right lists each step it took, with the reason and an undo.' },
  { who: 'Staff console · Marcus, Public Works', path: '/dept/request/REQ-2041', title: 'Public Works accepts and books a crew', text: 'Marcus sees why it ranks high (school bus route, many votes), accepts it and books a crew for tomorrow. Everyone who reported it gets the date automatically.', actionLabel: 'Accept and schedule',
    action: async () => { clearRun(); const q = getState().requests.find(x => x.id === 'REQ-2041'); if (q.status === 'new') { accept('REQ-2041'); await wait(500) } const crew = getState().crews.find(c => c.dept === 'publicworks' && c.status === 'available'); if (crew && getState().requests.find(x => x.id === 'REQ-2041').status === 'accepted') schedule('REQ-2041', crew.id, 1) } },
  { who: 'Staff console · Public Works crew', path: '/dept/request/REQ-2041', title: 'Next morning: the crew fixes it', text: 'The crew checks in on site and closes out with an after photo. It is not closed yet: a resident has to confirm the fix.', actionLabel: 'Crew fixes it',
    action: async () => { const q = getState().requests.find(x => x.id === 'REQ-2041'); if (['scheduled', 'accepted', 'new'].includes(q.status)) crewFix('REQ-2041') } },
  { who: 'Resident app · Priya', path: '/resident/issue/REQ-2041', title: 'Priya confirms the fix', text: 'She sees before and after photos and taps "Yes, it\'s fixed". Only then is it closed, and the City Health index moves.', actionLabel: 'Yes, it\'s fixed',
    action: async () => { const q = getState().requests.find(x => x.id === 'REQ-2041'); if (q.status === 'resolved') confirmFix('REQ-2041', true) } },
  { who: 'Staff console · Dana, operations', path: '/ops/decisions', title: 'When the AI is unsure, a person decides', text: 'A branch is blocking a storm drain: Parks or Water & Sewer? The AI is only 62% sure, so it stops and asks Dana, with its best guess and reason.', actionLabel: 'Send it to Parks',
    action: async () => { decideReview('REQ-2056', 'parks') } },
  { who: 'Staff console · Marcus, Public Works', path: '/dept/winter', title: 'A snowstorm hits', text: 'Dozens of residents report unplowed streets. The AI merges them by street and plans the order for all 8 plows, then posts a time for every street.', actionLabel: 'Start the snowstorm',
    action: async () => { triggerStorm() } },
  { who: 'Staff console · Dana, operations', path: '/ops/decisions', title: 'Two plows break down', text: 'With 6 plows left, the AI proposes a new order. Emergency routes and the hospital keep their times; side streets move later. It needs approval because many residents\' times change.', actionLabel: 'Break 2 plows',
    action: async () => { if (!getState().storm) triggerStorm(); breakPlows(2) } },
  { who: 'Staff console · Dana, operations', path: '/ops/decisions', title: 'Dana approves the new plan', text: 'She checks the before and after times, then approves. Residents on affected streets get their new time by text.', actionLabel: 'Approve the plan',
    action: async () => { const p = getState().proposals.find(x => x.status === 'pending'); if (p) decideProposal(p.id, true) } },
  { who: 'Staff console · Dana, operations', path: '/ops/requests/REQ-1877', title: 'Late work gets followed up', text: 'A fallen tree passes its 2-day target. The AI reminds Parks first. If nothing happens in 12 more hours, it escalates to Dana.', actionLabel: 'Move the clock 12 hours', repeat: true,
    action: async () => { advance(12) } },
  { who: 'Council · James', path: '/council', title: 'Council sees the health of the city', text: 'One live score across every service, fairness by district, hotspots and where the money goes. It moves with every fix: Priya\'s confirmed pothole and the plowed streets are already counted.' },
  { who: 'Staff console · Dana, operations', path: '/ops/history', title: 'Every action can be undone', text: 'The history keeps every AI and staff action with its reason and the state before it. Undo puts it back.', actionLabel: 'Undo the Parks routing',
    action: async () => { const a = getState().audit.find(x => x.reqId === 'REQ-2056' && x.before && !x.undone); if (a) undo(a.id) } },
]
