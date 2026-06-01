import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import MultiTimeframeChart from './MultiTimeframeChart.jsx'

const weekly = [
  { o: 10, h: 11, l: 9.8, c: 10.8 },
  { o: 10.8, h: 12, l: 10.5, c: 11.8 },
]
const daily = [
  { o: 11.8, h: 12, l: 11.4, c: 11.5 },
  { o: 11.5, h: 12.2, l: 11.4, c: 12.1 },
]

describe('MultiTimeframeChart', () => {
  it('渲染周线与日线两个面板', () => {
    const { container } = render(<MultiTimeframeChart data={daily} weekly={weekly} />)
    expect(container.querySelectorAll('svg')).toHaveLength(2)
  })
  it('两个面板都画出 K线实体', () => {
    const { container } = render(<MultiTimeframeChart data={daily} weekly={weekly} />)
    expect(container.querySelectorAll('rect[data-role="body"]')).toHaveLength(4)
  })
})
