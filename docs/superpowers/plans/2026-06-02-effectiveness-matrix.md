# 有效性矩阵（适用性矩阵）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增一个独立工具页 `/matrix`，用一张「工具/方法 × 市场状态」对照表，诚实呈现各技术工具在趋势市/震荡市/反转拐点下的定性有效性。

**Architecture:** 数据驱动。数据层 `effectiveness.js`（columns + rows，每格 rating + note）；展示组件 `EffectivenessMatrix.jsx`（表格 + 免责横幅，纯 SVG 无关，普通 DOM 表格）；新增极简 `tools.js` 工具页注册表，Nav/HomePage 遍历它渲染入口（为后续 search/glossary/playground 复用）。矩阵不进 8 大板块（categories 不变）。

**Tech Stack:** React 18 + Vite 5 + react-router-dom 6 + Vitest 2 + @testing-library/react。无新依赖。路径别名 `@`→`/src`。

**红线**：评级用中性色阶（`--primary` 深浅 / 灰阶），**不得**用 `--up`(红)/`--down`(绿)——红绿在本站专指涨跌，评级配色若用红绿会语义混淆。内容诚实克制，页内必须有「定性经验判断，非统计结论」免责声明。

---

## Task 1: 有效性矩阵数据层 + 校验测试

**Files:**
- Create: `src/content/effectiveness.js`
- Test: `src/content/effectiveness.test.js`

数据结构：`columns` 三列固定 `trend/range/reversal`；`rows` 为 10 个工具/方法，每个含 `id`、`label`、`ratings:{trend,range,reversal}`（值 ∈ `high|mid|low`）、`notes:{trend,range,reversal}`（每格一句话经验说明）。

10 行（id → label）：`ma`→均线系统、`macd`→MACD、`oscillator`→摆动指标(KDJ/RSI)、`boll`→布林带(BOLL)、`trendline`→趋势线与通道、`support-resistance`→支撑压力位、`reversal-pattern`→反转形态(头肩/双顶底)、`continuation-pattern`→持续形态(三角/旗形)、`volume`→量价配合、`chip`→筹码分布。

- [ ] **Step 1: 写失败的测试** — 创建 `src/content/effectiveness.test.js`：

```js
import { describe, it, expect } from 'vitest'
import { effectivenessMatrix } from './effectiveness.js'

const VALID = ['high', 'mid', 'low']

describe('effectivenessMatrix', () => {
  it('三列固定为 趋势/震荡/反转', () => {
    expect(effectivenessMatrix.columns.map((c) => c.id)).toEqual(['trend', 'range', 'reversal'])
  })
  it('含 10 行工具/方法', () => {
    expect(effectivenessMatrix.rows).toHaveLength(10)
  })
  it('行 id 唯一', () => {
    const ids = effectivenessMatrix.rows.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('每行对每列都有合法 rating 与非空 note', () => {
    for (const r of effectivenessMatrix.rows) {
      expect(r.label).toBeTruthy()
      for (const c of effectivenessMatrix.columns) {
        expect(VALID).toContain(r.ratings[c.id])
        expect(r.notes[c.id]).toBeTruthy()
      }
    }
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/content/effectiveness.test.js`
Expected: FAIL（`effectiveness.js` 不存在，导入报错）。

- [ ] **Step 3: 创建数据文件** — `src/content/effectiveness.js`。下表 ratings 是合理默认（实现者可按诚实判断微调，但须保持「同一工具不同市场状态差异明显」的教学意图）；`notes` 每格写一句**具体**经验说明（为何在该市场状态下有效/失效）。

建议 ratings（trend / range / reversal）：
- ma: high / low / low
- macd: high / low / mid
- oscillator: low / high / mid
- boll: mid / high / low
- trendline: high / mid / low
- support-resistance: low / high / mid
- reversal-pattern: low / mid / high
- continuation-pattern: high / low / low
- volume: mid / mid / mid
- chip: mid / mid / mid

文件骨架（补全所有 10 行的 notes）：

```js
// 适用性矩阵：技术工具在不同市场状态下的“定性经验有效性”。
// 评级为经验判断、非统计结论；真实有效性需用真实行情回测验证。
export const effectivenessMatrix = {
  columns: [
    { id: 'trend', label: '趋势市（单边）' },
    { id: 'range', label: '震荡市（箱体）' },
    { id: 'reversal', label: '反转/拐点' },
  ],
  rows: [
    {
      id: 'ma',
      label: '均线系统',
      ratings: { trend: 'high', range: 'low', reversal: 'low' },
      notes: {
        trend: '单边趋势中顺势持有、回踩均线加仓最能发挥；滞后反而过滤噪音',
        range: '箱体里均线缠绕、金叉死叉反复，whipsaw 重灾区',
        reversal: '滞后特性决定它确认拐点很慢，常在反转走完一半才发信号',
      },
    },
    // …macd / oscillator / boll / trendline / support-resistance /
    //   reversal-pattern / continuation-pattern / volume / chip 共 10 行，
    //   每行按上表 ratings + 各写 3 句具体 note
  ],
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/content/effectiveness.test.js`
Expected: PASS（4 个用例全绿）。

- [ ] **Step 5: 提交**

```bash
git add src/content/effectiveness.js src/content/effectiveness.test.js
git commit -m "feat: 有效性矩阵数据层(10工具×3市场状态)+校验测试"
```

---

## Task 2: EffectivenessMatrix 展示组件 + 测试

**Files:**
- Create: `src/components/EffectivenessMatrix.jsx`
- Test: `src/components/EffectivenessMatrix.test.jsx`

组件渲染：页标题 + 诚实免责横幅 + 一张表格。表头第一格「工具/方法」+ 三个市场状态列。每行行首是工具名，其后每格显示 rating 标签（高/中/低，中性色阶）+ note 小字。可测元素加 `data-role`。

- [ ] **Step 1: 写失败的测试** — 创建 `src/components/EffectivenessMatrix.test.jsx`：

```js
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EffectivenessMatrix from './EffectivenessMatrix.jsx'
import { effectivenessMatrix } from '../content/effectiveness.js'

describe('EffectivenessMatrix', () => {
  it('渲染三列表头', () => {
    render(<EffectivenessMatrix />)
    expect(screen.getByText('趋势市（单边）')).toBeInTheDocument()
    expect(screen.getByText('震荡市（箱体）')).toBeInTheDocument()
    expect(screen.getByText('反转/拐点')).toBeInTheDocument()
  })
  it('渲染每个工具行', () => {
    const { container } = render(<EffectivenessMatrix />)
    expect(container.querySelectorAll('[data-role="matrix-row"]').length).toBe(
      effectivenessMatrix.rows.length
    )
  })
  it('单元格数 = 行数 × 列数', () => {
    const { container } = render(<EffectivenessMatrix />)
    expect(container.querySelectorAll('[data-role="matrix-cell"]').length).toBe(
      effectivenessMatrix.rows.length * effectivenessMatrix.columns.length
    )
  })
  it('每个评级单元格带 data-rating 属性', () => {
    const { container } = render(<EffectivenessMatrix />)
    const cells = container.querySelectorAll('[data-role="matrix-cell"]')
    for (const cell of cells) {
      expect(['high', 'mid', 'low']).toContain(cell.getAttribute('data-rating'))
    }
  })
  it('渲染诚实免责声明', () => {
    render(<EffectivenessMatrix />)
    expect(screen.getByText(/定性经验判断/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/EffectivenessMatrix.test.jsx`
Expected: FAIL（组件不存在）。

- [ ] **Step 3: 实现组件** — `src/components/EffectivenessMatrix.jsx`：

```jsx
import { effectivenessMatrix } from '../content/effectiveness.js'

const RATING_LABEL = { high: '高', mid: '中', low: '低' }
// 中性色阶：故意不用 --up/--down（红绿在本站专指涨跌）
const RATING_STYLE = {
  high: { background: 'var(--primary)', color: '#fff' },
  mid: { background: 'var(--primary-soft)', color: 'var(--primary-text)' },
  low: { background: 'var(--surface-2)', color: 'var(--text-mute)' },
}

export default function EffectivenessMatrix() {
  const { columns, rows } = effectivenessMatrix
  return (
    <div>
      <h1 style={{ fontSize: 26 }}>适用性矩阵</h1>
      <p
        data-role="matrix-disclaimer"
        style={{
          color: 'var(--warn)', background: 'var(--surface)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, marginTop: 8,
        }}
      >
        本表为<strong>定性经验判断，非统计结论</strong>。同一工具在不同市场状态下有效性差异很大；
        评级配色用中性色（与红涨绿跌无关）。真实有效性需用真实行情回测验证（见后续 playground）。
      </p>
      <div style={{ overflowX: 'auto', marginTop: 16 }}>
        <table
          data-role="matrix-table"
          style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640 }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 10, color: 'var(--text-dim)' }}>工具 / 方法</th>
              {columns.map((c) => (
                <th key={c.id} data-role="matrix-col" style={{ padding: 10, color: 'var(--text-dim)' }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} data-role="matrix-row" style={{ borderTop: '1px solid var(--border)' }}>
                <th scope="row" style={{ textAlign: 'left', padding: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {r.label}
                </th>
                {columns.map((c) => {
                  const rating = r.ratings[c.id]
                  return (
                    <td
                      key={c.id}
                      data-role="matrix-cell"
                      data-rating={rating}
                      style={{ padding: 10, verticalAlign: 'top', minWidth: 160 }}
                    >
                      <span
                        style={{
                          ...RATING_STYLE[rating],
                          display: 'inline-block', fontSize: 12, fontWeight: 700,
                          padding: '2px 10px', borderRadius: 20,
                        }}
                      >
                        {RATING_LABEL[rating]}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 6 }}>
                        {r.notes[c.id]}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/components/EffectivenessMatrix.test.jsx`
Expected: PASS（5 个用例全绿）。

- [ ] **Step 5: 提交**

```bash
git add src/components/EffectivenessMatrix.jsx src/components/EffectivenessMatrix.test.jsx
git commit -m "feat: 适用性矩阵展示组件(中性色阶评级+免责横幅)"
```

---

## Task 3: 工具页注册表 + 路由 + Nav/首页入口

**Files:**
- Create: `src/content/tools.js`
- Test: `src/content/tools.test.js`
- Modify: `src/router.jsx`（加 `/matrix` 路由）
- Modify: `src/components/layout/Nav.jsx`（遍历 tools 加工具链接）
- Modify: `src/components/layout/Nav.test.jsx`（断言矩阵链接）
- Modify: `src/components/HomePage.jsx`（加工具入口区）
- Modify: `src/components/HomePage.test.jsx`（断言矩阵入口）

`tools.js` 是极简注册表，后续 search/glossary/playground 只需往数组追加一项即可复用 Nav/HomePage 入口逻辑。

- [ ] **Step 1: 写失败的测试（tools 注册表）** — 创建 `src/content/tools.test.js`：

```js
import { describe, it, expect } from 'vitest'
import { tools, enabledTools } from './tools.js'

describe('tools 注册表', () => {
  it('包含适用性矩阵且 path 为 /matrix', () => {
    const m = tools.find((t) => t.id === 'matrix')
    expect(m).toBeTruthy()
    expect(m.path).toBe('/matrix')
  })
  it('enabledTools 只返回 enabled 的工具', () => {
    expect(enabledTools().every((t) => t.enabled)).toBe(true)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/content/tools.test.js`
Expected: FAIL（`tools.js` 不存在）。

- [ ] **Step 3a: 创建 tools 注册表** — `src/content/tools.js`：

```js
// 横切工具页（不属于 8 大知识板块）。后续 search/glossary/playground 追加到此数组。
export const tools = [
  { id: 'matrix', path: '/matrix', name: '适用性矩阵', icon: '🧭', desc: '趋势市 vs 震荡市的有效性对照', enabled: true },
]

export function enabledTools() {
  return tools.filter((t) => t.enabled)
}
```

- [ ] **Step 3b: 跑 tools 测试确认通过**

Run: `npx vitest run src/content/tools.test.js`
Expected: PASS。

- [ ] **Step 3c: 接路由** — 在 `src/router.jsx` 加入 import 与 Route：

import 区加：
```js
import EffectivenessMatrix from './components/EffectivenessMatrix.jsx'
```
在 `/:category/:topic` 路由之前加（避免被 `/:category` 误吞，放在它之前）：
```jsx
        <Route path="/matrix" element={<EffectivenessMatrix />} />
```
（注意：`/matrix` 是静态路径，react-router 6 会优先匹配静态段，但仍把它放在 `/:category` 之前最稳妥。）

- [ ] **Step 3d: Nav 加工具链接** — 修改 `src/components/layout/Nav.jsx`：在文件顶部 import 处加 `import { enabledTools } from '../../content/tools.js'`；在组件内 `const cats = enabledCategories()` 下加 `const toolLinks = enabledTools()`；在 `.nav-links` 的 `{cats.map(...)}` 之后追加：
```jsx
        {toolLinks.map((t) => (
          <NavLink key={t.id} to={t.path} onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? 'active' : '')}>
            {t.name}
          </NavLink>
        ))}
```

- [ ] **Step 3e: 先加 Nav 测试断言** — 在 `src/components/layout/Nav.test.jsx` 的 `Nav` describe 内、已有断言后追加：
```js
    expect(screen.getByText('适用性矩阵')).toBeInTheDocument()
```

- [ ] **Step 3f: HomePage 加工具入口区** — 修改 `src/components/HomePage.jsx`：顶部 import 加 `import { enabledTools } from '../content/tools.js'`；在板块 grid 的闭合 `</div>` 之后、组件最外层 `</div>` 之前，加一段工具区：
```jsx
      <h2 style={{ fontSize: 18, marginTop: 36 }}>工具</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginTop: 12 }}>
        {enabledTools().map((t) => (
          <Link key={t.id} to={t.path}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)', padding: 18, height: '100%',
            }}>
              <div style={{ fontSize: 22 }}>{t.icon}</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>{t.name}</div>
              <div style={{ color: 'var(--text-mute)', fontSize: 12, marginTop: 4 }}>{t.desc}</div>
            </div>
          </Link>
        ))}
      </div>
```

- [ ] **Step 3g: 先加 HomePage 测试断言** — 在 `src/components/HomePage.test.jsx` 内新增一个用例：
```js
  it('渲染工具入口（适用性矩阵）', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    const link = screen.getByText('适用性矩阵').closest('a')
    expect(link).toHaveAttribute('href', '/matrix')
  })
```

- [ ] **Step 4: 跑全部测试确认通过**

Run: `npm test`
Expected: PASS — 全绿。新增测试文件 2 个（effectiveness.test、tools.test）+ EffectivenessMatrix.test + Nav/HomePage 新断言。

- [ ] **Step 5: 提交**

```bash
git add src/content/tools.js src/content/tools.test.js src/router.jsx src/components/layout/Nav.jsx src/components/layout/Nav.test.jsx src/components/HomePage.jsx src/components/HomePage.test.jsx
git commit -m "feat: 工具页注册表+/matrix路由+Nav与首页入口"
```

---

## 完成标准

- 访问 `/matrix` 渲染适用性矩阵（10 行 × 3 列，中性色阶评级 + 每格经验说明 + 免责横幅）。
- Nav 与首页都有「适用性矩阵」入口。
- `categories.js` 未改动（矩阵不进 8 大板块）；红涨绿跌色（`--up`/`--down`）未被用于评级。
- `npm test` 全绿；3 个原子提交，中文 `feat:` 前缀。

> **下一步（独立计划）：** 块 3「术语速查 + 搜索」另起一份计划。tools.js 已就绪，新工具页只需往其数组追加。
