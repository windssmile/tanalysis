import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GlossaryPage from './GlossaryPage.jsx'
import { glossary } from '../content/glossary.js'

describe('GlossaryPage', () => {
  it('渲染全部术语', () => {
    const { container } = render(<MemoryRouter><GlossaryPage /></MemoryRouter>)
    expect(container.querySelectorAll('[data-role="glossary-item"]').length).toBe(glossary.length)
  })
  it('展示术语「金叉」', () => {
    render(<MemoryRouter><GlossaryPage /></MemoryRouter>)
    expect(screen.getByText('金叉')).toBeInTheDocument()
  })
})
