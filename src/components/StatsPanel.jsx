const pct = (x) => `${(x * 100).toFixed(1)}%`

export default function StatsPanel({ strategy, control }) {
  const rows = [
    { key: 'count', label: '交易次数', fmt: (s) => String(s.count) },
    { key: 'winRate', label: '胜率', fmt: (s) => pct(s.winRate) },
    { key: 'expectancy', label: '期望值/笔', fmt: (s) => pct(s.expectancy) },
    { key: 'totalReturn', label: '累计收益(计入成本)', fmt: (s) => pct(s.totalReturn) },
  ]
  return (
    <table data-role="stats-panel" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: 8, color: 'var(--text-dim)' }}>指标</th>
          <th style={{ padding: 8, color: 'var(--text-dim)' }}>本策略</th>
          <th style={{ padding: 8, color: 'var(--text-dim)' }}>随机对照组</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} data-role="stats-row" style={{ borderTop: '1px solid var(--border)' }}>
            <td style={{ padding: 8, color: 'var(--text-dim)' }}>{r.label}</td>
            <td style={{ padding: 8, textAlign: 'center', fontWeight: 700 }}>{r.fmt(strategy)}</td>
            <td style={{ padding: 8, textAlign: 'center', color: 'var(--text-mute)' }}>{control ? r.fmt(control) : '—'}</td>
          </tr>
        ))}
        <tr data-role="stats-row" style={{ borderTop: '1px solid var(--border-strong)' }}>
          <td style={{ padding: 8, color: 'var(--text-dim)' }}>本策略数据·买入持有</td>
          <td colSpan={2} style={{ padding: 8, textAlign: 'center', color: 'var(--primary-text)' }}>
            {pct(strategy.buyHoldReturn)}
          </td>
        </tr>
      </tbody>
    </table>
  )
}
