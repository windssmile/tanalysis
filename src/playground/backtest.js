// 纯函数回测：多头单仓。成本线性：每笔净收益 = 毛收益 - 2*cost。累计按复利。
export function run(series, signals, { costBps = 0 } = {}) {
  const closes = series.map((b) => b.c)
  const cost = costBps / 10000
  const entrySet = new Set(signals.entries || [])
  const exitSet = new Set(signals.exits || [])

  const trades = []
  let entryIdx = null
  for (let i = 0; i < closes.length; i++) {
    if (entryIdx === null) {
      if (entrySet.has(i)) entryIdx = i
    } else if (exitSet.has(i) && i > entryIdx) {
      const entryPrice = closes[entryIdx]
      const exitPrice = closes[i]
      const grossReturn = exitPrice / entryPrice - 1
      const netReturn = grossReturn - 2 * cost
      trades.push({ entryIdx, exitIdx: i, entryPrice, exitPrice, grossReturn, netReturn })
      entryIdx = null
    }
  }

  const count = trades.length
  const wins = trades.filter((t) => t.netReturn > 0)
  const losses = trades.filter((t) => t.netReturn <= 0)
  const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
  const winRate = count ? wins.length / count : 0
  const avgWin = mean(wins.map((t) => t.netReturn))
  const avgLoss = mean(losses.map((t) => t.netReturn))
  const expectancy = mean(trades.map((t) => t.netReturn))
  const totalReturn = count ? trades.reduce((acc, t) => acc * (1 + t.netReturn), 1) - 1 : 0
  const buyHoldReturn = closes.length ? closes[closes.length - 1] / closes[0] - 1 : 0

  return {
    trades,
    stats: { count, winRate, avgWin, avgLoss, expectancy, totalReturn, buyHoldReturn, costBps },
  }
}
