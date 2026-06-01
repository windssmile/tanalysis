import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChipChart from './ChipChart.jsx'

const data = [
  { o: 10, h: 11, l: 9.5, c: 10.8, v: 100 },
  { o: 10.8, h: 11.2, l: 10.3, c: 10.5, v: 60 },
  { o: 10.5, h: 12, l: 10.4, c: 11.9, v: 200 },
]

describe('ChipChart', () => {
  it('按价位档渲染横向筹码柱', () => {
    const { container } = render(<ChipChart data={data} buckets={20} />)
    expect(container.querySelectorAll('rect[data-role="chip"]')).toHaveLength(20)
  })
  it('显示获利盘比例与现价', () => {
    render(<ChipChart data={data} />)
    expect(screen.getByText(/获利盘/)).toBeInTheDocument()
    expect(screen.getByText(/现价/)).toBeInTheDocument()
  })
})
