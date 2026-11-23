import { useSyncExternalStore } from 'react'
const subs = new Set()
const emit = () => subs.forEach(f => f())
window.addEventListener('popstate', emit)
export function navigate(to, { replace = false } = {}) {
  if (to === location.pathname) return
  history[replace ? 'replaceState' : 'pushState']({}, '', to)
  window.scrollTo(0, 0)
  emit()
}
export function usePath() {
  return useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f) }, () => location.pathname)
}
export function Link({ to, children, className, style, onClick, ...rest }) {
  return <a href={to} className={className} style={style} {...rest} onClick={e => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); onClick?.(e); navigate(to) }}>{children}</a>
}
