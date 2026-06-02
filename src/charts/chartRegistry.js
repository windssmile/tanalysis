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
import ChipChart from './ChipChart.jsx'
import MultiTimeframeChart from './MultiTimeframeChart.jsx'
import IntradayChart from './IntradayChart.jsx'
import OrderBookTable from './OrderBookTable.jsx'
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
  'chip-distribution': { Component: ChipChart, props: { data: chartData['chip-distribution'].candles } },
  'multi-indicator-resonance': candle('multi-indicator-resonance'),
  'market-regime': candle('market-regime'),
  'multi-timeframe': {
    Component: MultiTimeframeChart,
    props: {
      data: chartData['multi-timeframe'].candles,
      weekly: chartData['multi-timeframe'].weekly,
      annotations: chartData['multi-timeframe'].annotations || [],
    },
  },
  'position-risk': candle('position-risk'),
  'trading-system': candle('trading-system'),
  'dark-cloud-cover': candle('dark-cloud-cover'),
  'piercing-line': candle('piercing-line'),
  'evening-star': candle('evening-star'),
  harami: candle('harami'),
  'shooting-star': candle('shooting-star'),
  'hanging-man': candle('hanging-man'),
  'three-white-soldiers': candle('three-white-soldiers'),
  'three-black-crows': candle('three-black-crows'),
  'inverted-hammer': candle('inverted-hammer'),
  'special-doji': candle('special-doji'),
  tweezer: candle('tweezer'),
  marubozu: candle('marubozu'),
  'rising-falling-three': candle('rising-falling-three'),
  'three-inside': candle('three-inside'),
  rectangle: candle('rectangle'),
  'flag-wedge': candle('flag-wedge'),
  gap: candle('gap'),
  'v-reversal': candle('v-reversal'),
  'intraday-basics': { Component: IntradayChart, props: { data: chartData['intraday-basics'] } },
  'intraday-avgline': { Component: IntradayChart, props: { data: chartData['intraday-avgline'] } },
  'intraday-auction': { Component: IntradayChart, props: { data: chartData['intraday-auction'] } },
  'order-book': { Component: OrderBookTable, props: { data: chartData['order-book'] } },
  'false-breakout': candle('false-breakout'),
  'trading-psychology': candle('trading-psychology'),
  'drawdown-ruin': candle('drawdown-ruin'),
  'a-share-risks': candle('a-share-risks'),
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
