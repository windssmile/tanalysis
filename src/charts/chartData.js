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
  dmi: { candles: genTrend() },
  bias: { candles: genTrend() },
  obv: { candles: genTrendV() },

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

  // 上升趋势线：上涨途中回踩低点不断抬高，连成一条上升支撑线
  'trend-line': {
    candles: fromPath([10, 11, 12, 11, 11.5, 13, 14, 12.8, 13.5, 15, 16, 14.8, 15.5, 17]),
    annotations: [{ type: 'trendline', from: { i: 3, price: 10.5 }, to: { i: 11, price: 14.3 }, label: '上升趋势线' }],
  },
  // 支撑与压力：区间震荡，价格在支撑与压力之间往返
  'support-resistance': {
    candles: fromPath([13, 14.5, 15, 13.5, 12, 11.2, 12.5, 14, 15, 13.8, 12, 11.3, 12.5, 14.5, 15]),
    annotations: [
      { type: 'line', price: 15, label: '压力' },
      { type: 'line', price: 11.2, label: '支撑' },
    ],
  },
  // 道氏理论：高点与低点依次抬高，构成上升趋势
  'dow-theory': {
    candles: fromPath([10, 12, 11, 13, 12, 14.5, 13.5, 16, 15, 17]),
    annotations: [{ type: 'trendline', from: { i: 0, price: 9.6 }, to: { i: 8, price: 14.6 }, label: '上升趋势' }],
  },
  // 量化视角总览：在一段趋势上标出若干"信号触发点"
  'quant-signals': {
    candles: fromPath([12, 11.5, 12.5, 11, 12, 13.5, 12.8, 14, 13.2, 15, 14.3, 16]),
    annotations: [
      { type: 'highlight', index: 3 },
      { type: 'highlight', index: 6 },
      { type: 'highlight', index: 8 },
    ],
  },

  // 量价关系基础：上涨段量增价涨（健康），尾部价涨量缩（背离预警）
  'volume-price': {
    candles: fromPath(
      [10, 10.6, 11.3, 12, 12.8, 13.6, 14.2, 14.7, 15, 15.2],
      [80, 110, 140, 170, 200, 230, 150, 110, 80, 60],
    ),
  },
  // 放量突破：横盘缩量整理后，一根放量长阳突破压力
  'volume-breakout': {
    candles: fromPath(
      [12, 11.9, 12.1, 11.8, 12, 11.9, 12.1, 12, 13.6, 14.2],
      [70, 60, 65, 55, 60, 50, 58, 65, 260, 180],
    ),
    annotations: [
      { type: 'line', price: 12.3, label: '压力' },
      { type: 'highlight', index: 8 },
    ],
  },
  // 量价背离：价格创新高，但成交量逐级萎缩，上涨动能存疑
  'volume-divergence': {
    candles: fromPath(
      [12, 12.6, 13, 12.7, 13.4, 13.1, 13.8, 13.5, 14.1, 14.3],
      [200, 180, 160, 130, 120, 100, 90, 75, 70, 55],
    ),
  },
  // 筹码分布：一段震荡积累后上行，低位密集成交形成获利盘
  'chip-distribution': { candles: genTrendV() },

  // 多指标共振：下跌见底后多条件同时转多，标出共振入场点
  'multi-indicator-resonance': {
    candles: fromPath([16, 15, 14, 13, 12.4, 12, 12.3, 13.2, 14.2, 15.2, 16.2]),
    annotations: [
      { type: 'highlight', index: 6 },
      { type: 'highlight', index: 7 },
    ],
  },
  // 市场状态识别：前段震荡（ADX 低）、后段趋势（ADX 高）
  'market-regime': {
    candles: fromPath([12, 12.8, 12.1, 12.9, 12.2, 12.7, 12.2, 13.4, 14.4, 15.4, 16.4]),
    annotations: [
      { type: 'box', from: 0, to: 6, label: '震荡区(ADX低)' },
      { type: 'trendline', from: { i: 6, price: 12 }, to: { i: 10, price: 16 }, label: '趋势区(ADX高)' },
    ],
  },
  // 多周期共振：周线上行定方向，日线回调后企稳找买点
  'multi-timeframe': {
    candles: fromPath([15, 14.6, 14.2, 14.4, 14, 14.3, 15, 15.6]),
    weekly: fromPath([10, 11, 12, 11.8, 13, 14, 13.8, 15]),
    annotations: [{ type: 'highlight', index: 4 }],
  },
  // 仓位与止损止盈：入场、止损(-1R)、目标(+2R) 三条价位线
  'position-risk': {
    candles: fromPath([12.3, 12.1, 12.5, 12.4, 12.9, 13.4, 13.6]),
    annotations: [
      { type: 'line', price: 12.3, label: '入场' },
      { type: 'line', price: 11.7, label: '止损 -1R' },
      { type: 'line', price: 13.5, label: '目标 +2R' },
    ],
  },
  // 交易规则范例：突破入场(高亮)+止损线+目标线，完整一笔
  'trading-system': {
    candles: fromPath([11, 10.8, 11, 11.6, 12.3, 13, 13.8, 14.2]),
    annotations: [
      { type: 'highlight', index: 3 },
      { type: 'line', price: 10.6, label: '止损' },
      { type: 'line', price: 14, label: '目标' },
    ],
  },

  // 乌云盖顶：上涨中大阳后高开大阴，收盘深入前阳实体过半
  'dark-cloud-cover': {
    candles: [
      { o: 12, h: 13.2, l: 11.9, c: 13 },
      { o: 13.3, h: 13.5, l: 12.2, c: 12.4 },
    ],
    annotations: [{ type: 'box', from: 0, to: 1, label: '乌云盖顶' }],
  },
  // 刺透形态：下跌中大阴后低开大阳，收盘深入前阴实体过半
  'piercing-line': {
    candles: [
      { o: 13, h: 13.1, l: 11.8, c: 12 },
      { o: 11.7, h: 12.7, l: 11.6, c: 12.6 },
    ],
    annotations: [{ type: 'box', from: 0, to: 1, label: '刺透' }],
  },
  // 黄昏之星：大阳 + 高位小星 + 大阴深入第一阳
  'evening-star': {
    candles: [
      { o: 12, h: 14, l: 11.9, c: 13.9 },
      { o: 14.1, h: 14.4, l: 13.9, c: 14.05 },
      { o: 13.8, h: 13.9, l: 12, c: 12.1 },
    ],
    annotations: [{ type: 'highlight', index: 1 }],
  },
  // 孕线：大阴后一根小实体完全落在前一实体之内
  harami: {
    candles: [
      { o: 13.5, h: 13.7, l: 11.8, c: 12 },
      { o: 12.3, h: 12.6, l: 12.1, c: 12.5 },
    ],
    annotations: [{ type: 'box', from: 0, to: 1, label: '孕线' }],
  },
  // 流星线：上涨末端，小实体在下端、长上影
  'shooting-star': {
    candles: [
      { o: 12, h: 12.3, l: 11.9, c: 12.2 },
      { o: 12.2, h: 12.5, l: 12.1, c: 12.4 },
      { o: 12.5, h: 13.6, l: 12.4, c: 12.6 },
    ],
    annotations: [{ type: 'highlight', index: 2 }],
  },
  // 上吊线：上涨末端，小实体在上端、长下影（形似锤子但位于高位）
  'hanging-man': {
    candles: [
      { o: 12, h: 12.3, l: 11.9, c: 12.2 },
      { o: 12.2, h: 12.5, l: 12.1, c: 12.4 },
      { o: 12.5, h: 12.7, l: 11.5, c: 12.55 },
    ],
    annotations: [{ type: 'highlight', index: 2 }],
  },

  // 矩形整理：在水平支撑与压力间往返，末端突破
  rectangle: {
    candles: fromPath([12, 13, 12.1, 12.9, 12.2, 13, 12.1, 13.5, 14]),
    annotations: [
      { type: 'line', price: 13, label: '压力' },
      { type: 'line', price: 12, label: '支撑' },
    ],
  },
  // 旗形与楔形：急涨旗杆后小幅回落整理（旗面），再续涨
  'flag-wedge': {
    candles: fromPath([10, 11, 12, 13, 14, 13.6, 13.8, 13.4, 13.6, 13.2, 14, 15]),
    annotations: [{ type: 'box', from: 5, to: 9, label: '旗面整理' }],
  },
  // 跳空缺口：第二根低点高于第一根高点，留下跳空
  gap: {
    candles: [
      { o: 11, h: 11.5, l: 10.8, c: 11.4 },
      { o: 12, h: 12.6, l: 11.9, c: 12.5 },
      { o: 12.5, h: 13, l: 12.4, c: 12.9 },
    ],
    annotations: [{ type: 'line', price: 11.7, label: '跳空缺口' }],
  },
  // V形反转：急跌后急涨，形如 V
  'v-reversal': {
    candles: fromPath([16, 15, 13.5, 12, 11, 12.5, 14, 15.5, 16.5]),
    annotations: [{ type: 'highlight', index: 4 }],
  },

  // 分时图基础：平开后冲高回落、午后企稳的一天
  'intraday-basics': genIntraday(10, [
    10, 10.15, 10.32, 10.28, 10.12, 9.98, 9.95, 10.02, 10.08, 10.05, 10.1, 10.18,
  ]),
  // 均价线与分时量价：早盘弱于均价、午后站上均价线走强
  'intraday-avgline': genIntraday(10, [
    9.98, 9.9, 9.85, 9.92, 9.96, 10.0, 10.05, 10.12, 10.2, 10.26, 10.3, 10.34,
  ]),
  // 集合竞价：高开后高位震荡（昨收 10，9:30 高开至 10.3 附近）
  'intraday-auction': genIntraday(10, [
    10.3, 10.28, 10.34, 10.26, 10.22, 10.3, 10.36, 10.32, 10.28, 10.33, 10.38, 10.35,
  ]),

  // 假突破：放量突破压力后无法站稳，迅速跌回区间（多头陷阱）
  'false-breakout': {
    candles: fromPath([12, 12.5, 13, 13.7, 13.2, 12.6, 12.1, 11.6]),
    annotations: [
      { type: 'line', price: 13.1, label: '压力' },
      { type: 'highlight', index: 3 },
    ],
  },
  // 交易心理：追涨买在高点、恐慌割肉卖在低点（高亮两处错误决策）
  'trading-psychology': {
    candles: fromPath([10, 11, 12.5, 13.6, 13, 11.5, 10.4, 10, 11, 12.2]),
    annotations: [
      { type: 'highlight', index: 3 },
      { type: 'highlight', index: 7 },
    ],
  },
  // 回撤与破产风险：创出高点后深度回撤，展示亏损的不对称
  'drawdown-ruin': {
    candles: fromPath([12, 13, 14, 13.4, 11.8, 10.2, 9, 8.4]),
    annotations: [
      { type: 'line', price: 14, label: '峰值' },
      { type: 'highlight', index: 7 },
    ],
  },
  // A股特有风险：高位放量后连续暴跌/闪崩（庄股、暴雷情形）
  'a-share-risks': {
    candles: fromPath([15, 15.3, 15.1, 13.8, 12.4, 11, 9.9, 9.2]),
    annotations: [{ type: 'box', from: 3, to: 7, label: '闪崩' }],
  },

  // 盘口：买卖五档 + 委比/内外盘
  'order-book': {
    asks: [
      { label: '卖五', price: 10.25, vol: 320 },
      { label: '卖四', price: 10.24, vol: 180 },
      { label: '卖三', price: 10.23, vol: 90 },
      { label: '卖二', price: 10.22, vol: 150 },
      { label: '卖一', price: 10.21, vol: 60 },
    ],
    bids: [
      { label: '买一', price: 10.2, vol: 240 },
      { label: '买二', price: 10.19, vol: 130 },
      { label: '买三', price: 10.18, vol: 200 },
      { label: '买四', price: 10.17, vol: 110 },
      { label: '买五', price: 10.16, vol: 80 },
    ],
    ratio: 12.5,
    inner: 3200,
    outer: 4100,
  },
}

// 由逐点价格生成分时数据：均价为累计成交额 ÷ 累计成交量（当日 VWAP）
function genIntraday(prevClose, prices) {
  let cumPV = 0
  let cumV = 0
  const points = prices.map((p, i) => {
    const vol = Math.round(80 + Math.abs(p - (prices[i - 1] ?? prevClose)) * 800 + (Math.sin(i / 2) + 1) * 30)
    cumPV += p * vol
    cumV += vol
    return { price: round(p), avg: round(cumPV / cumV), vol }
  })
  return { prevClose, points }
}

// 把一串收盘价路径转成连续 K线：开=前收，高/低在实体外各留余量。
// 传入 volumes（与 closes 等长）时附带成交量 v 字段。
function fromPath(closes, volumes) {
  const out = []
  let prev = closes[0]
  for (let i = 0; i < closes.length; i++) {
    const o = i === 0 ? closes[0] : prev
    const c = closes[i]
    const h = Math.max(o, c) + 0.3
    const l = Math.min(o, c) - 0.3
    const candle = { o: round(o), h: round(h), l: round(l), c: round(c) }
    if (volumes) candle.v = volumes[i]
    out.push(candle)
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

// 同 genTrend，但附带与波动幅度正相关的成交量，供 OBV / 筹码分布使用
function genTrendV() {
  return genTrend().map((d, i) => ({
    ...d,
    v: Math.round(80 + Math.abs(d.c - d.o) * 120 + (Math.sin(i / 3) + 1) * 40),
  }))
}

function round(x) {
  return Math.round(x * 100) / 100
}
