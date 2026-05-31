export function isBullish(candle) {
  return candle.c >= candle.o
}

export function candleColor(candle, upColor, downColor) {
  return isBullish(candle) ? upColor : downColor
}

// 价格 → y 像素：价格越高 y 越小（顶部）。pad 为上下留白像素。
export function scaleY(price, { min, max, height, pad = 0 }) {
  if (max === min) return height / 2
  const usable = height - pad * 2
  return pad + (max - price) / (max - min) * usable
}

// 计算每根 K线的绘制坐标
export function layoutCandles(data, { width, height, pad = 8 }) {
  const prices = data.flatMap((d) => [d.h, d.l])
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const n = data.length
  const slot = width / n
  const bodyW = Math.max(4, slot * 0.5)
  return data.map((d, i) => {
    const x = slot * i + slot / 2
    const openY = scaleY(d.o, { min, max, height, pad })
    const closeY = scaleY(d.c, { min, max, height, pad })
    const bodyY = Math.min(openY, closeY)
    const bodyH = Math.max(1, Math.abs(openY - closeY))
    return {
      x,
      bodyX: x - bodyW / 2,
      bodyW,
      bodyY,
      bodyH,
      highY: scaleY(d.h, { min, max, height, pad }),
      lowY: scaleY(d.l, { min, max, height, pad }),
      bullish: isBullish(d),
    }
  })
}
