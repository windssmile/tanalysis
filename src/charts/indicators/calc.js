// 简单移动平均；前 period-1 个为 null
export function sma(values, period) {
  const out = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null)
    } else {
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) sum += values[j]
      out.push(sum / period)
    }
  }
  return out
}

// 指数移动平均；首值取首个数据点
export function ema(values, period) {
  const k = 2 / (period + 1)
  const out = []
  let prev = values[0]
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      out.push(values[0])
    } else {
      prev = values[i] * k + prev * (1 - k)
      out.push(prev)
    }
  }
  return out
}

// MACD：dif = ema(fast) - ema(slow)，dea = ema(dif, signal)，hist = (dif-dea)*2
export function macd(closes, fast = 12, slow = 26, signal = 9) {
  const emaFast = ema(closes, fast)
  const emaSlow = ema(closes, slow)
  const dif = closes.map((_, i) => emaFast[i] - emaSlow[i])
  const dea = ema(dif, signal)
  const hist = dif.map((v, i) => (v - dea[i]) * 2)
  return { dif, dea, hist }
}

// KDJ：基于 n 日 RSV，K/D 为 RSV 的移动平滑，J = 3K - 2D
export function kdj(data, n = 9, k1 = 3, d1 = 3) {
  const k = []
  const d = []
  const j = []
  let prevK = 50
  let prevD = 50
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - n + 1)
    const window = data.slice(start, i + 1)
    const high = Math.max(...window.map((x) => x.h))
    const low = Math.min(...window.map((x) => x.l))
    const rsv = high === low ? 0 : ((data[i].c - low) / (high - low)) * 100
    const curK = (prevK * (k1 - 1) + rsv) / k1
    const curD = (prevD * (d1 - 1) + curK) / d1
    k.push(curK)
    d.push(curD)
    j.push(3 * curK - 2 * curD)
    prevK = curK
    prevD = curD
  }
  return { k, d, j }
}

// RSI：N 日内平均涨幅 ÷（平均涨幅 + 平均跌幅）× 100；前 period 个为 null
export function rsi(closes, period = 14) {
  const out = new Array(closes.length).fill(null)
  const diffs = []
  for (let i = 1; i < closes.length; i++) diffs.push(closes[i] - closes[i - 1])
  // diffs[k] 对应 closes 第 k+1 根；RSI 在 closes 索引 i 处取最近 period 个 diff
  for (let i = period; i < closes.length; i++) {
    let gain = 0
    let loss = 0
    for (let k = i - period; k < i; k++) {
      const d = diffs[k]
      if (d >= 0) gain += d
      else loss -= d
    }
    const avgGain = gain / period
    const avgLoss = loss / period
    out[i] = avgGain + avgLoss === 0 ? 50 : (avgGain / (avgGain + avgLoss)) * 100
  }
  return out
}

// 布林带：中轨 = SMA(N)，上/下轨 = 中轨 ± k×标准差；前 N-1 个为 null
export function boll(closes, period = 20, k = 2) {
  const mid = sma(closes, period)
  const upper = []
  const lower = []
  for (let i = 0; i < closes.length; i++) {
    if (mid[i] == null) {
      upper.push(null)
      lower.push(null)
      continue
    }
    let sumSq = 0
    for (let j = i - period + 1; j <= i; j++) sumSq += (closes[j] - mid[i]) ** 2
    const std = Math.sqrt(sumSq / period)
    upper.push(mid[i] + k * std)
    lower.push(mid[i] - k * std)
  }
  return { mid, upper, lower }
}
