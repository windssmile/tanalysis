const UP = '#f43f5e'
const DOWN = '#22c55e'
const PRICE = '#e2e8f0'
const AVG = '#fbbf24'

// 分时图：上方价格线 + 均价线 + 昨收基准线（红绿分区），下方分时量柱
export default function IntradayChart({ data, width = 480, height = 260 }) {
  const { prevClose, points } = data
  const pad = 12
  const gap = 10
  const priceH = Math.round(height * 0.66)
  const volTop = priceH + gap
  const volH = height - volTop - 4
  const slot = width / Math.max(points.length - 1, 1)

  const all = [prevClose, ...points.flatMap((p) => [p.price, p.avg])]
  // 以昨收为中心对称取值域，使红绿分区视觉均衡
  const span = Math.max(...all.map((v) => Math.abs(v - prevClose)), 0.01) * 1.15
  const min = prevClose - span
  const max = prevClose + span
  function y(v) {
    const usable = priceH - pad * 2
    return pad + ((max - v) / (max - min)) * usable
  }
  const baseY = y(prevClose)
  const px = (i) => slot * i

  const priceLine = points.map((p, i) => `${px(i)},${y(p.price)}`).join(' ')
  const avgLine = points.map((p, i) => `${px(i)},${y(p.avg)}`).join(' ')

  const maxV = Math.max(...points.map((p) => p.vol), 1)
  const barW = Math.max(1, (width / points.length) * 0.6)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {/* 红绿分区背景 */}
      <rect x="0" y="0" width={width} height={baseY} fill="rgba(244,63,94,0.07)" />
      <rect x="0" y={baseY} width={width} height={priceH - baseY} fill="rgba(34,197,94,0.07)" />
      {/* 午休分隔 */}
      <line x1={width / 2} y1="0" x2={width / 2} y2={priceH} stroke="#1e293b" strokeDasharray="2 3" />
      {/* 昨收基准线 */}
      <line data-role="prevclose" x1="0" y1={baseY} x2={width} y2={baseY} stroke="#64748b" strokeDasharray="4 3" />
      <text x="2" y={baseY - 3} fill="#64748b" fontSize="10">昨收 {prevClose}</text>

      {/* 量价分隔 */}
      <line x1="0" y1={priceH + gap / 2} x2={width} y2={priceH + gap / 2} stroke="#1e293b" />

      {/* 均价线 + 价格线 */}
      <polyline data-role="avg" points={avgLine} fill="none" stroke={AVG} strokeWidth="1.3" />
      <polyline data-role="price" points={priceLine} fill="none" stroke={PRICE} strokeWidth="1.6" />

      {/* 分时量柱 */}
      {points.map((p, i) => {
        const barH = (p.vol / maxV) * volH
        return (
          <rect
            key={i}
            data-role="vol"
            x={px(i) - barW / 2}
            y={volTop + volH - barH}
            width={barW}
            height={barH}
            fill={p.price >= prevClose ? UP : DOWN}
          />
        )
      })}
    </svg>
  )
}
