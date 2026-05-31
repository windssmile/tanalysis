import { useState } from 'react'
import { layoutCandles } from '../geometry.js'
import { sma } from './calc.js'

const UP = '#f43f5e'
const DOWN = '#22c55e'
const MA_COLORS = { 5: '#fbbf24', 10: '#6366f1', 20: '#10d9a0' }

export default function MAChart({ data, width = 480, height = 220 }) {
  const [periods, setPeriods] = useState({ 5: true, 10: true, 20: true })
  const pad = 12
  const laid = layoutCandles(data, { width, height, pad })
  const closes = data.map((d) => d.c)

  function linePoints(period) {
    const vals = sma(closes, period)
    return vals
      .map((v, i) => (v == null ? null : `${laid[i].x},${scaleClose(v)}`))
      .filter(Boolean)
      .join(' ')
  }

  function scaleClose(price) {
    const prices = data.flatMap((d) => [d.h, d.l])
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const usable = height - pad * 2
    return pad + ((max - price) / (max - min)) * usable
  }

  return (
    <div>
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
        {Object.keys(MA_COLORS)
          .map(Number)
          .filter((p) => periods[p])
          .map((p) => (
            <polyline key={p} points={linePoints(p)} fill="none" stroke={MA_COLORS[p]} strokeWidth="1.5" />
          ))}
      </svg>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12 }}>
        {Object.keys(MA_COLORS).map(Number).map((p) => (
          <label key={p} style={{ color: MA_COLORS[p], cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={periods[p]}
              onChange={() => setPeriods((s) => ({ ...s, [p]: !s[p] }))}
            />
            MA{p}
          </label>
        ))}
      </div>
    </div>
  )
}
