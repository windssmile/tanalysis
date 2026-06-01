import CandleChart from './CandleChart.jsx'
import MAChart from './indicators/MAChart.jsx'
import MACDChart from './indicators/MACDChart.jsx'
import KDJChart from './indicators/KDJChart.jsx'
import RSIChart from './indicators/RSIChart.jsx'
import BOLLChart from './indicators/BOLLChart.jsx'
import DMIChart from './indicators/DMIChart.jsx'
import OBVChart from './indicators/OBVChart.jsx'
import BIASChart from './indicators/BIASChart.jsx'
import PriceVolumeChart from './PriceVolumeChart.jsx'
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
  dmi: { Component: DMIChart, props: { data: chartData.dmi.candles } },
  obv: { Component: OBVChart, props: { data: chartData.obv.candles } },
  bias: { Component: BIASChart, props: { data: chartData.bias.candles } },
  'double-bottom': candle('double-bottom'),
  'double-top': candle('double-top'),
  'head-shoulders-top': candle('head-shoulders-top'),
  'ascending-triangle': candle('ascending-triangle'),
  'trend-line': candle('trend-line'),
  'support-resistance': candle('support-resistance'),
  'dow-theory': candle('dow-theory'),
  'quant-signals': candle('quant-signals'),
  'volume-price': priceVolume('volume-price'),
  'volume-breakout': priceVolume('volume-breakout'),
  'volume-divergence': priceVolume('volume-divergence'),
}

function priceVolume(id) {
  return {
    Component: PriceVolumeChart,
    props: { data: chartData[id].candles, annotations: chartData[id].annotations || [] },
  }
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
