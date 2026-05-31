import { kdj } from './calc.js'

const COLORS = { k: '#6366f1', d: '#fbbf24', j: '#f43f5e' }

export default function KDJChart({ data, width = 480, height = 160 }) {
  const { k, d, j } = kdj(data)
  const slot = width / data.length
  const all = [...k, ...d, ...j]
  const max = Math.max(100, ...all)
  const min = Math.min(0, ...all)
  function scale(v) {
    return ((max - v) / (max - min)) * height
  }
  function line(arr) {
    return arr.map((v, i) => `${slot * i + slot / 2},${scale(v)}`).join(' ')
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {[20, 50, 80].map((lvl) => (
        <line key={lvl} x1="0" y1={scale(lvl)} x2={width} y2={scale(lvl)} stroke="#1e293b" />
      ))}
      <polyline points={line(k)} fill="none" stroke={COLORS.k} strokeWidth="1.5" />
      <polyline points={line(d)} fill="none" stroke={COLORS.d} strokeWidth="1.5" />
      <polyline points={line(j)} fill="none" stroke={COLORS.j} strokeWidth="1.5" />
    </svg>
  )
}
