import { effectivenessMatrix } from '../content/effectiveness.js'

const RATING_LABEL = { high: '高', mid: '中', low: '低' }
// 中性色阶：故意不用 --up/--down（红绿在本站专指涨跌）
const RATING_STYLE = {
  high: { background: 'var(--primary)', color: '#fff' },
  mid: { background: 'var(--primary-soft)', color: 'var(--primary-text)' },
  low: { background: 'var(--surface-2)', color: 'var(--text-mute)' },
}

export default function EffectivenessMatrix() {
  const { columns, rows } = effectivenessMatrix
  return (
    <div>
      <h1 style={{ fontSize: 26 }}>适用性矩阵</h1>
      <p
        data-role="matrix-disclaimer"
        style={{
          color: 'var(--text-dim)', background: 'var(--surface)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, marginTop: 8,
        }}
      >
        本表为<strong style={{ color: 'var(--warn)' }}>定性经验判断，非统计结论</strong>。同一工具在不同市场状态下有效性差异很大；
        评级配色用中性色（与红涨绿跌无关）。真实有效性需用真实行情回测验证（见后续 playground）。
      </p>
      <div style={{ overflowX: 'auto', marginTop: 16 }}>
        <table
          data-role="matrix-table"
          style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640 }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 10, color: 'var(--text-dim)' }}>工具 / 方法</th>
              {columns.map((c) => (
                <th key={c.id} data-role="matrix-col" style={{ padding: 10, color: 'var(--text-dim)' }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} data-role="matrix-row" style={{ borderTop: '1px solid var(--border)' }}>
                <th scope="row" style={{ textAlign: 'left', padding: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {r.label}
                </th>
                {columns.map((c) => {
                  const rating = r.ratings[c.id]
                  return (
                    <td
                      key={c.id}
                      data-role="matrix-cell"
                      data-rating={rating}
                      style={{ padding: 10, verticalAlign: 'top', minWidth: 160 }}
                    >
                      <span
                        style={{
                          ...RATING_STYLE[rating],
                          display: 'inline-block', fontSize: 12, fontWeight: 700,
                          padding: '2px 10px', borderRadius: 20,
                        }}
                      >
                        {RATING_LABEL[rating]}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 6 }}>
                        {r.notes[c.id]}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
