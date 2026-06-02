import { describe, it, expect } from 'vitest'
import { candlestickTopics } from './candlestick.js'

describe('candlestick topics', () => {
  it('包含 20 个条目', () => {
    expect(candlestickTopics).toHaveLength(20)
  })
  it('全部 category 为 candlestick', () => {
    for (const t of candlestickTopics) expect(t.category).toBe('candlestick')
  })
  it('每个条目含必填 sections 字段', () => {
    for (const t of candlestickTopics) {
      expect(t.sections.meaning).toBeTruthy()
      expect(Array.isArray(t.sections.identify)).toBe(true)
      expect(Array.isArray(t.sections.usage)).toBe(true)
      expect(t.sections.limitation).toBeTruthy()
    }
  })
  it('id 唯一', () => {
    const ids = candlestickTopics.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('每个条目含 metrics(量化刻画) 数组', () => {
    for (const t of candlestickTopics) {
      expect(Array.isArray(t.sections.metrics)).toBe(true)
      expect(t.sections.metrics.length).toBeGreaterThan(0)
    }
  })
  it('每个条目含 pitfalls(失效场景) 数组', () => {
    for (const t of candlestickTopics) {
      expect(Array.isArray(t.sections.pitfalls)).toBe(true)
      expect(t.sections.pitfalls.length).toBeGreaterThan(0)
    }
  })
})
