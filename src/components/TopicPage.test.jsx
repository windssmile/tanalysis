import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import TopicPage from './TopicPage.jsx'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/:category/:topic" element={<TopicPage />} /></Routes>
    </MemoryRouter>
  )
}

describe('TopicPage', () => {
  it('渲染标题、标签、含义、识别要点、局限', () => {
    renderAt('/candlestick/bullish-engulfing')
    expect(screen.getByRole('heading', { name: '看涨吞没' })).toBeInTheDocument()
    expect(screen.getByText('含义')).toBeInTheDocument()
    expect(screen.getByText('识别要点')).toBeInTheDocument()
    expect(screen.getByText('局限')).toBeInTheDocument()
    expect(screen.getByText(/震荡市中信号频繁/)).toBeInTheDocument()
  })
  it('指标条目额外渲染计算原理', () => {
    renderAt('/indicator/macd')
    expect(screen.getByText('计算原理')).toBeInTheDocument()
  })
  it('K线条目不渲染计算原理', () => {
    renderAt('/candlestick/hammer')
    expect(screen.queryByText('计算原理')).not.toBeInTheDocument()
  })
  it('含 metrics 字段的条目渲染量化刻画', () => {
    renderAt('/candlestick/hammer')
    expect(screen.getByText('量化刻画')).toBeInTheDocument()
  })
  it('含 quant 字段的条目渲染量化视角', () => {
    renderAt('/theory/trend-line')
    expect(screen.getByText('量化视角')).toBeInTheDocument()
  })
  it('无 quant 字段的条目不渲染量化视角', () => {
    renderAt('/candlestick/hammer')
    expect(screen.queryByText('量化视角')).not.toBeInTheDocument()
  })
  it('渲染延伸阅读链接', () => {
    renderAt('/candlestick/bullish-engulfing')
    expect(screen.getByText(/延伸阅读/)).toBeInTheDocument()
    // 看跌吞没 可能出现在侧栏和延伸阅读中，用 getAllByText
    expect(screen.getAllByText('看跌吞没').length).toBeGreaterThanOrEqual(1)
  })
  it('未知条目显示未找到', () => {
    renderAt('/candlestick/nope')
    expect(screen.getByText(/未找到/)).toBeInTheDocument()
  })
})
