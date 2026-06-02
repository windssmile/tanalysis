import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import TopicPage from './TopicPage.jsx'
import * as topicsModule from '../content/topics/index.js'

// 让 getTopic 默认走真实实现，仅在需要时按调用覆盖返回值，
// 这样其余依赖真实条目的用例不受影响。
vi.mock('../content/topics/index.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getTopic: vi.fn(actual.getTopic),
  }
})

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
  it('含 pitfalls 字段的条目渲染"何时会失效"', () => {
    renderAt('/risk/false-breakout')
    expect(screen.getByText('何时会失效')).toBeInTheDocument()
  })
  it('无 pitfalls 字段的条目不渲染"何时会失效"（使用 mock，不依赖真实内容）', () => {
    const fakeTopic = {
      id: 'fake',
      category: 'candlestick',
      title: '假条目',
      subtitle: '仅用于测试',
      tags: ['测试'],
      chartId: undefined,
      sections: {
        meaning: '含义文本',
        identify: ['识别要点一'],
        usage: ['使用提示一'],
        limitation: '局限文本',
        // 故意不包含 pitfalls
      },
      related: [],
    }
    vi.mocked(topicsModule.getTopic).mockReturnValueOnce(fakeTopic)
    renderAt('/candlestick/fake')
    expect(screen.getByRole('heading', { name: '假条目' })).toBeInTheDocument()
    expect(screen.queryByText('何时会失效')).not.toBeInTheDocument()
  })
  it('渲染延伸阅读链接', () => {
    renderAt('/candlestick/bullish-engulfing')
    expect(screen.getByText(/延伸阅读/)).toBeInTheDocument()
    // 看跌吞没 可能出现在侧栏和延伸阅读中，用 getAllByText
    expect(screen.getAllByText('看跌吞没').length).toBeGreaterThanOrEqual(1)
  })
  it('正文「含义」里的术语自动链到 /glossary', () => {
    const { container } = renderAt('/volume/volume-breakout')
    expect(container.querySelector('a[href="/glossary"]')).toBeInTheDocument()
  })
  it('未知条目显示未找到', () => {
    renderAt('/candlestick/nope')
    expect(screen.getByText(/未找到/)).toBeInTheDocument()
  })
})
