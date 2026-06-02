import { useState } from 'react'
import { layoutCandles, scaleY } from './geometry.js'

const UP = '#f43f5e'
const DOWN = '#22c55e'

export default function CandleChart({
  data,
  annotations = [],
  width = 320,
  height = 200,
  showTooltip = true,
}) {
  const [hover, setHover] = useState(null)
  const pad = 12
  const laid = layoutCandles(data, { width, height, pad })
  const slot = width / data.length
  const prices = data.flatMap((d) => [d.h, d.l])
  const min = Math.min(...prices)
  const max = Math.max(...prices)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {/* 网格 */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" y1={height * f} x2={width} y2={height * f} stroke="#1e293b" />
      ))}

      {/* 区域标注 */}
      {annotations
        .filter((a) => a.type === 'box')
        .map((a, i) => {
          const x1 = slot * a.from + slot * 0.1
          const x2 = slot * (a.to + 1) - slot * 0.1
          return (
            <g key={`box-${i}`}>
              <rect
                data-role="box"
                x={x1}
                y={pad / 2}
                width={x2 - x1}
                height={height - pad}
                fill="none"
                stroke="#fbbf24"
                strokeDasharray="4"
                rx="3"
              />
              {a.label && (
                <text x={(x1 + x2) / 2} y={height - 2} fill="#fbbf24" fontSize="11" textAnchor="middle">
                  {a.label}
                </text>
              )}
            </g>
          )
        })}

      {/* 水平参考线（颈线/支撑/压力） */}
      {annotations
        .filter((a) => a.type === 'line')
        .map((a, i) => {
          const y = scaleY(a.price, { min, max, height, pad })
          return (
            <g key={`line-${i}`}>
              <line
                data-role="hline"
                x1="0"
                y1={y}
                x2={width}
                y2={y}
                stroke="#fbbf24"
                strokeWidth="1.2"
                strokeDasharray="5 3"
              />
              {a.label && (
                <text x={width - 4} y={y - 4} fill="#fbbf24" fontSize="11" textAnchor="end">
                  {a.label}
                </text>
              )}
            </g>
          )
        })}

      {/* 斜趋势线（趋势线/通道边界） */}
      {annotations
        .filter((a) => a.type === 'trendline')
        .map((a, i) => {
          const x1 = slot * a.from.i + slot / 2
          const x2 = slot * a.to.i + slot / 2
          const y1 = scaleY(a.from.price, { min, max, height, pad })
          const y2 = scaleY(a.to.price, { min, max, height, pad })
          return (
            <g key={`trend-${i}`}>
              <line data-role="trendline" x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="1.4" />
              {a.label && (
                <text x={x2} y={y2 - 6} fill="#fbbf24" fontSize="11" textAnchor="end">{a.label}</text>
              )}
            </g>
          )
        })}

      {/* 买卖点标注（买=红三角朝上在下方，卖=绿三角朝下在上方；红涨绿跌） */}
      {annotations
        .filter((a) => a.type === 'marker')
        .map((a, i) => {
          const c = laid[a.index]
          if (!c) return null
          const buy = a.dir === 'buy'
          const color = buy ? UP : DOWN
          const points = buy
            ? `${c.x},${c.lowY + 4} ${c.x - 4},${c.lowY + 11} ${c.x + 4},${c.lowY + 11}`
            : `${c.x},${c.highY - 4} ${c.x - 4},${c.highY - 11} ${c.x + 4},${c.highY - 11}`
          return <polygon key={`marker-${i}`} data-role="marker" data-dir={a.dir} points={points} fill={color} />
        })}

      {/* K线 */}
      {laid.map((c, i) => {
        const color = c.bullish ? UP : DOWN
        const dim = annotations.some((a) => a.type === 'highlight') &&
          !annotations.some((a) => a.type === 'highlight' && a.index === i)
        return (
          <g
            key={i}
            opacity={dim ? 0.3 : 1}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: showTooltip ? 'pointer' : 'default' }}
          >
            <line data-role="wick" x1={c.x} y1={c.highY} x2={c.x} y2={c.lowY} stroke={color} strokeWidth="1.5" />
            <rect data-role="body" x={c.bodyX} y={c.bodyY} width={c.bodyW} height={c.bodyH} rx="1.5" fill={color} />
          </g>
        )
      })}

      {/* 悬停 OHLC 提示 */}
      {showTooltip && hover !== null && (
        <text x="6" y="14" fill="#cbd5e1" fontSize="11">
          {`开${data[hover].o} 高${data[hover].h} 低${data[hover].l} 收${data[hover].c}`}
        </text>
      )}
    </svg>
  )
}
