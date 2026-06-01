import { chipDistribution } from './chip.js'

const PROFIT = '#f43f5e' // 获利盘（当前价下方）：红
const TRAPPED = '#22c55e' // 套牢盘（当前价上方）：绿

// 筹码分布横向直方图：纵轴价格，横向柱长代表该价位沉淀的筹码量。
export default function ChipChart({ data, buckets = 24, width = 360, height = 240 }) {
  const { levels, min, max, lastClose, profitRatio } = chipDistribution(data, buckets)
  const pad = 8
  const maxW = Math.max(...levels.map((l) => l.weight), 1)
  const barMax = width * 0.7

  function scaleY(price) {
    if (max === min) return height / 2
    const usable = height - pad * 2
    return pad + ((max - price) / (max - min)) * usable
  }
  const rowH = Math.max(1, (height - pad * 2) / levels.length - 1)
  const closeY = scaleY(lastClose)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {levels.map((lv, i) => {
        const w = (lv.weight / maxW) * barMax
        return (
          <rect
            key={i}
            data-role="chip"
            x="0"
            y={scaleY(lv.high)}
            width={w}
            height={rowH}
            fill={lv.price < lastClose ? PROFIT : TRAPPED}
            opacity="0.75"
          />
        )
      })}
      {/* 当前价 */}
      <line x1="0" y1={closeY} x2={width} y2={closeY} stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 3" />
      <text x={width - 4} y={closeY - 4} fill="#fbbf24" fontSize="11" textAnchor="end">
        现价 {lastClose.toFixed(2)}
      </text>
      <text x={width - 4} y={14} fill="#cbd5e1" fontSize="11" textAnchor="end">
        获利盘 {(profitRatio * 100).toFixed(0)}%
      </text>
    </svg>
  )
}
