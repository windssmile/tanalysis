import { describe, it, expect } from 'vitest'
import { genSeries, syntheticSource } from './dataGen.js'

const REGIMES = ['trend', 'range', 'reversal', 'random']

describe('genSeries', () => {
  it('默认生成 240 根', () => {
    expect(genSeries('trend')).toHaveLength(240)
  })
  it('每根满足 OHLC 不变式且为正', () => {
    for (const regime of REGIMES) {
      for (const b of genSeries(regime, 1, 120)) {
        expect(b.h).toBeGreaterThanOrEqual(Math.max(b.o, b.c))
        expect(b.l).toBeLessThanOrEqual(Math.min(b.o, b.c))
        expect(b.o).toBeGreaterThan(0)
        expect(b.c).toBeGreaterThan(0)
        expect(b.v).toBeGreaterThan(0)
      }
    }
  })
  it('同 seed 可复现，异 seed 不同', () => {
    expect(genSeries('trend', 1)).toEqual(genSeries('trend', 1))
    expect(genSeries('trend', 1)).not.toEqual(genSeries('trend', 2))
  })
  it('不同 regime 产生不同序列', () => {
    expect(genSeries('trend', 1)).not.toEqual(genSeries('range', 1))
  })
})

describe('syntheticSource (DataSource 接口)', () => {
  it('有 id/label，load() 返回与 genSeries 一致的数据', async () => {
    const src = syntheticSource('trend', 5)
    expect(typeof src.id).toBe('string')
    expect(typeof src.label).toBe('string')
    const bars = await src.load()
    expect(bars).toEqual(genSeries('trend', 5))
  })
})
