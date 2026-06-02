import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GlossaryText, { linkifyTerms } from './GlossaryText.jsx'

describe('linkifyTerms', () => {
  it('把首次出现的术语切成链接段', () => {
    const segs = linkifyTerms('出现金叉后回调', ['金叉'])
    expect(segs.some((s) => s.linked && s.text === '金叉')).toBe(true)
  })
  it('无术语时整段不链接', () => {
    const segs = linkifyTerms('普通文本', ['金叉'])
    expect(segs.every((s) => !s.linked)).toBe(true)
  })
  it('最长优先：术语只链一次', () => {
    const segs = linkifyTerms('金叉又金叉', ['金叉'])
    expect(segs.filter((s) => s.linked).length).toBe(1)
  })
})

describe('GlossaryText', () => {
  it('术语渲染为指向 /glossary 的链接', () => {
    render(<MemoryRouter><GlossaryText text="出现金叉信号" /></MemoryRouter>)
    const link = screen.getByText('金叉').closest('a')
    expect(link).toHaveAttribute('href', '/glossary')
  })
})
