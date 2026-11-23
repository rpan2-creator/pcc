// Riverton: a fictional city used for the PCC demo. Nothing here is real data.

export const MAP_W = 1000
export const MAP_H = 620

// River centre line, west to east
export const RIVER = [[0, 262], [180, 284], [360, 296], [520, 300], [700, 326], [860, 340], [1000, 352]]

export function riverY(x) {
  for (let i = 0; i < RIVER.length - 1; i++) {
    const [x1, y1] = RIVER[i], [x2, y2] = RIVER[i + 1]
    if (x >= x1 && x <= x2) return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1)
  }
  return RIVER[RIVER.length - 1][1]
}

export const DISTRICTS = [
  { id: 'northgate', name: 'Northgate', n: 1, x0: 0, x1: 380, north: true, label: [150, 40] },
  { id: 'downtown', name: 'Downtown', n: 2, x0: 380, x1: 660, north: true, label: [520, 40] },
  { id: 'eastfield', name: 'Eastfield', n: 3, x0: 660, x1: 1000, north: true, label: [860, 40] },
  { id: 'westbrook', name: 'Westbrook', n: 4, x0: 0, x1: 330, north: false, label: [150, 600] },
  { id: 'riverside', name: 'Riverside', n: 5, x0: 330, x1: 660, north: false, label: [470, 600] },
  { id: 'southport', name: 'Southport', n: 6, x0: 660, x1: 1000, north: false, label: [860, 600] },
]

export function districtPolygon(d) {
  const pts = []
  const step = 20
  if (d.north) {
    pts.push([d.x0, 0], [d.x1, 0])
    for (let x = d.x1; x >= d.x0; x -= step) pts.push([x, riverY(x) - 14])
    pts.push([d.x0, riverY(d.x0) - 14])
  } else {
    for (let x = d.x0; x <= d.x1; x += step) pts.push([x, riverY(x) + 14])
    pts.push([d.x1, riverY(d.x1) + 14], [d.x1, MAP_H], [d.x0, MAP_H])
  }
  return pts.map(p => p.join(',')).join(' ')
}

export function districtAt(x, y) {
  const north = y < riverY(x)
  const d = DISTRICTS.find(d => d.north === north && x >= d.x0 && x < d.x1)
  return d ? d.id : north ? 'eastfield' : 'southport'
}

export const districtName = id => DISTRICTS.find(d => d.id === id)?.name ?? id

// Streets. kind: emergency | arterial | residential
export const STREETS = [
  { id: 'hillcrest', name: 'Hillcrest Dr', kind: 'residential', pts: [[20, 78], [640, 70]] },
  { id: 'northgate-ave', name: 'Northgate Ave', kind: 'arterial', pts: [[0, 150], [1000, 150]] },
  { id: 'main', name: 'Main St', kind: 'emergency', pts: [[300, 218], [1000, 230]] },
  { id: 'river-rd', name: 'River Rd', kind: 'emergency', pts: [[0, 300], [360, 318], [700, 350], [1000, 376]] },
  { id: 'elm', name: 'Elm St', kind: 'residential', pts: [[60, 430], [960, 430]] },
  { id: 'harbor', name: 'Harbor Way', kind: 'arterial', pts: [[0, 505], [1000, 505]] },
  { id: 'southport-blvd', name: 'Southport Blvd', kind: 'residential', pts: [[640, 575], [1000, 575]] },
  { id: 'cedar', name: 'Cedar Ln', kind: 'residential', pts: [[30, 560], [330, 560]] },
  { id: 'first', name: '1st Ave', kind: 'residential', pts: [[120, 20], [120, 610]] },
  { id: 'oak', name: 'Oak Ave', kind: 'arterial', pts: [[262, 0], [262, 620]] },
  { id: 'lincoln', name: 'Lincoln Ave', kind: 'arterial', pts: [[402, 0], [402, 280]] },
  { id: 'washington', name: 'Washington Blvd', kind: 'emergency', pts: [[540, 0], [540, 620]] },
  { id: 'maple', name: 'Maple St', kind: 'residential', pts: [[690, 360], [690, 620]] },
  { id: 'college', name: 'College Ave', kind: 'arterial', pts: [[830, 0], [830, 620]] },
  { id: 'pine', name: 'Pine St', kind: 'residential', pts: [[940, 20], [940, 330]] },
  { id: 'birch', name: 'Birch Ct', kind: 'residential', pts: [[300, 470], [300, 600]] },
]

export const BRIDGES = [262, 540, 830]

export const LANDMARKS = [
  { id: 'hospital', name: 'Riverton General Hospital', short: 'Hospital', x: 566, y: 112, kind: 'hospital' },
  { id: 'school1', name: 'Riverside Elementary', short: 'School', x: 470, y: 452, kind: 'school' },
  { id: 'school2', name: 'Westbrook Middle School', short: 'School', x: 150, y: 470, kind: 'school' },
  { id: 'cityhall', name: 'City Hall', short: 'City Hall', x: 610, y: 200, kind: 'civic' },
  { id: 'firestation', name: 'Fire Station 3', short: 'Fire', x: 860, y: 470, kind: 'fire' },
]

export const PARKS = [
  { name: 'Hillcrest Park', pts: '40,100 200,96 214,130 60,134' },
  { name: 'Riverfront Green', pts: '600,360 760,378 752,410 596,394' },
  { name: 'Southport Commons', pts: '880,520 980,520 980,560 880,560' },
]

export const CATEGORIES = {
  pothole: { label: 'Pothole', dept: 'streets', risk: 62, fix: 1.0, target: 5, color: '#D4553A' },
  snow: { label: 'Unplowed street', dept: 'streets', risk: 84, fix: 0.3, target: 1, color: '#3E7CB1' },
  trash: { label: 'Missed trash pickup', dept: 'streets', risk: 24, fix: 0.5, target: 3, color: '#8A7B5C' },
  streetlight: { label: 'Streetlight out', dept: 'transport', risk: 52, fix: 1.0, target: 7, color: '#E2A33B' },
  signal: { label: 'Traffic signal out', dept: 'transport', risk: 95, fix: 0.3, target: 1, color: '#C2410C' },
  tree: { label: 'Fallen tree', dept: 'parks', risk: 70, fix: 1.0, target: 3, color: '#3F7D4E' },
  drain: { label: 'Blocked storm drain', dept: 'water', risk: 58, fix: 1.0, target: 4, color: '#2C8C99' },
  leak: { label: 'Water main leak', dept: 'water', risk: 90, fix: 0.5, target: 1, color: '#1F6E8C' },
  sidewalk: { label: 'Sidewalk damage', dept: 'publicworks', risk: 44, fix: 2.0, target: 14, color: '#7C6A9A' },
  graffiti: { label: 'Graffiti', dept: 'publicworks', risk: 14, fix: 1.0, target: 10, color: '#B5577E' },
}

export const DEPARTMENTS = {
  streets: { name: 'Streets & Sanitation', short: 'Streets', crews: 4 },
  transport: { name: 'Transportation', short: 'Transport', crews: 2 },
  parks: { name: 'Parks & Forestry', short: 'Parks', crews: 2 },
  water: { name: 'Water', short: 'Water', crews: 2 },
  publicworks: { name: 'Public Works', short: 'Public Works', crews: 2 },
}

export function pointOnStreet(streetId, t) {
  const s = STREETS.find(s => s.id === streetId)
  const segs = []
  let total = 0
  for (let i = 0; i < s.pts.length - 1; i++) {
    const [x1, y1] = s.pts[i], [x2, y2] = s.pts[i + 1]
    const len = Math.hypot(x2 - x1, y2 - y1)
    segs.push({ x1, y1, x2, y2, len }); total += len
  }
  let d = t * total
  for (const g of segs) {
    if (d <= g.len) return [g.x1 + (g.x2 - g.x1) * (d / g.len), g.y1 + (g.y2 - g.y1) * (d / g.len)]
    d -= g.len
  }
  const last = segs[segs.length - 1]
  return [last.x2, last.y2]
}
