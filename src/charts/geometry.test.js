import { describe, it, expect } from 'vitest'
import { isBullish, candleColor, scaleY, layoutCandles } from './geometry.js'

const UP = '#f43f5e'
const DOWN = '#22c55e'

describe('geometry', () => {
  it('收盘≥开盘为阳线(上涨)', () => {
    expect(isBullish({ o: 10, c: 12 })).toBe(true)
    expect(isBullish({ o: 12, c: 10 })).toBe(false)
  })
  it('阳线红色、阴线绿色（A股习惯）', () => {
    expect(candleColor({ o: 10, c: 12 }, UP, DOWN)).toBe(UP)
    expect(candleColor({ o: 12, c: 10 }, UP, DOWN)).toBe(DOWN)
  })
  it('scaleY 将价格线性映射到像素，高价对应小 y', () => {
    const y = scaleY(20, { min: 10, max: 20, height: 100, pad: 0 })
    expect(y).toBeCloseTo(0)
    expect(scaleY(10, { min: 10, max: 20, height: 100, pad: 0 })).toBeCloseTo(100)
    expect(scaleY(15, { min: 10, max: 20, height: 100, pad: 0 })).toBeCloseTo(50)
  })
  it('layoutCandles 计算每根的 x/实体/影线坐标', () => {
    const data = [{ o: 10, h: 13, l: 9, c: 12 }, { o: 12, h: 14, l: 8, c: 9 }]
    const out = layoutCandles(data, { width: 200, height: 100, pad: 0 })
    expect(out).toHaveLength(2)
    expect(out[0]).toHaveProperty('x')
    expect(out[0]).toHaveProperty('bodyY')
    expect(out[0]).toHaveProperty('bodyH')
    expect(out[0]).toHaveProperty('highY')
    expect(out[0]).toHaveProperty('lowY')
    expect(out[0].bodyY).toBeLessThan(out[0].bodyY + out[0].bodyH)
  })
})
