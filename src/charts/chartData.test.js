import { describe, it, expect } from 'vitest'
import { chartData } from './chartData.js'

const ids = [
  'kline-basics', 'hammer', 'doji', 'bullish-engulfing',
  'bearish-engulfing', 'morning-star', 'ma', 'macd', 'kdj',
  'rsi', 'boll',
]

describe('chartData', () => {
  it('覆盖全部指标与 K线条目', () => {
    for (const id of ids) expect(chartData[id]).toBeDefined()
  })
  it('每个条目含非空 candles 数组，且每根有 o/h/l/c', () => {
    for (const id of ids) {
      const candles = chartData[id].candles
      expect(Array.isArray(candles)).toBe(true)
      expect(candles.length).toBeGreaterThan(0)
      for (const c of candles) {
        for (const k of ['o', 'h', 'l', 'c']) expect(typeof c[k]).toBe('number')
        expect(c.h).toBeGreaterThanOrEqual(Math.max(c.o, c.c))
        expect(c.l).toBeLessThanOrEqual(Math.min(c.o, c.c))
      }
    }
  })
})
