import { useMemo, useState } from 'react'
import { genSeries } from '../playground/dataGen.js'
import { rules, getRule } from '../playground/rules.js'
import { run } from '../playground/backtest.js'
import CandleChart from '../charts/CandleChart.jsx'
import StatsPanel from './StatsPanel.jsx'

const REGIMES = [
  { id: 'trend', label: '趋势市（单边）' },
  { id: 'range', label: '震荡市（箱体）' },
  { id: 'reversal', label: '反转市（倒V）' },
  { id: 'random', label: '随机游走（对照）' },
]

function defaultParams(rule) {
  const p = {}
  for (const item of rule.params) p[item.key] = item.default
  return p
}

export default function PlaygroundPage() {
  const [ruleId, setRuleId] = useState('ma-cross')
  const rule = getRule(ruleId)
  const [params, setParams] = useState(() => defaultParams(rule))
  const [regime, setRegime] = useState('trend')
  const [costBps, setCostBps] = useState(50)

  function onRuleChange(id) {
    setRuleId(id)
    setParams(defaultParams(getRule(id)))
  }

  const series = useMemo(() => genSeries(regime, 42), [regime])
  const control = useMemo(() => genSeries('random', 7), [])

  const signals = rule.signal(series, params)
  const result = run(series, signals, { costBps })
  const controlSignals = rule.signal(control, params)
  const controlResult = run(control, controlSignals, { costBps })

  const markers = [
    ...result.trades.map((t) => ({ type: 'marker', index: t.entryIdx, dir: 'buy' })),
    ...result.trades.map((t) => ({ type: 'marker', index: t.exitIdx, dir: 'sell' })),
  ]

  return (
    <div>
      <h1 style={{ fontSize: 26 }}>回测沙盘</h1>
      <p
        data-role="pg-disclaimer"
        style={{
          color: 'var(--text-dim)', background: 'var(--surface)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, marginTop: 8,
        }}
      >
        <strong style={{ color: 'var(--warn)' }}>合成数据仅演示计算方法，胜率系设计产物，不代表真实有效性。</strong>{' '}
        右侧「随机对照组」是同一规则在纯随机数据上的结果——若你的策略和它差不多，就说明"看似有效"只是错觉。切换市场情境，看同一规则胜率如何天差地别。
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: '16px 0' }}>
        <label>
          规则：
          <select value={ruleId} onChange={(e) => onRuleChange(e.target.value)}>
            {rules.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </label>
        <label>
          市场情境：
          <select value={regime} onChange={(e) => setRegime(e.target.value)}>
            {REGIMES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </label>
        <label>
          单边成本(bps)：
          <input type="number" min="0" max="200" value={costBps}
            onChange={(e) => setCostBps(Number(e.target.value) || 0)} style={{ width: 70 }} />
        </label>
        {rule.params.map((p) => (
          <label key={p.key}>
            {p.label}：
            <input
              type="number" min={p.min} max={p.max} step={p.step} value={params[p.key]}
              onChange={(e) => setParams((prev) => ({ ...prev, [p.key]: Number(e.target.value) }))}
              style={{ width: 70 }}
            />
          </label>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,1.4fr) minmax(240px,1fr)', gap: 20, alignItems: 'start' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 12 }}>
          <CandleChart data={series} annotations={markers} width={480} height={260} />
        </div>
        <StatsPanel strategy={result.stats} control={controlResult.stats} />
      </div>
    </div>
  )
}
