import { STREETS, CATEGORIES, DEPARTMENTS, pointOnStreet, districtAt } from './city.js'

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

const FIRST = ['Priya', 'Marcus', 'Elena', 'Tom', 'Aisha', 'Daniel', 'Grace', 'Luis', 'Nora', 'Sam', 'Wei', 'Fatima', 'Owen', 'Hannah', 'Jamal', 'Rosa', 'Ken', 'Maya', 'Ibrahim', 'Claire', 'Diego', 'Lena', 'Victor', 'Amara', 'Ben', 'Yuki', 'Tariq', 'Zoe', 'Paul', 'Ines']
const LAST = ['Shah', 'Okafor', 'Novak', 'Brennan', 'Haddad', 'Kim', 'Alvarez', 'Murphy', 'Chen', 'Patel', 'Silva', 'Becker', 'Nguyen', 'Rossi', 'Adeyemi', 'Lund', 'Morales', 'Weber', 'Costa', 'Doyle']

const TEXTS = {
  pothole: ['Deep pothole in the right lane, cars swerving around it', 'Pothole getting bigger after the rain', 'Big hole near the crosswalk, hit it on my bike', 'Road surface broken, about a foot wide'],
  snow: ['Street still not plowed, cars stuck', 'Snow piled up, buses can\'t get through', 'Side street completely blocked by snow'],
  trash: ['Trash not picked up on Monday', 'Recycling bins skipped again this week', 'Bags left out since last week'],
  streetlight: ['Streetlight out, very dark at night', 'Light keeps flickering on and off', 'Two lights out on this block'],
  signal: ['Traffic light stuck on red', 'Signal dark at the intersection, dangerous'],
  tree: ['Large branch down across the sidewalk', 'Tree fell after the wind, blocking part of the road', 'Branch hanging over the bike lane'],
  drain: ['Storm drain blocked, water pooling', 'Drain covered in leaves, flooding when it rains'],
  leak: ['Water bubbling up from the street', 'Water running down the gutter for hours'],
  sidewalk: ['Sidewalk slab lifted, tripping hazard', 'Cracked sidewalk near the bus stop', 'Uneven pavement, hard with a wheelchair'],
  graffiti: ['Graffiti on the underpass wall', 'Tags sprayed on the bus shelter', 'New graffiti on the park sign'],
}

const STREET_FOR = {
  snow: ['hillcrest', 'elm', 'cedar', 'maple', 'pine', 'southport-blvd', 'birch', 'first'],
}

export function makeSeed() {
  const r = rng(20261207)
  const pick = a => a[Math.floor(r() * a.length)]
  const now = START
  const requests = []
  const reports = []
  let reqN = 1900, rptN = 8800
  const residents = []
  for (let i = 0; i < 34; i++) residents.push({ id: `res-${i}`, name: `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}` })

  const catWeights = [['pothole', 22], ['streetlight', 16], ['trash', 12], ['tree', 8], ['drain', 9], ['sidewalk', 10], ['graffiti', 11], ['signal', 3], ['leak', 3]]
  const totalW = catWeights.reduce((s, c) => s + c[1], 0)
  const pickCat = () => { let x = r() * totalW; for (const [k, w] of catWeights) { if ((x -= w) < 0) return k } return 'pothole' }

  const statuses = ['new', 'new', 'accepted', 'scheduled', 'scheduled', 'in_progress', 'accepted']

  for (let i = 0; i < 132; i++) {
    const cat = pickCat()
    const street = pick(STREETS.filter(s => cat !== 'snow'))
    const [x, y] = pointOnStreet(street.id, 0.08 + r() * 0.84)
    const nReports = r() < 0.55 ? 1 : 1 + Math.floor(r() * r() * 9)
    const age = Math.min((0.1 + r() * r() * 11) * D, CATEGORIES[cat].target * 0.7 * D)
    const id = `REQ-${reqN++}`
    const ids = []
    for (let k = 0; k < nReports; k++) {
      const res = pick(residents)
      const rid = `RPT-${rptN++}`
      ids.push(rid)
      reports.push({ id: rid, reqId: id, residentId: res.id, residentName: res.name, text: pick(TEXTS[cat]), channel: r() < 0.72 ? 'App' : r() < 0.7 ? 'Phone (311)' : r() < 0.6 ? 'Web' : 'Paper mail', at: now - age + k * (age / (nReports + 1)) })
    }
    const num = 100 + Math.floor(r() * 1800)
    requests.push({
      id, category: cat, dept: CATEGORIES[cat].dept, street: street.id,
      address: `${num - (num % 2)} ${street.name}`, x: Math.round(x), y: Math.round(y), district: districtAt(x, y),
      status: pick(statuses), reports: ids, upvotes: Math.floor(nReports * (1 + r() * 3) + r() * 4),
      createdAt: now - age, confidence: 0.84 + r() * 0.15, flags: [], timeline: [], override: null,
    })
  }

  // ---- hand-authored requests the demo story uses ----
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
    const req = { flags: [], timeline: [], override: null, confidence: 0.93, upvotes: 0, ...o, x: Math.round(x), y: Math.round(y), district: districtAt(x, y), reports: ids, dept: CATEGORIES[o.category].dept }
    delete req.reps; delete req.t
    requests.push(req)
    return req
  }

  hero({ id: 'REQ-2041', category: 'pothole', street: 'elm', t: 0.47, address: '412 Elm St', status: 'new', upvotes: 22, createdAt: now - 4 * D - 3 * H,
    nearby: 'Riverside Elementary (school bus route)', confidence: 0.97,
    reps: ['Deep pothole in front of 412 Elm, right by the school crossing', 'Pothole on Elm near the school, kids walk around it into the road', 'Huge hole outside 412 Elm St', 'Elm St pothole getting worse, water inside it now', 'Big pothole Elm St / school', 'Same pothole as last week on Elm, still there'] })
  hero({ id: 'REQ-1877', category: 'tree', street: 'cedar', t: 0.55, address: '188 Cedar Ln', status: 'accepted', upvotes: 9, createdAt: now - 2.6 * D,
    reps: ['Large branch down across the sidewalk on Cedar', 'Tree limb blocking half the sidewalk, people walking in the street'] })
  hero({ id: 'REQ-2050', category: 'signal', street: 'washington', t: 0.16, address: 'Washington Blvd & Northgate Ave', status: 'in_progress', upvotes: 31, createdAt: now - 5 * H, nearby: 'Hospital corridor',
    reps: ['Traffic signal dark at Washington and Northgate', 'Signal out by the hospital, police directing traffic', 'Lights not working at Washington/Northgate'] })
  hero({ id: 'REQ-2062', category: 'leak', street: 'harbor', t: 0.76, address: '930 Harbor Way', status: 'scheduled', upvotes: 14, createdAt: now - 20 * H,
    reps: ['Water bubbling up from the street on Harbor Way', 'Gutter running with clean water for hours'] })

  // ---- items the agent was unsure about: these wait for a person ----
  const review = [
    hero({ id: 'REQ-2056', category: 'drain', street: 'cedar', t: 0.2, address: '64 Cedar Ln', status: 'review', upvotes: 3, createdAt: now - 7 * H, confidence: 0.62,
      reps: ['Big branch fell into the storm drain, water backing up onto the road'] }),
    hero({ id: 'REQ-2058', category: 'streetlight', street: 'college', t: 0.3, address: 'College Ave & Main St', status: 'review', upvotes: 5, createdAt: now - 3 * H, confidence: 0.71,
      reps: ['The light at College and Main keeps flashing, not sure if it is the street light or the signal'] }),
    hero({ id: 'REQ-2060', category: 'graffiti', street: 'harbor', t: 0.33, address: '340 Harbor Way', status: 'review', upvotes: 2, createdAt: now - 2 * H, confidence: 0.74,
      reps: ['Spray paint on the wall under the Harbor Way overpass'] }),
  ]
  review[0].reviewKind = 'route'; review[0].guess = 'water'; review[0].alt = 'parks'
  review[0].reviewNote = 'Report mentions both a fallen branch (Parks) and a blocked drain (Water).'
  review[1].reviewKind = 'category'; review[1].guess = 'streetlight'; review[1].alt = 'signal'
  review[1].reviewNote = 'A flashing light at an intersection could be a streetlight or a traffic signal fault. A signal fault would be urgent.'
  review[2].reviewKind = 'merge'; review[2].guess = 'REQ-2033'; review[2].alt = 'new'
  review[2].reviewNote = 'Looks like REQ-2033 (graffiti 60 m away), but the photos show different walls.'
  // make sure REQ-2033 exists as the merge candidate
  const g = requests.find(q => q.category === 'graffiti' && q.street === 'harbor')
  if (g) { g.id = 'REQ-2033'; reports.forEach(p => { if (g.reports.includes(p.id)) p.reqId = 'REQ-2033' }) }
  else hero({ id: 'REQ-2033', category: 'graffiti', street: 'harbor', t: 0.36, address: '372 Harbor Way', status: 'accepted', upvotes: 4, createdAt: now - 3 * D, reps: ['Graffiti on the overpass on Harbor Way'] })

  // resident persona and her history
  const priya = { id: 'res-priya', name: 'Priya Shah', district: 'riverside', address: '418 Elm St' }
  const priyaOld = hero({ id: 'REQ-1964', category: 'streetlight', street: 'elm', t: 0.52, address: '450 Elm St', status: 'resolved', upvotes: 6, createdAt: now - 12 * D, reps: ['Streetlight out in front of 450 Elm'] })
  reports.find(p => p.reqId === 'REQ-1964').residentId = priya.id
  reports.find(p => p.reqId === 'REQ-1964').residentName = priya.name
  priyaOld.resolvedAt = now - 9 * D

  const crews = [
    { id: 'C-S1', dept: 'streets', name: 'Streets crew 1', lead: 'R. Alvarez', status: 'assigned', on: 'REQ-2041' },
    { id: 'C-S2', dept: 'streets', name: 'Streets crew 2', lead: 'T. Brennan', status: 'available' },
    { id: 'C-S3', dept: 'streets', name: 'Streets crew 3', lead: 'K. Osei', status: 'assigned' },
    { id: 'C-S4', dept: 'streets', name: 'Streets crew 4', lead: 'M. Duarte', status: 'available' },
    { id: 'C-T1', dept: 'transport', name: 'Signals team', lead: 'J. Park', status: 'assigned', on: 'REQ-2050' },
    { id: 'C-T2', dept: 'transport', name: 'Lighting team', lead: 'S. Iyer', status: 'available' },
    { id: 'C-P1', dept: 'parks', name: 'Forestry crew', lead: 'L. Grant', status: 'assigned' },
    { id: 'C-P2', dept: 'parks', name: 'Parks crew', lead: 'D. Moreau', status: 'available' },
    { id: 'C-W1', dept: 'water', name: 'Water crew 1', lead: 'A. Nakamura', status: 'assigned', on: 'REQ-2062' },
    { id: 'C-W2', dept: 'water', name: 'Water crew 2', lead: 'B. Kowal', status: 'available' },
    { id: 'C-PW1', dept: 'publicworks', name: 'Public Works crew', lead: 'E. Fischer', status: 'available' },
    { id: 'C-PW2', dept: 'publicworks', name: 'Paint & signs crew', lead: 'H. Lindqvist', status: 'assigned' },
  ].map(c => ({ ...c, status: c.on === 'REQ-2041' ? 'available' : c.status, on: c.on === 'REQ-2041' ? undefined : c.on }))

  const plows = Array.from({ length: 8 }, (_, i) => ({ id: `P-0${i + 1}`, driver: ['G. Ruiz', 'F. Byrne', 'N. Petrov', 'O. Mensah', 'C. Holt', 'V. Sato', 'Y. Amari', 'W. Dunn'][i], status: 'ready' }))

  const feed = [
    ['08:58', 'merge', 'Merged 3 reports into REQ-2050 (Traffic signal out)', 'Same intersection, reported within 40 minutes, matching descriptions.', 'REQ-2050', '311 intake'],
    ['08:41', 'route', 'Routed REQ-2062 Water main leak to Water', 'Category water leak; Water owns mains. Crew 1 has capacity today.', 'REQ-2062', 'Work order system'],
    ['08:40', 'notify', 'Told 2 residents on Harbor Way that a crew is scheduled for today', 'Residents who report or follow a request get an update when its status changes.', 'REQ-2062', 'SMS / email'],
    ['08:22', 'review', 'Sent REQ-2056 to review: Parks or Water?', 'Confidence 62% is under your 80% threshold.', 'REQ-2056', null],
    ['08:05', 'merge', 'Merged 1 new report into REQ-2041 (Pothole, 412 Elm St)', 'Within 12 m of the existing request, same category, photo match 0.91.', 'REQ-2041', '311 intake'],
    ['07:48', 'priority', 'Raised REQ-2041 to High priority (78)', 'School bus route, 22 upvotes, 4 days open.', 'REQ-2041', null],
    ['07:30', 'nudge', 'Reminded Public Works about REQ-1931 (due tomorrow)', 'Due within 24 hours and not yet scheduled.', null, 'Work order system'],
    ['07:02', 'sync', 'Synced 41 work orders and 12 crew statuses', 'Scheduled sync with the work order system and fleet tracker.', null, 'Fleet tracker'],
  ].map(([t, kind, text, why, reqId, tool], i) => ({ id: `F-${100 + i}`, at: Date.parse(`2026-12-07T${t}:00-05:00`), kind, text, why, reqId, tool, actor: 'agent' }))

  return {
    version: 4, now, requests, reports, residents: [...residents, priya], priya: priya.id, crews, plows,
    feed, audit: feed.map(f => ({ ...f, id: 'A' + f.id.slice(1) })), proposals: [], toasts: [],
    rules: { weights: { safety: 35, community: 15, age: 20, resources: 15, equity: 15 }, threshold: 80, equityGap: 1.0, autoMerge: true, autoNotify: true },
    storm: null, stats: { merged: 38, routed: 52, nudges: 6, notified: 71, hoursSaved: 19 },
    following: ['REQ-2041'], upvoted: [], inbox: [{ id: 'M-1', at: now - 9 * D, reqId: 'REQ-1964', text: 'REQ-1964 at 450 Elm St is fixed. Thanks for reporting it.' }], seq: 3000, running: null, guided: null,
  }
}
