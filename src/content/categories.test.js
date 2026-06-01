import { describe, it, expect } from 'vitest'
import { categories, getCategory, enabledCategories } from './categories.js'

describe('categories', () => {
  it('定义了全部 6 大板块', () => {
    expect(categories).toHaveLength(6)
  })
  it('已启用 candlestick、indicator 与 pattern', () => {
    expect(enabledCategories().map((c) => c.id)).toEqual(['candlestick', 'indicator', 'pattern'])
  })
  it('每个板块有 id/name/order/enabled 字段', () => {
    for (const c of categories) {
      expect(typeof c.id).toBe('string')
      expect(typeof c.name).toBe('string')
      expect(typeof c.order).toBe('number')
      expect(typeof c.enabled).toBe('boolean')
    }
  })
  it('order 唯一且按升序可排', () => {
    const orders = categories.map((c) => c.order)
    expect(new Set(orders).size).toBe(orders.length)
  })
  it('getCategory 按 id 返回，未知 id 返回 undefined', () => {
    expect(getCategory('candlestick').name).toBe('K线基础')
    expect(getCategory('nope')).toBeUndefined()
  })
})
