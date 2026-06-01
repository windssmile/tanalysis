import CandleChart from './CandleChart.jsx'
import MAChart from './indicators/MAChart.jsx'
import MACDChart from './indicators/MACDChart.jsx'
import KDJChart from './indicators/KDJChart.jsx'
import RSIChart from './indicators/RSIChart.jsx'
import BOLLChart from './indicators/BOLLChart.jsx'
import { chartData } from './chartData.js'

// chartId → { Component, props }
const registry = {
  'kline-basics': candle('kline-basics'),
  hammer: candle('hammer'),
  doji: candle('doji'),
  'bullish-engulfing': candle('bullish-engulfing'),
  'bearish-engulfing': candle('bearish-engulfing'),
  'morning-star': candle('morning-star'),
  ma: { Component: MAChart, props: { data: chartData.ma.candles } },
  macd: { Component: MACDChart, props: { data: chartData.macd.candles } },
  kdj: { Component: KDJChart, props: { data: chartData.kdj.candles } },
  rsi: { Component: RSIChart, props: { data: chartData.rsi.candles } },
  boll: { Component: BOLLChart, props: { data: chartData.boll.candles } },
}

function candle(id) {
  return {
    Component: CandleChart,
    props: { data: chartData[id].candles, annotations: chartData[id].annotations || [] },
  }
}

export function getChart(chartId) {
  return registry[chartId]
}

export function hasChart(chartId) {
  return chartId in registry
}
