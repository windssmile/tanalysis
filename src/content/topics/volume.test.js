import { describe, it, expect } from 'vitest'
import { volumeTopics } from './volume.js'

describe('volume topics', () => {
  it('包含 4 个条目', () => {
    expect(volumeTopics).toHaveLength(4)
  })
  it('全部 category 为 volume', () => {
    for (const t of volumeTopics) expect(t.category).toBe('volume')
  })
  it('每个条目含必填 sections 字段与 quant 小节', () => {
    for (const t of volumeTopics) {
      expect(t.sections.meaning).toBeTruthy()
      expect(Array.isArray(t.sections.identify)).toBe(true)
      expect(Array.isArray(t.sections.usage)).toBe(true)
      expect(t.sections.limitation).toBeTruthy()
      expect(Array.isArray(t.sections.quant)).toBe(true)
      expect(Array.isArray(t.sections.metrics)).toBe(true)
    }
  })
})
