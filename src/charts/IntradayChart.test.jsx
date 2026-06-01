import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import IntradayChart from './IntradayChart.jsx'

const data = {
  prevClose: 10,
  points: [
    { price: 10.1, avg: 10.05, vol: 100 },
    { price: 10.3, avg: 10.18, vol: 160 },
    { price: 9.9, avg: 10.05, vol: 120 },
    { price: 10.2, avg: 10.1, vol: 90 },
  ],
}

describe('IntradayChart', () => {
  it('渲染价格线、均价线与昨收基准线', () => {
    const { container } = render(<IntradayChart data={data} />)
    expect(container.querySelector('polyline[data-role="price"]')).toBeTruthy()
    expect(container.querySelector('polyline[data-role="avg"]')).toBeTruthy()
    expect(container.querySelector('line[data-role="prevclose"]')).toBeTruthy()
  })
  it('为每个分时点渲染量柱', () => {
    const { container } = render(<IntradayChart data={data} />)
    expect(container.querySelectorAll('rect[data-role="vol"]')).toHaveLength(4)
  })
  it('量柱按价格相对昨收红涨绿跌', () => {
    const { container } = render(<IntradayChart data={data} />)
    const vols = container.querySelectorAll('rect[data-role="vol"]')
    expect(vols[0].getAttribute('fill')).toBe('#f43f5e') // 10.1 > 10 涨：红
    expect(vols[2].getAttribute('fill')).toBe('#22c55e') // 9.9 < 10 跌：绿
  })
})
