# Part B 失效场景（pitfalls）铺设 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给现有 45 个条目（candlestick/indicator/pattern/theory/volume/intraday/strategy 七个板块）补充结构化「失效场景」`pitfalls` 数组，并为每个板块测试加「全条目都含 pitfalls」完整性断言。

**Architecture:** 纯内容工作。渲染层（TopicPage 的「⚠ 何时会失效」）已就绪，只需在各 topic 的 `sections` 加 `pitfalls: [...]`。每个板块一个原子提交，先改测试（红）→ 补内容（绿）→ 提交。

**Tech Stack:** React 18 + Vite 5 + Vitest 2。无新依赖。

**内容标准（每个条目 2–4 条 pitfalls，照搬 risk 板块口吻）：**
- 具体、可识别的失效条件，不空泛。反例：「市场不好时会失效」。正例：「突破当日量能未达 20 日均量 1.5 倍 → 假突破概率高」。
- 与该条目已有 `limitation` 互补，回答「具体何时会失效」，不重复局限里已说的话。
- 诚实克制，不堆砌；红涨绿跌语境。

---

## Task B1: candlestick 板块（12 条目）

**Files:**
- Modify: `src/content/topics/candlestick.js`（给 12 个条目各加 `sections.pitfalls`）
- Modify: `src/content/topics/candlestick.test.js`（加完整性断言）

条目 id：`kline-basics, hammer, doji, bullish-engulfing, bearish-engulfing, morning-star, dark-cloud-cover, piercing-line, evening-star, harami, shooting-star, hanging-man`

- [ ] **Step 1: 先写失败的测试** — 在 `candlestick.test.js` 的 `describe` 块内追加：

```js
  it('每个条目含 pitfalls(失效场景) 数组', () => {
    for (const t of candlestickTopics) {
      expect(Array.isArray(t.sections.pitfalls)).toBe(true)
      expect(t.sections.pitfalls.length).toBeGreaterThan(0)
    }
  })
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/content/topics/candlestick.test.js`
Expected: FAIL — 新断言报 `Array.isArray(undefined)` 为 false（条目尚无 pitfalls）。

- [ ] **Step 3: 给 12 个条目补 pitfalls 内容** — 在每个条目的 `sections` 内、`limitation` 旁加 `pitfalls` 数组（2–4 条，按上述标准）。范例（hammer 锤子线）：

```js
      pitfalls: [
        '下跌趋势中途出现的锤子，常只是技术性反抽，随后续跌',
        '锤子次日未能高开/放量确认，反转往往落空',
        '弱势股、缩量环境下的锤子可靠性显著下降',
      ],
```
范例（doji 十字星）：
```js
      pitfalls: [
        '震荡市里十字星遍地都是，几乎没有指示意义',
        '低位十字星若无量能配合，常只是缩量歇脚而非变盘',
        '处在强趋势中的十字星，多数被趋势直接吞掉',
      ],
```
其余 10 个条目照此为每个写 2–4 条**具体**失效场景。

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/content/topics/candlestick.test.js`
Expected: PASS（全部断言绿）。

- [ ] **Step 5: 提交**

```bash
git add src/content/topics/candlestick.js src/content/topics/candlestick.test.js
git commit -m "feat: K线板块12条目补失效场景(pitfalls)+完整性断言"
```

---

## Task B2: indicator 板块（8 条目）

**Files:**
- Modify: `src/content/topics/indicator.js`
- Modify: `src/content/topics/indicator.test.js`

条目 id：`ma, macd, kdj, rsi, boll, dmi, obv, bias`

- [ ] **Step 1: 先写失败的测试** — 在 `indicator.test.js` 的 `describe` 块内追加：

```js
  it('每个条目含 pitfalls(失效场景) 数组', () => {
    for (const t of indicatorTopics) {
      expect(Array.isArray(t.sections.pitfalls)).toBe(true)
      expect(t.sections.pitfalls.length).toBeGreaterThan(0)
    }
  })
```
（注意导入名：确认 `indicator.test.js` 顶部从 `./indicator.js` 导入的数组名，按其实际名替换 `indicatorTopics`。）

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/content/topics/indicator.test.js`
Expected: FAIL — 新断言失败。

- [ ] **Step 3: 给 8 个条目补 pitfalls** — 范例（ma 均线）：

```js
      pitfalls: [
        '震荡市里均线频繁缠绕、金叉死叉反复，是典型 whipsaw 重灾区',
        '均线天然滞后，急涨急跌行情里信号到时行情常已走完大半',
        '周期参数对历史数据过拟合：换一段行情最优周期就变',
      ],
```
范例（rsi）：
```js
      pitfalls: [
        '强趋势中 RSI 可长期钝化于超买/超卖区，照此反向操作会被反复打脸',
        '阈值(70/30)是经验值，不同品种/周期并不通用',
        '背离信号可连续出现多次才兑现，单次背离不足为凭',
      ],
```
其余 6 个（macd/kdj/boll/dmi/obv/bias）照此各写 2–4 条。

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/content/topics/indicator.test.js`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/content/topics/indicator.js src/content/topics/indicator.test.js
git commit -m "feat: 指标板块8条目补失效场景(pitfalls)+完整性断言"
```

---

## Task B3: pattern 板块（8 条目）

**Files:**
- Modify: `src/content/topics/pattern.js`
- Modify: `src/content/topics/pattern.test.js`

条目 id：`double-bottom, double-top, head-shoulders-top, ascending-triangle, rectangle, flag-wedge, gap, v-reversal`

- [ ] **Step 1: 先写失败的测试** — 在 `pattern.test.js` 的 `describe` 块内追加（数组名按文件实际导入名替换）：

```js
  it('每个条目含 pitfalls(失效场景) 数组', () => {
    for (const t of patternTopics) {
      expect(Array.isArray(t.sections.pitfalls)).toBe(true)
      expect(t.sections.pitfalls.length).toBeGreaterThan(0)
    }
  })
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/content/topics/pattern.test.js`
Expected: FAIL。

- [ ] **Step 3: 给 8 个条目补 pitfalls** — 范例（head-shoulders-top 头肩顶）：

```js
      pitfalls: [
        '颈线跌破后常有回抽确认，急于一破就空易被回抽止损扫掉',
        '形态越广为人知，主力越可能制造假破位诱空',
        '强势市里"头肩顶"可演变为中继整理而非反转',
      ],
```
范例（ascending-triangle 上升三角）：
```js
      pitfalls: [
        '突破缺乏放量配合时，假突破概率显著上升',
        '形态未走完(触压力次数不足)就预判方向，常误判',
        '大盘系统性下跌时，个股再标准的上升三角也易失效',
      ],
```
其余 6 个照此各写 2–4 条。

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/content/topics/pattern.test.js`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/content/topics/pattern.js src/content/topics/pattern.test.js
git commit -m "feat: 形态板块8条目补失效场景(pitfalls)+完整性断言"
```

---

## Task B4: theory(4) + volume(4) 板块（8 条目）

**Files:**
- Modify: `src/content/topics/theory.js` + `src/content/topics/theory.test.js`
- Modify: `src/content/topics/volume.js` + `src/content/topics/volume.test.js`

条目 id：theory = `trend-line, support-resistance, dow-theory, quant-overview`；volume = `volume-price, volume-breakout, volume-divergence, chip-distribution`

- [ ] **Step 1: 先写失败的测试** — 在 `theory.test.js` 与 `volume.test.js` 各自的 `describe` 块内追加（数组名按各文件实际导入名替换为 `theoryTopics` / `volumeTopics`）：

```js
  it('每个条目含 pitfalls(失效场景) 数组', () => {
    for (const t of theoryTopics) {     // volume.test.js 内改为 volumeTopics
      expect(Array.isArray(t.sections.pitfalls)).toBe(true)
      expect(t.sections.pitfalls.length).toBeGreaterThan(0)
    }
  })
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/content/topics/theory.test.js src/content/topics/volume.test.js`
Expected: FAIL（两文件新断言均失败）。

- [ ] **Step 3: 给 8 个条目补 pitfalls** — 范例（support-resistance 支撑压力）：

```js
      pitfalls: [
        '关键支撑/压力位人人皆知，最易成为反向猎杀的诱多诱空目标',
        '强趋势会直接洞穿支撑压力，区间思维在单边市失效',
        '画线带主观性：同一图不同人画出不同位，事后挑合适的线易自欺',
      ],
```
范例（volume-breakout 放量突破）：
```js
      pitfalls: [
        '"放量"无统一标准，对倒/脉冲放量可制造假突破',
        '突破当日量能未达均量明显倍数时，假突破比例高',
        '消息驱动的放量突破常一日游，次日即回落',
      ],
```
其余 6 个（trend-line/dow-theory/quant-overview/volume-price/volume-divergence/chip-distribution）照此各写 2–4 条。

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/content/topics/theory.test.js src/content/topics/volume.test.js`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add src/content/topics/theory.js src/content/topics/theory.test.js src/content/topics/volume.js src/content/topics/volume.test.js
git commit -m "feat: 趋势+量价板块8条目补失效场景(pitfalls)+完整性断言"
```

---

## Task B5: intraday(4) + strategy(5) 板块（9 条目）

**Files:**
- Modify: `src/content/topics/intraday.js` + `src/content/topics/intraday.test.js`
- Modify: `src/content/topics/strategy.js` + `src/content/topics/strategy.test.js`

条目 id：intraday = `intraday-basics, intraday-avgline, order-book, call-auction`；strategy = `market-regime, multi-indicator-resonance, multi-timeframe, position-risk, trading-system`

- [ ] **Step 1: 先写失败的测试** — 在 `intraday.test.js` 与 `strategy.test.js` 各自的 `describe` 块内追加（数组名按各文件实际导入名替换为 `intradayTopics` / `strategyTopics`）：

```js
  it('每个条目含 pitfalls(失效场景) 数组', () => {
    for (const t of intradayTopics) {   // strategy.test.js 内改为 strategyTopics
      expect(Array.isArray(t.sections.pitfalls)).toBe(true)
      expect(t.sections.pitfalls.length).toBeGreaterThan(0)
    }
  })
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/content/topics/intraday.test.js src/content/topics/strategy.test.js`
Expected: FAIL。

- [ ] **Step 3: 给 9 个条目补 pitfalls** — 范例（order-book 盘口五档）：

```js
      pitfalls: [
        '挂单可瞬间撤换：大买单常是诱多的"假墙"，未必真买',
        '盘口只反映限价单，扫单/冰山单看不见，据此判断方向易被骗',
        '低流动性个股盘口极易被少量资金操纵',
      ],
```
范例（multi-indicator-resonance 多指标共振）：
```js
      pitfalls: [
        '同源指标(都基于价格均线)共振是伪独立，并不增加确认力度',
        '指标越多越易"凑出"信号，本质是过拟合与确认偏差',
        '共振也无法对抗系统性风险，齐刷刷看多照样被大盘拖下水',
      ],
```
其余 7 个照此各写 2–4 条。

- [ ] **Step 4: 跑全部测试确认通过**

Run: `npm test`
Expected: PASS — 全部测试绿（28 文件，原 113 + 新增 7 条板块完整性断言 = 120 测试）。

- [ ] **Step 5: 提交**

```bash
git add src/content/topics/intraday.js src/content/topics/intraday.test.js src/content/topics/strategy.js src/content/topics/strategy.test.js
git commit -m "feat: 分时+实战板块9条目补失效场景(pitfalls)+完整性断言"
```

---

## 完成标准

- 7 个板块共 45 条目全部含非空 `pitfalls` 数组（加上 risk 板块 4 条 = 全站 49 条目全覆盖）。
- 7 个板块测试各加一条完整性断言，`npm test` 全绿。
- 5 个原子提交（B1–B5），中文 `feat:` 前缀。

> **下一步（独立计划）：** Part B 完成后，块 2「有效性矩阵」将另起一份 `docs/superpowers/plans/` 计划。
