import { describe, it, expect } from 'vitest'
import { search } from './index.js'

describe('search', () => {
  it('空查询返回空数组', () => {
    expect(search('')).toEqual([])
    expect(search('   ')).toEqual([])
  })
  it('“吞没” 命中看涨吞没与看跌吞没两个条目', () => {
    const r = search('吞没')
    expect(r.some((x) => x.type === 'topic' && x.id === 'bullish-engulfing')).toBe(true)
    expect(r.some((x) => x.type === 'topic' && x.id === 'bearish-engulfing')).toBe(true)
  })
  it('“金叉” 命中术语结果', () => {
    const r = search('金叉')
    expect(r.some((x) => x.type === 'term' && x.title === '金叉')).toBe(true)
  })
  it('无意义查询返回空', () => {
    expect(search('zzzzzqqq')).toEqual([])
  })
  it('标题命中排在仅正文命中之前', () => {
    const r = search('吞没')
    const firstTopic = r.find((x) => x.type === 'topic')
    expect(['bullish-engulfing', 'bearish-engulfing']).toContain(firstTopic.id)
  })
  it('每个结果含 type/id/title/subtitle/path', () => {
    const r = search('金叉')
    for (const x of r) {
      expect(x).toHaveProperty('type')
      expect(x).toHaveProperty('id')
      expect(x).toHaveProperty('title')
      expect(x).toHaveProperty('subtitle')
      expect(typeof x.path).toBe('string')
    }
  })
  it('尊重 limit', () => {
    expect(search('的', 3).length).toBeLessThanOrEqual(3)
  })
})
