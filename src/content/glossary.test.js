import { describe, it, expect } from 'vitest'
import { glossary } from './glossary.js'
import { allTopics } from './topics/index.js'

describe('glossary 术语表', () => {
  it('至少 16 个术语', () => {
    expect(glossary.length).toBeGreaterThanOrEqual(16)
  })
  it('term 唯一且 def 非空', () => {
    const terms = glossary.map((g) => g.term)
    expect(new Set(terms).size).toBe(terms.length)
    for (const g of glossary) expect(g.def).toBeTruthy()
  })
  it('related 只指向真实存在的 topic id', () => {
    const ids = new Set(allTopics.map((t) => t.id))
    for (const g of glossary) {
      for (const rid of g.related || []) {
        expect(ids.has(rid)).toBe(true)
      }
    }
  })
  it('包含核心术语 金叉/背离/止损', () => {
    const terms = glossary.map((g) => g.term)
    expect(terms).toContain('金叉')
    expect(terms).toContain('背离')
    expect(terms).toContain('止损')
  })
})
