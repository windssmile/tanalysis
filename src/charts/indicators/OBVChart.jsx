import { obv } from './calc.js'

export default function OBVChart({ data, width = 480, height = 160 }) {
  const values = obv(data)
  const slot = width / data.length
  const pad = 8
  const max = Math.max(...values)
  const min = Math.min(...values)
  function scale(v) {
    if (max === min) return height / 2
    const usable = height - pad * 2
    return pad + ((max - v) / (max - min)) * usable
  }
  const points = values.map((v, i) => `${slot * i + slot / 2},${scale(v)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {[0.5].map((f) => (
        <line key={f} x1="0" y1={height * f} x2={width} y2={height * f} stroke="#1e293b" />
      ))}
      <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="1.8" />
    </svg>
  )
}
