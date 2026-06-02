import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EffectivenessMatrix from './EffectivenessMatrix.jsx'
import { effectivenessMatrix } from '../content/effectiveness.js'

describe('EffectivenessMatrix', () => {
  it('渲染三列表头', () => {
    render(<EffectivenessMatrix />)
    expect(screen.getByText('趋势市（单边）')).toBeInTheDocument()
    expect(screen.getByText('震荡市（箱体）')).toBeInTheDocument()
    expect(screen.getByText('反转/拐点')).toBeInTheDocument()
  })
  it('渲染每个工具行', () => {
    const { container } = render(<EffectivenessMatrix />)
    expect(container.querySelectorAll('[data-role="matrix-row"]').length).toBe(
      effectivenessMatrix.rows.length
    )
  })
  it('单元格数 = 行数 × 列数', () => {
    const { container } = render(<EffectivenessMatrix />)
    expect(container.querySelectorAll('[data-role="matrix-cell"]').length).toBe(
      effectivenessMatrix.rows.length * effectivenessMatrix.columns.length
    )
  })
  it('每个评级单元格带 data-rating 属性', () => {
    const { container } = render(<EffectivenessMatrix />)
    const cells = container.querySelectorAll('[data-role="matrix-cell"]')
    for (const cell of cells) {
      expect(['high', 'mid', 'low']).toContain(cell.getAttribute('data-rating'))
    }
  })
  it('渲染诚实免责声明', () => {
    render(<EffectivenessMatrix />)
    expect(screen.getByText(/定性经验判断/)).toBeInTheDocument()
  })
})
