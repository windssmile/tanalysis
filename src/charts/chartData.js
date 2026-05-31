export const chartData = {
  // K线构成：一阳一阴，展示影线实体
  'kline-basics': {
    candles: [
      { o: 10, h: 13, l: 9.5, c: 12.5 },
      { o: 12.5, h: 12.8, l: 9, c: 9.8 },
    ],
  },
  // 锤子线：下影长、实体小、收在上方（下跌末端）
  hammer: {
    candles: [
      { o: 14, h: 14.2, l: 13, c: 13.2 },
      { o: 13.2, h: 13.4, l: 12, c: 13 },
      { o: 12.5, h: 12.7, l: 10, c: 12.4 },
    ],
    annotations: [{ type: 'highlight', index: 2 }],
  },
  // 十字星：开收几乎相等
  doji: {
    candles: [
      { o: 11, h: 11.5, l: 10.5, c: 11.1 },
      { o: 11.1, h: 12, l: 10.2, c: 11.1 },
    ],
    annotations: [{ type: 'highlight', index: 1 }],
  },
  // 看涨吞没：阴后大阳吞没
  'bullish-engulfing': {
    candles: [
      { o: 13, h: 13.2, l: 11.5, c: 11.8 },
      { o: 11.5, h: 13.6, l: 11.3, c: 13.5 },
    ],
    annotations: [{ type: 'box', from: 0, to: 1, label: '吞没区' }],
  },
  // 看跌吞没：阳后大阴吞没
  'bearish-engulfing': {
    candles: [
      { o: 11, h: 12.8, l: 10.8, c: 12.6 },
      { o: 12.9, h: 13.1, l: 10.5, c: 10.7 },
    ],
    annotations: [{ type: 'box', from: 0, to: 1, label: '吞没区' }],
  },
  // 早晨之星：大阴 + 小星 + 大阳
  'morning-star': {
    candles: [
      { o: 14, h: 14.1, l: 12, c: 12.1 },
      { o: 11.8, h: 12, l: 11.4, c: 11.7 },
      { o: 12, h: 13.8, l: 11.9, c: 13.7 },
    ],
    annotations: [{ type: 'highlight', index: 1 }],
  },
  // MA/MACD/KDJ：一段先跌后涨的趋势数据
  ma: { candles: genTrend() },
  macd: { candles: genTrend() },
  kdj: { candles: genTrend() },
}

function genTrend() {
  const out = []
  let price = 20
  for (let i = 0; i < 40; i++) {
    const drift = i < 20 ? -0.3 : 0.4
    const o = price
    const c = price + drift + Math.sin(i / 2) * 0.3
    const h = Math.max(o, c) + 0.4
    const l = Math.min(o, c) - 0.4
    out.push({ o: round(o), h: round(h), l: round(l), c: round(c) })
    price = c
  }
  return out
}

function round(x) {
  return Math.round(x * 100) / 100
}
