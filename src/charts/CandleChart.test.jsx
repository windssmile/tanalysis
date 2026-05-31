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
})
