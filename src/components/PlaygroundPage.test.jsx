import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PlaygroundPage from './PlaygroundPage.jsx'

function setup() {
  return render(<MemoryRouter><PlaygroundPage /></MemoryRouter>)
}

describe('PlaygroundPage', () => {
  it('展示诚实免责声明（合成数据/不代表真实有效性）', () => {
    setup()
    expect(screen.getByText(/不代表真实有效性/)).toBeInTheDocument()
  })
  it('渲染规则选择器与三条规则选项', () => {
    setup()
    expect(screen.getByLabelText(/规则/)).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /MA 金叉/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /RSI/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /看涨吞没/ })).toBeInTheDocument()
  })
  it('渲染市场情境选择器（含随机）', () => {
    setup()
    expect(screen.getByLabelText(/市场情境/)).toBeInTheDocument()
  })
  it('渲染结果面板（StatsPanel）与图表', () => {
    const { container } = setup()
    expect(container.querySelector('[data-role="stats-panel"]')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
