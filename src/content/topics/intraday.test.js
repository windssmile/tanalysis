import { describe, it, expect } from 'vitest'
import { intradayTopics } from './intraday.js'

describe('intraday topics', () => {
  it('包含 4 个条目', () => {
    expect(intradayTopics).toHaveLength(4)
  })
  it('全部 category 为 intraday', () => {
    for (const t of intradayTopics) expect(t.category).toBe('intraday')
  })
  it('每个条目含必填 sections 字段与 metrics/quant 小节', () => {
    for (const t of intradayTopics) {
      expect(t.sections.meaning).toBeTruthy()
      expect(Array.isArray(t.sections.identify)).toBe(true)
      expect(Array.isArray(t.sections.usage)).toBe(true)
      expect(t.sections.limitation).toBeTruthy()
      expect(Array.isArray(t.sections.metrics)).toBe(true)
      expect(Array.isArray(t.sections.quant)).toBe(true)
    }
  })
  it('每个条目含 pitfalls(失效场景) 数组', () => {
    for (const t of intradayTopics) {
      expect(Array.isArray(t.sections.pitfalls)).toBe(true)
      expect(t.sections.pitfalls.length).toBeGreaterThan(0)
    }
  })
})
