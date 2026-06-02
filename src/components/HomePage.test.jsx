import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage.jsx'

describe('HomePage', () => {
  it('渲染全部 8 个板块卡片', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText('K线基础')).toBeInTheDocument()
    expect(screen.getByText('量价关系')).toBeInTheDocument()
  })
  it('已启用板块为链接；当前全部启用，无"敬请期待"', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    const enabled = screen.getByText('K线基础').closest('a')
    expect(enabled).toHaveAttribute('href', '/candlestick')
    expect(screen.queryAllByText('敬请期待')).toHaveLength(0)
  })
  it('渲染工具入口（适用性矩阵）', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    const link = screen.getByText('适用性矩阵').closest('a')
    expect(link).toHaveAttribute('href', '/matrix')
  })
})
