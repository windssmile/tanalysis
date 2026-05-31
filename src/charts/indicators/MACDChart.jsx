import { macd } from './calc.js'

const UP = '#f43f5e'
const DOWN = '#22c55e'

export default function MACDChart({ data, width = 480, height = 160 }) {
  const closes = data.map((d) => d.c)
  const { dif, dea, hist } = macd(closes)
  const all = [...dif, ...dea, ...hist].filter((v) => Number.isFinite(v))
  const max = Math.max(...all, 0.01)
  const min = Math.min(...all, -0.01)
  const zeroY = scale(0)
  const slot = width / data.length
  function scale(v) {
    return ((max - v) / (max - min)) * height
  }
  function line(arr) {
    return arr.map((v, i) => `${slot * i + slot / 2},${scale(v)}`).join(' ')
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      <line x1="0" y1={zeroY} x2={width} y2={zeroY} stroke="#334155" strokeDasharray="3" />
      {hist.map((v, i) => {
        const y = scale(v)
        const top = Math.min(y, zeroY)
        const h = Math.abs(y - zeroY)
        return (
          <rect
            key={i}
            data-role="hist"
            x={slot * i + slot * 0.25}
            y={top}
            width={slot * 0.5}
            height={h}
            fill={v >= 0 ? UP : DOWN}
          />
        )
      })}
      <polyline points={line(dif)} fill="none" stroke="#6366f1" strokeWidth="1.5" />
      <polyline points={line(dea)} fill="none" stroke="#fbbf24" strokeWidth="1.5" />
    </svg>
  )
}
