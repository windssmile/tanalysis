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
  it('↓ 键高亮第一个建议（aria-selected）', () => {
    render(<MemoryRouter><SearchBox /></MemoryRouter>)
    const box = screen.getByRole('searchbox')
    fireEvent.change(box, { target: { value: '吞没' } })
    fireEvent.keyDown(box, { key: 'ArrowDown' })
    const options = screen.getAllByRole('option')
    expect(options[0].getAttribute('aria-selected')).toBe('true')
  })
  it('未按方向键时无高亮项', () => {
    render(<MemoryRouter><SearchBox /></MemoryRouter>)
    const box = screen.getByRole('searchbox')
    fireEvent.change(box, { target: { value: '吞没' } })
    const options = screen.getAllByRole('option')
    expect(options.every((o) => o.getAttribute('aria-selected') === 'false')).toBe(true)
  })
})
