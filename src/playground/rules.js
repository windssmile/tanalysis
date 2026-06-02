import { sma, rsi } from '../charts/indicators/calc.js'

const maCross = {
  id: 'ma-cross',
  name: 'MA 金叉/死叉',
  params: [
    { key: 'fast', label: '快线周期', min: 2, max: 20, step: 1, default: 5 },
    { key: 'slow', label: '慢线周期', min: 5, max: 60, step: 1, default: 20 },
  ],
  signal(series, { fast, slow }) {
    const closes = series.map((b) => b.c)
    const f = sma(closes, fast)
    const s = sma(closes, slow)
    const entries = []
    const exits = []
    for (let i = 1; i < closes.length; i++) {
      if (f[i] == null || s[i] == null || f[i - 1] == null || s[i - 1] == null) continue
      if (f[i - 1] <= s[i - 1] && f[i] > s[i]) entries.push(i)
      else if (f[i - 1] >= s[i - 1] && f[i] < s[i]) exits.push(i)
    }
    return { entries, exits }
  },
}

const rsiThreshold = {
  id: 'rsi-threshold',
  name: 'RSI 超买超卖',
  params: [
    { key: 'period', label: 'RSI 周期', min: 3, max: 30, step: 1, default: 14 },
    { key: 'lower', label: '超卖阈值', min: 10, max: 45, step: 1, default: 30 },
    { key: 'upper', label: '超买阈值', min: 55, max: 90, step: 1, default: 70 },
  ],
  signal(series, { period, lower, upper }) {
    const r = rsi(series.map((b) => b.c), period)
    const entries = []
    const exits = []
    for (let i = 0; i < r.length; i++) {
      if (r[i] == null) continue
      if (r[i] < lower) entries.push(i)
      else if (r[i] > upper) exits.push(i)
    }
    return { entries, exits }
  },
}

const bullishEngulfing = {
  id: 'bullish-engulfing',
  name: '看涨吞没',
  params: [{ key: 'holdN', label: '持有根数', min: 1, max: 20, step: 1, default: 5 }],
  signal(series, { holdN }) {
    const entries = []
    const exits = []
    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1]
      const cur = series[i]
      const prevBear = prev.c < prev.o
      const curBull = cur.c > cur.o
      const engulf = cur.o <= prev.c && cur.c >= prev.o
      if (prevBear && curBull && engulf) {
        entries.push(i)
        exits.push(Math.min(i + holdN, series.length - 1))
      }
    }
    return { entries, exits }
  },
}

export const rules = [maCross, rsiThreshold, bullishEngulfing]

export function getRule(id) {
  return rules.find((r) => r.id === id)
}
