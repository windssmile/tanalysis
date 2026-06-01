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
  // MA/MACD/KDJ/RSI/BOLL：一段先跌后涨的趋势数据
  ma: { candles: genTrend() },
  macd: { candles: genTrend() },
  kdj: { candles: genTrend() },
  rsi: { candles: genTrend() },
  boll: { candles: genTrend() },

  // 双重底（W底）：两次探底于颈线下方，第二底不破前低后放量突破颈线
  'double-bottom': {
    candles: fromPath([16, 15, 14, 12.5, 11, 10.2, 11.2, 12.4, 13, 12.2, 11, 10.3, 11.5, 12.8, 13.5, 14.5]),
    annotations: [{ type: 'line', price: 13, label: '颈线' }],
  },
  // 双重顶（M顶）：两次冲高受阻于颈线上方，跌破颈线确认转势
  'double-top': {
    candles: fromPath([10, 11, 12, 13.5, 15, 15.8, 14.8, 13.6, 13, 13.8, 15, 15.7, 14.5, 13, 12, 11]),
    annotations: [{ type: 'line', price: 13, label: '颈线' }],
  },
  // 头肩顶：左肩—头（更高）—右肩，跌破颈线确认顶部
  'head-shoulders-top': {
    candles: fromPath([10, 11.5, 13, 14, 13, 12.1, 13.5, 15, 16, 14.8, 13, 12.2, 13.4, 14, 12.8, 12, 11, 10]),
    annotations: [{ type: 'line', price: 12, label: '颈线' }],
  },
  // 上升三角形：水平压力多次受阻，低点不断抬高，最终向上突破
  'ascending-triangle': {
    candles: fromPath([12, 13, 14.2, 15, 14.2, 13.6, 14.4, 15, 14.3, 14, 14.7, 15, 14.8, 15.6, 16.4]),
    annotations: [{ type: 'line', price: 15, label: '压力' }],
  },
}

// 把一串收盘价路径转成连续 K线：开=前收，高/低在实体外各留余量
function fromPath(closes) {
  const out = []
  let prev = closes[0]
  for (let i = 0; i < closes.length; i++) {
    const o = i === 0 ? closes[0] : prev
    const c = closes[i]
    const h = Math.max(o, c) + 0.3
    const l = Math.min(o, c) - 0.3
    out.push({ o: round(o), h: round(h), l: round(l), c: round(c) })
    prev = c
  }
  return out
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
