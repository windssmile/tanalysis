import { describe, it, expect } from 'vitest'
import { allTopics, getTopic, topicsByCategory } from './topics/index.js'
import { validateTopic, validateAll } from './validate.js'
import { hasChart } from '../charts/chartRegistry.js'
import { getCategory } from './categories.js'

describe('topics index', () => {
  it('汇总 11 个条目', () => {
    expect(allTopics).toHaveLength(11)
  })
  it('getTopic 按 id 返回，未知返回 undefined', () => {
    expect(getTopic('macd').title).toBe('MACD')
    expect(getTopic('nope')).toBeUndefined()
  })
  it('topicsByCategory 按板块过滤', () => {
    expect(topicsByCategory('candlestick')).toHaveLength(6)
    expect(topicsByCategory('indicator')).toHaveLength(5)
  })
})

describe('validate', () => {
  it('每个条目的 chartId 在注册表中存在', () => {
    for (const t of allTopics) expect(hasChart(t.chartId)).toBe(true)
  })
  it('每个条目的 category 合法', () => {
    for (const t of allTopics) expect(getCategory(t.category)).toBeDefined()
  })
  it('每个条目的 related 指向真实存在的条目', () => {
    const ids = new Set(allTopics.map((t) => t.id))
    for (const t of allTopics) {
      for (const r of t.related || []) expect(ids.has(r)).toBe(true)
    }
  })
  it('validateAll 对当前数据返回无错误', () => {
    expect(validateAll(allTopics)).toEqual([])
  })
  it('validateTopic 捕获缺失字段', () => {
    const errors = validateTopic({ id: 'x', category: 'candlestick', chartId: 'hammer', sections: {} })
    expect(errors.length).toBeGreaterThan(0)
  })
})
