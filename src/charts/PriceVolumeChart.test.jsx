import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import PriceVolumeChart from './PriceVolumeChart.jsx'

const data = [
  { o: 10, h: 11, l: 9.5, c: 10.8, v: 100 },
  { o: 10.8, h: 11.2, l: 10.3, c: 10.5, v: 60 },
  { o: 10.5, h: 12, l: 10.4, c: 11.9, v: 200 },
]

describe('PriceVolumeChart', () => {
  it('为每根 K线渲染实体与成交量柱', () => {
    const { container } = render(<PriceVolumeChart data={data} />)
    expect(container.querySelectorAll('rect[data-role="body"]')).toHaveLength(3)
    expect(container.querySelectorAll('rect[data-role="vol"]')).toHaveLength(3)
  })
  it('成交量柱按红涨绿跌上色', () => {
    const { container } = render(<PriceVolumeChart data={data} />)
    const vols = container.querySelectorAll('rect[data-role="vol"]')
    expect(vols[0].getAttribute('fill')).toBe('#f43f5e') // 阳：红
    expect(vols[1].getAttribute('fill')).toBe('#22c55e') // 阴：绿
  })
  it('highlight 标注强调指定柱（其余淡化）', () => {
    const { container } = render(
      <PriceVolumeChart data={data} annotations={[{ type: 'highlight', index: 2 }]} />
    )
    const groups = container.querySelectorAll('g[data-role="bar"]')
    expect(groups[2].getAttribute('opacity')).toBe('1')
    expect(Number(groups[0].getAttribute('opacity'))).toBeLessThan(1)
  })
})
