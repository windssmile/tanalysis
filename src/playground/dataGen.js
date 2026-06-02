// 合成 K线数据：仅供演示回测计算方法，非真实行情。带 seed 可复现。
// mulberry32 确定性伪随机
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), a | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 由收盘价路径 + rng 生成合规 OHLC（h>=max(o,c), l<=min(o,c)）
function buildBars(closes, rng) {
  const bars = []
  let prevClose = closes[0]
  for (let i = 0; i < closes.length; i++) {
    const c = closes[i]
    const o = i === 0 ? c : prevClose
    const hi = Math.max(o, c) * (1 + rng() * 0.012)
    const lo = Math.min(o, c) * (1 - rng() * 0.012)
    const v = Math.round(1_000_000 * (0.6 + rng()))
    bars.push({
      o: +o.toFixed(2), h: +hi.toFixed(2), l: +lo.toFixed(2), c: +c.toFixed(2), v,
    })
    prevClose = c
  }
  return bars
}

function closePath(regime, rng, n) {
  const closes = []
  let p = 100
  for (let i = 0; i < n; i++) {
    if (regime === 'trend') {
      p = p * (1 + 0.004 + (rng() - 0.5) * 0.02)
    } else if (regime === 'range') {
      p = p + (100 - p) * 0.1 + (rng() - 0.5) * 3
    } else if (regime === 'reversal') {
      const drift = i < n / 2 ? 0.005 : -0.005 // 先涨后跌（倒 V）
      p = p * (1 + drift + (rng() - 0.5) * 0.02)
    } else {
      // random：纯随机游走，作对照基准
      p = p * (1 + (rng() - 0.5) * 0.03)
    }
    p = Math.max(1, p)
    closes.push(p)
  }
  return closes
}

export function genSeries(regime, seed = 42, n = 240) {
  const rng = mulberry32(seed)
  const closes = closePath(regime, rng, n)
  return buildBars(closes, rng)
}

// 数据源抽象：v1 = 合成；日后接真实数据加 realSource(symbol,range) 即可，引擎不动。
export function syntheticSource(regime, seed = 42, n = 240) {
  return {
    id: `synthetic-${regime}-${seed}`,
    label: `合成数据（${regime}）`,
    load: () => Promise.resolve(genSeries(regime, seed, n)),
  }
}
