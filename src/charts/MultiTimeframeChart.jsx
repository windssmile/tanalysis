import CandleChart from './CandleChart.jsx'

const caption = { color: 'var(--text-dim)', fontSize: 12, fontWeight: 700, margin: '0 0 4px' }

// 多周期共振：上面板高级别（周线）定方向，下面板低级别（日线）找买点
export default function MultiTimeframeChart({ data, weekly, annotations = [], width = 460 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <p style={caption}>周线 · 定方向（顺大级别趋势）</p>
        <CandleChart data={weekly} width={width} height={130} showTooltip={false} />
      </div>
      <div>
        <p style={caption}>日线 · 找买点（回调到支撑后企稳）</p>
        <CandleChart data={data} annotations={annotations} width={width} height={130} />
      </div>
    </div>
  )
}
