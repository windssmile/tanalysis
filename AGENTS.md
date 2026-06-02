# AGENTS.md — 技术分析图谱（tanalysis）

> 本文件面向**接手本项目的 AI agent**，说明项目目标、架构约定、扩展配方、当前进度与后续路线。先读完本文件再动手。

---

## 1. 项目是什么

一个面向**中国大陆散户**的纯前端教学网站，系统介绍 K线/分时/技术指标/形态/趋势/量价/实战框架/风险管理。它**不接真实行情**，所有图表用手工设计的"教科书示意数据"自绘 SVG。

**核心立场（重要，影响内容口吻）**：随着迭代，项目重心已从"教你找买卖信号"转向"**理解市场 + 风险管理 + 量化纪律**"。维护者明确认同：技术分析的盈利信号价值有限，风险识别与纪律才是重点。因此：
- 每个条目都带「局限」，多数还带「📐量化视角」（如何统计检验、防过拟合、计入成本）。
- 内容要**诚实**：标注阈值是"经验参考值非普适常数"，不夸大形态/指标的有效性。

**A股惯例（绝对不能搞反）**：**红涨绿跌**。阳线/上涨 = 红 `#f43f5e`，阴线/下跌 = 绿 `#22c55e`。这与国际惯例相反。

---

## 2. 技术栈与命令

- React 18 + Vite 5 + react-router-dom 6（纯前端 SPA，无后端）
- Vitest 2 + @testing-library/react（TDD，全程测试驱动）
- 图表：纯 SVG 自绘，**不引第三方图表库**
- 路径别名：`@` → `/src`（见 `vite.config.js`）

```bash
npm install        # 安装依赖
npm run dev        # 开发服务器（默认 5173/5174）
npm test           # 跑全部测试（当前 113 passing / 28 文件）
npm run build      # 生产构建
```

---

## 3. 架构：数据驱动 + 图表注册表

核心理念：**内容与框架彻底分离**。加一个条目 = 加一个数据对象；加一个图表 = 写一个组件并注册。版式、导航、板块全自动生成。

```
src/
├── content/
│   ├── categories.js          8 大板块定义（id/name/icon/enabled/order/desc）
│   ├── validate.js            条目数据完整性校验
│   └── topics/
│       ├── index.js           汇总 allTopics + getTopic / topicsByCategory
│       ├── candlestick.js     各板块的条目数组（一个文件一个板块）
│       ├── indicator.js  pattern.js  theory.js  volume.js
│       ├── intraday.js   strategy.js  risk.js
│       └── *.test.js          每个板块一个测试（条目数 + 必填字段）
├── charts/
│   ├── chartRegistry.js       chartId → { Component, props } 注册表
│   ├── chartData.js           各 chartId 的示意数据（含 fromPath/genTrend/genTrendV/genIntraday 助手）
│   ├── geometry.js            纯函数：isBullish / candleColor / scaleY / layoutCandles
│   ├── chip.js                筹码分布计算
│   ├── CandleChart.jsx        通用 K线图（最常复用）
│   ├── PriceVolumeChart / ChipChart / IntradayChart / OrderBookTable / MultiTimeframeChart
│   └── indicators/            calc.js（指标计算）+ MA/MACD/KDJ/RSI/BOLL/DMI/OBV/BIAS 各图表
├── components/                HomePage / CategoryPage / TopicPage / TopicSidebar / NotFound + layout/
├── router.jsx                 / → /:category → /:category/:topic
└── styles/theme.css           设计令牌（CSS 变量）
```

**数据流**：路由 `:category/:topic` → `getTopic()` 取对象 → `TopicPage` 渲染文字字段 → 用 `chartId` 去 `chartRegistry` 取组件渲染。

---

## 4. 条目数据结构（topic schema）

```js
{
  id: 'bullish-engulfing',        // 唯一，kebab-case
  category: 'candlestick',        // 必须是 categories.js 里存在的 id
  title: '看涨吞没',
  subtitle: 'Bullish Engulfing',
  tags: ['组合形态', '反转', '看涨'],
  chartId: 'bullish-engulfing',   // 必须在 chartRegistry 注册
  sections: {
    meaning:    '……',            // 必填：段落
    identify:   ['…','…'],        // 必填：识别要点（数组）
    usage:      ['…','…'],        // 必填：使用提示（数组）
    limitation: '……',            // 必填：局限（段落）
    formula:    '……',            // 可选：计算原理（指标类用，渲染为「计算原理」）
    metrics:    ['…','…'],        // 可选：量化刻画（数组，渲染为「📏 量化刻画」+经验值提示）
    quant:      ['…','…'],        // 可选：量化视角（数组，渲染为「📐 量化视角」）
    pitfalls:   ['…','…'],        // 可选：失效场景（数组，渲染在「⚠局限」内的「何时会失效」）
  },
  related: ['bearish-engulfing', 'hammer'],   // 必须指向真实存在的 id（校验）
}
```

**字段约定（哪个板块用哪些可选字段，保持板块内一致）**：
- K线（candlestick）/ 形态（pattern）：用 `metrics`，不用 `formula`/`quant`。
- 指标（indicator）：用 `formula` + `metrics` + `quant`。
- 趋势（theory）/ 量价（volume）/ 实战（strategy）/ 分时（intraday）：用 `metrics` + `quant`。
- 风险（risk）：用 `metrics` + `quant` + `pitfalls`。

`validate.js` 校验：id、title、合法 category、已注册 chartId、必填四字段、related 指向存在的条目。`validate.test.js` 额外断言总数与各板块条目数——**改条目数时必须同步更新该测试的硬编码计数**。

---

## 5. 图表层与标注

`CandleChart` 支持的 `annotations` 类型（最常用，新形态优先复用它）：
- `{ type:'highlight', index }` —— 高亮某根，淡化其余（可多个）
- `{ type:'box', from, to, label }` —— 跨第 from~to 根的虚线框
- `{ type:'line', price, label }` —— 水平参考线（颈线/支撑/压力）
- `{ type:'trendline', from:{i,price}, to:{i,price}, label }` —— 斜趋势线

`PriceVolumeChart` 支持 `highlight` + `line`。

**颜色常量**（所有图表硬编码，红涨绿跌）：`UP = '#f43f5e'`，`DOWN = '#22c55e'`。设计令牌见 `theme.css`：`--up`/`--down`/`--warn(#f59e0b 琥珀，故意区别于 --up)`/`--primary(#6366f1)` 等。

`chartData.js` 生成助手：
- `fromPath(closes, volumes?)` —— 收盘价路径转连续 K线（可附 v）
- `genTrend()` / `genTrendV()` —— 40 根先跌后涨趋势（后者带成交量，供 OBV/筹码）
- `genIntraday(prevClose, prices)` —— 逐分钟分时数据（均价=累计 VWAP）
- 所有数据必须满足 `h >= max(o,c)` 且 `l <= min(o,c)`（`chartData.test` 会校验）。

---

## 6. 扩展配方（照做即可）

### 加一个新条目（最常见）
1. 在对应 `content/topics/<board>.js` 数组里加一个 topic 对象（按 §4 schema）。
2. 在 `charts/chartData.js` 加 `chartId` 对应的示意数据。
3. 在 `charts/chartRegistry.js` 注册：复用 K线图用 `candle('<id>')`；其他用 `{ Component, props }`。
4. 若该 chartId 是 OHLC 蜡烛数据，把 id 加进 `chartData.test.js` 的 `ids` 列表；**分时/盘口等非 OHLC 数据不要加入该列表**。
5. 更新该板块 `*.test.js` 的条目数 + `validate.test.js` 的总数与该板块计数。
6. `npm test` 全绿后提交。

### 加一个新板块
1. `categories.js` 加一项（设 `enabled: true`，给唯一 `order`）。
2. 新建 `content/topics/<board>.js` + 测试，并在 `topics/index.js` 汇入。
3. 同步 `categories.test.js`（长度 + 启用列表）、`HomePage.test.jsx`（板块卡片数 / 敬请期待数）、必要时 `Nav.test.jsx`。

### 加一个新图表组件
1. 在 `charts/`（或 `charts/indicators/`）写 SVG 组件，给可测元素加 `data-role`。
2. 写组件测试（render → 断言 polyline/rect 数量、颜色等）。
3. 在 `chartRegistry.js` import 并注册。

---

## 7. 测试与提交约定

- **TDD**：先写/改测试，再实现。`data-role` 属性用于图表元素断言。
- testing-library 自动在**每个 `it` 之间**清理 DOM；同一 `it` 里多次 render 会叠加 → 拆成多个 `it`。
- `getByText` 多个匹配会抛错 → 用 `getAllByText` 或更精确的查询。
- **原子提交**：每个逻辑单元一次提交，提交前 `npm test` 必须全绿。提交信息用中文 `feat:/fix:` 前缀。
- 远程：`origin` = https://github.com/windssmile/tanalysis.git，分支 `main`。

---

## 8. 当前进度（截至本文件）

**8 大板块 / 65 条目 / 186 测试全绿 / 11 种自绘图表组件 / 4 个工具页（适用性矩阵·术语速查·全站搜索·回测沙盘）**

| 板块 | id | 条目数 | 内容 |
|---|---|---|---|
| K线基础 | candlestick | 20 | 构成/锤子/十字星/吞没×2/早晨之星/乌云盖顶/刺透/黄昏之星/孕线/流星/上吊 + 红三兵/三只乌鸦/倒锤线/特殊十字/平头顶底/大阳大阴/上升下降三法/三内部 |
| 技术指标 | indicator | 8 | MA/MACD/KDJ/RSI/BOLL/DMI/OBV/BIAS |
| 经典形态 | pattern | 8 | 双底/双顶/头肩顶/上升三角/矩形/旗形楔形/缺口/V形 |
| 趋势理论 | theory | 4 | 趋势线/支撑压力/道氏理论/量化视角总览 |
| 量价关系 | volume | 12 | 量价基础/放量突破/量价背离/筹码分布 + 天量地量/换手率/葛兰碧量价法则/量价四组合/量价时空配合/主力量价手法/堆量峰量/顶底量能 |
| 分时图分析 | intraday | 4 | 分时基础/均价线量价/盘口五档/集合竞价 |
| 实战框架 | strategy | 5 | 市场状态/多指标共振/多周期/仓位风控/交易规则范例 |
| 风险管理 | risk | 4 | 信号失效/心理偏差/回撤破产/A股特有风险 |

**打磨**：Router v7 future flags 已开启（测试侧窄过滤 future-flag 噪音，见 `setupTests.js`）；SearchBox 支持键盘导航（↑↓/回车/Esc + aria）；条目「含义」段术语经 `GlossaryText` 自动链到 `/glossary`（计划 `docs/superpowers/plans/2026-06-02-content-and-polish.md`）。

贯穿全站的两条线：**📏 量化刻画**（可度量阈值）+ **📐 量化视角**（统计检验/防过拟合）。**全部 49 个条目均已有 ⚠ 何时会失效（`pitfalls`）**（Part B 已完成，见下）。每个板块测试含一条「全条目都有 pitfalls」完整性断言。

设计与计划文档见 `docs/superpowers/specs/` 与 `docs/superpowers/plans/`。

---

## 9. 后续路线（roadmap）

**Part B（✅ 已完成 2026-06-02）· 把「失效场景」`pitfalls` 铺到全部 45 个条目**
已逐板块为 K线12/指标8/形态8/趋势4/量价4/分时4/实战5 共 45 个条目补充结构化"何时会失效"清单，加上风险板块原有 4 条，全站 49 条目全覆盖。每个板块测试加了「全条目都有 pitfalls」完整性断言。`TopicPage.test.jsx` 的「无 pitfalls 不渲染」用例已改为与内容解耦的隔离 mock 测试（`vi.mock`），以防 pitfalls 普及后失去锚点。计划/设计文档：`docs/superpowers/plans/2026-06-02-partB-pitfalls.md`、`docs/superpowers/specs/2026-06-02-partB-and-tools-design.md`。

**工具页（独立于 8 大板块，注册表见 `src/content/tools.js`，Nav/首页自动生成入口）** —— 见 `docs/superpowers/specs/2026-06-02-partB-and-tools-design.md`：
- **有效性矩阵（✅ 已完成 2026-06-02）**：`/matrix`，10 工具×3 市场状态(趋势/震荡/反转)的定性适用性对照表，中性色阶评级(故意不用红绿)+ 每格经验说明 + 免责横幅。数据 `src/content/effectiveness.js`，组件 `EffectivenessMatrix.jsx`。计划 `docs/superpowers/plans/2026-06-02-effectiveness-matrix.md`。
- **术语速查 + 全站搜索（✅ 已完成 2026-06-02）**：顶栏常驻搜索框（实时下拉，条目+术语统一结果，回车进 `/search?q=`）；`/search` 结果页按术语/条目分组；`/glossary` 列出 16 个 curated 术语（定义+延伸条目链接）。纯函数搜索层 `src/search/index.js`（加权子串匹配 title>tags>subtitle>正文；术语并入索引），术语数据 `src/content/glossary.js`。组件 `SearchPage.jsx`/`GlossaryPage.jsx`/`layout/SearchBox.jsx`。计划 `docs/superpowers/plans/2026-06-02-search-glossary.md`。备注：术语结果点击跳转到其首个延伸条目（定义已在结果副标题内联展示）。
- **回测沙盘 playground（✅ 已完成 2026-06-02）**：`/playground`，选规则(MA金叉/RSI阈值/看涨吞没)+调参+选市场情境(趋势/震荡/反转/随机)+设成本 → 图表叠加成交买卖点(红买绿卖)+ StatsPanel 展示本策略 vs **随机对照组** vs 买入持有(胜率/期望/累计收益/计入成本)。纯函数引擎三件套：`src/playground/dataGen.js`(合成数据,4regime,seed可复现,`syntheticSource` 实现 `DataSource.load():Promise` 接口)、`rules.js`(规则注册表,复用 `charts/indicators/calc.js`)、`backtest.js`(多头单仓/线性成本/复利累计,精确测试)。`CandleChart` 新增 `{type:'marker',index,dir}` 标注。组件 `PlaygroundPage.jsx`/`StatsPanel.jsx`。诚实框架：页顶醒目标注"合成数据仅演示·不代表真实有效性"+随机对照组+多情境切换。计划 `docs/superpowers/plans/2026-06-02-playground.md`。**接真实数据时只需新增 `realSource(symbol,range)` 实现同一 `DataSource` 接口，引擎与 UI 全部复用。**

**接真实数据（大方向，待讨论）**
把"教科书示意数据"升级为真实行情验证。关键决策点：数据源（AKShare/新浪等免费源 vs CSV 上传）、静态打包历史数据 vs 实时拉取、纯前端跨域限制是否需要轻后端代理。图表组件基本可复用（只吃 `{o,h,l,c,v}` 数组），主要新增加载态/错误处理/数据规范化层。**最有价值的形态**：让用户选一段真实行情，把某个形态/指标按明确规则跑一遍，给出胜率/期望/对比买入持有/计入成本后的结果——即把网站从"讲知识"升级为"自己证伪信号"，这才是量化视角的落地，也是对"技术分析是否有效"最诚实的回答。

**可选打磨**：搜索/知识图谱、术语速查、适用环境对照表（趋势市 vs 震荡市的有效性矩阵）、图表可调参（拖动 MA 周期/BOLL 的 k）、分步高亮。

---

## 10. 红线（务必遵守）

- **红涨绿跌**，永不搞反（A股惯例）。
- 内容**诚实克制**：不夸大有效性，阈值标注为经验参考值，保留「局限」。
- 改条目/板块数量后**同步更新对应测试的硬编码计数**，否则测试会红。
- 不引第三方图表库；图表一律 SVG 自绘。
- 提交前 `npm test` 全绿；分批原子提交。
