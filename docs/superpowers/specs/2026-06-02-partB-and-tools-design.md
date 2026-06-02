# 设计文档 — Part B（失效场景）+ 三个工具页（2026-06-02）

> 本文档规划 4 条工作流：Part B 内容铺设 + 有效性矩阵 + 术语速查/搜索 + playground 回测沙盘。
> 接手前先读 `AGENTS.md`。所有约定（红涨绿跌、SVG 自绘、TDD、原子提交、改条目数同步测试计数）继续生效。

---

## 0. 总路线与排期（方案 A）

按「价值/风险」递增顺序，每块独立可交付，每步 `npm test` 全绿后原子提交：

1. **Part B** — 给现有 45 条目铺 `pitfalls` 失效场景（纯内容，零架构风险）
2. **有效性矩阵** — 趋势市/震荡市适用性对照表（小、最贴合「适用环境」立场）
3. **术语速查 + 搜索** — 全站搜索 + 术语表（中、实用工具）
4. **playground** — 参数沙盘 + 信号回测引擎（大、为日后接真实数据架构）

矩阵 / 搜索 / playground 均作为**独立工具页**，不进 8 大板块（避免牵动 categories/HomePage/Nav 的板块计数语义，也不符合「一个板块=条目数组」模型）。

贯穿原则：**诚实克制**。新增的回测/矩阵都必须醒目标注"经验/合成数据，不代表真实有效性"。

---

## 1. 块 1 / Part B — 失效场景 `pitfalls`

**性质**：纯内容。渲染层（TopicPage 的「⚠ 何时会失效」）已就绪，只需在各 topic `sections` 加 `pitfalls: [...]`。

**内容标准**（每条目 2–4 条，遵循现有 risk 板块口吻）：
- 具体、可识别的失效条件，不空泛（例：「放量突破」→「突破当日量能未达 20 日均量 1.5 倍 → 假突破概率高」）。
- 与该条目已有「局限」互补，不重复——回答「具体何时会失效」。
- 诚实克制，不堆砌。

**分批**（每批一次原子提交，提交前 `npm test` 全绿）：

| 批次 | 板块 | 条目数 |
|---|---|---|
| B1 | candlestick | 12 |
| B2 | indicator | 8 |
| B3 | pattern | 8 |
| B4 | theory(4)+volume(4) | 8 |
| B5 | intraday(4)+strategy(5) | 9 |

**测试**：`pitfalls` 为可选字段，`validate.js` 不强制。每个板块 `*.test.js` **新增一条断言**「该板块全部条目都含非空 pitfalls 数组」，保证铺设完整、防回归。risk 板块已满足。

---

## 2. 块 2 / 有效性矩阵

**数据层** `src/content/effectiveness.js`：
```js
{
  columns: [
    { id:'trend',    label:'趋势市（单边）' },
    { id:'range',    label:'震荡市（箱体）' },
    { id:'reversal', label:'反转/拐点' },
  ],
  rows: [
    { id:'ma',   label:'均线(MA)', ratings:{ trend:'high', range:'low',  reversal:'mid' }, notes:{ trend:'…', range:'…', reversal:'…' } },
    { id:'macd', label:'MACD',    ratings:{ … }, notes:{ … } },
    // 覆盖核心指标/形态/方法
  ],
}
```
- 评级 3 档 `high/mid/low`，用**中性色阶/灰阶**（不用 up/down 红绿，避免语义混淆）+ 文字标签。
- 每格一句话说明（`notes`），诚实标注「定性经验判断，非统计结论」。
- 页顶免责横幅：真实有效性需 playground / 真实数据验证（呼应块 4）。

**组件** `src/components/EffectivenessMatrix.jsx`（非 SVG，归 components）：渲染表格，格子加 `data-role` 供断言。

**接入**：新路由 `/matrix`，导航/首页加入口。

**测试**：
- `effectiveness.test.js`：每行覆盖所有列、评级值合法、notes 齐全。
- `EffectivenessMatrix.test.jsx`：渲染行列数、评级文案。

---

## 3. 块 3 / 术语速查 + 搜索

### 3a. 全站搜索
- **索引** `src/search/index.js`（纯前端，无第三方库）：对 `allTopics` 构建内存索引，覆盖 `title/subtitle/tags/sections 文本`。子串 + 分词匹配（中文按字/词，英文按词），字段权重 title>tags>正文。术语并入索引（见 3b）。
- **UI**：顶栏常驻搜索框 → 即时下拉结果（标题+所属板块+命中片段），回车进 `/search?q=` 结果页 → 点击跳 `/:category/:topic`。结果项加 `data-role`。

### 3b. 术语速查
- **数据** `src/content/glossary.js`（curated 小表，独立于 topics）：`{ term, def, related:[topicId] }`。覆盖高频术语（金叉/背离/缩量/颈线/VWAP/期望值…）。
- **UI**：术语页 `/glossary`，分组列出，每条可跳关联条目。
- 术语**并入搜索索引**作为一类结果（统一入口）。

**接入**：路由 `/search`、`/glossary`，导航加入口，搜索框常驻顶栏。

**测试**：
- `search/index.test.js`（纯函数）：给定查询→断言命中条目/排序。
- `glossary.test.js`：字段齐全、`related` 指向存在的 topic id。
- 搜索框/结果页/术语页各一个渲染测试。

---

## 4. 块 4 / playground — 参数沙盘 + 信号回测引擎

核心原则：**纯函数引擎 + 可换数据源 + 诚实框架**。数据接口统一为 `{o,h,l,c,v}[]`，日后接真实数据只换数据层、引擎不动。

### 分层架构（新目录 `src/playground/`）

**① 数据层** `dataGen.js`
- `genSeries(regime, seed, n=240) → Bar[]`，`regime ∈ {trend, range, reversal, random}`。
- `random` = 随机游走，专作**对照组**基准。
- 满足 `h>=max(o,c) && l<=min(o,c)`（沿用 chartData.test 同款不变式）；`seed` 可复现。
- **真实数据预留**：定义 `DataSource = { id, label, load(): Promise<Bar[]> }`；v1 实现 `syntheticSource(regime, seed)`，日后加 `realSource(symbol, range)` 即插即用。

**② 规则层** `rules.js`
- 规则 = `{ id, name, params:[{key,label,min,max,default}], signal(series, params) → { entries:int[], exits:int[] } }`。
- v1 三条（复用 `indicators/calc.js`，对应三大家族，各讲一个证伪故事）：
  - `ma-cross` — 金叉买/死叉卖（参数：快/慢周期）。揭穿：趋势市好看、震荡市被 whipsaw。
  - `rsi-threshold` — 超卖买/超买卖（参数：周期/上下阈值）。揭穿：与 MA 相反，趋势市持续超买仍涨。
  - `bullish-engulfing` — 形态出现买、持有 N 根后卖（参数：N）。揭穿：常≈随机对照组。

**③ 回测引擎** `backtest.js`（纯函数，TDD 核心）
- `run(series, signals, { costBps }) → { trades, stats }`。
- `stats`：交易次数、胜率、平均盈/亏、**期望值**、累计收益、**对比买入持有**、**计入成本后净值**。
- `costBps` 默认含 A 股双边成本（佣金+印花税，标注经验值）。

**④ 诚实框架**（贯穿）
- 页顶**醒目免责横幅**：合成数据仅演示计算方法，胜率系设计产物，不代表真实有效性。
- **随机对照组**：同规则在 `random` 序列跑一遍并排展示 → "看似有效"在随机数据上也成立。
- **多市场情境**：regime 选择器，同规则在 trend/range/reversal 下胜率天差地别 → 呼应有效性矩阵。

### UI — 新页面 `/playground`
- 左：控制面板（规则选择 + 参数滑块 + regime 选择 + 成本输入）。
- 中：复用 `CandleChart`，叠加买卖点。**新增 annotation 类型** `{ type:'marker', index, dir:'buy'|'sell' }`（红买绿卖，遵循红涨绿跌）。
- 右：结果面板（stats 表 + 本策略 vs 买入持有 vs 随机对照 三栏对比）。

### 测试（TDD）
- `backtest.test.js`：已知序列+已知信号 → 断言每项 stat 精确值（引擎正确性核心保障）。
- `rules.test.js`：给定序列 → 断言 entries/exits 索引。
- `dataGen.test.js`：形状 + OHLC 不变式 + seed 可复现。
- `CandleChart` marker 标注渲染测试 + playground 页组件测试。

### 接入
- 路由 `/playground`，导航/首页加入口（独立工具页，不进 8 大板块）。

**复用**：`CandleChart`、`geometry`、`indicators/calc`、`chartData` 生成思路。
**新增**：`dataGen` / `rules` / `backtest` 三个纯模块 + 一个页面 + `marker` 标注类型。

---

## 5. 红线（继续遵守 AGENTS.md §10）
- 红涨绿跌，永不搞反。
- 内容诚实克制；矩阵评级标"定性经验"，回测标"合成数据/不代表真实有效性"。
- 改条目/板块数量后同步更新对应测试硬编码计数。
- 不引第三方图表库；图表 SVG 自绘。搜索/索引不引第三方库。
- 提交前 `npm test` 全绿；分批原子提交，中文 `feat:/fix:` 前缀。
