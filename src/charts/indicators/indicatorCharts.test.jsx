import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { chartData } from '../chartData.js'
import MAChart from './MAChart.jsx'
import MACDChart from './MACDChart.jsx'
import KDJChart from './KDJChart.jsx'

describe('指标图表', () => {
  it('MAChart 在 K线主图上叠加均线 polyline', () => {
    const { container } = render(<MAChart data={chartData.ma.candles} />)
    expect(container.querySelectorAll('polyline').length).toBeGreaterThanOrEqual(1)
    expect(container.querySelectorAll('rect[data-role="body"]').length).toBeGreaterThan(0)
  })
  it('MACDChart 渲染红绿柱与 DIF/DEA 双线', () => {
    const { container } = render(<MACDChart data={chartData.macd.candles} />)
    expect(container.querySelectorAll('rect[data-role="hist"]').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('polyline').length).toBe(2)
  })
  it('KDJChart 渲染 K/D/J 三条线', () => {
    const { container } = render(<KDJChart data={chartData.kdj.candles} />)
    expect(container.querySelectorAll('polyline').length).toBe(3)
  })
})
