// 筹码分布（简化模型）：把每根 K线的成交量按其价格区间 [l, h] 均匀分摊到价位档，
// 累积成"每个价位上沉淀了多少筹码"。返回各档权重、获利盘比例与价格范围。
export function chipDistribution(data, buckets = 24) {
  const min = Math.min(...data.map((d) => d.l))
  const max = Math.max(...data.map((d) => d.h))
  const size = (max - min) / buckets || 1

  const levels = Array.from({ length: buckets }, (_, i) => ({
    low: min + size * i,
    high: min + size * (i + 1),
    price: min + size * (i + 0.5),
    weight: 0,
  }))

  for (const d of data) {
    const range = d.h - d.l
    if (range <= 0) {
      // 区间为一点：整笔量落入所在档
      const idx = Math.min(buckets - 1, Math.max(0, Math.floor((d.c - min) / size)))
      levels[idx].weight += d.v
      continue
    }
    for (const lv of levels) {
      const overlap = Math.min(lv.high, d.h) - Math.max(lv.low, d.l)
      if (overlap > 0) lv.weight += d.v * (overlap / range)
    }
  }

  const lastClose = data[data.length - 1].c
  const total = levels.reduce((s, l) => s + l.weight, 0)
  const below = levels.filter((l) => l.price < lastClose).reduce((s, l) => s + l.weight, 0)
  const profitRatio = total === 0 ? 0 : below / total

  return { levels, min, max, lastClose, profitRatio }
}
