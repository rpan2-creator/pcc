import { useSyncExternalStore } from 'react'

const KEY = 'pcc-theme'
const subs = new Set()
let theme = (() => { try { return localStorage.getItem(KEY) || 'dark' } catch { return 'dark' } })()
document.documentElement.dataset.theme = theme

export function setTheme(t) {
  theme = t
  try { localStorage.setItem(KEY, t) } catch {}
  const apply = () => { document.documentElement.dataset.theme = t; subs.forEach(f => f()) }
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply)
  else apply()
}
export const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
export function useTheme() {
  return useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f) }, () => theme)
}
