import { STREETS, CATEGORIES, pointOnStreet, districtAt } from './city.js'

export const START = Date.parse('2026-12-07T09:12:00-05:00')
const H = 3600e3, D = 24 * H

function rng(seed) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ['Priya', 'Marcus', 'Elena', 'Tom', 'Aisha', 'Daniel', 'Grace', 'Luis', 'Nora', 'Sam', 'Wei', 'Fatima', 'Owen', 'Hannah', 'Jamal', 'Rosa', 'Ken', 'Maya', 'Ibrahim', 'Claire', 'Diego', 'Lena', 'Victor', 'Amara', 'Ben', 'Yuki', 'Tariq', 'Zoe', 'Paul', 'Ines', 'Kofi', 'Mei', 'Arjun', 'Sofia']
const LAST = ['Shah', 'Okafor', 'Novak', 'Brennan', 'Haddad', 'Kim', 'Alvarez', 'Murphy', 'Chen', 'Patel', 'Silva', 'Becker', 'Nguyen', 'Rossi', 'Adeyemi', 'Lund', 'Morales', 'Weber', 'Costa', 'Doyle']

export const TEXTS = {
  pothole: ['Deep pothole in the right lane, cars swerving around it', 'Pothole getting bigger after the rain', 'Big hole near the crosswalk, hit it on my bike'],
  sidewalk: ['Sidewalk slab lifted, tripping hazard', 'Cracked sidewalk near the bus stop', 'Uneven pavement, hard with a wheelchair'],
  sign: ['Stop sign knocked over at the corner', 'Street sign bent and facing the wrong way', 'Speed limit sign missing since last week'],
  signal: ['Traffic light stuck on red', 'Signal dark at the intersection, dangerous'],
  streetlight: ['Streetlight out, very dark at night', 'Light keeps flickering on and off', 'Two lights out on this block'],
  vehicle: ['Car with flat tires parked here for three weeks', 'Abandoned van, windows broken', 'Same car has not moved in a month, no plates'],
  leak: ['Water bubbling up from the street', 'Water running down the gutter for hours'],
  flood: ['Storm drain blocked, water pooling across the road', 'Street floods every time it rains'],
  sewer: ['Strong sewer smell from the manhole', 'Sewage coming up in the basement after rain'],
  trash: ['Trash not picked up on Monday', 'Recycling skipped again this week', 'Bags left out since last week'],
  dumping: ['Someone dumped a mattress and old furniture in the alley', 'Pile of construction debris left on the sidewalk', 'Tires dumped behind the playground'],
  graffiti: ['Graffiti on the underpass wall', 'Tags sprayed on the bus shelter', 'New graffiti on the park sign'],
  tree: ['Large branch down across the sidewalk', 'Tree fell after the wind, blocking part of the road', 'Branch hanging over the bike lane'],
  park: ['Playground swing chain broken', 'Bench in the park is smashed', 'Water fountain at the park not working'],
  building: ['Vacant house with doors open, kids going inside', 'Building facade cracking, bricks falling', 'Boarded house, people sleeping inside in the cold'],
  heat: ['No heat in our apartment for two days, landlord not answering', 'Radiators cold, baby at home'],
  noise: ['Loud construction before 7 AM every day', 'Party music until 3 AM on weeknights'],
  rodent: ['Rats running around the dumpsters behind the restaurant', 'Seeing rats in the alley every evening'],
  snow: ['Street still not plowed, cars stuck', 'Snow piled up, buses cannot get through', 'Side street completely blocked by snow'],
}

export function makeSeed() {
  const r = rng(20261207)
  const pick = a => a[Math.floor(r() * a.length)]
  const now = START
  const requests = []
  const reports = []
  let reqN = 1900, rptN = 8800
  const HERO_IDS = new Set(['REQ-1877', 'REQ-1964', 'REQ-2033', 'REQ-2041', 'REQ-2050', 'REQ-2056', 'REQ-2058', 'REQ-2060', 'REQ-2062', 'REQ-2064', 'REQ-2066'])
  const nextReq = () => { let id; do { id = `REQ-${reqN++}` } while (HERO_IDS.has(id)); return id }
  const residents = []
  for (let i = 0; i < 34; i++) residents.push({ id: `res-${i}`, name: `${FIRST[i]} ${LAST[(i * 7) % LAST.length]}` })

  const catWeights = [['pothole', 18], ['streetlight', 12], ['trash', 11], ['graffiti', 8], ['sidewalk', 7], ['dumping', 7], ['tree', 6], ['flood', 6], ['vehicle', 5], ['rodent', 4], ['noise', 5], ['park', 4], ['sign', 4], ['building', 3], ['heat', 2], ['sewer', 2], ['leak', 2], ['signal', 2]]
  const totalW = catWeights.reduce((s, c) => s + c[1], 0)
  const pickCat = () => { let x = r() * totalW; for (const [k, w] of catWeights) { if ((x -= w) < 0) return k } return 'pothole' }
  const statuses = ['new', 'new', 'accepted', 'scheduled', 'scheduled', 'in_progress', 'accepted']

  for (let i = 0; i < 150; i++) {
    const cat = pickCat()
    const street = pick(STREETS)
    const [x, y] = pointOnStreet(street.id, 0.08 + r() * 0.84)
    const nReports = r() < 0.55 ? 1 : 1 + Math.floor(r() * r() * 9)
    const age = Math.min((0.1 + r() * r() * 11) * D, CATEGORIES[cat].target * (r() < 0.2 ? 1.8 : 0.8) * D)
    const id = nextReq()
    const ids = []
    for (let k = 0; k < nReports; k++) {
      const res = pick(residents)
      const rid = `RPT-${rptN++}`
      ids.push(rid)
      reports.push({ id: rid, reqId: id, residentId: res.id, residentName: res.name, text: pick(TEXTS[cat]), channel: r() < 0.7 ? 'App' : r() < 0.7 ? 'Phone (311)' : r() < 0.6 ? 'Web' : 'Paper mail', at: now - age + k * (age / (nReports + 1)) })
    }
    const num = 100 + Math.floor(r() * 1800)
    requests.push({
      id, category: cat, dept: CATEGORIES[cat].dept, street: street.id,
      address: `${num - (num % 2)} ${street.name}`, x: Math.round(x), y: Math.round(y), district: districtAt(x, y),
      status: pick(statuses), reports: ids, upvotes: Math.floor(nReports * (1 + r() * 3) + r() * 4), downvotes: r() < 0.15 ? 1 + Math.floor(r() * 3) : 0,
      createdAt: now - age, confidence: 0.84 + r() * 0.15, flags: [], timeline: [], override: null,
    })
    // work that is already late is booked: the AI reminded the department days ago and they scheduled it
    const last = requests[requests.length - 1]
    if (age > CATEGORIES[cat].target * D && ['new', 'accepted'].includes(last.status)) { last.status = 'scheduled'; last.scheduledFor = now + (0.3 + r() * 1.5) * D }
  }

  // closed history, so the health numbers have something to stand on
  for (let i = 0; i < 40; i++) {
    const cat = pickCat()
    const street = pick(STREETS)
    const [x, y] = pointOnStreet(street.id, 0.1 + r() * 0.8)
    const id = nextReq()
    const rid = `RPT-${rptN++}`
    const res = pick(residents)
    const age = (2 + r() * 12) * D
    reports.push({ id: rid, reqId: id, residentId: res.id, residentName: res.name, text: pick(TEXTS[cat]), channel: 'App', at: now - age })
    requests.push({ id, category: cat, dept: CATEGORIES[cat].dept, street: street.id, address: `${200 + Math.floor(r() * 1500)} ${street.name}`, x: Math.round(x), y: Math.round(y), district: districtAt(x, y), status: 'closed', reports: [rid], upvotes: 1 + Math.floor(r() * 6), downvotes: 0, createdAt: now - age, closedAt: now - age + CATEGORIES[cat].target * (0.4 + r() * 0.8) * D, confidence: 0.93, flags: [], timeline: [], override: null })
  }

  const hero = (o) => {
    const id = o.id
    const ids = []
    ;(o.reps || []).forEach((t, k) => {
      const res = residents[(k * 5 + id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % residents.length]
      const rid = `RPT-${rptN++}`
      ids.push(rid)
      reports.push({ id: rid, reqId: id, residentId: res.id, residentName: res.name, text: t, channel: k % 3 === 2 ? 'Phone (311)' : 'App', at: o.createdAt + k * 5 * H })
    })
    const [x, y] = pointOnStreet(o.street, o.t)
    const req = { flags: [], timeline: [], override: null, confidence: 0.93, upvotes: 0, downvotes: 0, ...o, x: Math.round(x), y: Math.round(y), district: districtAt(x, y), reports: ids, dept: CATEGORIES[o.category].dept }
    delete req.reps; delete req.t
    requests.push(req)
    return req
  }

  hero({ id: 'REQ-2041', category: 'pothole', street: 'elm', t: 0.47, address: '412 Elm St', status: 'new', upvotes: 22, createdAt: now - 4 * D - 3 * H,
    nearby: 'Riverside Elementary (school bus route)', confidence: 0.97,
    reps: ['Deep pothole in front of 412 Elm, right by the school crossing', 'Pothole on Elm near the school, kids walk around it into the road', 'Huge hole outside 412 Elm St', 'Elm St pothole getting worse, water inside it now', 'Big pothole Elm St / school', 'Same pothole as last week on Elm, still there'] })
  hero({ id: 'REQ-1877', category: 'tree', street: 'cedar', t: 0.55, address: '188 Cedar Ln', status: 'accepted', upvotes: 9, createdAt: now - 1.6 * D,
    reps: ['Large branch down across the sidewalk on Cedar', 'Tree limb blocking half the sidewalk, people walking in the street'] })
  hero({ id: 'REQ-2050', category: 'signal', street: 'washington', t: 0.16, address: 'Washington Blvd & Northgate Ave', status: 'in_progress', upvotes: 31, createdAt: now - 5 * H, nearby: 'Hospital corridor',
    reps: ['Traffic signal dark at Washington and Northgate', 'Signal out by the hospital, police directing traffic', 'Lights not working at Washington/Northgate'] })
  hero({ id: 'REQ-2062', category: 'leak', street: 'harbor', t: 0.76, address: '930 Harbor Way', status: 'scheduled', upvotes: 14, createdAt: now - 20 * H, scheduledFor: now + 4 * H, crew: 'C-W1',
    reps: ['Water bubbling up from the street on Harbor Way', 'Gutter running with clean water for hours'] })
  hero({ id: 'REQ-2064', category: 'heat', street: 'maple', t: 0.6, address: '1210 Maple St, Apt 3B', status: 'new', upvotes: 4, createdAt: now - 9 * H,
    reps: ['No heat in our apartment for two days, landlord not answering', 'Same building, no heat on the 2nd floor either'] })
  hero({ id: 'REQ-2066', category: 'dumping', street: 'birch', t: 0.5, address: 'Alley behind 40 Birch Ct', status: 'new', upvotes: 7, createdAt: now - 26 * H,
    reps: ['Someone dumped a mattress and old furniture in the alley', 'Mattress and couch still in the alley, blocking the garage'] })

  // the agent was unsure about these, so a person decides
  const review = [
    hero({ id: 'REQ-2056', category: 'flood', street: 'cedar', t: 0.2, address: '64 Cedar Ln', status: 'review', upvotes: 3, createdAt: now - 7 * H, confidence: 0.62,
      reps: ['Big branch fell into the storm drain, water backing up onto the road'] }),
    hero({ id: 'REQ-2058', category: 'streetlight', street: 'college', t: 0.3, address: 'College Ave & Main St', status: 'review', upvotes: 5, createdAt: now - 3 * H, confidence: 0.71,
      reps: ['The light at College and Main keeps flashing, not sure if it is the street light or the signal'] }),
    hero({ id: 'REQ-2060', category: 'graffiti', street: 'harbor', t: 0.33, address: '340 Harbor Way', status: 'review', upvotes: 2, createdAt: now - 2 * H, confidence: 0.74,
      reps: ['Spray paint on the wall under the Harbor Way overpass'] }),
  ]
  review[0].reviewKind = 'route'; review[0].guess = 'water'; review[0].alt = 'parks'
  review[0].reviewNote = 'The report mentions a fallen branch (Parks) and a blocked drain (Water & Sewer). Both teams could own it.'
  review[1].reviewKind = 'category'; review[1].guess = 'streetlight'; review[1].alt = 'signal'
  review[1].reviewNote = 'A flashing light at an intersection could be a streetlight or a traffic signal. A signal fault would be urgent.'
  review[2].reviewKind = 'merge'; review[2].guess = 'REQ-2033'; review[2].alt = 'new'
  review[2].reviewNote = 'It looks like REQ-2033 (graffiti 60 m away), but the photos show different walls.'
  const g = requests.find(q => q.category === 'graffiti' && q.status !== 'closed' && q.status !== 'review')
  if (g) { const old = g.id; g.id = 'REQ-2033'; g.street = 'harbor'; g.address = '372 Harbor Way'; const [x, y] = pointOnStreet('harbor', 0.36); g.x = Math.round(x); g.y = Math.round(y); g.district = districtAt(x, y); reports.forEach(p => { if (p.reqId === old) p.reqId = 'REQ-2033' }) }

  const priya = { id: 'res-priya', name: 'Priya Shah', district: 'riverside', address: '418 Elm St' }
  const priyaOld = hero({ id: 'REQ-1964', category: 'streetlight', street: 'elm', t: 0.52, address: '450 Elm St', status: 'closed', upvotes: 6, createdAt: now - 12 * D, reps: ['Streetlight out in front of 450 Elm'] })
  const pr = reports.find(p => p.reqId === 'REQ-1964'); pr.residentId = priya.id; pr.residentName = priya.name
  priyaOld.closedAt = now - 9 * D

  const crews = [
    ['C-PW1', 'publicworks', 'Public Works crew 1', 'R. Alvarez', 'assigned'], ['C-PW2', 'publicworks', 'Public Works crew 2', 'T. Brennan', 'available'],
    ['C-PW3', 'publicworks', 'Public Works crew 3', 'K. Osei', 'assigned'], ['C-PW4', 'publicworks', 'Public Works crew 4', 'M. Duarte', 'available'],
    ['C-T1', 'transport', 'Signals team', 'J. Park', 'assigned', 'REQ-2050'], ['C-T2', 'transport', 'Lighting and signs team', 'S. Iyer', 'available'],
    ['C-W1', 'water', 'Water crew 1', 'A. Nakamura', 'assigned', 'REQ-2062'], ['C-W2', 'water', 'Sewer crew', 'B. Kowal', 'available'],
    ['C-S1', 'sanitation', 'Bulk pickup truck', 'E. Fischer', 'available'], ['C-S2', 'sanitation', 'Graffiti removal', 'H. Lindqvist', 'assigned'],
    ['C-P1', 'parks', 'Forestry crew', 'L. Grant', 'assigned'], ['C-P2', 'parks', 'Parks maintenance', 'D. Moreau', 'available'],
    ['C-C1', 'code', 'Housing inspector', 'N. Farah', 'available'], ['C-C2', 'code', 'Building inspector', 'O. Lindgren', 'assigned'],
  ].map(([id, dept, name, lead, status, on]) => ({ id, dept, name, lead, status, on }))

  const plows = Array.from({ length: 8 }, (_, i) => ({ id: `P-0${i + 1}`, driver: ['G. Ruiz', 'F. Byrne', 'N. Petrov', 'O. Mensah', 'C. Holt', 'V. Sato', 'Y. Amari', 'W. Dunn'][i], status: 'ready' }))

  const feed = [
    ['08:58', 'merge', 'Merged 3 reports into REQ-2050 (traffic signal out)', 'Same intersection, reported within 40 minutes, matching descriptions.', 'REQ-2050', '311 intake'],
    ['08:47', 'route', 'Sent REQ-2064 (no heat in rental) to Code Enforcement as urgent', 'No heat in December is a health risk. Target: 1 day.', 'REQ-2064', 'Work order system'],
    ['08:41', 'route', 'Sent REQ-2062 (water main leak) to Water & Sewer', 'Water & Sewer owns mains. Crew 1 has capacity today.', 'REQ-2062', 'Work order system'],
    ['08:40', 'notify', 'Told 2 residents on Harbor Way a crew is coming today', 'Everyone who reported or follows a request gets an update when it changes.', 'REQ-2062', 'SMS / email'],
    ['08:22', 'review', 'Asked Dana to decide REQ-2056: Parks or Water & Sewer?', 'Confidence 62% is below the 80% threshold.', 'REQ-2056', null],
    ['08:05', 'merge', 'Merged a new report into REQ-2041 (pothole, 412 Elm St)', 'Within 12 m of the existing request, same type, photo match 0.91.', 'REQ-2041', '311 intake'],
    ['07:48', 'priority', 'Raised REQ-2041 to High priority', 'School bus route, 22 upvotes, 4 days open.', 'REQ-2041', null],
    ['07:30', 'nudge', 'Reminded Sanitation about REQ-1931 (due tomorrow)', 'Due within 24 hours and not yet scheduled.', null, 'Work order system'],
    ['07:02', 'sync', 'Synced 41 work orders and 14 crew statuses', 'Scheduled sync with the work order system and fleet tracker.', null, 'Fleet tracker'],
  ].map(([t, kind, text, why, reqId, tool], i) => ({ id: `F-${100 + i}`, at: Date.parse(`2026-12-07T${t}:00-05:00`), kind, text, why, reqId, tool, actor: 'agent' }))

  return {
    version: 7, now, requests, reports, residents: [...residents, priya], priya: priya.id, crews, plows,
    feed, audit: feed.map(f => ({ ...f, id: 'A' + f.id.slice(1) })), proposals: [], toasts: [],
    rules: { weights: { safety: 35, community: 15, age: 20, resources: 15, equity: 15 }, threshold: 80, equityGap: 1.0, autoMerge: true, autoNotify: true },
    storm: null, stats: { merged: 38, routed: 52, nudges: 6, notified: 71 },
    following: ['REQ-2041'], upvoted: [], downvoted: [], seq: 3000, running: null, guided: null,
    inbox: [{ id: 'M-1', at: now - 9 * D, reqId: 'REQ-1964', text: 'Your streetlight report at 450 Elm St is closed. Thanks for helping.' }],
  }
}
