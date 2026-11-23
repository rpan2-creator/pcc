import { readFileSync, writeFileSync } from 'fs'
const miss = JSON.parse(readFileSync('scripts/missing.json', 'utf8'))
for (const [url, path] of Object.entries(miss)) {
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 3000 + i * 4000))
    const r = await fetch(url, { headers: { 'User-Agent': 'PCC-class-demo/1.0 (https://github.com/rpan2-creator/pcc; student project)' } })
    if (r.ok) { writeFileSync('public' + path, Buffer.from(await r.arrayBuffer())); console.log('ok', path); break }
    console.log('retry', r.status, url)
  }
}
