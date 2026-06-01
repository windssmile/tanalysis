import { describe, it, expect } from 'vitest'
import { indicatorTopics } from './indicator.js'

describe('indicator topics', () => {
  it('包含 5 个条目', () => {
    expect(indicatorTopics).toHaveLength(5)
  })
  it('全部 category 为 indicator 且含 formula 字段', () => {
    for (const t of indicatorTopics) {
      expect(t.category).toBe('indicator')
      expect(t.sections.formula).toBeTruthy()
    }
  })
  it('必填 sections 字段齐全', () => {
    for (const t of indicatorTopics) {
      expect(t.sections.meaning).toBeTruthy()
      expect(Array.isArray(t.sections.identify)).toBe(true)
      expect(Array.isArray(t.sections.usage)).toBe(true)
      expect(t.sections.limitation).toBeTruthy()
    }
  })
})
