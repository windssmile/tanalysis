import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CategoryPage from './CategoryPage.jsx'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/:category" element={<CategoryPage />} /></Routes>
    </MemoryRouter>
  )
}

describe('CategoryPage', () => {
  it('展示该板块下所有条目卡片', () => {
    renderAt('/candlestick')
    expect(screen.getByText('看涨吞没')).toBeInTheDocument()
    expect(screen.getByText('锤子线')).toBeInTheDocument()
  })
  it('未知板块显示未找到提示', () => {
    renderAt('/nope')
    expect(screen.getByText(/未找到/)).toBeInTheDocument()
  })
})
