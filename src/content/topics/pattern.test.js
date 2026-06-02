import { describe, it, expect } from 'vitest'
import { patternTopics } from './pattern.js'

describe('pattern topics', () => {
  it('包含 8 个条目', () => {
    expect(patternTopics).toHaveLength(8)
  })
  it('全部 category 为 pattern', () => {
    for (const t of patternTopics) expect(t.category).toBe('pattern')
  })
  it('每个条目含必填 sections 字段', () => {
    for (const t of patternTopics) {
      expect(t.sections.meaning).toBeTruthy()
      expect(Array.isArray(t.sections.identify)).toBe(true)
      expect(Array.isArray(t.sections.usage)).toBe(true)
      expect(t.sections.limitation).toBeTruthy()
    }
  })
  it('id 唯一', () => {
    const ids = patternTopics.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('每个条目含 metrics(量化刻画) 数组', () => {
    for (const t of patternTopics) {
      expect(Array.isArray(t.sections.metrics)).toBe(true)
      expect(t.sections.metrics.length).toBeGreaterThan(0)
    }
  })
  it('每个条目含 pitfalls(失效场景) 数组', () => {
    for (const t of patternTopics) {
      expect(Array.isArray(t.sections.pitfalls)).toBe(true)
      expect(t.sections.pitfalls.length).toBeGreaterThan(0)
    }
  })
})
