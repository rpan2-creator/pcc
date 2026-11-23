// Downloads every Wikimedia photo used by the demo into public/photos so the site
// serves its own copies. Run by .github/workflows/photos.yml.
import { PHOTOS, EXTRA } from '../src/data/photos.js'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { createHash } from 'crypto'
mkdirSync('public/photos', { recursive: true })
const all = [...Object.values(PHOTOS).flat(), ...Object.values(EXTRA)]
const map = {}
for (const p of all) {
  const name = createHash('sha1').update(p.src).digest('hex').slice(0, 12) + '.jpg'
  map[p.src] = '/photos/' + name
  if (existsSync('public/photos/' + name)) continue
  for (let i = 0; i < 3; i++) {
    const r = await fetch(p.src, { headers: { 'User-Agent': 'PCC-class-demo/1.0 (student project)' } })
    if (r.ok) { writeFileSync('public/photos/' + name, Buffer.from(await r.arrayBuffer())); console.log('ok', name); break }
    console.log('retry', r.status, p.src); await new Promise(r => setTimeout(r, 2000))
  }
  await new Promise(r => setTimeout(r, 400))
}
writeFileSync('src/data/photo-map.json', JSON.stringify(map, null, 1))
