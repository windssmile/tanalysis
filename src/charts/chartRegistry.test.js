import { describe, it, expect } from 'vitest'
import { getChart, hasChart } from './chartRegistry.js'

describe('chartRegistry', () => {
  it('K线类条目返回 CandleChart 渲染器', () => {
    expect(hasChart('bullish-engulfing')).toBe(true)
    const entry = getChart('bullish-engulfing')
    expect(typeof entry.Component).toBe('function')
    expect(entry.props.data.length).toBeGreaterThan(0)
  })
  it('指标条目返回各自图表组件', () => {
    expect(hasChart('macd')).toBe(true)
    expect(typeof getChart('macd').Component).toBe('function')
  })
  it('未知 chartId 返回 undefined', () => {
    expect(getChart('nope')).toBeUndefined()
    expect(hasChart('nope')).toBe(false)
  })
})
