import { bias } from './calc.js'

const COLORS = { 6: '#6366f1', 12: '#fbbf24', 24: '#10d9a0' }

export default function BIASChart({ data, width = 480, height = 160 }) {
  const closes = data.map((d) => d.c)
  const series = Object.keys(COLORS).map(Number).map((p) => bias(closes, p))
  const slot = width / data.length
  const pad = 8
  const all = series.flat().filter((v) => v != null)
  const max = Math.max(0.5, ...all)
  const min = Math.min(-0.5, ...all)
  function scale(v) {
    const usable = height - pad * 2
    return pad + ((max - v) / (max - min)) * usable
  }
  function line(arr) {
    return arr
      .map((v, i) => (v == null ? null : `${slot * i + slot / 2},${scale(v)}`))
      .filter(Boolean)
      .join(' ')
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {/* 零轴 */}
      <line x1="0" y1={scale(0)} x2={width} y2={scale(0)} stroke="#334155" strokeDasharray="3" />
      {series.map((arr, idx) => {
        const p = Object.keys(COLORS).map(Number)[idx]
        return <polyline key={p} points={line(arr)} fill="none" stroke={COLORS[p]} strokeWidth="1.5" />
      })}
    </svg>
  )
}
