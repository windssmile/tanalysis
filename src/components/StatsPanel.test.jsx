import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsPanel from './StatsPanel.jsx'

const strat = { count: 8, winRate: 0.5, avgWin: 0.1, avgLoss: -0.06, expectancy: 0.02, totalReturn: 0.16, buyHoldReturn: 0.3, costBps: 50 }
const ctrl = { count: 7, winRate: 0.43, avgWin: 0.08, avgLoss: -0.07, expectancy: -0.005, totalReturn: -0.03, buyHoldReturn: 0.1, costBps: 50 }

describe('StatsPanel', () => {
  it('展示交易次数/胜率/期望/累计收益四项指标', () => {
    render(<StatsPanel strategy={strat} control={ctrl} />)
    expect(screen.getByText(/交易次数/)).toBeInTheDocument()
    expect(screen.getByText(/胜率/)).toBeInTheDocument()
    expect(screen.getByText(/期望/)).toBeInTheDocument()
    expect(screen.getByText(/累计收益/)).toBeInTheDocument()
  })
  it('每个指标一行，带 data-role', () => {
    const { container } = render(<StatsPanel strategy={strat} control={ctrl} />)
    expect(container.querySelectorAll('[data-role="stats-row"]').length).toBeGreaterThanOrEqual(4)
  })
  it('展示本策略胜率 50.0%', () => {
    render(<StatsPanel strategy={strat} control={ctrl} />)
    expect(screen.getAllByText(/50\.0%/).length).toBeGreaterThanOrEqual(1)
  })
  it('展示买入持有基准 30.0%', () => {
    render(<StatsPanel strategy={strat} control={ctrl} />)
    expect(screen.getByText(/30\.0%/)).toBeInTheDocument()
  })
})
