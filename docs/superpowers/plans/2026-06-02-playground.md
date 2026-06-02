# Playground（参数沙盘 + 信号回测引擎）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增工具页 `/playground`：用户选规则（MA金叉/RSI阈值/看涨吞没）+ 调参 + 选市场情境，把规则跑在合成数据上，输出胜率/期望/累计收益/对比买入持有/计入成本，并并排展示**随机对照组**——让用户亲眼看到"看似有效"在随机数据上也成立。

**Architecture:** 纯函数引擎 + 可换数据源 + 诚实框架。三个纯模块：`dataGen.js`（带 seed 的合成 K线，4 种 regime，含 random 对照）、`rules.js`（规则注册表，复用 `charts/indicators/calc.js`）、`backtest.js`（纯函数回测，精确可测）。数据接口统一 `{o,h,l,c,v}[]`，并定义 `DataSource = {id,label,load():Promise<Bar[]>}`，日后接真实数据只换数据层、引擎不动。展示复用 `CandleChart`（新增 `marker` 标注类型）。

**Tech Stack:** React 18 + Vite 5 + react-router-dom 6 + Vitest 2 + @testing-library/react。无新依赖。

**红线**：合成数据**仅演示计算方法**，页面必须醒目标注"胜率系设计产物，不代表真实有效性"。买卖点遵循**红涨绿跌**：买=红(`#f43f5e`)、卖=绿(`#22c55e`)。引擎为纯函数，TDD 精确断言。

**统一数据/结果结构（贯穿全 block）：**
```ts
Bar = { o:number, h:number, l:number, c:number, v:number }   // h>=max(o,c), l<=min(o,c)
Signals = { entries:number[], exits:number[] }                // 索引数组
Trade = { entryIdx, exitIdx, entryPrice, exitPrice, grossReturn, netReturn }
Stats = { count, winRate, avgWin, avgLoss, expectancy, totalReturn, buyHoldReturn, costBps }
run(series:Bar[], signals:Signals, opts:{costBps:number}) => { trades:Trade[], stats:Stats }
Rule = { id, name, params:[{key,label,min,max,step,default}], signal(series, params):Signals }
DataSource = { id, label, load():Promise<Bar[]> }
```
成本模型（线性、透明、可精确测）：`cost = costBps/10000`；每笔 `netReturn = grossReturn - 2*cost`（买卖双边）。累计收益按复利 `∏(1+netReturn)-1`。

---

## Task P1: 合成数据 `dataGen.js` + 测试

**Files:** Create `src/playground/dataGen.js` + `src/playground/dataGen.test.js`

`genSeries(regime, seed=42, n=240) => Bar[]`，`regime ∈ {trend, range, reversal, random}`，带 seed 可复现。`syntheticSource(regime, seed)` 返回 `DataSource`。

- [ ] **Step 1: 写失败的测试** — 创建 `src/playground/dataGen.test.js`：

```js
import { describe, it, expect } from 'vitest'
import { genSeries, syntheticSource } from './dataGen.js'

const REGIMES = ['trend', 'range', 'reversal', 'random']

describe('genSeries', () => {
  it('默认生成 240 根', () => {
    expect(genSeries('trend')).toHaveLength(240)
  })
  it('每根满足 OHLC 不变式且为正', () => {
    for (const regime of REGIMES) {
      for (const b of genSeries(regime, 1, 120)) {
        expect(b.h).toBeGreaterThanOrEqual(Math.max(b.o, b.c))
        expect(b.l).toBeLessThanOrEqual(Math.min(b.o, b.c))
        expect(b.o).toBeGreaterThan(0)
        expect(b.c).toBeGreaterThan(0)
        expect(b.v).toBeGreaterThan(0)
      }
    }
  })
  it('同 seed 可复现，异 seed 不同', () => {
    expect(genSeries('trend', 1)).toEqual(genSeries('trend', 1))
    expect(genSeries('trend', 1)).not.toEqual(genSeries('trend', 2))
  })
  it('不同 regime 产生不同序列', () => {
    expect(genSeries('trend', 1)).not.toEqual(genSeries('range', 1))
  })
})

describe('syntheticSource (DataSource 接口)', () => {
  it('有 id/label，load() 返回与 genSeries 一致的数据', async () => {
    const src = syntheticSource('trend', 5)
    expect(typeof src.id).toBe('string')
    expect(typeof src.label).toBe('string')
    const bars = await src.load()
    expect(bars).toEqual(genSeries('trend', 5))
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/playground/dataGen.test.js`
Expected: FAIL（文件不存在）。

- [ ] **Step 3: 实现 `src/playground/dataGen.js`：**

```js
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/playground/dataGen.test.js`
Expected: PASS。再跑 `npm test` 确认无连带破坏。

- [ ] **Step 5: 提交**

```bash
git add src/playground/dataGen.js src/playground/dataGen.test.js
git commit -m "feat: playground合成数据dataGen(4种regime+seed可复现+DataSource接口)"
```

---

## Task P2: 规则注册表 `rules.js` + 测试

**Files:** Create `src/playground/rules.js` + `src/playground/rules.test.js`

三条规则，复用 `src/charts/indicators/calc.js` 的 `sma`/`rsi`。每条 `signal(series, params) => {entries, exits}`（索引数组）。

- [ ] **Step 1: 写失败的测试** — 创建 `src/playground/rules.test.js`：

```js
import { describe, it, expect } from 'vitest'
import { rules, getRule } from './rules.js'

const bars = (closes) => closes.map((c, i) => ({
  o: i ? closes[i - 1] : c, h: Math.max(c, i ? closes[i - 1] : c) + 1,
  l: Math.min(c, i ? closes[i - 1] : c) - 1, c, v: 1000,
}))

describe('rules 注册表', () => {
  it('含三条规则 ma-cross / rsi-threshold / bullish-engulfing', () => {
    expect(rules.map((r) => r.id).sort()).toEqual(['bullish-engulfing', 'ma-cross', 'rsi-threshold'])
  })
  it('每条规则有 params(含 default) 与 signal 函数', () => {
    for (const r of rules) {
      expect(Array.isArray(r.params)).toBe(true)
      for (const p of r.params) expect(p).toHaveProperty('default')
      expect(typeof r.signal).toBe('function')
    }
  })
  it('getRule 按 id 取规则', () => {
    expect(getRule('ma-cross').id).toBe('ma-cross')
  })
})

describe('ma-cross signal', () => {
  it('快线上穿慢线给出 entry，下穿给出 exit', () => {
    // 先跌后涨再跌：制造一次金叉与一次死叉
    const series = bars([10, 9, 8, 7, 8, 10, 12, 14, 12, 9, 7, 6])
    const sig = getRule('ma-cross').signal(series, { fast: 2, slow: 4 })
    expect(sig.entries.length).toBeGreaterThanOrEqual(1)
    expect(sig.exits.length).toBeGreaterThanOrEqual(1)
    // entry 索引应早于其后的某个 exit
    expect(Math.min(...sig.entries)).toBeLessThan(Math.max(...sig.exits))
  })
})

describe('rsi-threshold signal', () => {
  it('超卖给 entry、超买给 exit', () => {
    const downUp = [20, 18, 16, 14, 12, 10, 9, 8, 12, 16, 20, 24, 28, 32, 36, 40]
    const sig = getRule('rsi-threshold').signal(bars(downUp), { period: 5, lower: 30, upper: 70 })
    expect(sig.entries.length + sig.exits.length).toBeGreaterThan(0)
  })
})

describe('bullish-engulfing signal', () => {
  it('识别看涨吞没并在 holdN 根后退出', () => {
    // 第 2 根（index 2）阴，第 3 根（index 3）大阳完全吞没第 2 根
    const series = [
      { o: 10, h: 10.5, l: 9.5, c: 10, v: 1 },
      { o: 10, h: 10.2, l: 9, c: 9.2, v: 1 },     // 阴
      { o: 9.2, h: 9.3, l: 8.6, c: 8.8, v: 1 },   // 阴（被吞没的前一根）
      { o: 8.6, h: 9.6, l: 8.5, c: 9.5, v: 1 },   // 阳，o<=前c(8.8) 且 c>=前o(9.2) → 吞没
    ]
    const sig = getRule('bullish-engulfing').signal(series, { holdN: 2 })
    expect(sig.entries).toContain(3)
    expect(sig.exits).toContain(Math.min(3 + 2, series.length - 1))
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/playground/rules.test.js`
Expected: FAIL（文件不存在）。

- [ ] **Step 3: 实现 `src/playground/rules.js`：**

```js
import { sma, rsi } from '../charts/indicators/calc.js'

// MA 金叉/死叉：快线上穿慢线买、下穿卖
const maCross = {
  id: 'ma-cross',
  name: 'MA 金叉/死叉',
  params: [
    { key: 'fast', label: '快线周期', min: 2, max: 20, step: 1, default: 5 },
    { key: 'slow', label: '慢线周期', min: 5, max: 60, step: 1, default: 20 },
  ],
  signal(series, { fast, slow }) {
    const closes = series.map((b) => b.c)
    const f = sma(closes, fast)
    const s = sma(closes, slow)
    const entries = []
    const exits = []
    for (let i = 1; i < closes.length; i++) {
      if (f[i] == null || s[i] == null || f[i - 1] == null || s[i - 1] == null) continue
      if (f[i - 1] <= s[i - 1] && f[i] > s[i]) entries.push(i)
      else if (f[i - 1] >= s[i - 1] && f[i] < s[i]) exits.push(i)
    }
    return { entries, exits }
  },
}

// RSI 阈值：超卖买、超买卖（电平触发，由回测状态机配对）
const rsiThreshold = {
  id: 'rsi-threshold',
  name: 'RSI 超买超卖',
  params: [
    { key: 'period', label: 'RSI 周期', min: 3, max: 30, step: 1, default: 14 },
    { key: 'lower', label: '超卖阈值', min: 10, max: 45, step: 1, default: 30 },
    { key: 'upper', label: '超买阈值', min: 55, max: 90, step: 1, default: 70 },
  ],
  signal(series, { period, lower, upper }) {
    const r = rsi(series.map((b) => b.c), period)
    const entries = []
    const exits = []
    for (let i = 0; i < r.length; i++) {
      if (r[i] == null) continue
      if (r[i] < lower) entries.push(i)
      else if (r[i] > upper) exits.push(i)
    }
    return { entries, exits }
  },
}

// 看涨吞没：阳线完全吞没前一根阴线实体；持有 holdN 根后退出
const bullishEngulfing = {
  id: 'bullish-engulfing',
  name: '看涨吞没',
  params: [{ key: 'holdN', label: '持有根数', min: 1, max: 20, step: 1, default: 5 }],
  signal(series, { holdN }) {
    const entries = []
    const exits = []
    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1]
      const cur = series[i]
      const prevBear = prev.c < prev.o
      const curBull = cur.c > cur.o
      const engulf = cur.o <= prev.c && cur.c >= prev.o
      if (prevBear && curBull && engulf) {
        entries.push(i)
        exits.push(Math.min(i + holdN, series.length - 1))
      }
    }
    return { entries, exits }
  },
}

export const rules = [maCross, rsiThreshold, bullishEngulfing]

export function getRule(id) {
  return rules.find((r) => r.id === id)
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/playground/rules.test.js`
Expected: PASS。若某用例失败，**先诊断**（例如检查构造的序列是否真的产生交叉/吞没），不要篡改断言去迁就实现。再跑 `npm test`。

- [ ] **Step 5: 提交**

```bash
git add src/playground/rules.js src/playground/rules.test.js
git commit -m "feat: playground规则注册表(MA金叉/RSI阈值/看涨吞没,复用calc)"
```

---

## Task P3: 回测引擎 `backtest.js` + 测试（核心，精确断言）

**Files:** Create `src/playground/backtest.js` + `src/playground/backtest.test.js`

纯函数 `run(series, signals, {costBps}) => {trades, stats}`。多头单仓状态机：flat 时遇 entry 索引买入；long 时遇 entry 之后的 exit 索引卖出，记一笔。末尾未平仓不强制平仓（忽略）。

- [ ] **Step 1: 写失败的测试** — 创建 `src/playground/backtest.test.js`：

```js
import { describe, it, expect } from 'vitest'
import { run } from './backtest.js'

const bars = (closes) => closes.map((c) => ({ o: c, h: c, l: c, c, v: 1 }))

describe('backtest run', () => {
  it('单笔盈利，零成本', () => {
    const { trades, stats } = run(bars([100, 110, 105, 120]), { entries: [0], exits: [3] }, { costBps: 0 })
    expect(trades).toHaveLength(1)
    expect(trades[0].grossReturn).toBeCloseTo(0.2, 10)
    expect(stats.count).toBe(1)
    expect(stats.winRate).toBeCloseTo(1, 10)
    expect(stats.expectancy).toBeCloseTo(0.2, 10)
    expect(stats.totalReturn).toBeCloseTo(0.2, 10)
    expect(stats.buyHoldReturn).toBeCloseTo(0.2, 10) // 120/100-1
  })
  it('计入成本：每边 50bps → 单笔净收益 0.2-0.01=0.19', () => {
    const { stats } = run(bars([100, 110, 105, 120]), { entries: [0], exits: [3] }, { costBps: 50 })
    expect(stats.expectancy).toBeCloseTo(0.19, 10)
  })
  it('两笔一盈一亏，胜率/期望/复利累计正确', () => {
    // 100→120(+.2 赢)，120→90(-.25 亏)
    const { stats } = run(bars([100, 120, 120, 90]), { entries: [0, 2], exits: [1, 3] }, { costBps: 0 })
    expect(stats.count).toBe(2)
    expect(stats.winRate).toBeCloseTo(0.5, 10)
    expect(stats.avgWin).toBeCloseTo(0.2, 10)
    expect(stats.avgLoss).toBeCloseTo(-0.25, 10)
    expect(stats.expectancy).toBeCloseTo((0.2 - 0.25) / 2, 10) // -0.025
    expect(stats.totalReturn).toBeCloseTo(1.2 * 0.75 - 1, 10)  // -0.1
    expect(stats.buyHoldReturn).toBeCloseTo(-0.1, 10)          // 90/100-1
  })
  it('long 时忽略重复 entry；flat 时忽略 exit', () => {
    // entries=[0,1] 第二个在持仓中被忽略；exit 在 idx2
    const { trades } = run(bars([100, 105, 110]), { entries: [0, 1], exits: [2] }, { costBps: 0 })
    expect(trades).toHaveLength(1)
    expect(trades[0].entryIdx).toBe(0)
    expect(trades[0].exitIdx).toBe(2)
  })
  it('无信号：count=0，期望/胜率为0，buyHold 仍计算', () => {
    const { stats } = run(bars([100, 90, 80]), { entries: [], exits: [] }, { costBps: 0 })
    expect(stats.count).toBe(0)
    expect(stats.winRate).toBe(0)
    expect(stats.expectancy).toBe(0)
    expect(stats.totalReturn).toBe(0)
    expect(stats.buyHoldReturn).toBeCloseTo(-0.2, 10)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/playground/backtest.test.js`
Expected: FAIL（文件不存在）。

- [ ] **Step 3: 实现 `src/playground/backtest.js`：**

```js
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/playground/backtest.test.js`
Expected: PASS（5 用例，精确数值）。再跑 `npm test`。

- [ ] **Step 5: 提交**

```bash
git add src/playground/backtest.js src/playground/backtest.test.js
git commit -m "feat: playground回测引擎(多头单仓/线性成本/复利累计/对比买入持有)+精确测试"
```

---

## Task P4: CandleChart 新增 `marker` 买卖点标注 + 测试

**Files:**
- Modify: `src/charts/CandleChart.jsx`（加 marker 渲染）
- Modify: `src/charts/CandleChart.test.jsx`（加 marker 断言）

`{ type:'marker', index, dir:'buy'|'sell' }`：买=红三角（在该根下方、朝上），卖=绿三角（在该根上方、朝下）。遵循红涨绿跌（UP=`#f43f5e`，DOWN=`#22c55e`）。

- [ ] **Step 1: 先写失败的测试** — 先 Read `src/charts/CandleChart.test.jsx` 对齐其 render/断言风格，然后在其中追加：

```js
  it('渲染 marker 买卖点（买红卖绿，带 data-dir）', () => {
    const data = [
      { o: 10, h: 11, l: 9, c: 10 },
      { o: 10, h: 12, l: 9, c: 11 },
      { o: 11, h: 12, l: 10, c: 10 },
    ]
    const { container } = render(
      <CandleChart data={data} annotations={[
        { type: 'marker', index: 1, dir: 'buy' },
        { type: 'marker', index: 2, dir: 'sell' },
      ]} />
    )
    const markers = container.querySelectorAll('[data-role="marker"]')
    expect(markers).toHaveLength(2)
    const buy = container.querySelector('[data-role="marker"][data-dir="buy"]')
    const sell = container.querySelector('[data-role="marker"][data-dir="sell"]')
    expect(buy.getAttribute('fill')).toBe('#f43f5e')   // 红=买（涨色）
    expect(sell.getAttribute('fill')).toBe('#22c55e')  // 绿=卖（跌色）
  })
```
（若该测试文件顶部没有 `render`/`CandleChart` 的 import，按文件现有 import 风格补齐——一般已存在。）

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/charts/CandleChart.test.jsx`
Expected: FAIL（marker 未渲染，querySelectorAll 长度 0）。

- [ ] **Step 3: 实现** — 在 `src/charts/CandleChart.jsx` 的「斜趋势线」`annotations.filter((a) => a.type === 'trendline')` 那个 `map` 块**之后**、`{/* K线 */}` 注释之前，插入 marker 渲染块：

```jsx
      {/* 买卖点标注（买=红三角朝上在下方，卖=绿三角朝下在上方；红涨绿跌） */}
      {annotations
        .filter((a) => a.type === 'marker')
        .map((a, i) => {
          const c = laid[a.index]
          if (!c) return null
          const buy = a.dir === 'buy'
          const color = buy ? UP : DOWN
          const points = buy
            ? `${c.x},${c.lowY + 4} ${c.x - 4},${c.lowY + 11} ${c.x + 4},${c.lowY + 11}`
            : `${c.x},${c.highY - 4} ${c.x - 4},${c.highY - 11} ${c.x + 4},${c.highY - 11}`
          return <polygon key={`marker-${i}`} data-role="marker" data-dir={a.dir} points={points} fill={color} />
        })}
```
（`UP`/`DOWN`/`laid` 都已在组件作用域内。）

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/charts/CandleChart.test.jsx`
Expected: PASS。再跑 `npm test` 确认无连带破坏（现有 CandleChart 用例不受影响）。

- [ ] **Step 5: 提交**

```bash
git add src/charts/CandleChart.jsx src/charts/CandleChart.test.jsx
git commit -m "feat: CandleChart新增marker买卖点标注(红买绿卖)"
```

---

## Task P5: StatsPanel 结果对比组件 + 测试（纯展示）

**Files:** Create `src/components/StatsPanel.jsx` + `src/components/StatsPanel.test.jsx`

纯展示组件：给定 `strategy`（本策略 stats）、`control`（随机对照组 stats），并排展示交易次数/胜率/期望/累计收益，以及买入持有基准（取自 strategy.buyHoldReturn）。`data-role="stats-row"`。

- [ ] **Step 1: 写失败的测试** — 创建 `src/components/StatsPanel.test.jsx`：

```js
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsPanel from './StatsPanel.jsx'

const strat = { count: 8, winRate: 0.5, avgWin: 0.1, avgLoss: -0.06, expectancy: 0.02, totalReturn: 0.16, buyHoldReturn: 0.3, costBps: 50 }
const ctrl = { count: 7, winRate: 0.43, avgWin: 0.08, avgLoss: -0.07, expectancy: -0.005, totalReturn: -0.03, buyHoldReturn: 0.1, costBps: 50 }

describe('StatsPanel', () => {
  it('展示交易次数/胜率/期望/累计收益四项指标', () => {
    render(<StatsPanel strategy={strat} control={ctrl} />)
    expect(screen.getByText(/交易次数/)).toBeInTheDocument()
    expect(screen.getByText(/胜率/)).toBeInTheDocument()
    expect(screen.getByText(/期望/)).toBeInTheDocument()
    expect(screen.getByText(/累计收益/)).toBeInTheDocument()
  })
  it('每个指标一行，带 data-role', () => {
    const { container } = render(<StatsPanel strategy={strat} control={ctrl} />)
    expect(container.querySelectorAll('[data-role="stats-row"]').length).toBeGreaterThanOrEqual(4)
  })
  it('展示本策略胜率 50.0%', () => {
    render(<StatsPanel strategy={strat} control={ctrl} />)
    expect(screen.getAllByText(/50\.0%/).length).toBeGreaterThanOrEqual(1)
  })
  it('展示买入持有基准 30.0%', () => {
    render(<StatsPanel strategy={strat} control={ctrl} />)
    expect(screen.getByText(/30\.0%/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/StatsPanel.test.jsx`
Expected: FAIL（组件不存在）。

- [ ] **Step 3: 实现 `src/components/StatsPanel.jsx`：**

```jsx
const pct = (x) => `${(x * 100).toFixed(1)}%`

export default function StatsPanel({ strategy, control }) {
  const rows = [
    { key: 'count', label: '交易次数', fmt: (s) => String(s.count) },
    { key: 'winRate', label: '胜率', fmt: (s) => pct(s.winRate) },
    { key: 'expectancy', label: '期望值/笔', fmt: (s) => pct(s.expectancy) },
    { key: 'totalReturn', label: '累计收益(计入成本)', fmt: (s) => pct(s.totalReturn) },
  ]
  return (
    <table data-role="stats-panel" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: 8, color: 'var(--text-dim)' }}>指标</th>
          <th style={{ padding: 8, color: 'var(--text-dim)' }}>本策略</th>
          <th style={{ padding: 8, color: 'var(--text-dim)' }}>随机对照组</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} data-role="stats-row" style={{ borderTop: '1px solid var(--border)' }}>
            <td style={{ padding: 8, color: 'var(--text-dim)' }}>{r.label}</td>
            <td style={{ padding: 8, textAlign: 'center', fontWeight: 700 }}>{r.fmt(strategy)}</td>
            <td style={{ padding: 8, textAlign: 'center', color: 'var(--text-mute)' }}>{control ? r.fmt(control) : '—'}</td>
          </tr>
        ))}
        <tr data-role="stats-row" style={{ borderTop: '1px solid var(--border-strong)' }}>
          <td style={{ padding: 8, color: 'var(--text-dim)' }}>买入持有(基准)</td>
          <td colSpan={2} style={{ padding: 8, textAlign: 'center', color: 'var(--primary-text)' }}>
            {pct(strategy.buyHoldReturn)}
          </td>
        </tr>
      </tbody>
    </table>
  )
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/components/StatsPanel.test.jsx`
Expected: PASS（4 用例）。再跑 `npm test`。

- [ ] **Step 5: 提交**

```bash
git add src/components/StatsPanel.jsx src/components/StatsPanel.test.jsx
git commit -m "feat: 回测结果对比组件StatsPanel(本策略vs随机对照vs买入持有)"
```

---

## Task P6: PlaygroundPage 集成 + 路由 + 工具入口 + 测试

**Files:**
- Create: `src/components/PlaygroundPage.jsx` + `src/components/PlaygroundPage.test.jsx`
- Modify: `src/router.jsx`（加 `/playground` 路由）
- Modify: `src/content/tools.js` + `src/content/tools.test.js`（加 playground 工具页）

页面：诚实免责横幅 + 控制面板（规则选择 + 参数滑块 + regime 选择 + 成本输入）+ CandleChart（叠加成交买卖点 marker）+ StatsPanel（本策略 vs 随机对照）。

- [ ] **Step 1: 写失败的测试** — 创建 `src/components/PlaygroundPage.test.jsx`：

```js
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PlaygroundPage from './PlaygroundPage.jsx'

function setup() {
  return render(<MemoryRouter><PlaygroundPage /></MemoryRouter>)
}

describe('PlaygroundPage', () => {
  it('展示诚实免责声明（合成数据/不代表真实有效性）', () => {
    setup()
    expect(screen.getByText(/不代表真实有效性/)).toBeInTheDocument()
  })
  it('渲染规则选择器与三条规则选项', () => {
    setup()
    expect(screen.getByLabelText(/规则/)).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /MA 金叉/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /RSI/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /看涨吞没/ })).toBeInTheDocument()
  })
  it('渲染市场情境选择器（含随机）', () => {
    setup()
    expect(screen.getByLabelText(/市场情境/)).toBeInTheDocument()
  })
  it('渲染结果面板（StatsPanel）与图表', () => {
    const { container } = setup()
    expect(container.querySelector('[data-role="stats-panel"]')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/PlaygroundPage.test.jsx`
Expected: FAIL（组件不存在）。

- [ ] **Step 3a: 实现 `src/components/PlaygroundPage.jsx`：**

```jsx
import { useMemo, useState } from 'react'
import { genSeries } from '../playground/dataGen.js'
import { rules, getRule } from '../playground/rules.js'
import { run } from '../playground/backtest.js'
import CandleChart from '../charts/CandleChart.jsx'
import StatsPanel from './StatsPanel.jsx'

const REGIMES = [
  { id: 'trend', label: '趋势市（单边）' },
  { id: 'range', label: '震荡市（箱体）' },
  { id: 'reversal', label: '反转市（倒V）' },
  { id: 'random', label: '随机游走（对照）' },
]

function defaultParams(rule) {
  const p = {}
  for (const item of rule.params) p[item.key] = item.default
  return p
}

export default function PlaygroundPage() {
  const [ruleId, setRuleId] = useState('ma-cross')
  const rule = getRule(ruleId)
  const [params, setParams] = useState(() => defaultParams(rule))
  const [regime, setRegime] = useState('trend')
  const [costBps, setCostBps] = useState(50)

  function onRuleChange(id) {
    setRuleId(id)
    setParams(defaultParams(getRule(id)))
  }

  const series = useMemo(() => genSeries(regime, 42), [regime])
  const control = useMemo(() => genSeries('random', 7), [])

  const signals = rule.signal(series, params)
  const result = run(series, signals, { costBps })
  const controlSignals = rule.signal(control, params)
  const controlResult = run(control, controlSignals, { costBps })

  const markers = [
    ...result.trades.map((t) => ({ type: 'marker', index: t.entryIdx, dir: 'buy' })),
    ...result.trades.map((t) => ({ type: 'marker', index: t.exitIdx, dir: 'sell' })),
  ]

  return (
    <div>
      <h1 style={{ fontSize: 26 }}>回测沙盘</h1>
      <p
        data-role="pg-disclaimer"
        style={{
          color: 'var(--text-dim)', background: 'var(--surface)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, marginTop: 8,
        }}
      >
        <strong style={{ color: 'var(--warn)' }}>合成数据仅演示计算方法，胜率系设计产物，不代表真实有效性。</strong>{' '}
        右侧「随机对照组」是同一规则在纯随机数据上的结果——若你的策略和它差不多，就说明"看似有效"只是错觉。切换市场情境，看同一规则胜率如何天差地别。
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: '16px 0' }}>
        <label>
          规则：
          <select value={ruleId} onChange={(e) => onRuleChange(e.target.value)}>
            {rules.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </label>
        <label>
          市场情境：
          <select value={regime} onChange={(e) => setRegime(e.target.value)}>
            {REGIMES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </label>
        <label>
          单边成本(bps)：
          <input type="number" min="0" max="200" value={costBps}
            onChange={(e) => setCostBps(Number(e.target.value) || 0)} style={{ width: 70 }} />
        </label>
        {rule.params.map((p) => (
          <label key={p.key}>
            {p.label}：
            <input
              type="number" min={p.min} max={p.max} step={p.step} value={params[p.key]}
              onChange={(e) => setParams((prev) => ({ ...prev, [p.key]: Number(e.target.value) }))}
              style={{ width: 70 }}
            />
          </label>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,1.4fr) minmax(240px,1fr)', gap: 20, alignItems: 'start' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 12 }}>
          <CandleChart data={series} annotations={markers} width={480} height={260} />
        </div>
        <StatsPanel strategy={result.stats} control={controlResult.stats} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3b: 接路由** — `src/router.jsx`：import 加 `import PlaygroundPage from './components/PlaygroundPage.jsx'`；在 `/:category` 之前加 `<Route path="/playground" element={<PlaygroundPage />} />`。

- [ ] **Step 3c: tools 注册表加 playground** — `src/content/tools.js` 的 `tools` 数组追加：
```js
  { id: 'playground', path: '/playground', name: '回测沙盘', icon: '🧪', desc: '参数沙盘+信号回测（合成数据·诚实框架）', enabled: true },
```
`src/content/tools.test.js` 追加：
```js
  it('包含回测沙盘且 path 为 /playground', () => {
    const p = tools.find((t) => t.id === 'playground')
    expect(p).toBeTruthy()
    expect(p.path).toBe('/playground')
  })
```

- [ ] **Step 4: 跑全部测试确认通过**

Run: `npm test`
Expected: PASS 全绿。（首页/Nav 自动多出「回测沙盘」入口。）

- [ ] **Step 5: 提交**

```bash
git add src/components/PlaygroundPage.jsx src/components/PlaygroundPage.test.jsx src/router.jsx src/content/tools.js src/content/tools.test.js
git commit -m "feat: 回测沙盘页/playground(规则+调参+情境+随机对照,诚实框架)+路由与入口"
```

---

## 完成标准

- 访问 `/playground`：选规则/调参/选市场情境/设成本 → 图表叠加成交买卖点（红买绿卖）+ StatsPanel 展示本策略 vs 随机对照 vs 买入持有。
- 醒目免责声明在页顶；随机对照组与多市场情境均可用。
- 引擎三模块（dataGen/rules/backtest）为纯函数且有精确测试；数据源经 `DataSource.load()` 抽象，日后接真实数据只换数据层。
- `categories.js` 未改动；无第三方库；`npm test` 全绿；6 个原子提交，中文 `feat:` 前缀。

> **playground 完成即四块工具页全部落地。** 「接真实数据」是更大的独立方向（见 AGENTS.md §9），届时新增 `realSource(symbol,range)` 实现同一 `DataSource` 接口即可复用全部引擎与 UI。
