const TZ = 'America/New_York'
export const time = t => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ })
export const day = t => new Date(t).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: TZ })
export const dayTime = t => `${day(t)}, ${time(t)}`
export function ago(t, now) {
  const m = Math.round((now - t) / 60e3)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  const d = Math.round(h / 24)
  return `${d} day${d === 1 ? '' : 's'} ago`
}
export const ageDays = (t, now) => (now - t) / 864e5
export const plural = (n, w, p = w + 's') => `${n} ${n === 1 ? w : p}`
