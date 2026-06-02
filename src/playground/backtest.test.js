import { describe, it, expect } from 'vitest'
import { run } from './backtest.js'

const bars = (closes) => closes.map((c) => ({ o: c, h: c, l: c, c, v: 1 }))

describe('backtest run', () => {
  it('单笔盈利，零成本', () => {
    const { trades, stats } = run(bars([100, 110, 105, 120]), { entries: [0], exits: [3] }, { costBps: 0 })
    expect(trades).toHaveLength(1)
    expect(trades[0].grossReturn).toBeCloseTo(0.2, 10)
    expect(stats.count).toBe(1)
    expect(stats.winRate).toBeCloseTo(1, 10)
    expect(stats.expectancy).toBeCloseTo(0.2, 10)
    expect(stats.totalReturn).toBeCloseTo(0.2, 10)
    expect(stats.buyHoldReturn).toBeCloseTo(0.2, 10)
  })
  it('计入成本：每边 50bps → 单笔净收益 0.2-0.01=0.19', () => {
    const { stats } = run(bars([100, 110, 105, 120]), { entries: [0], exits: [3] }, { costBps: 50 })
    expect(stats.expectancy).toBeCloseTo(0.19, 10)
  })
  it('两笔一盈一亏，胜率/期望/复利累计正确', () => {
    const { stats } = run(bars([100, 120, 120, 90]), { entries: [0, 2], exits: [1, 3] }, { costBps: 0 })
    expect(stats.count).toBe(2)
    expect(stats.winRate).toBeCloseTo(0.5, 10)
    expect(stats.avgWin).toBeCloseTo(0.2, 10)
    expect(stats.avgLoss).toBeCloseTo(-0.25, 10)
    expect(stats.expectancy).toBeCloseTo((0.2 - 0.25) / 2, 10)
    expect(stats.totalReturn).toBeCloseTo(1.2 * 0.75 - 1, 10)
    expect(stats.buyHoldReturn).toBeCloseTo(-0.1, 10)
  })
  it('long 时忽略重复 entry；flat 时忽略 exit', () => {
    const { trades } = run(bars([100, 105, 110]), { entries: [0, 1], exits: [2] }, { costBps: 0 })
    expect(trades).toHaveLength(1)
    expect(trades[0].entryIdx).toBe(0)
    expect(trades[0].exitIdx).toBe(2)
  })
  it('无信号：count=0，期望/胜率为0，buyHold 仍计算', () => {
    const { stats } = run(bars([100, 90, 80]), { entries: [], exits: [] }, { costBps: 0 })
    expect(stats.count).toBe(0)
    expect(stats.winRate).toBe(0)
    expect(stats.expectancy).toBe(0)
    expect(stats.totalReturn).toBe(0)
    expect(stats.buyHoldReturn).toBeCloseTo(-0.2, 10)
  })
})
