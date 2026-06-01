import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage.jsx'

describe('HomePage', () => {
  it('渲染全部 7 个板块卡片', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText('K线基础')).toBeInTheDocument()
    expect(screen.getByText('量价关系')).toBeInTheDocument()
  })
  it('已启用板块为链接，未启用显示"敬请期待"', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    const enabled = screen.getByText('K线基础').closest('a')
    expect(enabled).toHaveAttribute('href', '/candlestick')
    expect(screen.getAllByText('敬请期待').length).toBe(1)
  })
})
