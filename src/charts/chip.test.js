import { describe, it, expect } from 'vitest'
import { chipDistribution } from './chip.js'

const data = [
  { h: 11, l: 9, c: 10, v: 100 },
  { h: 12, l: 10, c: 11, v: 120 },
  { h: 13, l: 11, c: 12, v: 80 },
]

describe('chipDistribution', () => {
  it('返回指定数量的价位档，覆盖全程高低', () => {
    const { levels, min, max } = chipDistribution(data, 20)
    expect(levels).toHaveLength(20)
    expect(min).toBe(9)
    expect(max).toBe(13)
  })
  it('权重守恒：各档权重之和约等于总成交量', () => {
    const { levels } = chipDistribution(data, 20)
    const total = levels.reduce((s, l) => s + l.weight, 0)
    expect(total).toBeCloseTo(300, 5)
  })
  it('获利盘比例在 0~1 之间，且等于当前价下方筹码占比', () => {
    const { profitRatio } = chipDistribution(data, 20)
    expect(profitRatio).toBeGreaterThanOrEqual(0)
    expect(profitRatio).toBeLessThanOrEqual(1)
  })
})
