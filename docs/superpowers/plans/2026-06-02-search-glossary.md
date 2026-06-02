# 术语速查 + 全站搜索 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增全站搜索（顶栏搜索框 + 实时下拉 + `/search` 结果页）与术语速查页 `/glossary`，术语并入搜索作为一类结果。纯前端、无第三方库。

**Architecture:** 纯函数搜索层 `src/search/index.js`（对 `allTopics` + `glossary` 建内存索引，加权子串匹配，返回带 `type` 的统一结果）；curated 术语数据 `src/content/glossary.js`；展示组件 `SearchPage`/`GlossaryPage`/`SearchBox`；复用 `src/content/tools.js` 注册表（glossary 作为新工具页）。搜索框常驻 Nav。

**Tech Stack:** React 18 + Vite 5 + react-router-dom 6（`useSearchParams`/`useNavigate`）+ Vitest 2 + @testing-library/react。无新依赖。

**统一结果结构（贯穿全 block，务必一致）：**
```ts
search(query: string, limit = 20) => Result[]
Result = {
  type: 'topic' | 'term',
  id: string,        // topic id 或术语文本
  title: string,     // topic.title 或术语
  subtitle: string,  // topic.subtitle 或术语简短定义
  path: string,      // 跳转目标：topic = /<category>/<id>；term = 首个 related 的 /<cat>/<id>，无则 /glossary
}
```

---

## Task S1: 术语数据 `glossary.js` + 校验测试

**Files:**
- Create: `src/content/glossary.js`
- Test: `src/content/glossary.test.js`

每个术语：`{ term, aliases?, def, related }`。`term` 唯一；`def` 一句简明定义；`related` 为 topic id 数组（可空，但若有必须指向真实存在的条目）。

要收录的 16 个术语（`term`）：`金叉、死叉、背离、放量、缩量、颈线、支撑位、压力位、均价线(VWAP)、期望值、盈亏比、止损、筹码分布、假突破、超买超卖、T+1`。`related` 指向最相关的现有条目 id（参考：金叉/死叉→`ma`/`macd`；背离→`volume-divergence`/`macd`；放量/缩量→`volume-price`/`volume-breakout`；颈线→`head-shoulders-top`/`double-top`；支撑位/压力位→`support-resistance`；均价线→`intraday-avgline`；期望值/盈亏比/止损→`position-risk`/`drawdown-ruin` 等 risk 条目；筹码分布→`chip-distribution`；假突破→`false-breakout`/`volume-breakout`；超买超卖→`kdj`/`rsi`；T+1→`order-book`/`intraday-basics` 或 risk 的 A股特有风险条目）。**实现前先 Read `src/content/topics/index.js` 汇总的真实 id，related 只填存在的 id。**

- [ ] **Step 1: 写失败的测试** — 创建 `src/content/glossary.test.js`：

```js
import { describe, it, expect } from 'vitest'
import { glossary } from './glossary.js'
import { allTopics } from './topics/index.js'

describe('glossary 术语表', () => {
  it('至少 16 个术语', () => {
    expect(glossary.length).toBeGreaterThanOrEqual(16)
  })
  it('term 唯一且 def 非空', () => {
    const terms = glossary.map((g) => g.term)
    expect(new Set(terms).size).toBe(terms.length)
    for (const g of glossary) expect(g.def).toBeTruthy()
  })
  it('related 只指向真实存在的 topic id', () => {
    const ids = new Set(allTopics.map((t) => t.id))
    for (const g of glossary) {
      for (const rid of g.related || []) {
        expect(ids.has(rid)).toBe(true)
      }
    }
  })
  it('包含核心术语 金叉/背离/止损', () => {
    const terms = glossary.map((g) => g.term)
    expect(terms).toContain('金叉')
    expect(terms).toContain('背离')
    expect(terms).toContain('止损')
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/content/glossary.test.js`
Expected: FAIL（`glossary.js` 不存在）。

- [ ] **Step 3: 创建 `src/content/glossary.js`** —— 先 Read `topics/index.js` 各板块确认真实 id。骨架（补全 16 条，`related` 只填存在的 id）：

```js
// 术语速查：高频技术分析用语的简明定义 + 延伸条目。related 必须指向真实 topic id。
export const glossary = [
  {
    term: '金叉',
    aliases: ['黄金交叉'],
    def: '短期均线（或快线）由下向上穿过长期均线（或慢线），常被视作偏多信号；震荡市频繁金叉死叉易反复失效。',
    related: ['ma', 'macd'],
  },
  {
    term: '背离',
    aliases: ['顶背离', '底背离'],
    def: '价格创新高/新低但指标未同步创新高/新低，提示动能减弱；A股常连续背离多次才兑现，单次背离不足为凭。',
    related: ['volume-divergence', 'macd'],
  },
  // …其余 14 条：死叉/放量/缩量/颈线/支撑位/压力位/均价线(VWAP)/期望值/盈亏比/止损/筹码分布/假突破/超买超卖/T+1
]
```
定义要诚实克制、贴合 A股语境，与站内立场一致（不夸大有效性）。

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/content/glossary.test.js`
Expected: PASS（4 用例）。再跑 `npm test` 确认无连带破坏。

- [ ] **Step 5: 提交**

```bash
git add src/content/glossary.js src/content/glossary.test.js
git commit -m "feat: 术语速查数据(16个高频术语+延伸条目)+校验测试"
```

---

## Task S2: 搜索索引 `search/index.js` + 测试

**Files:**
- Create: `src/search/index.js`
- Test: `src/search/index.test.js`

纯函数搜索：对 `allTopics`（title/subtitle/tags/sections 全文）+ `glossary`（term/aliases/def）做加权子串匹配，返回统一 `Result[]`（见顶部结构）。权重：topic title 10 / tags 6 / subtitle 5 / 正文 1；term term 10 / aliases 8 / def 2。

- [ ] **Step 1: 写失败的测试** — 创建 `src/search/index.test.js`：

```js
import { describe, it, expect } from 'vitest'
import { search } from './index.js'

describe('search', () => {
  it('空查询返回空数组', () => {
    expect(search('')).toEqual([])
    expect(search('   ')).toEqual([])
  })
  it('“吞没” 命中看涨吞没与看跌吞没两个条目', () => {
    const r = search('吞没')
    expect(r.some((x) => x.type === 'topic' && x.id === 'bullish-engulfing')).toBe(true)
    expect(r.some((x) => x.type === 'topic' && x.id === 'bearish-engulfing')).toBe(true)
  })
  it('“金叉” 命中术语结果', () => {
    const r = search('金叉')
    expect(r.some((x) => x.type === 'term' && x.title === '金叉')).toBe(true)
  })
  it('无意义查询返回空', () => {
    expect(search('zzzzzqqq')).toEqual([])
  })
  it('标题命中排在仅正文命中之前', () => {
    // 标题含“吞没”的条目应排在仅正文提到“吞没”的条目之前
    const r = search('吞没')
    const firstTopic = r.find((x) => x.type === 'topic')
    expect(['bullish-engulfing', 'bearish-engulfing']).toContain(firstTopic.id)
  })
  it('每个结果含 type/id/title/subtitle/path', () => {
    const r = search('金叉')
    for (const x of r) {
      expect(x).toHaveProperty('type')
      expect(x).toHaveProperty('id')
      expect(x).toHaveProperty('title')
      expect(x).toHaveProperty('subtitle')
      expect(typeof x.path).toBe('string')
    }
  })
  it('尊重 limit', () => {
    expect(search('的', 3).length).toBeLessThanOrEqual(3)
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/search/index.test.js`
Expected: FAIL（`index.js` 不存在）。

- [ ] **Step 3: 实现 `src/search/index.js`：**

```js
import { allTopics, getTopic } from '../content/topics/index.js'
import { glossary } from '../content/glossary.js'

const norm = (s) => String(s || '').toLowerCase()

// 把一个条目的所有正文字段拼成可搜字符串
function topicBody(t) {
  const s = t.sections || {}
  const parts = [s.meaning, s.limitation, s.formula]
  for (const key of ['identify', 'usage', 'metrics', 'quant', 'pitfalls']) {
    if (Array.isArray(s[key])) parts.push(s[key].join(' '))
  }
  return norm(parts.filter(Boolean).join(' '))
}

// 预构建索引（模块级，静态数据只算一次）
const topicEntries = allTopics.map((t) => ({
  type: 'topic',
  id: t.id,
  title: t.title,
  subtitle: t.subtitle || '',
  path: `/${t.category}/${t.id}`,
  _title: norm(t.title),
  _subtitle: norm(t.subtitle),
  _tags: norm((t.tags || []).join(' ')),
  _body: topicBody(t),
}))

const termEntries = glossary.map((g) => {
  const first = (g.related || []).map(getTopic).find(Boolean)
  return {
    type: 'term',
    id: g.term,
    title: g.term,
    subtitle: g.def,
    path: first ? `/${first.category}/${first.id}` : '/glossary',
    _term: norm(g.term),
    _aliases: norm((g.aliases || []).join(' ')),
    _def: norm(g.def),
  }
})

function scoreTopic(e, q) {
  let s = 0
  if (e._title.includes(q)) s += 10
  if (e._tags.includes(q)) s += 6
  if (e._subtitle.includes(q)) s += 5
  if (e._body.includes(q)) s += 1
  return s
}

function scoreTerm(e, q) {
  let s = 0
  if (e._term.includes(q)) s += 10
  if (e._aliases.includes(q)) s += 8
  if (e._def.includes(q)) s += 2
  return s
}

export function search(query, limit = 20) {
  const q = norm(query).trim()
  if (!q) return []
  const scored = []
  for (const e of topicEntries) {
    const s = scoreTopic(e, q)
    if (s > 0) scored.push({ e, s })
  }
  for (const e of termEntries) {
    const s = scoreTerm(e, q)
    if (s > 0) scored.push({ e, s })
  }
  scored.sort((a, b) => b.s - a.s || a.e.title.localeCompare(b.e.title))
  return scored.slice(0, limit).map(({ e }) => ({
    type: e.type, id: e.id, title: e.title, subtitle: e.subtitle, path: e.path,
  }))
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/search/index.test.js`
Expected: PASS（7 用例）。再跑 `npm test`。

> 若「标题命中排在仅正文命中之前」用例失败，检查打分/排序是否按 score 降序；不要为了过测试硬编码 id。

- [ ] **Step 5: 提交**

```bash
git add src/search/index.js src/search/index.test.js
git commit -m "feat: 全站搜索索引(加权子串匹配,条目+术语统一结果)+测试"
```

---

## Task S3: SearchPage + GlossaryPage + 路由 + tools 注册表

**Files:**
- Create: `src/components/SearchPage.jsx` + `SearchPage.test.jsx`
- Create: `src/components/GlossaryPage.jsx` + `GlossaryPage.test.jsx`
- Modify: `src/router.jsx`（加 `/search`、`/glossary` 路由）
- Modify: `src/content/tools.js`（加 glossary 工具页）+ `src/content/tools.test.js`（断言）

- [ ] **Step 1: 写失败的测试（两页）** —— 创建 `src/components/SearchPage.test.jsx`：

```js
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SearchPage from './SearchPage.jsx'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/search" element={<SearchPage />} /></Routes>
    </MemoryRouter>
  )
}

describe('SearchPage', () => {
  it('按 q 展示命中条目（吞没）', () => {
    renderAt('/search?q=' + encodeURIComponent('吞没'))
    expect(screen.getAllByText(/吞没/).length).toBeGreaterThanOrEqual(1)
  })
  it('空 q 提示输入', () => {
    renderAt('/search')
    expect(screen.getByText(/搜索/)).toBeInTheDocument()
  })
  it('无结果显示空态', () => {
    renderAt('/search?q=zzzzzqqq')
    expect(screen.getByText(/没有匹配/)).toBeInTheDocument()
  })
})
```

创建 `src/components/GlossaryPage.test.jsx`：
```js
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GlossaryPage from './GlossaryPage.jsx'
import { glossary } from '../content/glossary.js'

describe('GlossaryPage', () => {
  it('渲染全部术语', () => {
    const { container } = render(<MemoryRouter><GlossaryPage /></MemoryRouter>)
    expect(container.querySelectorAll('[data-role="glossary-item"]').length).toBe(glossary.length)
  })
  it('展示术语「金叉」', () => {
    render(<MemoryRouter><GlossaryPage /></MemoryRouter>)
    expect(screen.getByText('金叉')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/SearchPage.test.jsx src/components/GlossaryPage.test.jsx`
Expected: FAIL（组件不存在）。

- [ ] **Step 3a: 实现 `src/components/SearchPage.jsx`：**

```jsx
import { useSearchParams, Link } from 'react-router-dom'
import { search } from '../search/index.js'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim()
  const results = q ? search(q) : []
  const topics = results.filter((r) => r.type === 'topic')
  const terms = results.filter((r) => r.type === 'term')

  return (
    <div>
      <h1 style={{ fontSize: 26 }}>搜索</h1>
      <p style={{ color: 'var(--text-dim)' }}>
        关键词：{q || '（请输入）'} · 共 {results.length} 条
      </p>
      {q && results.length === 0 && <p data-role="search-empty">没有匹配的条目或术语。</p>}

      {terms.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, marginTop: 24 }}>术语 ({terms.length})</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {terms.map((r) => (
              <li key={'term-' + r.id} data-role="search-term" style={{ padding: '8px 0' }}>
                <Link to={r.path} style={{ color: 'var(--primary-text)', fontWeight: 700 }}>{r.title}</Link>
                <span style={{ color: 'var(--text-mute)', marginLeft: 8, fontSize: 13 }}>{r.subtitle}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topics.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, marginTop: 24 }}>条目 ({topics.length})</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {topics.map((r) => (
              <li key={'topic-' + r.id} data-role="search-topic" style={{ padding: '8px 0' }}>
                <Link to={r.path} style={{ color: 'var(--primary-text)', fontWeight: 700 }}>{r.title}</Link>
                <span style={{ color: 'var(--text-mute)', marginLeft: 8, fontSize: 13 }}>{r.subtitle}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 3b: 实现 `src/components/GlossaryPage.jsx`：**

```jsx
import { Link } from 'react-router-dom'
import { glossary } from '../content/glossary.js'
import { getTopic } from '../content/topics/index.js'

export default function GlossaryPage() {
  return (
    <div>
      <h1 style={{ fontSize: 26 }}>术语速查</h1>
      <p style={{ color: 'var(--text-dim)' }}>共 {glossary.length} 个高频术语 —— 简明定义与延伸条目。</p>
      <dl style={{ marginTop: 16 }}>
        {glossary.map((t) => (
          <div key={t.term} data-role="glossary-item" style={{ borderTop: '1px solid var(--border)', padding: '14px 0' }}>
            <dt style={{ fontWeight: 700 }}>{t.term}</dt>
            <dd style={{ margin: '4px 0 0', color: 'var(--text-dim)' }}>
              {t.def}
              {t.related && t.related.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 13 }}>
                  延伸：
                  {t.related.map((id) => {
                    const tp = getTopic(id)
                    return tp ? (
                      <Link key={id} to={`/${tp.category}/${tp.id}`} style={{ marginRight: 10, color: 'var(--primary-text)' }}>
                        {tp.title}
                      </Link>
                    ) : null
                  })}
                </div>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
```

- [ ] **Step 3c: 接路由** —— 在 `src/router.jsx` import 区加：
```js
import SearchPage from './components/SearchPage.jsx'
import GlossaryPage from './components/GlossaryPage.jsx'
```
在 `/:category` 之前加：
```jsx
        <Route path="/search" element={<SearchPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
```

- [ ] **Step 3d: tools 注册表加 glossary** —— 在 `src/content/tools.js` 的 `tools` 数组追加：
```js
  { id: 'glossary', path: '/glossary', name: '术语速查', icon: '📖', desc: '高频术语简明定义与延伸条目', enabled: true },
```
并在 `src/content/tools.test.js` 追加：
```js
  it('包含术语速查且 path 为 /glossary', () => {
    const g = tools.find((t) => t.id === 'glossary')
    expect(g).toBeTruthy()
    expect(g.path).toBe('/glossary')
  })
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm test`
Expected: PASS 全绿。（首页/Nav 会因 tools 注册表自动多出「术语速查」入口卡片/链接——现有断言不受影响。）

- [ ] **Step 5: 提交**

```bash
git add src/components/SearchPage.jsx src/components/SearchPage.test.jsx src/components/GlossaryPage.jsx src/components/GlossaryPage.test.jsx src/router.jsx src/content/tools.js src/content/tools.test.js
git commit -m "feat: 搜索结果页/search + 术语速查页/glossary + 路由与工具入口"
```

---

## Task S4: 顶栏搜索框 SearchBox + Nav 集成

**Files:**
- Create: `src/components/layout/SearchBox.jsx` + `SearchBox.test.jsx`
- Modify: `src/components/layout/Nav.jsx`（嵌入 SearchBox）+ `Nav.test.jsx`（断言搜索框）
- Modify: `src/components/layout/layout.css`（搜索框样式）

- [ ] **Step 1: 写失败的测试** —— 创建 `src/components/layout/SearchBox.test.jsx`：

```js
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SearchBox from './SearchBox.jsx'

describe('SearchBox', () => {
  it('渲染搜索输入框', () => {
    render(<MemoryRouter><SearchBox /></MemoryRouter>)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })
  it('输入后显示实时下拉建议', () => {
    render(<MemoryRouter><SearchBox /></MemoryRouter>)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '吞没' } })
    const suggest = screen.getByRole('listbox')
    expect(suggest).toBeInTheDocument()
    expect(screen.getAllByText(/吞没/).length).toBeGreaterThanOrEqual(1)
  })
  it('空输入不显示下拉', () => {
    render(<MemoryRouter><SearchBox /></MemoryRouter>)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/layout/SearchBox.test.jsx`
Expected: FAIL（组件不存在）。

- [ ] **Step 3a: 实现 `src/components/layout/SearchBox.jsx`：**

```jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { search } from '../../search/index.js'

export default function SearchBox() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const results = q.trim() ? search(q.trim(), 6) : []

  function submit(e) {
    e.preventDefault()
    if (!q.trim()) return
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <form className="nav-search" role="search" onSubmit={submit}>
      <input
        type="search"
        className="nav-search-input"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="搜索条目 / 术语…"
        aria-label="搜索"
      />
      {open && results.length > 0 && (
        <ul className="nav-search-suggest" role="listbox">
          {results.map((r) => (
            <li key={r.type + '-' + r.id} role="option" aria-selected="false">
              <Link to={r.path} onClick={() => { setOpen(false); setQ('') }}>
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
（`type="search"` 的 input 对应 `getByRole('searchbox')`；`ul[role="listbox"]` 对应 `getByRole('listbox')`。）

- [ ] **Step 3b: 样式** —— 在 `src/components/layout/layout.css` 末尾追加（与现有变量风格一致）：

```css
.nav-search { position: relative; margin-left: auto; }
.nav-search-input {
  background: var(--surface-2); color: var(--text); border: 1px solid var(--border-strong);
  border-radius: 20px; padding: 6px 14px; font-size: 13px; width: 180px; outline: none;
}
.nav-search-input:focus { border-color: var(--primary); }
.nav-search-suggest {
  position: absolute; top: 110%; right: 0; left: 0; z-index: 30; margin: 0; padding: 6px;
  list-style: none; background: var(--surface); border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm); box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.nav-search-suggest li a {
  display: flex; justify-content: space-between; gap: 10px; padding: 6px 10px; border-radius: 6px;
}
.nav-search-suggest li a:hover { background: var(--primary-soft); }
.nav-search-kind { color: var(--text-mute); font-size: 12px; }
```

- [ ] **Step 3c: Nav 嵌入 SearchBox** —— 修改 `src/components/layout/Nav.jsx`：import 加 `import SearchBox from './SearchBox.jsx'`；在 `.nav-links` 容器之后（`</div>` 之后、`</nav>` 之前）加 `<SearchBox />`。然后在 `src/components/layout/Nav.test.jsx` 的 `Nav` describe 内追加：
```js
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
```

- [ ] **Step 4: 跑全部测试确认通过**

Run: `npm test`
Expected: PASS 全绿。

- [ ] **Step 5: 提交**

```bash
git add src/components/layout/SearchBox.jsx src/components/layout/SearchBox.test.jsx src/components/layout/Nav.jsx src/components/layout/Nav.test.jsx src/components/layout/layout.css
git commit -m "feat: 顶栏搜索框SearchBox(实时下拉+回车进结果页)+Nav集成"
```

---

## 完成标准

- 顶栏有常驻搜索框，输入实时下拉（条目+术语），回车进 `/search?q=` 结果页。
- `/search` 按 q 分组展示术语/条目命中并可跳转；`/glossary` 列出全部术语（定义 + 延伸条目链接）。
- 术语并入搜索索引（搜「金叉」既可能出条目也出术语）。
- 首页/Nav 自动多出「术语速查」入口（来自 tools 注册表）。
- `categories.js` 未改动；无第三方库；`npm test` 全绿；4 个原子提交，中文 `feat:` 前缀。

> **下一步（独立计划）：** 块 4「playground」另起一份计划。
