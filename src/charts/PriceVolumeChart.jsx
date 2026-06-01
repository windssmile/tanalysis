import { useState } from 'react'
import { layoutCandles, scaleY } from './geometry.js'

const UP = '#f43f5e'
const DOWN = '#22c55e'

// 量价图：上方 K线主图，下方成交量柱，红涨绿跌
export default function PriceVolumeChart({ data, annotations = [], width = 480, height = 260 }) {
  const [hover, setHover] = useState(null)
  const pad = 12
  const gap = 10
  const priceH = Math.round(height * 0.64)
  const volTop = priceH + gap
  const volH = height - volTop - 4

  const laid = layoutCandles(data, { width, height: priceH, pad })
  const slot = width / data.length
  const maxV = Math.max(...data.map((d) => d.v || 0), 1)

  const prices = data.flatMap((d) => [d.h, d.l])
  const min = Math.min(...prices)
  const max = Math.max(...prices)

  const hasHighlight = annotations.some((a) => a.type === 'highlight')
  function dimmed(i) {
    return hasHighlight && !annotations.some((a) => a.type === 'highlight' && a.index === i)
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {/* 价格网格 */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" y1={priceH * f} x2={width} y2={priceH * f} stroke="#1e293b" />
      ))}
      {/* 量价分隔线 */}
      <line x1="0" y1={priceH + gap / 2} x2={width} y2={priceH + gap / 2} stroke="#1e293b" />

      {/* 水平参考线（支撑/压力） */}
      {annotations
        .filter((a) => a.type === 'line')
        .map((a, i) => {
          const y = scaleY(a.price, { min, max, height: priceH, pad })
          return (
            <g key={`line-${i}`}>
              <line x1="0" y1={y} x2={width} y2={y} stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="5 3" />
              {a.label && (
                <text x={width - 4} y={y - 4} fill="#fbbf24" fontSize="11" textAnchor="end">{a.label}</text>
              )}
            </g>
          )
        })}

      {laid.map((c, i) => {
        const color = c.bullish ? UP : DOWN
        const v = data[i].v || 0
        const barH = (v / maxV) * volH
        return (
          <g
            key={i}
            data-role="bar"
            opacity={dimmed(i) ? 0.3 : 1}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {/* 价格 */}
            <line data-role="wick" x1={c.x} y1={c.highY} x2={c.x} y2={c.lowY} stroke={color} strokeWidth="1.4" />
            <rect data-role="body" x={c.bodyX} y={c.bodyY} width={c.bodyW} height={c.bodyH} rx="1.5" fill={color} />
            {/* 成交量 */}
            <rect data-role="vol" x={c.bodyX} y={volTop + volH - barH} width={c.bodyW} height={barH} fill={color} />
          </g>
        )
      })}

      {hover !== null && (
        <text x="6" y="14" fill="#cbd5e1" fontSize="11">
          {`开${data[hover].o} 高${data[hover].h} 低${data[hover].l} 收${data[hover].c} 量${data[hover].v}`}
        </text>
      )}
    </svg>
  )
}
