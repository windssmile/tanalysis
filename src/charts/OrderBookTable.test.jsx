import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrderBookTable from './OrderBookTable.jsx'

const data = {
  asks: [
    { label: '卖五', price: 10.25, vol: 320 },
    { label: '卖四', price: 10.24, vol: 180 },
    { label: '卖三', price: 10.23, vol: 90 },
    { label: '卖二', price: 10.22, vol: 150 },
    { label: '卖一', price: 10.21, vol: 60 },
  ],
  bids: [
    { label: '买一', price: 10.2, vol: 240 },
    { label: '买二', price: 10.19, vol: 130 },
    { label: '买三', price: 10.18, vol: 200 },
    { label: '买四', price: 10.17, vol: 110 },
    { label: '买五', price: 10.16, vol: 80 },
  ],
  ratio: 12.5,
  inner: 3200,
  outer: 4100,
}

describe('OrderBookTable', () => {
  it('渲染五档卖盘与五档买盘共 10 行', () => {
    const { container } = render(<OrderBookTable data={data} />)
    expect(container.querySelectorAll('tr[data-role="ask"]')).toHaveLength(5)
    expect(container.querySelectorAll('tr[data-role="bid"]')).toHaveLength(5)
  })
  it('显示委比与内外盘', () => {
    render(<OrderBookTable data={data} />)
    expect(screen.getByText(/委比/)).toBeInTheDocument()
    expect(screen.getByText(/外盘/)).toBeInTheDocument()
    expect(screen.getByText(/内盘/)).toBeInTheDocument()
  })
})
