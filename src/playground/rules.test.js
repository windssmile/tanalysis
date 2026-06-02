import { describe, it, expect } from 'vitest'
import { rules, getRule } from './rules.js'

const bars = (closes) => closes.map((c, i) => ({
  o: i ? closes[i - 1] : c, h: Math.max(c, i ? closes[i - 1] : c) + 1,
  l: Math.min(c, i ? closes[i - 1] : c) - 1, c, v: 1000,
}))

describe('rules 注册表', () => {
  it('含三条规则 ma-cross / rsi-threshold / bullish-engulfing', () => {
    expect(rules.map((r) => r.id).sort()).toEqual(['bullish-engulfing', 'ma-cross', 'rsi-threshold'])
  })
  it('每条规则有 params(含 default) 与 signal 函数', () => {
    for (const r of rules) {
      expect(Array.isArray(r.params)).toBe(true)
      for (const p of r.params) expect(p).toHaveProperty('default')
      expect(typeof r.signal).toBe('function')
    }
  })
  it('getRule 按 id 取规则', () => {
    expect(getRule('ma-cross').id).toBe('ma-cross')
  })
})

describe('ma-cross signal', () => {
  it('快线上穿慢线给出 entry，下穿给出 exit', () => {
    const series = bars([10, 9, 8, 7, 8, 10, 12, 14, 12, 9, 7, 6])
    const sig = getRule('ma-cross').signal(series, { fast: 2, slow: 4 })
    expect(sig.entries.length).toBeGreaterThanOrEqual(1)
    expect(sig.exits.length).toBeGreaterThanOrEqual(1)
    expect(Math.min(...sig.entries)).toBeLessThan(Math.max(...sig.exits))
  })
})

describe('rsi-threshold signal', () => {
  it('超卖给 entry、超买给 exit', () => {
    const downUp = [20, 18, 16, 14, 12, 10, 9, 8, 12, 16, 20, 24, 28, 32, 36, 40]
    const sig = getRule('rsi-threshold').signal(bars(downUp), { period: 5, lower: 30, upper: 70 })
    expect(sig.entries.length + sig.exits.length).toBeGreaterThan(0)
  })
})

describe('bullish-engulfing signal', () => {
  it('识别看涨吞没并在 holdN 根后退出', () => {
    const series = [
      { o: 10, h: 10.5, l: 9.5, c: 10, v: 1 },
      { o: 10, h: 10.2, l: 9, c: 9.2, v: 1 },
      { o: 9.2, h: 9.3, l: 8.6, c: 8.8, v: 1 },
      { o: 8.6, h: 9.6, l: 8.5, c: 9.5, v: 1 },
    ]
    const sig = getRule('bullish-engulfing').signal(series, { holdN: 2 })
    expect(sig.entries).toContain(3)
    expect(sig.exits).toContain(Math.min(3 + 2, series.length - 1))
  })
})
