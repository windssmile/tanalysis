import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'

describe('Nav', () => {
  it('渲染品牌名与已启用板块链接', () => {
    render(<MemoryRouter><Nav /></MemoryRouter>)
    expect(screen.getByText('技术分析图谱')).toBeInTheDocument()
    expect(screen.getByText('K线基础')).toBeInTheDocument()
    expect(screen.getByText('技术指标')).toBeInTheDocument()
    expect(screen.getByText('经典形态')).toBeInTheDocument()
    expect(screen.queryByText('趋势理论')).not.toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('显示免责声明', () => {
    render(<Footer />)
    expect(screen.getByText(/不构成任何投资建议/)).toBeInTheDocument()
  })
})
