import { describe, it, expect } from 'vitest'
import { sma, ema, macd, kdj, rsi, boll, obv, bias, dmi } from './calc.js'

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
  it('rsi 前 period 个为 null，单调上涨序列为 100', () => {
    const closes = [1, 2, 3, 4, 5, 6]
    const out = rsi(closes, 3)
    expect(out).toHaveLength(6)
    expect(out.slice(0, 3)).toEqual([null, null, null])
    expect(out[3]).toBe(100)
    expect(out[5]).toBe(100)
  })
  it('rsi 单调下跌序列为 0', () => {
    const out = rsi([6, 5, 4, 3, 2, 1], 3)
    expect(out[3]).toBe(0)
  })
  it('boll 返回等长 mid/upper/lower；恒定序列上下轨等于中轨', () => {
    const closes = [10, 10, 10, 10, 10]
    const { mid, upper, lower } = boll(closes, 3, 2)
    expect(mid).toHaveLength(5)
    expect(mid.slice(0, 2)).toEqual([null, null])
    expect(mid[2]).toBe(10)
    expect(upper[2]).toBe(10)
    expect(lower[2]).toBe(10)
  })
  it('boll 上轨高于中轨、下轨低于中轨（有波动时）', () => {
    const { mid, upper, lower } = boll([8, 12, 9, 13, 10, 14], 3, 2)
    const i = 5
    expect(upper[i]).toBeGreaterThan(mid[i])
    expect(lower[i]).toBeLessThan(mid[i])
  })
  it('obv 随收盘涨跌累加/减去成交量', () => {
    const data = [
      { c: 10, v: 100 },
      { c: 11, v: 50 }, // 涨：+50
      { c: 10, v: 30 }, // 跌：-30
      { c: 10, v: 40 }, // 平：不变
    ]
    expect(obv(data)).toEqual([0, 50, 20, 20])
  })
  it('bias 乖离率：前 n-1 个为 null，等于 (收-MA)/MA*100', () => {
    const out = bias([10, 10, 13], 3)
    expect(out.slice(0, 2)).toEqual([null, null])
    // MA3 = 11, bias =(13-11)/11*100
    expect(out[2]).toBeCloseTo((2 / 11) * 100, 6)
  })
  it('dmi 强上涨中 +DI 大于 -DI', () => {
    const data = Array.from({ length: 40 }, (_, i) => ({
      h: 10 + i + 0.5,
      l: 10 + i - 0.5,
      c: 10 + i,
    }))
    const { pdi, mdi, adx } = dmi(data, 14)
    expect(pdi).toHaveLength(40)
    expect(mdi).toHaveLength(40)
    expect(adx).toHaveLength(40)
    const last = 39
    expect(pdi[last]).toBeGreaterThan(mdi[last])
    expect(adx[last]).toBeGreaterThan(20)
  })
})
