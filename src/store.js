import { useSyncExternalStore } from 'react'
import { makeSeed } from './data/seed.js'
import { CATEGORIES, DEPARTMENTS, STREETS, pointOnStreet, districtAt, districtName } from './data/city.js'

const KEY = 'pcc-state-v4'
const H = 3600e3, D = 24 * H

let state = load()
const subs = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) { const s = JSON.parse(raw); if (s.version === 4) return { ...s, running: null, toasts: [] } }
  } catch {}
  return makeSeed()
}
function save() { try { localStorage.setItem(KEY, JSON.stringify({ ...state, running: null, toasts: [] })) } catch {} }

export function getState() { return state }
function emit() { subs.forEach(f => f()) }
export function useStore(sel = s => s) {
  return useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f) }, () => sel(state))
}

// Every action works on a deep copy, then swaps it in.
function update(fn, { persist = true } = {}) {
  const draft = structuredClone(state)
  fn(draft)
  state = draft
  if (persist) save()
  emit()
}

// ---------------- helpers ----------------
export const OPEN = ['review', 'new', 'accepted', 'scheduled', 'in_progress']
export const isOpen = q => OPEN.includes(q.status)
export const req = (s, id) => s.requests.find(q => q.id === id)
const nextId = (s, p) => `${p}-${++s.seq}`
const clock = s => s.now

export const EQUITY = { southport: 82, westbrook: 74, riverside: 58, downtown: 42, eastfield: 30, northgate: 26 }
const EQ_NOTE = {
  southport: 'Southport waited 1.4 days longer than the city median this year',
  westbrook: 'Westbrook waited 1.1 days longer than the city median this year',
  riverside: 'Riverside waited 0.5 days longer than the city median this year',
  downtown: 'Downtown is near the city median',
  eastfield: 'Eastfield is faster than the city median',
  northgate: 'Northgate is faster than the city median',
}

export const FACTOR_LABEL = { safety: 'Safety risk', community: 'Community signal', age: 'Time open', resources: 'Crew availability', equity: 'Equity adjustment' }

export function priorityOf(q, s = state) {
  const cat = CATEGORIES[q.category]
  const ageDays = (s.now - q.createdAt) / D
  const crews = s.crews.filter(c => c.dept === q.dept)
  const free = crews.filter(c => c.status === 'available').length
  const f = {
    safety: Math.min(100, cat.risk + (q.nearby ? 14 : 0)),
    community: Math.min(100, q.upvotes * 3 + q.reports.length * 4),
    age: Math.min(100, Math.round((ageDays / cat.target) * 100)),
    resources: Math.round(((free + 1) / (crews.length + 1)) * 100),
    equity: EQUITY[q.district] ?? 50,
  }
  const notes = {
    safety: `${cat.label}${q.nearby ? ` near ${q.nearby}` : ''}`,
    community: `${q.upvotes} upvotes from ${q.reports.length} report${q.reports.length === 1 ? '' : 's'}`,
    age: `${ageDays.toFixed(1)} days open of a ${cat.target}-day target`,
    resources: `${free} of ${crews.length} ${DEPARTMENTS[q.dept].short} crews free`,
    equity: EQ_NOTE[q.district],
  }
  const w = s.rules.weights
  const wsum = Object.values(w).reduce((a, b) => a + b, 0) || 1
  const factors = Object.keys(f).map(k => ({ key: k, label: FACTOR_LABEL[k], value: f[k], weight: w[k], contrib: (w[k] * f[k]) / wsum, note: notes[k] }))
  let score = Math.round(factors.reduce((a, x) => a + x.contrib, 0))
  let level = score >= 66 ? 'high' : score >= 46 ? 'medium' : 'low'
  if (q.override) level = q.override.level
  return { score, level, factors, overridden: !!q.override }
}

export function deptQueue(s, dept) {
  return s.requests.filter(q => q.dept === dept && ['new', 'accepted', 'scheduled', 'in_progress'].includes(q.status))
    .map(q => ({ q, p: priorityOf(q, s) }))
    .sort((a, b) => rank(b) - rank(a))
}
const rank = ({ q, p }) => (p.level === 'high' ? 1000 : p.level === 'medium' ? 500 : 0) + p.score

export function etaOf(q, s = state) {
  if (q.status === 'resolved') return { text: 'Fixed', short: 'Fixed', hours: 0, reason: 'The crew marked this fixed.' }
  if (q.status === 'review') return { text: 'Being reviewed', short: '—', hours: null, reason: 'A city coordinator is confirming who should handle this.' }
  if (q.category === 'snow' && s.storm) {
    const r = s.storm.plan.routes.find(r => r.street === q.street)
    if (r) {
      const hrs = Math.max(0, (r.end - s.now) / H)
      return { text: hrs < 1 ? 'Within the hour' : `In about ${Math.round(hrs)} hours`, short: `${Math.round(hrs)}h`, hours: hrs, reason: `${s.storm.plan.plows} plows are working. ${STREETS.find(x => x.id === q.street).name} is a ${r.kind} route, number ${r.order} of ${s.storm.plan.routes.length} in the plan.` }
    }
  }
  if (q.scheduledFor) {
    const days = (q.scheduledFor - s.now) / D
    return { text: days < 0.6 ? 'Today' : days < 1.6 ? 'Tomorrow' : `In about ${Math.round(days)} days`, short: days < 0.6 ? 'Today' : days < 1.6 ? 'Tmrw' : `${Math.round(days)}d`, hours: days * 24, reason: `A ${DEPARTMENTS[q.dept].short} crew is scheduled.` }
  }
  const list = deptQueue(s, q.dept)
  const pos = Math.max(0, list.findIndex(x => x.q.id === q.id))
  const crews = Math.max(1, s.crews.filter(c => c.dept === q.dept && c.status !== 'out').length)
  const cat = CATEGORIES[q.category]
  const days = Math.max(0.5, Math.ceil(((pos + 1) * cat.fix / crews) * 2) / 2)
  return { text: days <= 1 ? 'About 1 day' : `About ${days} days`, short: `${days}d`, hours: days * 24, reason: `Number ${pos + 1} in the ${DEPARTMENTS[q.dept].short} queue, ${crews} crews, a typical ${cat.label.toLowerCase()} repair takes ${cat.fix} day${cat.fix === 1 ? '' : 's'}.` }
}

function log(s, e) {
  const entry = { id: nextId(s, 'A'), at: s.now, actor: 'agent', ...e }
  s.audit.unshift(entry)
  if (entry.actor === 'agent') s.feed.unshift({ ...entry, id: 'F' + entry.id.slice(1) })
  s.feed = s.feed.slice(0, 80)
  return entry
}
function toast(s, text, kind = 'agent', link) { s.toasts.push({ id: nextId(s, 'T'), text, kind, link }) }
function tl(q, at, text, who = 'agent') { q.timeline.push({ at, text, who }) }
function notifyResidents(s, q, text) {
  const followers = new Set(s.reports.filter(r => q.reports.includes(r.id)).map(r => r.residentId))
  if (s.following.includes(q.id)) followers.add(s.priya)
  if (followers.has(s.priya)) {
    s.inbox = s.inbox || []
    s.inbox.unshift({ id: nextId(s, 'M'), at: s.now, reqId: q.id, text })
  }
  s.stats.notified += followers.size
  return followers.size
}
const snap = (s, ids) => ids.map(id => structuredClone(req(s, id))).filter(Boolean)

// ---------------- toasts ----------------
export function dismissToast(id) { update(s => { s.toasts = s.toasts.filter(t => t.id !== id) }, { persist: false }) }

// ---------------- resident ----------------
export function upvote(id) {
  update(s => {
    const q = req(s, id)
    if (s.upvoted.includes(id)) { s.upvoted = s.upvoted.filter(x => x !== id); q.upvotes-- }
    else { s.upvoted.push(id); q.upvotes++; if (!s.following.includes(id)) s.following.push(id) }
  })
}
export function follow(id) {
  update(s => { s.following = s.following.includes(id) ? s.following.filter(x => x !== id) : [...s.following, id] })
}

const STEP_MS = 650
export function submitReport({ category, street, t, text, channel = 'App', photo = true }) {
  const runId = `RUN-${Date.now()}`
  const [x, y] = pointOnStreet(street, t)
  const near = state.requests.filter(q => isOpen(q) && q.category === category && Math.hypot(q.x - x, q.y - y) < 40)
    .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0]
  const cat = CATEGORIES[category]
  const dist = near ? Math.round(Math.hypot(near.x - x, near.y - y) * 2.2) : null
  const steps = [
    { label: 'Read the report', detail: `"${text.slice(0, 80)}${text.length > 80 ? '…' : ''}"`, tool: '311 intake' },
    { label: 'Classify it', detail: `${cat.label} · confidence ${category === 'pothole' ? 96 : 91}%`, tool: null },
    { label: 'Find the location', detail: `${STREETS.find(z => z.id === street).name}, ${districtName(districtAt(x, y))}`, tool: 'GIS' },
    { label: 'Look for duplicates', detail: near ? `Match: ${near.id}, ${dist} m away, ${near.reports.length} earlier reports` : 'No open request within 90 m', tool: '311 intake' },
    { label: near ? 'Merge and add an upvote' : 'Open a new request', detail: near ? `Added to ${near.id}` : `Routed to ${DEPARTMENTS[cat.dept].name}`, tool: 'Work order system' },
    { label: 'Reply to the resident', detail: 'Status, time estimate and why', tool: 'SMS / email' },
  ]
  update(s => { s.running = { id: runId, steps: steps.map(st => ({ ...st, done: false })), text, category, street, startedAt: s.now, result: null } }, { persist: false })
  return new Promise(resolve => {
    let i = 0
    const tick = () => {
      if (!state.running || state.running.id !== runId) return resolve(null)
      update(s => { s.running.steps[i].done = true }, { persist: false })
      i++
      if (i < steps.length) return setTimeout(tick, STEP_MS)
      let result
      update(s => {
        const rid = `RPT-${++s.seq}`
        s.now += 2 * 60e3
        if (near) {
          const q = req(s, near.id)
          const before = snap(s, [q.id])
          s.reports.push({ id: rid, reqId: q.id, residentId: s.priya, residentName: 'Priya Shah', text, channel, at: s.now, photo })
          q.reports.push(rid)
          q.upvotes++
          if (!s.upvoted.includes(q.id)) s.upvoted.push(q.id)
          if (!s.following.includes(q.id)) s.following.push(q.id)
          tl(q, s.now, `Report ${rid} from Priya Shah merged (${dist} m away, photo match 0.93)`)
          const e = log(s, { kind: 'merge', text: `Merged a new report into ${q.id} (${cat.label}, ${q.address})`, why: `Same category, ${dist} m from the existing request, photo similarity 0.93. Upvote added for the resident.`, reqId: q.id, tool: '311 intake', before, createdReports: [rid] })
          s.stats.merged++
          const p = priorityOf(q, s)
          const eta = etaOf(q, s)
          result = { kind: 'merged', reqId: q.id, count: q.reports.length, eta, level: p.level, auditId: e.id }
          s.inbox = s.inbox || []
          s.inbox.unshift({ id: nextId(s, 'M'), at: s.now, reqId: q.id, text: `Thanks, Priya. ${q.reports.length - 1} neighbors already reported this pothole, so I added your report and your upvote to ${q.id}. It is High priority because it is on a school bus route. Estimated repair: ${eta.text.toLowerCase()}.` })
          toast(s, `Agent merged Priya's report into ${q.id}`, 'agent', `/ops/requests/${q.id}`)
        } else {
          const id = `REQ-${++s.seq}`
          const q = { id, category, dept: cat.dept, street, address: `${STREETS.find(z => z.id === street).name}`, x: Math.round(x), y: Math.round(y), district: districtAt(x, y), status: 'new', reports: [rid], upvotes: 1, createdAt: s.now, confidence: 0.91, flags: [], timeline: [], override: null }
          s.requests.push(q)
          s.reports.push({ id: rid, reqId: id, residentId: s.priya, residentName: 'Priya Shah', text, channel, at: s.now, photo })
          s.upvoted.push(id); s.following.push(id)
          tl(q, s.now, `Opened from report ${rid}; routed to ${DEPARTMENTS[cat.dept].name}`)
          const e = log(s, { kind: 'route', text: `Opened ${id} (${cat.label}) and routed it to ${DEPARTMENTS[cat.dept].short}`, why: `No open ${cat.label.toLowerCase()} request within 90 m. ${DEPARTMENTS[cat.dept].name} owns this category.`, reqId: id, tool: 'Work order system', created: [id], createdReports: [rid] })
          s.stats.routed++
          const eta = etaOf(q, s)
          result = { kind: 'new', reqId: id, eta, level: priorityOf(q, s).level, auditId: e.id }
          s.inbox = s.inbox || []
          s.inbox.unshift({ id: nextId(s, 'M'), at: s.now, reqId: id, text: `Thanks, Priya. I opened ${id} and sent it to ${DEPARTMENTS[cat.dept].name}. Estimated time: ${eta.text.toLowerCase()}. I will message you when it is scheduled.` })
          toast(s, `Agent opened ${id} from Priya's report`, 'agent', `/ops/requests/${id}`)
        }
        s.running.result = result
        s.running.finished = true
      })
      setTimeout(() => { if (state.running?.id === runId) clearRun() }, 14000)
      resolve(result)
    }
    setTimeout(tick, STEP_MS)
  })
}
export function clearRun() { update(s => { s.running = null }, { persist: false }) }

// ---------------- coordination manager ----------------
export function decideReview(id, choice, actor = 'Dana Reyes') {
  update(s => {
    const q = req(s, id)
    const before = snap(s, [id])
    if (q.reviewKind === 'route') {
      q.dept = choice
      q.status = 'new'
      tl(q, s.now, `${actor} routed this to ${DEPARTMENTS[choice].name}`, actor)
      log(s, { actor, kind: 'review', text: `${actor} routed ${id} to ${DEPARTMENTS[choice].short}`, why: choice === q.guess ? 'Confirmed the agent\'s suggestion.' : 'Chose the alternative to the agent\'s suggestion. The agent will learn from this correction.', reqId: id, before })
      const e = log(s, { kind: 'route', text: `Sent ${id} to ${DEPARTMENTS[choice].short} with the reviewer's note`, why: 'Routing confirmed by a person.', reqId: id, tool: 'Work order system' })
      notifyResidents(s, q, `Your report ${id} is with ${DEPARTMENTS[choice].name}. Estimated time: ${etaOf(q, s).text.toLowerCase()}.`)
    } else if (q.reviewKind === 'category') {
      q.category = choice
      q.dept = CATEGORIES[choice].dept
      q.status = 'new'
      tl(q, s.now, `${actor} confirmed category: ${CATEGORIES[choice].label}`, actor)
      log(s, { actor, kind: 'review', text: `${actor} set ${id} to ${CATEGORIES[choice].label}`, why: choice === q.guess ? 'Confirmed the agent\'s suggestion.' : 'Corrected the agent.', reqId: id, before })
      log(s, { kind: 'route', text: `Routed ${id} to ${DEPARTMENTS[q.dept].short}${choice === 'signal' ? ' as urgent' : ''}`, why: choice === 'signal' ? 'Traffic signal faults are a safety risk; Transportation is asked to respond within 1 day.' : 'Category confirmed by a person.', reqId: id, tool: 'Work order system' })
    } else if (q.reviewKind === 'merge') {
      if (choice === 'merge') {
        const target = req(s, q.guess)
        const beforeT = snap(s, [q.guess])
        target.reports.push(...q.reports)
        s.reports.forEach(r => { if (q.reports.includes(r.id)) r.reqId = target.id })
        target.upvotes += q.upvotes
        q.status = 'merged'; q.mergedInto = target.id
        tl(target, s.now, `${actor} merged ${id} into this request`, actor)
        log(s, { actor, kind: 'merge', text: `${actor} merged ${id} into ${target.id}`, why: 'Confirmed duplicate.', reqId: target.id, before: [...before, ...beforeT] })
      } else {
        q.status = 'new'
        tl(q, s.now, `${actor} kept this as a separate request`, actor)
        log(s, { actor, kind: 'review', text: `${actor} kept ${id} separate from ${q.guess}`, why: 'Different walls in the photos.', reqId: id, before })
      }
    }
    delete q.reviewKind
  })
}

export function setWeight(key, val) {
  update(s => { s.rules.weights[key] = val })
}
export function commitWeights(prevTop) {
  update(s => {
    const top = s.requests.filter(q => ['new', 'accepted'].includes(q.status)).map(q => ({ q, p: priorityOf(q, s) })).sort((a, b) => b.p.score - a.p.score).slice(0, 5).map(x => x.q.id)
    const moved = top.filter(id => !prevTop.includes(id))
    log(s, { actor: 'Dana Reyes', kind: 'rules', text: 'Dana Reyes changed the priority weights', why: Object.entries(s.rules.weights).map(([k, v]) => `${FACTOR_LABEL[k]} ${v}`).join(', ') })
    log(s, { kind: 'priority', text: `Re-ranked ${s.requests.filter(isOpen).length} open requests with the new weights`, why: moved.length ? `${moved.join(', ')} moved into the top 5.` : 'The top 5 did not change.', tool: null })
  })
}
export function setRule(key, val) {
  update(s => { s.rules[key] = val })
}

export function overridePriority(id, level, actor) {
  update(s => {
    const q = req(s, id)
    const before = snap(s, [id])
    q.override = level ? { level, by: actor, at: s.now } : null
    tl(q, s.now, level ? `${actor} set priority to ${level}` : `${actor} cleared the priority override`, actor)
    log(s, { actor, kind: 'override', text: level ? `${actor} overrode ${id} priority to ${level}` : `${actor} cleared the override on ${id}`, why: 'Manual override. The agent keeps the score for reference.', reqId: id, before })
  })
}

// ---------------- department ----------------
export function accept(id, actor = 'Marcus Lee') {
  update(s => {
    const q = req(s, id); const before = snap(s, [id])
    q.status = 'accepted'
    tl(q, s.now, `${actor} accepted`, actor)
    log(s, { actor, kind: 'accept', text: `${actor} accepted ${id}`, why: 'Accepted from the agent\'s queue.', reqId: id, before })
  })
}
export function schedule(id, crewId, whenDays, actor = 'Marcus Lee') {
  update(s => {
    const q = req(s, id); const before = snap(s, [id])
    const crew = s.crews.find(c => c.id === crewId)
    q.status = 'scheduled'; q.crew = crewId; q.scheduledFor = s.now + whenDays * D
    crew.status = 'assigned'; crew.on = id
    const day = whenDays < 0.6 ? 'today' : whenDays < 1.6 ? 'tomorrow' : `in ${whenDays} days`
    tl(q, s.now, `${actor} scheduled ${crew.name} for ${day}`, actor)
    log(s, { actor, kind: 'schedule', text: `${actor} scheduled ${crew.name} on ${id} for ${day}`, why: 'Scheduled by the department.', reqId: id, before })
    const n = notifyResidents(s, q, `Update on ${id} (${q.address}): a ${DEPARTMENTS[q.dept].short} crew is scheduled for ${day}. ${q.reports.length} reports and ${q.upvotes} upvotes helped move it up.`)
    log(s, { kind: 'notify', text: `Told ${n + q.reports.length - 1} residents that ${id} is scheduled for ${day}`, why: 'Residents who reported or follow a request get an update when it is scheduled.', reqId: id, tool: 'SMS / email' })
  })
}
export function start(id, actor = 'Marcus Lee') {
  update(s => {
    const q = req(s, id); const before = snap(s, [id])
    q.status = 'in_progress'
    tl(q, s.now, 'Crew on site', actor)
    log(s, { actor, kind: 'start', text: `${actor} marked ${id} in progress`, why: 'Crew on site.', reqId: id, before })
    notifyResidents(s, q, `A crew is working on ${id} (${q.address}) now.`)
  })
}
export function resolve(id, actor = 'Marcus Lee', note = '') {
  update(s => {
    const q = req(s, id); const before = snap(s, [id])
    q.status = 'resolved'; q.resolvedAt = s.now; q.afterPhoto = true; q.fixNote = note || 'Cut out the damaged area, filled and compacted hot asphalt.'
    const crew = s.crews.find(c => c.on === id); if (crew) { crew.status = 'available'; delete crew.on }
    tl(q, s.now, `Fixed, with an after photo: ${q.fixNote}`, actor)
    log(s, { actor, kind: 'resolve', text: `${actor} marked ${id} fixed with an after photo`, why: q.fixNote, reqId: id, before })
    const n = notifyResidents(s, q, `${id} at ${q.address} has been fixed. Here is the crew's photo. Does it look right to you? Tap "Yes, it's fixed" or "Still a problem".`)
    log(s, { kind: 'notify', text: `Sent the after photo to ${n + q.reports.length - 1} residents and asked them to confirm`, why: 'A request is only closed when a resident confirms, or after 3 days with no reply.', reqId: id, tool: 'SMS / email' })
  })
}
export function crewFix(id, actor = 'Streets crew 2') {
  update(s => {
    const q = req(s, id)
    if (q.scheduledFor && q.scheduledFor > s.now) s.now = q.scheduledFor
    s.now += 40 * 60e3
    q.status = 'in_progress'
    tl(q, s.now, `${actor} checked in on site`, actor)
    log(s, { actor, kind: 'start', text: `${actor} checked in at ${q.address}`, why: 'GPS check-in from the crew app.', reqId: id, tool: 'Work order system' })
    notifyResidents(s, q, `A crew is working on ${id} (${q.address}) right now.`)
    s.now += 55 * 60e3
  })
  resolve(id, actor)
}
export function confirmFix(id, ok) {
  update(s => {
    const q = req(s, id); const before = snap(s, [id])
    if (ok) {
      q.status = 'closed'; q.closedAt = s.now
      tl(q, s.now, 'Priya Shah confirmed it is fixed', 'Priya Shah')
      log(s, { actor: 'Priya Shah', kind: 'confirm', text: `Priya Shah confirmed ${id} is fixed`, why: 'Resident confirmation from the app.', reqId: id, before })
      log(s, { kind: 'resolve', text: `Closed ${id}: fixed and confirmed by a resident`, why: `Reported ${((q.closedAt - q.createdAt) / D).toFixed(1)} days ago; target was ${CATEGORIES[q.category].target} days.`, reqId: id, tool: 'Work order system' })
      s.inbox.unshift({ id: nextId(s, 'M'), at: s.now, reqId: id, text: `Thanks for confirming, Priya. ${id} is closed.` })
    } else {
      q.status = 'accepted'; q.flags.push('reopened'); delete q.scheduledFor
      tl(q, s.now, 'Priya Shah says it is still a problem', 'Priya Shah')
      log(s, { actor: 'Priya Shah', kind: 'reopen', text: `Priya Shah reported ${id} is still a problem`, why: 'Resident feedback from the app.', reqId: id, before })
      log(s, { kind: 'reopen', text: `Reopened ${id} and sent it back to ${DEPARTMENTS[q.dept].short} with the resident's note`, why: 'A resident disagreed with the fix, so the agent does not close it.', reqId: id, tool: 'Work order system' })
      s.inbox.unshift({ id: nextId(s, 'M'), at: s.now, reqId: id, text: `Sorry about that. I reopened ${id} and sent it back to the crew. You will get a new time soon.` })
    }
  })
}

// One shared description of where a request is in its life.
export const STAGES = [
  { key: 'reported', label: 'Reported', who: 'Resident' },
  { key: 'triaged', label: 'Sorted by agent', who: 'PCC agent' },
  { key: 'accepted', label: 'Accepted by department', who: 'Department' },
  { key: 'scheduled', label: 'Crew scheduled', who: 'Department' },
  { key: 'onsite', label: 'Crew on site', who: 'Crew' },
  { key: 'fixed', label: 'Fixed with photo', who: 'Crew' },
  { key: 'confirmed', label: 'Confirmed by resident', who: 'Resident' },
]
export const STAGE_IX = { review: 1, new: 2, accepted: 3, scheduled: 4, in_progress: 5, resolved: 6, closed: 7, merged: 1 }
export function reroute(id, dept, note, actor = 'Marcus Lee') {
  update(s => {
    const q = req(s, id); const before = snap(s, [id])
    q.dept = dept; q.status = 'new'
    tl(q, s.now, `${actor} rerouted to ${DEPARTMENTS[dept].name}: ${note}`, actor)
    log(s, { actor, kind: 'reroute', text: `${actor} rerouted ${id} to ${DEPARTMENTS[dept].short}`, why: note || 'No note.', reqId: id, before })
    log(s, { kind: 'learn', text: `Noted the correction on ${id} for future routing`, why: `Similar reports will lean toward ${DEPARTMENTS[dept].short}.`, reqId: id })
  })
}
export function unmerge(id, reportId, actor = 'Marcus Lee') {
  update(s => {
    const q = req(s, id); const before = snap(s, [id])
    const rpt = s.reports.find(r => r.id === reportId)
    const nid = `REQ-${++s.seq}`
    q.reports = q.reports.filter(r => r !== reportId); q.upvotes = Math.max(0, q.upvotes - 1)
    const nq = { ...structuredClone(q), id: nid, reports: [reportId], upvotes: 1, timeline: [], status: 'new', createdAt: rpt.at, scheduledFor: undefined, crew: undefined }
    rpt.reqId = nid
    s.requests.push(nq)
    tl(q, s.now, `${actor} split report ${reportId} into ${nid}`, actor)
    log(s, { actor, kind: 'unmerge', text: `${actor} split ${reportId} out of ${id} into ${nid}`, why: 'Not the same problem.', reqId: id, before, created: [nid] })
  })
}
export function editMessageAndSend(id, text, actor) {
  update(s => {
    const q = req(s, id)
    tl(q, s.now, `${actor} edited and sent the resident update`, actor)
    const n = notifyResidents(s, q, text)
    log(s, { actor, kind: 'notify', text: `${actor} sent an edited update to ${n + q.reports.length - 1} residents on ${id}`, why: 'Edited the agent\'s draft before sending.', reqId: id })
  })
}

// ---------------- snow ----------------
const ROUTE_HOURS = { emergency: 1.5, arterial: 2, residential: 2.5 }
const KIND_RANK = { emergency: 0, arterial: 1, residential: 2 }
function planRoutes(s, plows, startAt) {
  const counts = {}
  s.requests.filter(q => q.category === 'snow' && isOpen(q)).forEach(q => { counts[q.street] = (counts[q.street] || 0) + q.reports.length })
  const routes = STREETS.map(st => {
    const [mx, my] = pointOnStreet(st.id, 0.5)
    return { street: st.id, name: st.name, kind: st.kind, district: districtAt(mx, my), reports: counts[st.id] || 0, critical: ['washington', 'main'].includes(st.id) }
  })
  routes.sort((a, b) => KIND_RANK[a.kind] - KIND_RANK[b.kind] || (b.critical - a.critical) || (b.reports - a.reports) || ((EQUITY[b.district] ?? 0) - (EQUITY[a.district] ?? 0)))
  const free = Array.from({ length: plows }, (_, i) => ({ id: i, t: startAt }))
  const ids = s.plows.filter(p => p.status !== 'broken').map(p => p.id)
  routes.forEach((r, i) => {
    free.sort((a, b) => a.t - b.t)
    const p = free[0]
    r.order = i + 1; r.plow = ids[p.id] || `P-0${p.id + 1}`; r.start = p.t; r.end = p.t + ROUTE_HOURS[r.kind] * H
    p.t = r.end
  })
  return { plows, routes, createdAt: s.now }
}

export function triggerStorm() {
  update(s => {
    if (s.storm) return
    s.storm = { declaredAt: s.now, plan: null, history: [] }
    const streets = ['elm', 'cedar', 'maple', 'pine', 'southport-blvd', 'birch', 'hillcrest', 'first', 'oak']
    let total = 0
    streets.forEach((st, i) => {
      const [x, y] = pointOnStreet(st, 0.3 + (i % 3) * 0.2)
      const id = `REQ-${++s.seq}`
      const n = 2 + ((i * 5) % 7)
      const ids = []
      for (let k = 0; k < n; k++) {
        const rid = `RPT-${++s.seq}`; ids.push(rid)
        const res = s.residents[(i * 3 + k) % 30]
        s.reports.push({ id: rid, reqId: id, residentId: res.id, residentName: res.name, text: ['Street still not plowed, cars stuck', 'Snow piled up, buses can\'t get through', 'Side street completely blocked by snow'][k % 3], channel: k % 4 === 3 ? 'Phone (311)' : 'App', at: s.now - k * 3 * 60e3 })
      }
      total += n
      s.requests.push({ id, category: 'snow', dept: 'streets', street: st, address: STREETS.find(z => z.id === st).name, x: Math.round(x), y: Math.round(y), district: districtAt(x, y), status: 'accepted', reports: ids, upvotes: n + 3, createdAt: s.now - 40 * 60e3, confidence: 0.98, flags: ['storm'], timeline: [], override: null })
    })
    if (!s.following.includes(s.requests.find(q => q.street === 'elm' && q.category === 'snow').id)) s.following.push(s.requests.find(q => q.street === 'elm' && q.category === 'snow').id)
    s.storm.plan = planRoutes(s, s.plows.filter(p => p.status !== 'broken').length, s.now)
    log(s, { kind: 'storm', text: `Snow emergency: merged ${total} reports into ${streets.length} street requests`, why: 'Many residents reported the same streets within 40 minutes.', tool: '311 intake' })
    log(s, { kind: 'plan', text: `Built a plow plan: ${s.storm.plan.routes.length} routes for ${s.storm.plan.plows} plows`, why: 'Emergency routes and the hospital corridor first, then arterials, then residential streets with the most reports. Within the same class, districts that waited longest this year go first.', tool: 'Fleet tracker' })
    log(s, { kind: 'notify', text: `Posted plow times for every street on the public map`, why: 'Residents can search their street instead of calling 311.', tool: 'Public map' })
    s.stats.merged += total
    toast(s, 'Snow emergency: agent built a plow plan for 8 plows', 'agent', '/dept/snow')
  })
}

export function breakPlows(n = 2) {
  update(s => {
    if (!s.storm) return
    const ready = s.plows.filter(p => p.status !== 'broken')
    ready.slice(-n).forEach(p => { p.status = 'broken' })
    const plan = planRoutes(s, s.plows.filter(p => p.status !== 'broken').length, s.now)
    const diff = plan.routes.map(r => {
      const old = s.storm.plan.routes.find(o => o.street === r.street)
      return { street: r.street, name: r.name, kind: r.kind, district: r.district, before: old.end, after: r.end, delta: (r.end - old.end) / H }
    }).sort((a, b) => b.delta - a.delta)
    const pushed = diff.filter(d => d.delta > 0.25)
    const byDistrict = {}
    diff.forEach(d => { byDistrict[d.district] = Math.max(byDistrict[d.district] || 0, (d.after - s.now) / H) })
    s.proposals.unshift({
      id: nextId(s, 'PR'), kind: 'replan', status: 'pending', at: s.now,
      title: `Re-plan snow routes for ${plan.plows} working plows`,
      summary: `${n} plows (${ready.slice(-n).map(p => p.id).join(', ')}) reported broken. Emergency routes and the hospital corridor keep their times. ${pushed.length} streets move later, by ${Math.max(...pushed.map(d => d.delta)).toFixed(1)} hours at most.`,
      plan, diff, byDistrict,
      checks: [
        { ok: true, text: 'Hospital corridor and emergency routes unchanged' },
        { ok: true, text: `Every district gets its first residential street within ${Math.ceil(Math.max(...Object.values(byDistrict)) )} hours` },
        { ok: true, text: `Residents on ${pushed.length} streets will get a new time when you approve` },
      ],
    })
    ready.slice(-n).forEach(p => log(s, { actor: 'Fleet tracker', kind: 'fleet', text: `${p.id} reported a hydraulic fault`, why: 'Status from the fleet tracker.' }))
    log(s, { kind: 'proposal', text: `Proposed a new plow plan for ${plan.plows} plows; waiting for approval`, why: `Losing ${n} plows pushes ${pushed.length} streets later. Changing every resident's time is a big change, so it needs a person to approve.`, tool: 'Fleet tracker' })
    toast(s, `${n} plows down. The agent proposed a new route plan.`, 'warn', '/ops/proposals')
  })
}

export function decideProposal(id, ok, actor = 'Dana Reyes') {
  update(s => {
    const p = s.proposals.find(x => x.id === id)
    p.status = ok ? 'approved' : 'rejected'; p.decidedBy = actor; p.decidedAt = s.now
    if (ok && p.kind === 'replan') {
      s.storm.history.push(s.storm.plan)
      s.storm.plan = p.plan
      log(s, { actor, kind: 'approve', text: `${actor} approved the new plow plan`, why: p.summary })
      const pushed = p.diff.filter(d => d.delta > 0.25)
      let n = 0
      s.requests.filter(q => q.category === 'snow' && isOpen(q) && pushed.some(d => d.street === q.street)).forEach(q => {
        const d = pushed.find(d => d.street === q.street)
        n += notifyResidents(s, q, `Plow update for ${STREETS.find(z => z.id === q.street).name}: two plows broke down, so your street is now expected in about ${Math.round((d.after - s.now) / H)} hours (was ${Math.round((d.before - s.now) / H)}). Emergency routes come first.`) + q.reports.length
      })
      log(s, { kind: 'notify', text: `Sent new plow times to ${n} residents on ${pushed.length} streets`, why: 'Their estimated time changed by more than 15 minutes.', tool: 'SMS / email' })
      log(s, { kind: 'sync', text: 'Sent the new route order to all plow drivers', why: 'Drivers see the updated list in the fleet app.', tool: 'Fleet tracker' })
      toast(s, `Plan approved. ${n} residents got new plow times.`, 'ok')
    } else if (!ok) {
      log(s, { actor, kind: 'reject', text: `${actor} rejected the plow re-plan`, why: 'The current plan stays. The agent will not message residents.' })
    }
  })
}

export function repairPlows() {
  update(s => { s.plows.forEach(p => { p.status = 'ready' }) })
}

// ---------------- time ----------------
export function advance(hours = 12) {
  update(s => {
    s.now += hours * H
    s.requests.filter(q => ['new', 'accepted'].includes(q.status) && q.category !== 'snow').forEach(q => {
      const due = q.createdAt + CATEGORIES[q.category].target * D
      if (s.now > due && !q.flags.includes('nudged')) {
        q.flags.push('nudged'); q.nudgedAt = s.now
        tl(q, s.now, `Overdue: reminded ${DEPARTMENTS[q.dept].name}`)
        log(s, { kind: 'nudge', text: `Reminded ${DEPARTMENTS[q.dept].short} that ${q.id} is overdue`, why: `${CATEGORIES[q.category].label} target is ${CATEGORIES[q.category].target} days; it has been open ${((s.now - q.createdAt) / D).toFixed(1)}. First miss: a reminder to the department.`, reqId: q.id, tool: 'Work order system' })
        s.stats.nudges++
        if (q.id === 'REQ-1877') toast(s, `Agent reminded Parks: ${q.id} is overdue`, 'warn', `/ops/requests/${q.id}`)
      } else if (q.flags.includes('nudged') && !q.flags.includes('escalated') && s.now - q.nudgedAt >= 12 * H) {
        q.flags.push('escalated')
        tl(q, s.now, 'Escalated to the city coordination manager')
        log(s, { kind: 'escalate', text: `Escalated ${q.id} to Dana Reyes: still not scheduled after a reminder`, why: 'Second miss. The rule is: remind the department once, then escalate.', reqId: q.id })
        if (q.id === 'REQ-1877') toast(s, `Agent escalated ${q.id} to the city manager`, 'warn', '/ops/review')
      }
    })
  })
}

// ---------------- undo ----------------
export function undo(auditId, actor = 'Dana Reyes') {
  update(s => {
    const e = s.audit.find(a => a.id === auditId)
    if (!e || e.undone || !e.before) return
    e.before.forEach(b => { const i = s.requests.findIndex(q => q.id === b.id); if (i >= 0) s.requests[i] = b })
    ;(e.created || []).forEach(id => { s.requests = s.requests.filter(q => q.id !== id) })
    ;(e.createdReports || []).forEach(id => { s.reports = s.reports.filter(r => r.id !== id) })
    e.before.forEach(b => b.reports.forEach(rid => { const r = s.reports.find(x => x.id === rid); if (r) r.reqId = b.id }))
    e.undone = true
    const fe = s.feed.find(f => f.id === 'F' + e.id.slice(1)); if (fe) fe.undone = true
    log(s, { actor, kind: 'undo', text: `${actor} undid: ${e.text}`, why: 'Restored the state before that action.', reqId: e.reqId })
    toast(s, 'Undone. The previous state is restored.', 'ok')
  })
}

export function reset() {
  try { localStorage.removeItem(KEY) } catch {}
  state = makeSeed()
  emit()
}
export function setGuided(g) { update(s => { s.guided = g }, { persist: false }) }
