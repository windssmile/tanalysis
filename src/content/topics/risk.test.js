import { describe, it, expect } from 'vitest'
import { riskTopics } from './risk.js'

describe('risk topics', () => {
  it('包含 4 个条目', () => {
    expect(riskTopics).toHaveLength(4)
  })
  it('全部 category 为 risk', () => {
    for (const t of riskTopics) expect(t.category).toBe('risk')
  })
  it('每个条目含必填 sections 字段与 metrics/quant/pitfalls 小节', () => {
    for (const t of riskTopics) {
      expect(t.sections.meaning).toBeTruthy()
      expect(Array.isArray(t.sections.identify)).toBe(true)
      expect(Array.isArray(t.sections.usage)).toBe(true)
      expect(t.sections.limitation).toBeTruthy()
      expect(Array.isArray(t.sections.metrics)).toBe(true)
      expect(Array.isArray(t.sections.quant)).toBe(true)
      expect(Array.isArray(t.sections.pitfalls)).toBe(true)
    }
  })
})
