import { useEffect, useRef } from 'react'

// Liquid-chrome shapes behind the interface. Glass only reads as glass when there is
// something with depth and highlights behind it to blur.
export default function Backdrop() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let tx = 0, ty = 0, x = 0, y = 0, raf
    const move = e => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5 }
    const tick = () => { x += (tx - x) * 0.04; y += (ty - y) * 0.04; el.style.setProperty('--px', x.toFixed(3)); el.style.setProperty('--py', y.toFixed(3)); raf = requestAnimationFrame(tick) }
    addEventListener('pointermove', move); raf = requestAnimationFrame(tick)
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div className="backdrop" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="chromeA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--c1)' }} /><stop offset=".22" style={{ stopColor: 'var(--c2)' }} /><stop offset=".45" style={{ stopColor: 'var(--c3)' }} />
            <stop offset=".62" style={{ stopColor: 'var(--c1)' }} /><stop offset=".8" style={{ stopColor: 'var(--c4)' }} /><stop offset="1" style={{ stopColor: 'var(--c2)' }} />
          </linearGradient>
          <linearGradient id="chromeB" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--c3)' }} /><stop offset=".3" style={{ stopColor: 'var(--c1)' }} /><stop offset=".55" style={{ stopColor: 'var(--c4)' }} />
            <stop offset=".75" style={{ stopColor: 'var(--c2)' }} /><stop offset="1" style={{ stopColor: 'var(--c1)' }} />
          </linearGradient>
          <linearGradient id="iri" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFC9DE" /><stop offset=".35" stopColor="#C9E4FF" /><stop offset=".7" stopColor="#CFF7E6" /><stop offset="1" stopColor="#FFF0C2" />
          </linearGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="1.2" /></filter>
          <filter id="haze"><feGaussianBlur stdDeviation="40" /></filter>
        </defs>
        <g className="bd-l1">
          <ellipse cx="1180" cy="760" rx="420" ry="260" fill="url(#iri)" style={{ opacity: 'var(--iri)' }} filter="url(#haze)" />
          <ellipse cx="260" cy="120" rx="360" ry="220" fill="url(#iri)" style={{ opacity: 'var(--iri)' }} filter="url(#haze)" />
        </g>
        <g className="bd-l2" filter="url(#soft)">
          <path d="M-160 560 C 0 380, 60 160, 300 90 S 640 -10, 760 -140" fill="none" stroke="url(#chromeA)" strokeWidth="120" strokeLinecap="round" />
          <path d="M-160 560 C 0 380, 60 160, 300 90 S 640 -10, 760 -140" fill="none" style={{ stroke: 'var(--hl)' }} strokeWidth="6" strokeLinecap="round" opacity=".55" transform="translate(-14 -36)" />
        </g>
        <g className="bd-l3" filter="url(#soft)">
          <path d="M1560 520 C 1320 420, 1240 760, 1020 700 S 760 980, 820 1060" fill="none" stroke="url(#chromeB)" strokeWidth="150" strokeLinecap="round" />
          <path d="M1560 520 C 1320 420, 1240 760, 1020 700 S 760 980, 820 1060" fill="none" style={{ stroke: 'var(--hl)' }} strokeWidth="7" strokeLinecap="round" opacity=".5" transform="translate(-10 -50)" />
          <circle cx="1270" cy="210" r="92" fill="url(#chromeA)" />
          <ellipse cx="1244" cy="176" rx="40" ry="20" style={{ fill: 'var(--hl)' }} opacity=".7" transform="rotate(-25 1244 176)" />
        </g>
        <g className="bd-l2" filter="url(#soft)">
          <circle cx="560" cy="820" r="58" fill="url(#chromeB)" />
          <ellipse cx="544" cy="798" rx="24" ry="12" style={{ fill: 'var(--hl)' }} opacity=".7" transform="rotate(-25 544 798)" />
        </g>
      </svg>
    </div>
  )
}
