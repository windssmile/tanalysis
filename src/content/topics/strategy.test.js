import { describe, it, expect } from 'vitest'
import { strategyTopics } from './strategy.js'

describe('strategy topics', () => {
  it('包含 5 个条目', () => {
    expect(strategyTopics).toHaveLength(5)
  })
  it('全部 category 为 strategy', () => {
    for (const t of strategyTopics) expect(t.category).toBe('strategy')
  })
  it('每个条目含必填 sections 字段与 metrics/quant 小节', () => {
    for (const t of strategyTopics) {
      expect(t.sections.meaning).toBeTruthy()
      expect(Array.isArray(t.sections.identify)).toBe(true)
      expect(Array.isArray(t.sections.usage)).toBe(true)
      expect(t.sections.limitation).toBeTruthy()
      expect(Array.isArray(t.sections.metrics)).toBe(true)
      expect(Array.isArray(t.sections.quant)).toBe(true)
    }
  })
  it('每个条目含 pitfalls(失效场景) 数组', () => {
    for (const t of strategyTopics) {
      expect(Array.isArray(t.sections.pitfalls)).toBe(true)
      expect(t.sections.pitfalls.length).toBeGreaterThan(0)
    }
  })
})
