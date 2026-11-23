import { ArrowLeft } from 'lucide-react'
import { Link } from '../router.jsx'
import { ALL_CREDITS } from '../data/photos.js'

export default function Credits() {
  return (
    <div className="landing" style={{ minHeight: '100vh' }}>
      <div className="lsec" style={{ maxWidth: 900 }}>
        <Link to="/" className="row small muted" style={{ fontWeight: 600, marginBottom: 18 }}><ArrowLeft size={15} />Back</Link>
        <h2>Photo credits</h2>
        <p className="muted" style={{ marginTop: 6 }}>Photos are real street photos from Wikimedia Commons, used under the licences below. They stand in for photos residents would upload. Places and names in PCC are fictional.</p>
        <div className="card" style={{ marginTop: 18 }}>
          <table className="table">
            <thead><tr><th style={{ width: 90 }}>Photo</th><th>File</th><th>Author</th><th>Licence</th></tr></thead>
            <tbody>{ALL_CREDITS.map(c => (
              <tr key={c.src}>
                <td><img src={c.src} alt="" referrerPolicy="no-referrer" style={{ width: 72, height: 50, objectFit: 'cover', borderRadius: 6, display: 'block' }} /></td>
                <td className="small"><a href={`https://commons.wikimedia.org/wiki/File:${c.file}`} target="_blank" rel="noreferrer" style={{ color: 'var(--agent)' }}>{c.file.replace(/_/g, ' ')}</a></td>
                <td className="small">{c.by}</td>
                <td className="small">{c.lic}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
