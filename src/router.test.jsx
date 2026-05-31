import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from './router.jsx'

function renderAt(path) {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

describe('routing', () => {
  it('/ 渲染首页', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: '技术分析图谱' })).toBeInTheDocument()
  })
  it('/candlestick 渲染板块页', () => {
    renderAt('/candlestick')
    expect(screen.getByText('看涨吞没')).toBeInTheDocument()
  })
  it('/candlestick/macd 类目不匹配显示未找到', () => {
    renderAt('/candlestick/macd')
    expect(screen.getByText(/未找到/)).toBeInTheDocument()
  })
  it('完全未知路径显示 404', () => {
    renderAt('/totally/unknown/path')
    expect(screen.getByText(/页面不存在/)).toBeInTheDocument()
  })
})
