import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SearchBox from './SearchBox.jsx'

describe('SearchBox', () => {
  it('渲染搜索输入框', () => {
    render(<MemoryRouter><SearchBox /></MemoryRouter>)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })
  it('输入后显示实时下拉建议', () => {
    render(<MemoryRouter><SearchBox /></MemoryRouter>)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '吞没' } })
    const suggest = screen.getByRole('listbox')
    expect(suggest).toBeInTheDocument()
    expect(screen.getAllByText(/吞没/).length).toBeGreaterThanOrEqual(1)
  })
  it('空输入不显示下拉', () => {
    render(<MemoryRouter><SearchBox /></MemoryRouter>)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
