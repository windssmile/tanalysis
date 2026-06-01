const ASK = '#22c55e' // 卖盘：绿
const BID = '#f43f5e' // 买盘：红

const cell = { padding: '4px 10px', fontSize: 13 }
const labelCell = { ...cell, color: 'var(--text-dim)' }

// 买卖五档盘口表（mockup）：卖五~卖一在上、买一~买五在下，附委比/内外盘
export default function OrderBookTable({ data }) {
  const { asks, bids, ratio, inner, outer } = data
  return (
    <div style={{ maxWidth: 320 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {asks.map((r) => (
            <tr data-role="ask" key={r.label} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={labelCell}>{r.label}</td>
              <td style={{ ...cell, color: ASK, fontWeight: 700 }}>{r.price.toFixed(2)}</td>
              <td style={{ ...cell, color: 'var(--text-dim)', textAlign: 'right' }}>{r.vol}</td>
            </tr>
          ))}
          {bids.map((r) => (
            <tr data-role="bid" key={r.label} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={labelCell}>{r.label}</td>
              <td style={{ ...cell, color: BID, fontWeight: 700 }}>{r.price.toFixed(2)}</td>
              <td style={{ ...cell, color: 'var(--text-dim)', textAlign: 'right' }}>{r.vol}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--text-dim)' }}>
        <span>委比 <b style={{ color: ratio >= 0 ? BID : ASK }}>{ratio > 0 ? '+' : ''}{ratio}%</b></span>
        <span>外盘 <b style={{ color: BID }}>{outer}</b></span>
        <span>内盘 <b style={{ color: ASK }}>{inner}</b></span>
      </div>
    </div>
  )
}
