import { rsi } from './calc.js'

const COLORS = { 6: '#6366f1', 12: '#fbbf24', 24: '#10d9a0' }

export default function RSIChart({ data, width = 480, height = 160 }) {
  const closes = data.map((d) => d.c)
  const slot = width / data.length
  function scale(v) {
    return ((100 - v) / 100) * height
  }
  function line(period) {
    return rsi(closes, period)
      .map((v, i) => (v == null ? null : `${slot * i + slot / 2},${scale(v)}`))
      .filter(Boolean)
      .join(' ')
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {[30, 50, 70].map((lvl) => (
        <line key={lvl} x1="0" y1={scale(lvl)} x2={width} y2={scale(lvl)} stroke="#1e293b" />
      ))}
      {Object.keys(COLORS).map(Number).map((p) => (
        <polyline key={p} points={line(p)} fill="none" stroke={COLORS[p]} strokeWidth="1.5" />
      ))}
    </svg>
  )
}
