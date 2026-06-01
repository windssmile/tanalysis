import { layoutCandles } from '../geometry.js'
import { boll } from './calc.js'

const UP = '#f43f5e'
const DOWN = '#22c55e'
const BAND = { upper: '#6366f1', mid: '#fbbf24', lower: '#6366f1' }

export default function BOLLChart({ data, width = 480, height = 220 }) {
  const pad = 12
  const laid = layoutCandles(data, { width, height, pad })
  const closes = data.map((d) => d.c)
  const { mid, upper, lower } = boll(closes)

  const prices = data.flatMap((d) => [d.h, d.l])
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  function scaleClose(price) {
    const usable = height - pad * 2
    return pad + ((max - price) / (max - min)) * usable
  }
  function points(arr) {
    return arr
      .map((v, i) => (v == null ? null : `${laid[i].x},${scaleClose(v)}`))
      .filter(Boolean)
      .join(' ')
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {laid.map((c, i) => {
        const color = c.bullish ? UP : DOWN
        return (
          <g key={i}>
            <line x1={c.x} y1={c.highY} x2={c.x} y2={c.lowY} stroke={color} strokeWidth="1" />
            <rect data-role="body" x={c.bodyX} y={c.bodyY} width={c.bodyW} height={c.bodyH} fill={color} />
          </g>
        )
      })}
      <polyline points={points(upper)} fill="none" stroke={BAND.upper} strokeWidth="1.5" />
      <polyline points={points(mid)} fill="none" stroke={BAND.mid} strokeWidth="1.5" strokeDasharray="4" />
      <polyline points={points(lower)} fill="none" stroke={BAND.lower} strokeWidth="1.5" />
    </svg>
  )
}
