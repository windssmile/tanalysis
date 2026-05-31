import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TopicSidebar from './TopicSidebar.jsx'

describe('TopicSidebar', () => {
  it('列出同板块全部条目并高亮当前条目', () => {
    render(
      <MemoryRouter>
        <TopicSidebar category="candlestick" currentId="hammer" />
      </MemoryRouter>
    )
    expect(screen.getByText('看涨吞没')).toBeInTheDocument()
    const current = screen.getByText('锤子线')
    expect(current.className).toMatch(/active/)
  })
})
