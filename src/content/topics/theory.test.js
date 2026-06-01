import { describe, it, expect } from 'vitest'
import { theoryTopics } from './theory.js'

describe('theory topics', () => {
  it('包含 4 个条目', () => {
    expect(theoryTopics).toHaveLength(4)
  })
  it('全部 category 为 theory', () => {
    for (const t of theoryTopics) expect(t.category).toBe('theory')
  })
  it('每个条目含必填 sections 字段', () => {
    for (const t of theoryTopics) {
      expect(t.sections.meaning).toBeTruthy()
      expect(Array.isArray(t.sections.identify)).toBe(true)
      expect(Array.isArray(t.sections.usage)).toBe(true)
      expect(t.sections.limitation).toBeTruthy()
    }
  })
  it('趋势线条目含 quant(量化视角) 小节', () => {
    const t = theoryTopics.find((x) => x.id === 'trend-line')
    expect(Array.isArray(t.sections.quant)).toBe(true)
    expect(t.sections.quant.length).toBeGreaterThan(0)
  })
  it('趋势线/支撑压力/道氏理论含 metrics(量化刻画)', () => {
    for (const id of ['trend-line', 'support-resistance', 'dow-theory']) {
      const t = theoryTopics.find((x) => x.id === id)
      expect(Array.isArray(t.sections.metrics)).toBe(true)
      expect(t.sections.metrics.length).toBeGreaterThan(0)
    }
  })
})
