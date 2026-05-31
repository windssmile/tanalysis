import { describe, it, expect } from 'vitest'
import { sma, ema, macd, kdj } from './calc.js'

describe('指标计算', () => {
  it('sma 简单移动平均，前 n-1 个为 null', () => {
    expect(sma([1, 2, 3, 4], 2)).toEqual([null, 1.5, 2.5, 3.5])
  })
  it('ema 指数移动平均，首值等于首个数据', () => {
    const out = ema([1, 2, 3], 2)
    expect(out[0]).toBe(1)
    // k = 2/(2+1)=0.6667; ema1 = 2*0.6667 + 1*0.3333 = 1.6667
    expect(out[1]).toBeCloseTo(1.6667, 3)
  })
  it('macd 返回 dif/dea/hist 等长数组', () => {
    const closes = Array.from({ length: 40 }, (_, i) => 10 + Math.sin(i / 3))
    const { dif, dea, hist } = macd(closes)
    expect(dif).toHaveLength(40)
    expect(dea).toHaveLength(40)
    expect(hist).toHaveLength(40)
    const idx = 39
    expect(hist[idx]).toBeCloseTo((dif[idx] - dea[idx]) * 2, 6)
  })
  it('kdj 返回 k/d/j 三线且在合理范围', () => {
    const data = Array.from({ length: 30 }, (_, i) => ({
      h: 12 + Math.sin(i / 2),
      l: 8 + Math.sin(i / 2),
      c: 10 + Math.sin(i / 2),
    }))
    const { k, d, j } = kdj(data)
    expect(k).toHaveLength(30)
    expect(d).toHaveLength(30)
    expect(j).toHaveLength(30)
    const last = 29
    expect(k[last]).toBeGreaterThanOrEqual(0)
    expect(k[last]).toBeLessThanOrEqual(100)
  })
})
