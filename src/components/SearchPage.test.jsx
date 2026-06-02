import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SearchPage from './SearchPage.jsx'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/search" element={<SearchPage />} /></Routes>
    </MemoryRouter>
  )
}

describe('SearchPage', () => {
  it('按 q 展示命中条目（吞没）', () => {
    renderAt('/search?q=' + encodeURIComponent('吞没'))
    expect(screen.getAllByText(/吞没/).length).toBeGreaterThanOrEqual(1)
  })
  it('空 q 提示输入', () => {
    renderAt('/search')
    expect(screen.getByText(/搜索/)).toBeInTheDocument()
  })
  it('无结果显示空态', () => {
    renderAt('/search?q=zzzzzqqq')
    expect(screen.getByText(/没有匹配/)).toBeInTheDocument()
  })
})
