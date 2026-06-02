# 内容扩充（K线+量价 16 条）+ 打磨清理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ① 给 candlestick 板块 +8 条、volume 板块 +8 条新条目（49→65）；② 三项打磨：消 React Router v7 警告、SearchBox 键盘导航、术语正文自动互链。

**Architecture:** 内容沿用数据驱动 + 图表注册表模式（见 AGENTS.md §3/§6）。打磨为局部增强，不改架构。

**Tech Stack:** React 18 + Vite 5 + react-router-dom 6 + Vitest 2。无新依赖。

**红线（AGENTS.md §10）**：红涨绿跌（`UP=#f43f5e` 红=涨/阳，`DOWN=#22c55e` 绿=跌/阴）；内容诚实克制；改条目数后**同步更新硬编码测试计数**；图表 SVG 自绘不引库；提交前 `npm test` 全绿；分批原子提交。

---

## 内容部分通用配方（C1–C4 每条新条目都照此做）

新增一个条目 = 改 6 处：
1. **board 文件**（`src/content/topics/candlestick.js` 或 `volume.js`）数组追加 topic 对象，**完整 sections**：
   - candlestick：`meaning`(段) + `identify`(数组) + `metrics`(数组) + `usage`(数组) + `limitation`(段) + `pitfalls`(数组)。**不要** formula/quant。
   - volume：`meaning` + `identify` + `metrics` + `usage` + `quant`(数组) + `limitation` + `pitfalls`。
   - 必填四字段 meaning/identify/usage/limitation；本项目板块测试还断言每条目有 `metrics` 与 `pitfalls`（volume 另需 `quant`），缺了会红。
   - `id`(kebab-case 唯一)、`category`、`title`、`subtitle`(英文)、`tags`(数组)、`chartId`(=id)、`related`(指向**真实存在**的 id，可引用本批或既有条目)。
2. **`src/charts/chartData.js`** 加 `chartId` 的示意数据：
   - candlestick：`{ candles:[{o,h,l,c}…], annotations:[…] }`，手工设计 3–6 根 K线体现该形态，满足 `h>=max(o,c) && l<=min(o,c)`，配 `highlight`/`box`/`line` 标注。
   - volume：`{ candles:[{o,h,l,c,v}…], annotations:[…] }`，每根带成交量 `v`，设计 12–20 根体现量价关系。
3. **`src/charts/chartRegistry.js`** 注册：candlestick 用 `candle('<id>')`；volume 用 `priceVolume('<id>')`（两个 helper 已存在）。
4. **`src/charts/chartData.test.js`** 的 `ids` 数组加入新 id（candlestick 与 volume 的 candles 都是 OHLC，都要加）。
5. **board 的 `*.test.js`** 条目数断言 + **`src/content/validate.test.js`** 的总数与该板块 `topicsByCategory` 计数同步更新。
6. `npm test` 全绿后提交。

**已有条目可作范本**：`hammer`（candlestick）、`volume-breakout`（volume）——照其字段密度与诚实口吻写。

---

## Task C1: K线 +4（红三兵/三只乌鸦/倒锤线/特殊十字）

**Files:** `src/content/topics/candlestick.js`, `src/charts/chartData.js`, `src/charts/chartRegistry.js`, `src/charts/chartData.test.js`, `src/content/topics/candlestick.test.js`, `src/content/validate.test.js`

新增 4 条：

| id | title | subtitle | tags | 示意图思路 | related(示例,须存在) |
|---|---|---|---|---|---|
| `three-white-soldiers` | 红三兵 | Three White Soldiers | ['组合形态','看涨','持续/反转'] | 3 根依次抬高的中阳线，实体重叠上移；highlight 后三根 | ['three-black-crows','bullish-engulfing'] |
| `three-black-crows` | 三只乌鸦 | Three Black Crows | ['组合形态','看跌','反转'] | 3 根依次走低的中阴线，高位连阴 | ['three-white-soldiers','evening-star'] |
| `inverted-hammer` | 倒锤线 | Inverted Hammer | ['单根形态','反转','看涨'] | 下跌末端小实体长上影；highlight 末根（与流星同形异位） | ['shooting-star','hammer'] |
| `special-doji` | 特殊十字星 | Gravestone/Dragonfly Doji | ['单根形态','反转','中性'] | 墓碑(长上影)/蜻蜓(长下影)/长腿十字，可画 3 根并列 highlight | ['doji','hammer'] |

- [ ] **Step 1: 先改测试（红）** — 同时改两处计数：
  - `candlestick.test.js`：`expect(candlestickTopics).toHaveLength(12)` → `16`
  - `validate.test.js`：`expect(allTopics).toHaveLength(49)` → `53`；`expect(topicsByCategory('candlestick')).toHaveLength(12)` → `16`
  - `chartData.test.js`：在 `ids` 数组加入 `'three-white-soldiers','three-black-crows','inverted-hammer','special-doji'`

- [ ] **Step 2: 跑测试确认失败** — Run: `npm test`；Expected: FAIL（条目数不符 + chartData 缺失 + chartId 未注册）。

- [ ] **Step 3: 加内容** — 按通用配方为 4 条各写：① candlestick.js topic 对象（完整 sections，含 metrics+pitfalls，照 `hammer` 范本，诚实口吻）；② chartData.js 示意 candles+annotations（满足 OHLC 不变式）；③ chartRegistry.js 用 `candle('<id>')` 注册。范例（chartData 一条）：
```js
  // 红三兵：三根依次抬高的阳线
  'three-white-soldiers': {
    candles: [
      { o: 10, h: 10.3, l: 9.8, c: 10.2 },
      { o: 10.1, h: 11, l: 10, c: 10.9 },
      { o: 10.8, h: 11.8, l: 10.7, c: 11.7 },
      { o: 11.6, h: 12.6, l: 11.5, c: 12.5 },
    ],
    annotations: [{ type: 'box', from: 1, to: 3, label: '红三兵' }],
  },
```

- [ ] **Step 4: 跑测试确认通过** — Run: `npm test`；Expected: PASS 全绿（candlestick 16、总数 53）。

- [ ] **Step 5: 提交**
```bash
git add src/content/topics/candlestick.js src/content/topics/candlestick.test.js src/charts/chartData.js src/charts/chartRegistry.js src/charts/chartData.test.js src/content/validate.test.js
git commit -m "feat: K线板块新增4条(红三兵/三只乌鸦/倒锤线/特殊十字)"
```

---

## Task C2: K线 +4（平头顶底/大阳大阴/上升下降三法/三内部）

**Files:** 同 C1 的六个文件。

| id | title | subtitle | tags | 示意图思路 | related(示例) |
|---|---|---|---|---|---|
| `tweezer` | 平头顶/平头底 | Tweezer Top/Bottom | ['组合形态','反转','中性'] | 相邻两根高点(或低点)几乎相等；line 标注等高位 | ['doji','double-top'] |
| `marubozu` | 大阳线/大阴线 | Marubozu | ['单根形态','趋势','中性'] | 光头光脚满实体阳与阴各一根 highlight | ['three-white-soldiers','kline-basics'] |
| `rising-falling-three` | 上升/下降三法 | Rising/Falling Three Methods | ['组合形态','持续','中性'] | 大阳 + 三根小阴回调(不破大阳低) + 大阳创新高 | ['flag-wedge','three-white-soldiers'] |
| `three-inside` | 三内部上涨/下跌 | Three Inside Up/Down | ['组合形态','反转','中性'] | 孕线(大阴含小阳) + 第三根放量确认向上 | ['harami','bullish-engulfing'] |

- [ ] **Step 1: 先改测试（红）**
  - `candlestick.test.js`：`16` → `20`
  - `validate.test.js`：总数 `53` → `57`；`candlestick` `16` → `20`
  - `chartData.test.js`：`ids` 加 `'tweezer','marubozu','rising-falling-three','three-inside'`

- [ ] **Step 2: 跑测试确认失败** — `npm test` → FAIL。

- [ ] **Step 3: 加内容** — 4 条 topic 对象（candlestick 字段约定）+ chartData 示意 + `candle()` 注册。`three-inside` 的 related 引用了 `harami`（孕线，已存在）。

- [ ] **Step 4: 跑测试确认通过** — `npm test` → PASS（candlestick 20、总数 57）。

- [ ] **Step 5: 提交**
```bash
git add src/content/topics/candlestick.js src/content/topics/candlestick.test.js src/charts/chartData.js src/charts/chartRegistry.js src/charts/chartData.test.js src/content/validate.test.js
git commit -m "feat: K线板块新增4条(平头顶底/大阳大阴/上升下降三法/三内部)"
```

---

## Task C3: 量价 +4（天量地量/换手率/葛兰碧量价法则/量价四组合）

**Files:** `src/content/topics/volume.js`, `chartData.js`, `chartRegistry.js`, `chartData.test.js`, `src/content/topics/volume.test.js`, `validate.test.js`

volume 字段约定：metrics + **quant** + pitfalls（照 `volume-breakout` 范本）。chartData 用带 `v` 的 candles，注册用 `priceVolume('<id>')`。

| id | title | subtitle | tags | 示意图思路 | related(示例) |
|---|---|---|---|---|---|
| `volume-climax` | 天量天价·地量地价 | Volume Climax | ['量价','顶底','中性'] | 顶部巨量长阴滞涨 / 底部极度缩量企稳，各画一段 | ['volume-price','volume-divergence'] |
| `turnover-rate` | 换手率 | Turnover Rate | ['量价','基础','中性'] | 一段行情下方量柱，标注高/低换手区 | ['volume-price','volume-breakout'] |
| `granville-volume` | 葛兰碧量价法则 | Granville Volume Rules | ['量价','方法论','中性'] | 量增价升/量缩价跌等若干配合段落 | ['volume-price','volume-divergence'] |
| `volume-price-combos` | 量价四组合 | Price-Volume Combinations | ['量价','基础','中性'] | 价涨量增 / 价涨量缩 / 价跌量增 / 价跌量缩 四段 | ['volume-price','granville-volume'] |

- [ ] **Step 1: 先改测试（红）**
  - `volume.test.js`：`expect(volumeTopics).toHaveLength(4)` → `8`
  - `validate.test.js`：总数 `57` → `61`；`expect(topicsByCategory('volume')).toHaveLength(4)` → `8`
  - `chartData.test.js`：`ids` 加 `'volume-climax','turnover-rate','granville-volume','volume-price-combos'`

- [ ] **Step 2: 跑测试确认失败** — `npm test` → FAIL。

- [ ] **Step 3: 加内容** — 4 条 topic（volume 字段约定，含 quant）+ chartData 带 v 的 candles + `priceVolume()` 注册。范例（chartData 一条，注意每根带 v）：
```js
  // 量价四组合：示意一段量价配合
  'volume-price-combos': {
    candles: [
      { o: 10, h: 10.6, l: 9.9, c: 10.5, v: 1200 },
      { o: 10.5, h: 11.2, l: 10.4, c: 11.1, v: 1800 },
      { o: 11.1, h: 11.5, l: 10.9, c: 11.4, v: 900 },
      { o: 11.4, h: 11.5, l: 10.6, c: 10.7, v: 2000 },
      { o: 10.7, h: 10.9, l: 10.1, c: 10.3, v: 700 },
    ],
    annotations: [],
  },
```

- [ ] **Step 4: 跑测试确认通过** — `npm test` → PASS（volume 8、总数 61）。

- [ ] **Step 5: 提交**
```bash
git add src/content/topics/volume.js src/content/topics/volume.test.js src/charts/chartData.js src/charts/chartRegistry.js src/charts/chartData.test.js src/content/validate.test.js
git commit -m "feat: 量价板块新增4条(天量地量/换手率/葛兰碧/量价四组合)"
```

---

## Task C4: 量价 +4（量价时空配合/主力量价手法/堆量与峰量/顶底量能特征）

**Files:** 同 C3 的六个文件。

| id | title | subtitle | tags | 示意图思路 | related(示例) |
|---|---|---|---|---|---|
| `volume-time-space` | 量价时空配合 | Volume-Price-Time-Space | ['量价','方法论','中性'] | 量价 × 周期 × 相对位置的一段综合示意 | ['volume-price','volume-climax'] |
| `manipulation-volume` | 主力量价手法 | Manipulation Patterns | ['量价','方法论','风险'] | 吸筹(底部温和放量)→洗盘(缩量回踩)→拉升→出货(高位放量滞涨) | ['volume-climax','volume-divergence'] |
| `volume-stacking` | 堆量与峰量 | Volume Stacking | ['量价','方法论','中性'] | 连续温和放量"堆量" vs 单根突放"峰量" | ['volume-breakout','volume-price'] |
| `volume-top-bottom` | 顶底量能特征 | Top/Bottom Volume | ['量价','顶底','中性'] | 顶部放量滞涨 / 底部缩量后温和放大 | ['volume-climax','volume-divergence'] |

- [ ] **Step 1: 先改测试（红）**
  - `volume.test.js`：`8` → `12`
  - `validate.test.js`：总数 `61` → `65`；`volume` `8` → `12`
  - `chartData.test.js`：`ids` 加 `'volume-time-space','manipulation-volume','volume-stacking','volume-top-bottom'`

- [ ] **Step 2: 跑测试确认失败** — `npm test` → FAIL。

- [ ] **Step 3: 加内容** — 4 条 topic（volume 字段约定，含 quant；`manipulation-volume` 量化视角要诚实强调"主力手法事后好讲、事前难证伪"）+ chartData 带 v + `priceVolume()` 注册。

- [ ] **Step 4: 跑测试确认通过** — `npm test` → PASS（volume 12、总数 65）。

- [ ] **Step 5: 提交**
```bash
git add src/content/topics/volume.js src/content/topics/volume.test.js src/charts/chartData.js src/charts/chartRegistry.js src/charts/chartData.test.js src/content/validate.test.js
git commit -m "feat: 量价板块新增4条(量价时空/主力手法/堆量峰量/顶底量能)"
```

---

## Task D1: 消除 React Router v7 future-flag 警告

**Files:** Modify `src/main.jsx`, `src/setupTests.js`

> 此任务是配置/噪音清理，无新增单测；验证 = 跑测试看警告消失且全绿。

- [ ] **Step 1: 生产侧 opt-in** — 在 `src/main.jsx` 给 `BrowserRouter` 加 future flags：
```jsx
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

- [ ] **Step 2: 测试侧窄过滤** — `src/setupTests.js` 改为：
```js
import '@testing-library/jest-dom'

// 仅过滤 React Router v6 的两条 future-flag 告知性警告（生产已在 main.jsx 显式 opt-in）。
// 其余 console.warn 照常输出，不掩盖真实警告。
const origWarn = console.warn
console.warn = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : ''
  if (msg.includes('React Router Future Flag Warning')) return
  origWarn(...args)
}
```

- [ ] **Step 3: 验证** — Run: `npm test 2>&1 | grep -c "React Router Future Flag Warning"`；Expected: `0`（不再出现）。再确认 `npm test` 全绿。

- [ ] **Step 4: 提交**
```bash
git add src/main.jsx src/setupTests.js
git commit -m "chore: 开启Router v7 future flags并过滤测试侧future-flag警告噪音"
```

---

## Task D2: SearchBox 键盘导航

**Files:** Modify `src/components/layout/SearchBox.jsx`, `src/components/layout/SearchBox.test.jsx`

下拉建议支持 ↑↓ 移动高亮、回车跳转选中项；补 `aria-selected`/`aria-activedescendant`。

- [ ] **Step 1: 先写失败的测试** — 在 `SearchBox.test.jsx` 追加：
```js
  it('↓ 键高亮第一个建议（aria-selected）', () => {
    render(<MemoryRouter><SearchBox /></MemoryRouter>)
    const box = screen.getByRole('searchbox')
    fireEvent.change(box, { target: { value: '吞没' } })
    fireEvent.keyDown(box, { key: 'ArrowDown' })
    const options = screen.getAllByRole('option')
    expect(options[0].getAttribute('aria-selected')).toBe('true')
  })
  it('未按方向键时无高亮项', () => {
    render(<MemoryRouter><SearchBox /></MemoryRouter>)
    const box = screen.getByRole('searchbox')
    fireEvent.change(box, { target: { value: '吞没' } })
    const options = screen.getAllByRole('option')
    expect(options.every((o) => o.getAttribute('aria-selected') === 'false')).toBe(true)
  })
```

- [ ] **Step 2: 跑测试确认失败** — Run: `npx vitest run src/components/layout/SearchBox.test.jsx`；Expected: FAIL。

- [ ] **Step 3: 实现** — 改 `src/components/layout/SearchBox.jsx`，加 `active` 状态与键盘处理。完整新版：
```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { search } from '../../search/index.js'

export default function SearchBox() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const navigate = useNavigate()
  const results = q.trim() ? search(q.trim(), 6) : []

  function go(path) {
    setOpen(false)
    setQ('')
    setActive(-1)
    navigate(path)
  }

  function submit(e) {
    e.preventDefault()
    if (!q.trim()) return
    if (active >= 0 && results[active]) return go(results[active].path)
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  function onKeyDown(e) {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <form className="nav-search" role="search" onSubmit={submit}>
      <input
        type="search"
        className="nav-search-input"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder="搜索条目 / 术语…"
        aria-label="搜索"
        aria-activedescendant={active >= 0 ? `nav-search-opt-${active}` : undefined}
      />
      {open && results.length > 0 && (
        <ul className="nav-search-suggest" role="listbox">
          {results.map((r, i) => (
            <li
              key={r.type + '-' + r.id}
              id={`nav-search-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
            >
              <Link to={r.path} onClick={() => go(r.path)}>
                <span>{r.title}</span>
                <span className="nav-search-kind">{r.type === 'term' ? '术语' : '条目'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
```
并在 `src/components/layout/layout.css` 的 `.nav-search-suggest li a:hover` 规则旁加高亮态：
```css
.nav-search-suggest li.active a { background: var(--primary-soft); }
```

- [ ] **Step 4: 跑测试确认通过** — Run: `npm test`；Expected: PASS 全绿（含原 SearchBox 用例）。

- [ ] **Step 5: 提交**
```bash
git add src/components/layout/SearchBox.jsx src/components/layout/SearchBox.test.jsx src/components/layout/layout.css
git commit -m "feat: SearchBox键盘导航(↑↓高亮/回车跳转/aria-activedescendant)"
```

---

## Task D3: 术语正文自动互链（GlossaryText）

**Files:** Create `src/components/GlossaryText.jsx` + `GlossaryText.test.jsx`；Modify `src/components/TopicPage.jsx` + `TopicPage.test.jsx`

新建可测的 `GlossaryText`：把文本里**首次出现**的术语自动链到 `/glossary`（最长优先、每术语一次）。用在 TopicPage 的「含义」段落。

- [ ] **Step 1: 先写失败的测试** — 创建 `src/components/GlossaryText.test.jsx`：
```js
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GlossaryText, { linkifyTerms } from './GlossaryText.jsx'

describe('linkifyTerms', () => {
  it('把首次出现的术语切成链接段', () => {
    const segs = linkifyTerms('出现金叉后回调', ['金叉'])
    expect(segs.some((s) => s.linked && s.text === '金叉')).toBe(true)
  })
  it('无术语时整段不链接', () => {
    const segs = linkifyTerms('普通文本', ['金叉'])
    expect(segs.every((s) => !s.linked)).toBe(true)
  })
  it('最长优先：术语只链一次', () => {
    const segs = linkifyTerms('金叉又金叉', ['金叉'])
    expect(segs.filter((s) => s.linked).length).toBe(1)
  })
})

describe('GlossaryText', () => {
  it('术语渲染为指向 /glossary 的链接', () => {
    render(<MemoryRouter><GlossaryText text="出现金叉信号" /></MemoryRouter>)
    const link = screen.getByText('金叉').closest('a')
    expect(link).toHaveAttribute('href', '/glossary')
  })
})
```

- [ ] **Step 2: 跑测试确认失败** — Run: `npx vitest run src/components/GlossaryText.test.jsx`；Expected: FAIL。

- [ ] **Step 3a: 实现 `src/components/GlossaryText.jsx`：**
```jsx
import { Link } from 'react-router-dom'
import { glossary } from '../content/glossary.js'

// 把文本里首次出现的术语切段（最长优先、每术语一次）
export function linkifyTerms(text, terms) {
  let segs = [{ text: String(text || ''), linked: false }]
  const sorted = [...terms].sort((a, b) => b.length - a.length)
  for (const term of sorted) {
    if (!term) continue
    segs = segs.flatMap((seg) => {
      if (seg.linked) return [seg]
      const idx = seg.text.indexOf(term)
      if (idx === -1) return [seg]
      const out = []
      if (idx > 0) out.push({ text: seg.text.slice(0, idx), linked: false })
      out.push({ text: term, linked: true })
      const rest = seg.text.slice(idx + term.length)
      if (rest) out.push({ text: rest, linked: false })
      return out
    })
  }
  return segs
}

export default function GlossaryText({ text }) {
  const terms = glossary.map((g) => g.term)
  const segs = linkifyTerms(text, terms)
  return (
    <>
      {segs.map((s, i) =>
        s.linked ? (
          <Link key={i} to="/glossary" style={{ color: 'var(--primary-text)', textDecoration: 'underline dotted' }}>{s.text}</Link>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}
```

- [ ] **Step 3b: 接入 TopicPage** — 在 `src/components/TopicPage.jsx`：import 加 `import GlossaryText from './GlossaryText.jsx'`；把「含义」段落
```jsx
        <p style={{ color: '#cbd5e1', marginTop: 0 }}>{s.meaning}</p>
```
改为
```jsx
        <p style={{ color: '#cbd5e1', marginTop: 0 }}><GlossaryText text={s.meaning} /></p>
```

- [ ] **Step 3c: TopicPage 接入断言** — 在 `src/components/TopicPage.test.jsx` 追加（`volume-breakout` 的「含义」含术语「缩量」）：
```js
  it('正文「含义」里的术语自动链到 /glossary', () => {
    const { container } = renderAt('/volume/volume-breakout')
    expect(container.querySelector('a[href="/glossary"]')).toBeInTheDocument()
  })
```
（若 `renderAt` 帮助函数未返回 container，按文件现有写法取 container；该文件已有 `renderAt`。）

- [ ] **Step 4: 跑测试确认通过** — Run: `npm test`；Expected: PASS 全绿。

- [ ] **Step 5: 提交**
```bash
git add src/components/GlossaryText.jsx src/components/GlossaryText.test.jsx src/components/TopicPage.jsx src/components/TopicPage.test.jsx
git commit -m "feat: 术语正文自动互链GlossaryText(含义段首现术语链到/glossary)"
```

---

## 完成标准

- candlestick 12→20、volume 4→12、总条目 49→**65**，每条目含 metrics+pitfalls（volume 另含 quant），示意图满足 OHLC 不变式，红涨绿跌。
- 测试硬编码计数（board test / validate.test / chartData.test ids）全部同步，`npm test` 全绿。
- Router future-flag 警告从测试输出消失；SearchBox 可键盘上下选+回车跳转；条目「含义」段术语自动链到 `/glossary`。
- 7 个原子提交，中文 `feat:/chore:` 前缀。

> 完成后同步更新 `AGENTS.md` §8 的板块条目表与计数。
