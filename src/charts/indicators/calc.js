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

// OBV 能量潮：收盘较前一日上涨加量、下跌减量、持平不变（首值为 0）
export function obv(data) {
  const out = [0]
  for (let i = 1; i < data.length; i++) {
    const prev = out[i - 1]
    if (data[i].c > data[i - 1].c) out.push(prev + data[i].v)
    else if (data[i].c < data[i - 1].c) out.push(prev - data[i].v)
    else out.push(prev)
  }
  return out
}

// BIAS 乖离率 =(收盘 − MA)/MA × 100；前 period-1 个为 null
export function bias(closes, period) {
  const ma = sma(closes, period)
  return closes.map((c, i) => (ma[i] == null ? null : ((c - ma[i]) / ma[i]) * 100))
}

// DMI/ADX：基于 Wilder 平滑的方向性指标，返回 {pdi, mdi, adx}
export function dmi(data, period = 14) {
  const n = data.length
  const tr = new Array(n).fill(0)
  const plusDM = new Array(n).fill(0)
  const minusDM = new Array(n).fill(0)
  for (let i = 1; i < n; i++) {
    const up = data[i].h - data[i - 1].h
    const down = data[i - 1].l - data[i].l
    plusDM[i] = up > down && up > 0 ? up : 0
    minusDM[i] = down > up && down > 0 ? down : 0
    tr[i] = Math.max(
      data[i].h - data[i].l,
      Math.abs(data[i].h - data[i - 1].c),
      Math.abs(data[i].l - data[i - 1].c),
    )
  }
  // Wilder 平滑：首个有效值为首 period 个之和，其后递推
  const wilder = (arr) => {
    const out = new Array(n).fill(null)
    let sum = 0
    for (let i = 1; i <= period; i++) sum += arr[i]
    out[period] = sum
    for (let i = period + 1; i < n; i++) out[i] = out[i - 1] - out[i - 1] / period + arr[i]
    return out
  }
  const trN = wilder(tr)
  const plusN = wilder(plusDM)
  const minusN = wilder(minusDM)
  const pdi = new Array(n).fill(null)
  const mdi = new Array(n).fill(null)
  const dx = new Array(n).fill(null)
  for (let i = period; i < n; i++) {
    if (!trN[i]) continue
    pdi[i] = (plusN[i] / trN[i]) * 100
    mdi[i] = (minusN[i] / trN[i]) * 100
    const sum = pdi[i] + mdi[i]
    dx[i] = sum === 0 ? 0 : (Math.abs(pdi[i] - mdi[i]) / sum) * 100
  }
  // ADX = DX 的 Wilder 平滑（从首个可算 DX 起算 period 个的均值）
  const adx = new Array(n).fill(null)
  const firstDX = period
  const adxStart = firstDX + period - 1
  if (adxStart < n) {
    let sum = 0
    for (let i = firstDX; i <= adxStart; i++) sum += dx[i]
    adx[adxStart] = sum / period
    for (let i = adxStart + 1; i < n; i++) adx[i] = (adx[i - 1] * (period - 1) + dx[i]) / period
  }
  return { pdi, mdi, adx }
}
