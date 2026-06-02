import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import CandleChart from './CandleChart.jsx'

const data = [
  { o: 10, h: 13, l: 9, c: 12 },
  { o: 12, h: 14, l: 8, c: 9 },
]

describe('CandleChart', () => {
  it('为每根 K线渲染实体与影线', () => {
    const { container } = render(<CandleChart data={data} />)
    const bodies = container.querySelectorAll('rect[data-role="body"]')
    expect(bodies).toHaveLength(2)
    const wicks = container.querySelectorAll('line[data-role="wick"]')
    expect(wicks).toHaveLength(2)
  })
  it('阳线用红色、阴线用绿色', () => {
    const { container } = render(<CandleChart data={data} />)
    const bodies = container.querySelectorAll('rect[data-role="body"]')
    expect(bodies[0].getAttribute('fill')).toBe('#f43f5e') // 阳
    expect(bodies[1].getAttribute('fill')).toBe('#22c55e') // 阴
  })
  it('渲染高亮区域标注', () => {
    const { container } = render(
      <CandleChart data={data} annotations={[{ type: 'box', from: 0, to: 1, label: '吞没区' }]} />
    )
    expect(container.querySelector('rect[data-role="box"]')).toBeTruthy()
  })
  it('渲染水平参考线标注', () => {
    const { getByText, container } = render(
      <CandleChart data={data} annotations={[{ type: 'line', price: 11, label: '颈线' }]} />
    )
    expect(container.querySelector('line[data-role="hline"]')).toBeTruthy()
    expect(getByText('颈线')).toBeTruthy()
  })
  it('渲染斜趋势线标注', () => {
    const { getByText, container } = render(
      <CandleChart
        data={data}
        annotations={[{ type: 'trendline', from: { i: 0, price: 9 }, to: { i: 1, price: 13 }, label: '上升趋势线' }]}
      />
    )
    expect(container.querySelector('line[data-role="trendline"]')).toBeTruthy()
    expect(getByText('上升趋势线')).toBeTruthy()
  })
  it('渲染 marker 买卖点（买红卖绿，带 data-dir）', () => {
    const data = [
      { o: 10, h: 11, l: 9, c: 10 },
      { o: 10, h: 12, l: 9, c: 11 },
      { o: 11, h: 12, l: 10, c: 10 },
    ]
    const { container } = render(
      <CandleChart data={data} annotations={[
        { type: 'marker', index: 1, dir: 'buy' },
        { type: 'marker', index: 2, dir: 'sell' },
      ]} />
    )
    const markers = container.querySelectorAll('[data-role="marker"]')
    expect(markers).toHaveLength(2)
    const buy = container.querySelector('[data-role="marker"][data-dir="buy"]')
    const sell = container.querySelector('[data-role="marker"][data-dir="sell"]')
    expect(buy.getAttribute('fill')).toBe('#f43f5e')
    expect(sell.getAttribute('fill')).toBe('#22c55e')
  })
})
