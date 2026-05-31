# 股票技术分析图谱 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个数据驱动的纯前端单页应用，面向中国大陆有基础散户系统介绍 K线/技术指标知识；第一版做 K线基础(6) + 技术指标(3)，并搭好支撑后续 6 大板块扩展的框架。

**Architecture:** 方案 A —— 内容与框架彻底分离。内容为结构化数据对象（`content/`），通用渲染器（`TopicPage` 等）自动排版，K线/指标示意图为可复用 SVG 组件经注册表（`chartRegistry`）按 id 引用。React Router 三级路由：首页 → 板块目录 → 条目详情。

**Tech Stack:** React 18 + Vite + react-router-dom + Vitest + @testing-library/react。图表用 SVG 自绘，无第三方图表库。深色主题、靛蓝主色、**红涨绿跌**（A股习惯）。

---

## 文件结构

```
package.json                      依赖与脚本
vite.config.js                    Vite + Vitest 配置
index.html                        入口 HTML
src/
  main.jsx                        React 挂载入口
  App.jsx                         路由装配
  router.jsx                      路由表
  styles/
    theme.css                     设计令牌（CSS 变量）+ 全局样式
  content/
    categories.js                 6 大板块定义（enabled 控制）
    topics/
      candlestick.js              6 个 K线基础条目数据
      indicator.js                3 个技术指标条目数据
      index.js                    汇总所有条目 + 查询辅助函数
    validate.js                   条目数据校验函数（测试用）
  charts/
    chartData.js                  各条目预置 K线/指标示意数据
    CandleChart.jsx               通用 K线 SVG 绘制组件
    geometry.js                   K线坐标/颜色计算纯函数
    indicators/
      calc.js                     MA / MACD / KDJ 计算纯函数
      MAChart.jsx                 MA 均线图（叠加主图）
      MACDChart.jsx               MACD 红绿柱 + 双线
      KDJChart.jsx                KDJ 三线
    chartRegistry.js              chartId → 图表组件 注册表
  components/
    layout/
      Nav.jsx                     顶部导航（板块切换 + 移动端汉堡）
      Footer.jsx                  页脚免责声明
      Layout.jsx                  页面外壳
    HomePage.jsx                  首页（板块入口）
    CategoryPage.jsx              板块目录页
    TopicPage.jsx                 条目详情渲染器
    TopicSidebar.jsx              详情页左侧同板块导航
    NotFound.jsx                  404 友好页
```

测试文件与源文件同目录，命名 `*.test.js(x)`。

---

## Task 1: 项目脚手架

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/styles/theme.css`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "tanalysis",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "vite": "^5.4.0",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js（含 Vitest 配置）**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
```

- [ ] **Step 3: 创建 src/setupTests.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 4: 创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>技术分析图谱</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: 创建 src/styles/theme.css（设计令牌 + 全局）**

```css
:root {
  --bg: #0b0f1a;
  --surface: #141b2d;
  --surface-2: #0e131f;
  --border: #1e293b;
  --border-strong: #2d3a52;
  --text: #f1f5f9;
  --text-dim: #94a3b8;
  --text-mute: #64748b;
  --primary: #6366f1;
  --primary-soft: rgba(99, 102, 241, 0.15);
  --primary-text: #a5b4fc;
  --up: #f43f5e;   /* 红：上涨/阳线（A股习惯） */
  --down: #22c55e; /* 绿：下跌/阴线 */
  --warn: #f43f5e;
  --accent: #10d9a0;
  --radius: 14px;
  --radius-sm: 8px;
  --font: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  line-height: 1.6;
}
a { color: inherit; text-decoration: none; }
.tag {
  display: inline-block;
  background: var(--primary-soft);
  color: var(--primary-text);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}
```

- [ ] **Step 6: 创建 src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/theme.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 7: 创建 src/App.jsx（占位，Task 12 替换为路由）**

```jsx
export default function App() {
  return <div>技术分析图谱</div>
}
```

- [ ] **Step 8: 安装依赖并验证 dev 可启动**

Run: `npm install && npm run build`
Expected: 安装成功，build 输出 `dist/` 无报错。

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: 初始化 Vite + React + Vitest 脚手架与主题令牌"
```

---

## Task 2: 板块定义 categories.js

**Files:**
- Create: `src/content/categories.js`
- Test: `src/content/categories.test.js`

- [ ] **Step 1: 写失败测试**

```js
import { describe, it, expect } from 'vitest'
import { categories, getCategory, enabledCategories } from './categories.js'

describe('categories', () => {
  it('定义了全部 6 大板块', () => {
    expect(categories).toHaveLength(6)
  })
  it('第一版仅启用 candlestick 与 indicator', () => {
    expect(enabledCategories().map((c) => c.id)).toEqual(['candlestick', 'indicator'])
  })
  it('每个板块有 id/name/order/enabled 字段', () => {
    for (const c of categories) {
      expect(typeof c.id).toBe('string')
      expect(typeof c.name).toBe('string')
      expect(typeof c.order).toBe('number')
      expect(typeof c.enabled).toBe('boolean')
    }
  })
  it('order 唯一且按升序可排', () => {
    const orders = categories.map((c) => c.order)
    expect(new Set(orders).size).toBe(orders.length)
  })
  it('getCategory 按 id 返回，未知 id 返回 undefined', () => {
    expect(getCategory('candlestick').name).toBe('K线基础')
    expect(getCategory('nope')).toBeUndefined()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/content/categories.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 categories.js**

```js
export const categories = [
  { id: 'candlestick', name: 'K线基础', icon: '📊', enabled: true, order: 1, desc: 'K线构成与经典单根/组合形态' },
  { id: 'indicator', name: '技术指标', icon: '📈', enabled: true, order: 2, desc: '均线、MACD、KDJ 等常用指标' },
  { id: 'pattern', name: '经典形态', icon: '📐', enabled: false, order: 3, desc: '头肩顶底、双顶底、三角形等' },
  { id: 'theory', name: '趋势理论', icon: '🌊', enabled: false, order: 4, desc: '道氏理论、波浪理论、支撑阻力' },
  { id: 'intraday', name: '分时图分析', icon: '⏱️', enabled: false, order: 5, desc: '分时线、均价线、量价与盘口' },
  { id: 'strategy', name: '实战框架', icon: '🎯', enabled: false, order: 6, desc: '多指标组合成分析与交易体系' },
]

export function getCategory(id) {
  return categories.find((c) => c.id === id)
}

export function enabledCategories() {
  return categories.filter((c) => c.enabled).sort((a, b) => a.order - b.order)
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/content/categories.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/content/categories.js src/content/categories.test.js
git commit -m "feat: 定义 6 大板块，第一版启用 K线基础与技术指标"
```

---

## Task 3: K线坐标/颜色计算纯函数 geometry.js

把 K线绘制中的纯计算从 SVG 组件中分离，便于单测。

**Files:**
- Create: `src/charts/geometry.js`
- Test: `src/charts/geometry.test.js`

- [ ] **Step 1: 写失败测试**

```js
import { describe, it, expect } from 'vitest'
import { isBullish, candleColor, scaleY, layoutCandles } from './geometry.js'

const UP = '#f43f5e'
const DOWN = '#22c55e'

describe('geometry', () => {
  it('收盘≥开盘为阳线(上涨)', () => {
    expect(isBullish({ o: 10, c: 12 })).toBe(true)
    expect(isBullish({ o: 12, c: 10 })).toBe(false)
  })
  it('阳线红色、阴线绿色（A股习惯）', () => {
    expect(candleColor({ o: 10, c: 12 }, UP, DOWN)).toBe(UP)
    expect(candleColor({ o: 12, c: 10 }, UP, DOWN)).toBe(DOWN)
  })
  it('scaleY 将价格线性映射到像素，高价对应小 y', () => {
    // 价格区间[10,20] 映射到 y 像素区间[100,0]（含 padding=0）
    const y = scaleY(20, { min: 10, max: 20, height: 100, pad: 0 })
    expect(y).toBeCloseTo(0)
    expect(scaleY(10, { min: 10, max: 20, height: 100, pad: 0 })).toBeCloseTo(100)
    expect(scaleY(15, { min: 10, max: 20, height: 100, pad: 0 })).toBeCloseTo(50)
  })
  it('layoutCandles 计算每根的 x/实体/影线坐标', () => {
    const data = [{ o: 10, h: 13, l: 9, c: 12 }, { o: 12, h: 14, l: 8, c: 9 }]
    const out = layoutCandles(data, { width: 200, height: 100, pad: 0 })
    expect(out).toHaveLength(2)
    expect(out[0]).toHaveProperty('x')
    expect(out[0]).toHaveProperty('bodyY')
    expect(out[0]).toHaveProperty('bodyH')
    expect(out[0]).toHaveProperty('highY')
    expect(out[0]).toHaveProperty('lowY')
    // 第一根阳线，bodyY 对应较高价 c=12
    expect(out[0].bodyY).toBeLessThan(out[0].bodyY + out[0].bodyH)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/charts/geometry.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 geometry.js**

```js
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
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/charts/geometry.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/charts/geometry.js src/charts/geometry.test.js
git commit -m "feat: K线坐标与涨跌颜色计算纯函数"
```

---

## Task 4: 通用 K线绘制组件 CandleChart

**Files:**
- Create: `src/charts/CandleChart.jsx`
- Test: `src/charts/CandleChart.test.jsx`

- [ ] **Step 1: 写失败测试**

```jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import CandleChart from './CandleChart.jsx'

const data = [
  { o: 10, h: 13, l: 9, c: 12 },
  { o: 12, h: 14, l: 8, c: 9 },
]

describe('CandleChart', () => {
  it('为每根 K线渲染实体与影线', () => {
    const { container } = render(<CandleChart data={data} />)
    // 2 根 K线 → 2 个实体 rect（不含标注）
    const bodies = container.querySelectorAll('rect[data-role="body"]')
    expect(bodies).toHaveLength(2)
    const wicks = container.querySelectorAll('line[data-role="wick"]')
    expect(wicks).toHaveLength(2)
  })
  it('阳线用红色、阴线用绿色', () => {
    const { container } = render(<CandleChart data={data} />)
    const bodies = container.querySelectorAll('rect[data-role="body"]')
    expect(bodies[0].getAttribute('fill')).toBe('#f43f5e') // 阳
    expect(bodies[1].getAttribute('fill')).toBe('#22c55e') // 阴
  })
  it('渲染高亮区域标注', () => {
    const { container } = render(
      <CandleChart data={data} annotations={[{ type: 'box', from: 0, to: 1, label: '吞没区' }]} />
    )
    expect(container.querySelector('rect[data-role="box"]')).toBeTruthy()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/charts/CandleChart.test.jsx`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 CandleChart.jsx**

```jsx
import { useState } from 'react'
import { layoutCandles } from './geometry.js'

const UP = '#f43f5e'
const DOWN = '#22c55e'

export default function CandleChart({
  data,
  annotations = [],
  width = 320,
  height = 200,
  showTooltip = true,
}) {
  const [hover, setHover] = useState(null)
  const pad = 12
  const laid = layoutCandles(data, { width, height, pad })
  const slot = width / data.length

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {/* 网格 */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" y1={height * f} x2={width} y2={height * f} stroke="#1e293b" />
      ))}

      {/* 区域标注 */}
      {annotations
        .filter((a) => a.type === 'box')
        .map((a, i) => {
          const x1 = slot * a.from + slot * 0.1
          const x2 = slot * (a.to + 1) - slot * 0.1
          return (
            <g key={`box-${i}`}>
              <rect
                data-role="box"
                x={x1}
                y={pad / 2}
                width={x2 - x1}
                height={height - pad}
                fill="none"
                stroke="#fbbf24"
                strokeDasharray="4"
                rx="3"
              />
              {a.label && (
                <text x={(x1 + x2) / 2} y={height - 2} fill="#fbbf24" fontSize="11" textAnchor="middle">
                  {a.label}
                </text>
              )}
            </g>
          )
        })}

      {/* K线 */}
      {laid.map((c, i) => {
        const color = c.bullish ? UP : DOWN
        const dim = annotations.some((a) => a.type === 'highlight') &&
          !annotations.some((a) => a.type === 'highlight' && a.index === i)
        return (
          <g
            key={i}
            opacity={dim ? 0.3 : 1}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: showTooltip ? 'pointer' : 'default' }}
          >
            <line data-role="wick" x1={c.x} y1={c.highY} x2={c.x} y2={c.lowY} stroke={color} strokeWidth="1.5" />
            <rect data-role="body" x={c.bodyX} y={c.bodyY} width={c.bodyW} height={c.bodyH} rx="1.5" fill={color} />
          </g>
        )
      })}

      {/* 悬停 OHLC 提示 */}
      {showTooltip && hover !== null && (
        <text x="6" y="14" fill="#cbd5e1" fontSize="11">
          {`开${data[hover].o} 高${data[hover].h} 低${data[hover].l} 收${data[hover].c}`}
        </text>
      )}
    </svg>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/charts/CandleChart.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/charts/CandleChart.jsx src/charts/CandleChart.test.jsx
git commit -m "feat: 通用 K线 SVG 绘制组件（红涨绿跌、标注、悬停提示）"
```

---

## Task 5: 指标计算纯函数 calc.js

**Files:**
- Create: `src/charts/indicators/calc.js`
- Test: `src/charts/indicators/calc.test.js`

- [ ] **Step 1: 写失败测试**

```js
import { describe, it, expect } from 'vitest'
import { sma, ema, macd, kdj } from './calc.js'

describe('指标计算', () => {
  it('sma 简单移动平均，前 n-1 个为 null', () => {
    expect(sma([1, 2, 3, 4], 2)).toEqual([null, 1.5, 2.5, 3.5])
  })
  it('ema 指数移动平均，首值等于首个数据', () => {
    const out = ema([1, 2, 3], 2)
    expect(out[0]).toBe(1)
    // k = 2/(2+1)=0.6667; ema1 = 2*0.6667 + 1*0.3333 = 1.6667
    expect(out[1]).toBeCloseTo(1.6667, 3)
  })
  it('macd 返回 dif/dea/hist 等长数组', () => {
    const closes = Array.from({ length: 40 }, (_, i) => 10 + Math.sin(i / 3))
    const { dif, dea, hist } = macd(closes)
    expect(dif).toHaveLength(40)
    expect(dea).toHaveLength(40)
    expect(hist).toHaveLength(40)
    // hist = (dif - dea) * 2，取一个有效点验证
    const idx = 39
    expect(hist[idx]).toBeCloseTo((dif[idx] - dea[idx]) * 2, 6)
  })
  it('kdj 返回 k/d/j 三线且在合理范围', () => {
    const data = Array.from({ length: 30 }, (_, i) => ({
      h: 12 + Math.sin(i / 2),
      l: 8 + Math.sin(i / 2),
      c: 10 + Math.sin(i / 2),
    }))
    const { k, d, j } = kdj(data)
    expect(k).toHaveLength(30)
    expect(d).toHaveLength(30)
    expect(j).toHaveLength(30)
    const last = 29
    expect(k[last]).toBeGreaterThanOrEqual(0)
    expect(k[last]).toBeLessThanOrEqual(100)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/charts/indicators/calc.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 calc.js**

```js
// 简单移动平均；前 period-1 个为 null
export function sma(values, period) {
  const out = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null)
    } else {
      let sum = 0
      for (let j = i - period + 1; j <= i; j++) sum += values[j]
      out.push(sum / period)
    }
  }
  return out
}

// 指数移动平均；首值取首个数据点
export function ema(values, period) {
  const k = 2 / (period + 1)
  const out = []
  let prev = values[0]
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      out.push(values[0])
    } else {
      prev = values[i] * k + prev * (1 - k)
      out.push(prev)
    }
  }
  return out
}

// MACD：dif = ema(fast) - ema(slow)，dea = ema(dif, signal)，hist = (dif-dea)*2
export function macd(closes, fast = 12, slow = 26, signal = 9) {
  const emaFast = ema(closes, fast)
  const emaSlow = ema(closes, slow)
  const dif = closes.map((_, i) => emaFast[i] - emaSlow[i])
  const dea = ema(dif, signal)
  const hist = dif.map((v, i) => (v - dea[i]) * 2)
  return { dif, dea, hist }
}

// KDJ：基于 n 日 RSV，K/D 为 RSV 的移动平滑，J = 3K - 2D
export function kdj(data, n = 9, k1 = 3, d1 = 3) {
  const k = []
  const d = []
  const j = []
  let prevK = 50
  let prevD = 50
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - n + 1)
    const window = data.slice(start, i + 1)
    const high = Math.max(...window.map((x) => x.h))
    const low = Math.min(...window.map((x) => x.l))
    const rsv = high === low ? 0 : ((data[i].c - low) / (high - low)) * 100
    const curK = (prevK * (k1 - 1) + rsv) / k1
    const curD = (prevD * (d1 - 1) + curK) / d1
    k.push(curK)
    d.push(curD)
    j.push(3 * curK - 2 * curD)
    prevK = curK
    prevD = curD
  }
  return { k, d, j }
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/charts/indicators/calc.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/charts/indicators/calc.js src/charts/indicators/calc.test.js
git commit -m "feat: MA/EMA/MACD/KDJ 指标计算纯函数"
```

---

## Task 6: 示意数据 chartData.js

为 9 个条目准备"教科书形态"预置数据。这里手工设计干净、特征明显的数据。

**Files:**
- Create: `src/charts/chartData.js`
- Test: `src/charts/chartData.test.js`

- [ ] **Step 1: 写失败测试**

```js
import { describe, it, expect } from 'vitest'
import { chartData } from './chartData.js'

const ids = [
  'kline-basics', 'hammer', 'doji', 'bullish-engulfing',
  'bearish-engulfing', 'morning-star', 'ma', 'macd', 'kdj',
]

describe('chartData', () => {
  it('覆盖全部 9 个条目', () => {
    for (const id of ids) expect(chartData[id]).toBeDefined()
  })
  it('每个条目含非空 candles 数组，且每根有 o/h/l/c', () => {
    for (const id of ids) {
      const candles = chartData[id].candles
      expect(Array.isArray(candles)).toBe(true)
      expect(candles.length).toBeGreaterThan(0)
      for (const c of candles) {
        for (const k of ['o', 'h', 'l', 'c']) expect(typeof c[k]).toBe('number')
        expect(c.h).toBeGreaterThanOrEqual(Math.max(c.o, c.c))
        expect(c.l).toBeLessThanOrEqual(Math.min(c.o, c.c))
      }
    }
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/charts/chartData.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 chartData.js**

> 数据为示意用途，特征清晰。`annotations` 供详情页分步高亮/区域框使用。

```js
export const chartData = {
  // K线构成：一阳一阴，展示影线实体
  'kline-basics': {
    candles: [
      { o: 10, h: 13, l: 9.5, c: 12.5 },
      { o: 12.5, h: 12.8, l: 9, c: 9.8 },
    ],
  },
  // 锤子线：下影长、实体小、收在上方（下跌末端）
  hammer: {
    candles: [
      { o: 14, h: 14.2, l: 13, c: 13.2 },
      { o: 13.2, h: 13.4, l: 12, c: 13 },
      { o: 12.5, h: 12.7, l: 10, c: 12.4 }, // 锤子
    ],
    annotations: [{ type: 'highlight', index: 2 }],
  },
  // 十字星：开收几乎相等
  doji: {
    candles: [
      { o: 11, h: 11.5, l: 10.5, c: 11.1 },
      { o: 11.1, h: 12, l: 10.2, c: 11.1 }, // 十字星
    ],
    annotations: [{ type: 'highlight', index: 1 }],
  },
  // 看涨吞没：阴后大阳吞没
  'bullish-engulfing': {
    candles: [
      { o: 13, h: 13.2, l: 11.5, c: 11.8 },
      { o: 11.5, h: 13.6, l: 11.3, c: 13.5 }, // 阳吞没
    ],
    annotations: [{ type: 'box', from: 0, to: 1, label: '吞没区' }],
  },
  // 看跌吞没：阳后大阴吞没
  'bearish-engulfing': {
    candles: [
      { o: 11, h: 12.8, l: 10.8, c: 12.6 },
      { o: 12.9, h: 13.1, l: 10.5, c: 10.7 }, // 阴吞没
    ],
    annotations: [{ type: 'box', from: 0, to: 1, label: '吞没区' }],
  },
  // 早晨之星：大阴 + 小星 + 大阳
  'morning-star': {
    candles: [
      { o: 14, h: 14.1, l: 12, c: 12.1 },     // 大阴
      { o: 11.8, h: 12, l: 11.4, c: 11.7 },   // 小星
      { o: 12, h: 13.8, l: 11.9, c: 13.7 },   // 大阳
    ],
    annotations: [{ type: 'highlight', index: 1 }],
  },
  // MA：一段带趋势的收盘序列
  ma: {
    candles: genTrend(),
  },
  macd: {
    candles: genTrend(),
  },
  kdj: {
    candles: genTrend(),
  },
}

// 生成一段先跌后涨的趋势数据，便于指标演示
function genTrend() {
  const out = []
  let price = 20
  for (let i = 0; i < 40; i++) {
    const drift = i < 20 ? -0.3 : 0.4
    const o = price
    const c = price + drift + Math.sin(i / 2) * 0.3
    const h = Math.max(o, c) + 0.4
    const l = Math.min(o, c) - 0.4
    out.push({ o: round(o), h: round(h), l: round(l), c: round(c) })
    price = c
  }
  return out
}
function round(x) {
  return Math.round(x * 100) / 100
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/charts/chartData.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/charts/chartData.js src/charts/chartData.test.js
git commit -m "feat: 9 个条目的教科书示意数据"
```

---

## Task 7: 指标图表组件（MA / MACD / KDJ）

**Files:**
- Create: `src/charts/indicators/MAChart.jsx`
- Create: `src/charts/indicators/MACDChart.jsx`
- Create: `src/charts/indicators/KDJChart.jsx`
- Test: `src/charts/indicators/indicatorCharts.test.jsx`

- [ ] **Step 1: 写失败测试**

```jsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { chartData } from '../chartData.js'
import MAChart from './MAChart.jsx'
import MACDChart from './MACDChart.jsx'
import KDJChart from './KDJChart.jsx'

describe('指标图表', () => {
  it('MAChart 在 K线主图上叠加均线 polyline', () => {
    const { container } = render(<MAChart data={chartData.ma.candles} />)
    expect(container.querySelectorAll('polyline').length).toBeGreaterThanOrEqual(1)
    expect(container.querySelectorAll('rect[data-role="body"]').length).toBeGreaterThan(0)
  })
  it('MACDChart 渲染红绿柱与 DIF/DEA 双线', () => {
    const { container } = render(<MACDChart data={chartData.macd.candles} />)
    expect(container.querySelectorAll('rect[data-role="hist"]').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('polyline').length).toBe(2)
  })
  it('KDJChart 渲染 K/D/J 三条线', () => {
    const { container } = render(<KDJChart data={chartData.kdj.candles} />)
    expect(container.querySelectorAll('polyline').length).toBe(3)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/charts/indicators/indicatorCharts.test.jsx`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 MAChart.jsx**

```jsx
import { useState } from 'react'
import { layoutCandles } from '../geometry.js'
import { sma } from './calc.js'

const UP = '#f43f5e'
const DOWN = '#22c55e'
const MA_COLORS = { 5: '#fbbf24', 10: '#6366f1', 20: '#10d9a0' }

export default function MAChart({ data, width = 480, height = 220 }) {
  const [periods, setPeriods] = useState({ 5: true, 10: true, 20: true })
  const pad = 12
  const laid = layoutCandles(data, { width, height, pad })
  const closes = data.map((d) => d.c)

  function linePoints(period) {
    const vals = sma(closes, period)
    return vals
      .map((v, i) => (v == null ? null : `${laid[i].x},${scaleClose(v)}`))
      .filter(Boolean)
      .join(' ')
  }
  // 用与 K线相同的价格范围映射收盘价
  function scaleClose(price) {
    const prices = data.flatMap((d) => [d.h, d.l])
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const usable = height - pad * 2
    return pad + ((max - price) / (max - min)) * usable
  }

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
        {laid.map((c, i) => {
          const color = c.bullish ? UP : DOWN
          return (
            <g key={i}>
              <line x1={c.x} y1={c.highY} x2={c.x} y2={c.lowY} stroke={color} strokeWidth="1" />
              <rect data-role="body" x={c.bodyX} y={c.bodyY} width={c.bodyW} height={c.bodyH} fill={color} />
            </g>
          )
        })}
        {Object.keys(MA_COLORS)
          .map(Number)
          .filter((p) => periods[p])
          .map((p) => (
            <polyline key={p} points={linePoints(p)} fill="none" stroke={MA_COLORS[p]} strokeWidth="1.5" />
          ))}
      </svg>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12 }}>
        {Object.keys(MA_COLORS).map(Number).map((p) => (
          <label key={p} style={{ color: MA_COLORS[p], cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={periods[p]}
              onChange={() => setPeriods((s) => ({ ...s, [p]: !s[p] }))}
            />
            MA{p}
          </label>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 实现 MACDChart.jsx**

```jsx
import { layoutCandles } from '../geometry.js'
import { macd } from './calc.js'

const UP = '#f43f5e'
const DOWN = '#22c55e'

export default function MACDChart({ data, width = 480, height = 160 }) {
  const closes = data.map((d) => d.c)
  const { dif, dea, hist } = macd(closes)
  const all = [...dif, ...dea, ...hist].filter((v) => Number.isFinite(v))
  const max = Math.max(...all, 0.01)
  const min = Math.min(...all, -0.01)
  const zeroY = scale(0)
  const slot = width / data.length
  function scale(v) {
    return ((max - v) / (max - min)) * height
  }
  function line(arr) {
    return arr.map((v, i) => `${slot * i + slot / 2},${scale(v)}`).join(' ')
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      <line x1="0" y1={zeroY} x2={width} y2={zeroY} stroke="#334155" strokeDasharray="3" />
      {hist.map((v, i) => {
        const y = scale(v)
        const top = Math.min(y, zeroY)
        const h = Math.abs(y - zeroY)
        return (
          <rect
            key={i}
            data-role="hist"
            x={slot * i + slot * 0.25}
            y={top}
            width={slot * 0.5}
            height={h}
            fill={v >= 0 ? UP : DOWN}
          />
        )
      })}
      <polyline points={line(dif)} fill="none" stroke="#6366f1" strokeWidth="1.5" />
      <polyline points={line(dea)} fill="none" stroke="#fbbf24" strokeWidth="1.5" />
    </svg>
  )
}
```

- [ ] **Step 5: 实现 KDJChart.jsx**

```jsx
import { kdj } from './calc.js'

const COLORS = { k: '#6366f1', d: '#fbbf24', j: '#f43f5e' }

export default function KDJChart({ data, width = 480, height = 160 }) {
  const { k, d, j } = kdj(data)
  const slot = width / data.length
  // KDJ 一般在 0-100，J 可能越界，做一次裁剪范围
  const all = [...k, ...d, ...j]
  const max = Math.max(100, ...all)
  const min = Math.min(0, ...all)
  function scale(v) {
    return ((max - v) / (max - min)) * height
  }
  function line(arr) {
    return arr.map((v, i) => `${slot * i + slot / 2},${scale(v)}`).join(' ')
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {[20, 50, 80].map((lvl) => (
        <line key={lvl} x1="0" y1={scale(lvl)} x2={width} y2={scale(lvl)} stroke="#1e293b" />
      ))}
      <polyline points={line(k)} fill="none" stroke={COLORS.k} strokeWidth="1.5" />
      <polyline points={line(d)} fill="none" stroke={COLORS.d} strokeWidth="1.5" />
      <polyline points={line(j)} fill="none" stroke={COLORS.j} strokeWidth="1.5" />
    </svg>
  )
}
```

- [ ] **Step 6: 运行测试确认通过**

Run: `npx vitest run src/charts/indicators/indicatorCharts.test.jsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/charts/indicators/MAChart.jsx src/charts/indicators/MACDChart.jsx src/charts/indicators/KDJChart.jsx src/charts/indicators/indicatorCharts.test.jsx
git commit -m "feat: MA/MACD/KDJ 指标图表组件"
```

---

## Task 8: 图表注册表 chartRegistry

**Files:**
- Create: `src/charts/chartRegistry.js`
- Test: `src/charts/chartRegistry.test.js`

- [ ] **Step 1: 写失败测试**

```js
import { describe, it, expect } from 'vitest'
import { getChart, hasChart } from './chartRegistry.js'

describe('chartRegistry', () => {
  it('K线类条目返回 CandleChart 渲染器', () => {
    expect(hasChart('bullish-engulfing')).toBe(true)
    const entry = getChart('bullish-engulfing')
    expect(typeof entry.Component).toBe('function')
    expect(entry.props.data.length).toBeGreaterThan(0)
  })
  it('指标条目返回各自图表组件', () => {
    expect(hasChart('macd')).toBe(true)
    expect(typeof getChart('macd').Component).toBe('function')
  })
  it('未知 chartId 返回 undefined', () => {
    expect(getChart('nope')).toBeUndefined()
    expect(hasChart('nope')).toBe(false)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/charts/chartRegistry.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 chartRegistry.js**

```js
import CandleChart from './CandleChart.jsx'
import MAChart from './indicators/MAChart.jsx'
import MACDChart from './indicators/MACDChart.jsx'
import KDJChart from './indicators/KDJChart.jsx'
import { chartData } from './chartData.js'

// chartId → { Component, props }
const registry = {
  'kline-basics': candle('kline-basics'),
  hammer: candle('hammer'),
  doji: candle('doji'),
  'bullish-engulfing': candle('bullish-engulfing'),
  'bearish-engulfing': candle('bearish-engulfing'),
  'morning-star': candle('morning-star'),
  ma: { Component: MAChart, props: { data: chartData.ma.candles } },
  macd: { Component: MACDChart, props: { data: chartData.macd.candles } },
  kdj: { Component: KDJChart, props: { data: chartData.kdj.candles } },
}

function candle(id) {
  return {
    Component: CandleChart,
    props: { data: chartData[id].candles, annotations: chartData[id].annotations || [] },
  }
}

export function getChart(chartId) {
  return registry[chartId]
}

export function hasChart(chartId) {
  return chartId in registry
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/charts/chartRegistry.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/charts/chartRegistry.js src/charts/chartRegistry.test.js
git commit -m "feat: 图表注册表，按 chartId 解析图表组件与预置数据"
```

---

## Task 9: 条目内容数据（K线基础 6 个）

**Files:**
- Create: `src/content/topics/candlestick.js`
- Test: `src/content/topics/candlestick.test.js`

- [ ] **Step 1: 写失败测试**

```js
import { describe, it, expect } from 'vitest'
import { candlestickTopics } from './candlestick.js'

describe('candlestick topics', () => {
  it('包含 6 个条目', () => {
    expect(candlestickTopics).toHaveLength(6)
  })
  it('全部 category 为 candlestick', () => {
    for (const t of candlestickTopics) expect(t.category).toBe('candlestick')
  })
  it('每个条目含必填 sections 字段', () => {
    for (const t of candlestickTopics) {
      expect(t.sections.meaning).toBeTruthy()
      expect(Array.isArray(t.sections.identify)).toBe(true)
      expect(Array.isArray(t.sections.usage)).toBe(true)
      expect(t.sections.limitation).toBeTruthy()
    }
  })
  it('id 唯一', () => {
    const ids = candlestickTopics.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/content/topics/candlestick.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 candlestick.js**

> 内容面向有基础散户，专业准确。

```js
export const candlestickTopics = [
  {
    id: 'kline-basics',
    category: 'candlestick',
    title: 'K线的构成',
    subtitle: 'Candlestick Basics',
    tags: ['基础', '入门'],
    chartId: 'kline-basics',
    sections: {
      meaning:
        '一根 K线记录了某一周期内的四个价格：开盘价、最高价、最低价、收盘价（合称 OHLC）。实体表示开盘与收盘之间的区间——收盘高于开盘为阳线（红），收盘低于开盘为阴线（绿）；实体上下的细线称为影线，上影线顶端为最高价，下影线底端为最低价。',
      identify: [
        '实体颜色：红阳（收>开）、绿阴（收<开）',
        '实体长度反映多空力量强弱，越长一方主导越明显',
        '上影线长说明上方抛压重，下影线长说明下方承接强',
      ],
      usage: [
        '先看实体方向与长短判断当根多空胜负',
        '再看影线位置判断关键价位的攻防',
        'K线要结合位置（高位/低位）和周期共同解读，单根意义有限',
      ],
      limitation:
        '单根 K线信息量有限，容易被主力用单日波动误导；务必放在趋势与成交量背景下、结合多根组合来判断。',
    },
    related: ['hammer', 'doji'],
  },
  {
    id: 'hammer',
    category: 'candlestick',
    title: '锤子线',
    subtitle: 'Hammer',
    tags: ['单根形态', '反转', '看涨'],
    chartId: 'hammer',
    sections: {
      meaning:
        '锤子线是出现在下跌趋势末端的单根反转形态：实体较小且位于价格区间上端，下影线很长（通常为实体的 2 倍以上），几乎没有上影线。它表明盘中虽一度大幅下探，但买方将价格强力拉回收盘，空方力量衰竭。',
      identify: [
        '出现在明显的下跌趋势之后',
        '下影线长度≥实体的 2 倍，上影线极短或没有',
        '实体颜色不限，但收红（阳）信号更强',
      ],
      usage: [
        '可视为下跌动能衰竭、潜在见底的预警',
        '需等待次日收阳或放量突破锤子线高点再确认',
        '结合支撑位、成交量萎缩后放大判断更可靠',
      ],
      limitation:
        '锤子线只是“可能反转”的提示而非确认信号，下跌中继时也会出现长下影；不确认就抢反弹易被套，须设好止损。',
    },
    related: ['doji', 'bullish-engulfing'],
  },
  {
    id: 'doji',
    category: 'candlestick',
    title: '十字星',
    subtitle: 'Doji',
    tags: ['单根形态', '变盘', '中性'],
    chartId: 'doji',
    sections: {
      meaning:
        '十字星指开盘价与收盘价几乎相等、实体极小、上下都有影线的 K线。它代表多空力量在该周期内势均力敌、市场陷入犹豫，常出现在趋势的转折或暂歇处，是重要的“变盘”信号。',
      identify: [
        '开盘与收盘价基本重合，实体接近一条横线',
        '通常上下影线都存在，长十字星变盘意义更强',
        '出现在趋势高位或低位时参考价值最大',
      ],
      usage: [
        '高位十字星警惕见顶，低位十字星留意见底',
        '把它当作“趋势可能改变”的提醒，等次日方向确认',
        '结合所处位置与成交量综合判断变盘方向',
      ],
      limitation:
        '十字星只说明分歧加大，并不指明方向；震荡市中频繁出现、参考价值低，必须依赖后续 K线确认。',
    },
    related: ['hammer', 'morning-star'],
  },
  {
    id: 'bullish-engulfing',
    category: 'candlestick',
    title: '看涨吞没',
    subtitle: 'Bullish Engulfing',
    tags: ['组合形态', '反转', '看涨'],
    chartId: 'bullish-engulfing',
    sections: {
      meaning:
        '看涨吞没由一阴一阳两根 K线组成，出现在下跌趋势末端：第一根为阴线，第二根为阳线且其实体完全包住（吞没）前一根阴线的实体。它表明买方力量在短时间内彻底压倒卖方，是较强的见底反转信号。',
      identify: [
        '出现在下跌趋势末端',
        '第二根为阳线，实体完全吞没前一根阴线实体',
        '第二根成交量明显放大，信号更可靠',
      ],
      usage: [
        '可作为试探性买入或离场观望转为偏多的依据',
        '配合成交量放大、处于支撑位附近确认度更高',
        '可将吞没阳线的低点作为止损参考',
      ],
      limitation:
        '在震荡市中信号频繁且容易失效；若吞没阳线放量却不能延续，可能是诱多，需结合趋势与量能过滤。',
    },
    related: ['bearish-engulfing', 'hammer'],
  },
  {
    id: 'bearish-engulfing',
    category: 'candlestick',
    title: '看跌吞没',
    subtitle: 'Bearish Engulfing',
    tags: ['组合形态', '反转', '看跌'],
    chartId: 'bearish-engulfing',
    sections: {
      meaning:
        '看跌吞没与看涨吞没相反，出现在上涨趋势末端：第一根为阳线，第二根为阴线且实体完全吞没前一根阳线的实体。它表明卖方力量骤然占据上风，是较强的见顶反转信号。',
      identify: [
        '出现在上涨趋势末端或高位',
        '第二根为阴线，实体完全吞没前一根阳线实体',
        '第二根放量下跌，见顶信号更强',
      ],
      usage: [
        '持仓者可视为减仓或离场的警示',
        '结合高位、放量、前期阻力位判断更可靠',
        '可将吞没阴线的高点作为反弹离场或止损参考',
      ],
      limitation:
        '高位震荡时也会出现假吞没；若后续快速收复阴线则信号失效，应结合趋势确认而非单根定生死。',
    },
    related: ['bullish-engulfing', 'doji'],
  },
  {
    id: 'morning-star',
    category: 'candlestick',
    title: '早晨之星',
    subtitle: 'Morning Star',
    tags: ['组合形态', '反转', '看涨'],
    chartId: 'morning-star',
    sections: {
      meaning:
        '早晨之星是由三根 K线组成的底部反转形态：第一根为延续跌势的大阴线；第二根为实体很小的星线（跳空或低位窄幅，多空僵持）；第三根为大阳线，深入第一根阴线实体内部。三根共同描绘出空头衰竭、多头反攻、趋势由跌转涨的过程。',
      identify: [
        '出现在下跌趋势末端',
        '中间星线实体小、与两侧拉开（理想有跳空）',
        '第三根大阳线收复第一根阴线相当部分（越多越强）',
      ],
      usage: [
        '是较可靠的底部反转组合，可作为偏多依据',
        '第三根放量、星线位置低、收复幅度大则确认度更高',
        '可将形态最低点作为止损参考',
      ],
      limitation:
        '形态识别较主观，A股常无跳空使其打折；仍需结合趋势、量能与支撑位确认，避免在下跌中继处误判。',
    },
    related: ['bullish-engulfing', 'hammer'],
  },
]
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/content/topics/candlestick.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/content/topics/candlestick.js src/content/topics/candlestick.test.js
git commit -m "feat: K线基础 6 个条目内容数据"
```

---

## Task 10: 条目内容数据（技术指标 3 个）

**Files:**
- Create: `src/content/topics/indicator.js`
- Test: `src/content/topics/indicator.test.js`

- [ ] **Step 1: 写失败测试**

```js
import { describe, it, expect } from 'vitest'
import { indicatorTopics } from './indicator.js'

describe('indicator topics', () => {
  it('包含 3 个条目', () => {
    expect(indicatorTopics).toHaveLength(3)
  })
  it('全部 category 为 indicator 且含 formula 字段', () => {
    for (const t of indicatorTopics) {
      expect(t.category).toBe('indicator')
      expect(t.sections.formula).toBeTruthy()
    }
  })
  it('必填 sections 字段齐全', () => {
    for (const t of indicatorTopics) {
      expect(t.sections.meaning).toBeTruthy()
      expect(Array.isArray(t.sections.identify)).toBe(true)
      expect(Array.isArray(t.sections.usage)).toBe(true)
      expect(t.sections.limitation).toBeTruthy()
    }
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/content/topics/indicator.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 indicator.js**

```js
export const indicatorTopics = [
  {
    id: 'ma',
    category: 'indicator',
    title: 'MA 均线',
    subtitle: 'Moving Average',
    tags: ['趋势指标', '基础'],
    chartId: 'ma',
    sections: {
      formula:
        'MA(N) = 最近 N 个周期收盘价之和 ÷ N。常用 MA5、MA10、MA20、MA60 分别代表 5/10/20/60 日的平均成本。EMA 则对近端价格加权，反应更灵敏。',
      meaning:
        '均线是把一段时间的收盘价做平均后连成的曲线，代表该周期内市场的平均持仓成本与趋势方向。短期均线灵敏、长期均线稳健；多条均线的排列与交叉刻画了趋势的强弱与转折。',
      identify: [
        '多头排列：短期在上、长期在下且向上发散，趋势走强',
        '空头排列：短期在下、长期在上且向下发散，趋势走弱',
        '金叉：短期上穿长期；死叉：短期下穿长期',
      ],
      usage: [
        '用均线方向判断趋势、用均线作动态支撑/压力',
        '金叉偏多、死叉偏空，结合周期级别使用',
        '价格回踩重要均线（如 MA20、MA60）不破常是介入参考',
      ],
      limitation:
        '均线是滞后指标，转折后才发出信号；震荡市中频繁金叉死叉、假信号多，单用均线易被反复打脸。',
    },
    related: ['macd', 'kdj'],
  },
  {
    id: 'macd',
    category: 'indicator',
    title: 'MACD',
    subtitle: 'Moving Average Convergence Divergence',
    tags: ['趋势指标', '动能'],
    chartId: 'macd',
    sections: {
      formula:
        'DIF = EMA12 − EMA26；DEA（信号线）= DIF 的 9 日 EMA；柱状图 MACD = (DIF − DEA) × 2。柱由负转正、由正转负反映动能的扩张与收缩。',
      meaning:
        'MACD 由快慢两条均线之差（DIF）及其平滑线（DEA），加上反映两者距离的红绿柱组成，用来衡量趋势的方向与动能强弱。它兼具趋势与摆动特性，是最常用的中线指标之一。',
      identify: [
        '金叉：DIF 上穿 DEA，柱由绿转红，动能转多',
        '死叉：DIF 下穿 DEA，柱由红转绿，动能转空',
        '背离：价格创新高/低而 DIF 未跟随，预示动能衰竭',
      ],
      usage: [
        '零轴之上金叉偏强、零轴之下死叉偏弱',
        '红柱放大表示多头动能增强，缩短表示动能减弱',
        '顶背离警惕见顶、底背离留意见底，是较受重视的信号',
      ],
      limitation:
        'MACD 同样滞后，震荡市金叉死叉频繁失效；背离可能持续很久不兑现，不能单凭背离逆势操作。',
    },
    related: ['ma', 'kdj'],
  },
  {
    id: 'kdj',
    category: 'indicator',
    title: 'KDJ 随机指标',
    subtitle: 'Stochastic Oscillator',
    tags: ['摆动指标', '超买超卖'],
    chartId: 'kdj',
    sections: {
      formula:
        '先算 N 日 RSV =(收盘 − N 日最低)÷(N 日最高 − N 日最低)×100；K = 前一日 K×2/3 + 当日 RSV×1/3；D = 前一日 D×2/3 + 当日 K×1/3；J = 3K − 2D。常用参数为 (9,3,3)。',
      meaning:
        'KDJ 衡量当前收盘价在近期价格区间中的相对位置，是一种灵敏的超买超卖摆动指标。K、D 较平滑，J 最灵敏、常领先转折，适合判断短线买卖点。',
      identify: [
        'K、D 进入 80 以上为超买区，20 以下为超卖区',
        '低位金叉（K 上穿 D）偏买，高位死叉偏卖',
        'J 值钝化（长时间 >100 或 <0）提示极端强弱',
      ],
      usage: [
        '超卖区金叉找短线买点，超买区死叉找卖点',
        '配合趋势使用：强势中 KDJ 高位钝化未必下跌',
        '与价格背离时提示动能转弱，可作辅助',
      ],
      limitation:
        'KDJ 过于灵敏、假信号多，强趋势中长期钝化会让超买超卖失灵；必须结合趋势级别，不宜在单边行情中逆势使用。',
    },
    related: ['ma', 'macd'],
  },
]
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/content/topics/indicator.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/content/topics/indicator.js src/content/topics/indicator.test.js
git commit -m "feat: 技术指标 3 个条目内容数据"
```

---

## Task 11: 条目汇总与查询 index.js + 数据校验 validate.js

**Files:**
- Create: `src/content/topics/index.js`
- Create: `src/content/validate.js`
- Test: `src/content/validate.test.js`

- [ ] **Step 1: 写失败测试**

```js
import { describe, it, expect } from 'vitest'
import { allTopics, getTopic, topicsByCategory } from './topics/index.js'
import { validateTopic, validateAll } from './validate.js'
import { hasChart } from '../charts/chartRegistry.js'
import { getCategory } from './categories.js'

describe('topics index', () => {
  it('汇总 9 个条目', () => {
    expect(allTopics).toHaveLength(9)
  })
  it('getTopic 按 id 返回，未知返回 undefined', () => {
    expect(getTopic('macd').title).toBe('MACD')
    expect(getTopic('nope')).toBeUndefined()
  })
  it('topicsByCategory 按板块过滤', () => {
    expect(topicsByCategory('candlestick')).toHaveLength(6)
    expect(topicsByCategory('indicator')).toHaveLength(3)
  })
})

describe('validate', () => {
  it('每个条目的 chartId 在注册表中存在', () => {
    for (const t of allTopics) expect(hasChart(t.chartId)).toBe(true)
  })
  it('每个条目的 category 合法', () => {
    for (const t of allTopics) expect(getCategory(t.category)).toBeDefined()
  })
  it('每个条目的 related 指向真实存在的条目', () => {
    const ids = new Set(allTopics.map((t) => t.id))
    for (const t of allTopics) {
      for (const r of t.related || []) expect(ids.has(r)).toBe(true)
    }
  })
  it('validateAll 对当前数据返回无错误', () => {
    expect(validateAll(allTopics)).toEqual([])
  })
  it('validateTopic 捕获缺失字段', () => {
    const errors = validateTopic({ id: 'x', category: 'candlestick', chartId: 'hammer', sections: {} })
    expect(errors.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/content/validate.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 topics/index.js**

```js
import { candlestickTopics } from './candlestick.js'
import { indicatorTopics } from './indicator.js'

export const allTopics = [...candlestickTopics, ...indicatorTopics]

export function getTopic(id) {
  return allTopics.find((t) => t.id === id)
}

export function topicsByCategory(categoryId) {
  return allTopics.filter((t) => t.category === categoryId)
}
```

- [ ] **Step 4: 实现 validate.js**

```js
import { hasChart } from '../charts/chartRegistry.js'
import { getCategory } from './categories.js'

// 返回某条目的错误信息数组（空数组表示通过）
export function validateTopic(t, knownIds = null) {
  const errors = []
  if (!t.id) errors.push('缺少 id')
  if (!t.title) errors.push(`${t.id}: 缺少 title`)
  if (!getCategory(t.category)) errors.push(`${t.id}: 非法 category "${t.category}"`)
  if (!hasChart(t.chartId)) errors.push(`${t.id}: chartId "${t.chartId}" 未注册`)
  const s = t.sections || {}
  if (!s.meaning) errors.push(`${t.id}: 缺少 sections.meaning`)
  if (!Array.isArray(s.identify) || s.identify.length === 0) errors.push(`${t.id}: 缺少 sections.identify`)
  if (!Array.isArray(s.usage) || s.usage.length === 0) errors.push(`${t.id}: 缺少 sections.usage`)
  if (!s.limitation) errors.push(`${t.id}: 缺少 sections.limitation`)
  if (knownIds) {
    for (const r of t.related || []) {
      if (!knownIds.has(r)) errors.push(`${t.id}: related "${r}" 不存在`)
    }
  }
  return errors
}

export function validateAll(topics) {
  const ids = new Set(topics.map((t) => t.id))
  return topics.flatMap((t) => validateTopic(t, ids))
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npx vitest run src/content/validate.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/content/topics/index.js src/content/validate.js src/content/validate.test.js
git commit -m "feat: 条目汇总查询与数据完整性校验"
```

---

## Task 12: 布局外壳 Layout / Nav / Footer

**Files:**
- Create: `src/components/layout/Footer.jsx`
- Create: `src/components/layout/Nav.jsx`
- Create: `src/components/layout/Layout.jsx`
- Create: `src/components/layout/layout.css`
- Test: `src/components/layout/Nav.test.jsx`

- [ ] **Step 1: 写失败测试**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'

describe('Nav', () => {
  it('渲染品牌名与已启用板块链接', () => {
    render(<MemoryRouter><Nav /></MemoryRouter>)
    expect(screen.getByText('技术分析图谱')).toBeInTheDocument()
    expect(screen.getByText('K线基础')).toBeInTheDocument()
    expect(screen.getByText('技术指标')).toBeInTheDocument()
    // 未启用板块不出现在主导航
    expect(screen.queryByText('经典形态')).not.toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('显示免责声明', () => {
    render(<Footer />)
    expect(screen.getByText(/不构成任何投资建议/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/components/layout/Nav.test.jsx`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 Footer.jsx**

```jsx
export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center', color: 'var(--text-mute)', fontSize: 12,
      padding: '24px 16px', borderTop: '1px solid var(--border)', marginTop: 40,
    }}>
      本站内容仅供学习参考，不构成任何投资建议。市场有风险，投资需谨慎。
    </footer>
  )
}
```

- [ ] **Step 4: 实现 Nav.jsx**

```jsx
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { enabledCategories } from '../../content/categories.js'
import './layout.css'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const cats = enabledCategories()
  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        <span className="nav-logo" />
        技术分析图谱
      </Link>
      <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="菜单">☰</button>
      <div className={`nav-links ${open ? 'open' : ''}`}>
        {cats.map((c) => (
          <NavLink key={c.id} to={`/${c.id}`} onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? 'active' : '')}>
            {c.name}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 5: 实现 layout.css**

```css
.nav {
  display: flex; align-items: center; gap: 24px;
  padding: 14px 24px; border-bottom: 1px solid var(--border);
  position: sticky; top: 0; background: rgba(11,15,26,0.9);
  backdrop-filter: blur(8px); z-index: 10;
}
.nav-brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 15px; }
.nav-logo { width: 26px; height: 26px; border-radius: 7px; background: linear-gradient(135deg,#6366f1,#8b5cf6); }
.nav-links { display: flex; gap: 18px; font-size: 14px; color: var(--text-dim); }
.nav-links a.active { color: var(--primary-text); }
.nav-toggle { display: none; background: none; border: none; color: var(--text); font-size: 20px; margin-left: auto; cursor: pointer; }
.container { max-width: 1100px; margin: 0 auto; padding: 24px; }
@media (max-width: 720px) {
  .nav-toggle { display: block; }
  .nav-links {
    display: none; position: absolute; top: 56px; right: 0; left: 0;
    flex-direction: column; background: var(--surface); padding: 12px 24px;
    border-bottom: 1px solid var(--border);
  }
  .nav-links.open { display: flex; }
}
```

- [ ] **Step 6: 实现 Layout.jsx**

```jsx
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children }) {
  return (
    <>
      <Nav />
      <main className="container">{children}</main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 7: 运行测试确认通过**

Run: `npx vitest run src/components/layout/Nav.test.jsx`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/
git commit -m "feat: 布局外壳、顶部导航（响应式）、免责声明页脚"
```

---

## Task 13: 首页 HomePage

**Files:**
- Create: `src/components/HomePage.jsx`
- Test: `src/components/HomePage.test.jsx`

- [ ] **Step 1: 写失败测试**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage.jsx'

describe('HomePage', () => {
  it('渲染全部 6 个板块卡片', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText('K线基础')).toBeInTheDocument()
    expect(screen.getByText('经典形态')).toBeInTheDocument()
  })
  it('已启用板块为链接，未启用显示“敬请期待”', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    const enabled = screen.getByText('K线基础').closest('a')
    expect(enabled).toHaveAttribute('href', '/candlestick')
    expect(screen.getAllByText('敬请期待').length).toBe(4)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/components/HomePage.test.jsx`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 HomePage.jsx**

```jsx
import { Link } from 'react-router-dom'
import { categories } from '../content/categories.js'
import { topicsByCategory } from '../content/topics/index.js'

export default function HomePage() {
  const sorted = [...categories].sort((a, b) => a.order - b.order)
  return (
    <div>
      <h1 style={{ fontSize: 26 }}>技术分析图谱</h1>
      <p style={{ color: 'var(--text-dim)' }}>面向有基础的投资者，系统梳理 K线、分时与技术指标知识。</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginTop: 24 }}>
        {sorted.map((c) => {
          const count = topicsByCategory(c.id).length
          const card = (
            <div style={{
              background: c.enabled ? 'var(--surface)' : 'var(--surface-2)',
              border: `1px ${c.enabled ? 'solid var(--border-strong)' : 'dashed var(--border)'}`,
              borderRadius: 'var(--radius)', padding: 18, opacity: c.enabled ? 1 : 0.5, height: '100%',
            }}>
              <div style={{ fontSize: 22 }}>{c.enabled ? c.icon : '🔒'}</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>{c.name}</div>
              <div style={{ color: 'var(--text-mute)', fontSize: 12, marginTop: 4 }}>{c.desc}</div>
              <div style={{ color: c.enabled ? 'var(--primary-text)' : 'var(--text-mute)', fontSize: 12, marginTop: 10 }}>
                {c.enabled ? `${count} 个条目 →` : '敬请期待'}
              </div>
            </div>
          )
          return c.enabled
            ? <Link key={c.id} to={`/${c.id}`}>{card}</Link>
            : <div key={c.id}>{card}</div>
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/components/HomePage.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/HomePage.jsx src/components/HomePage.test.jsx
git commit -m "feat: 首页板块入口（启用可点、占位敬请期待）"
```

---

## Task 14: 板块目录页 CategoryPage

**Files:**
- Create: `src/components/CategoryPage.jsx`
- Test: `src/components/CategoryPage.test.jsx`

- [ ] **Step 1: 写失败测试**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CategoryPage from './CategoryPage.jsx'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/:category" element={<CategoryPage />} /></Routes>
    </MemoryRouter>
  )
}

describe('CategoryPage', () => {
  it('展示该板块下所有条目卡片', () => {
    renderAt('/candlestick')
    expect(screen.getByText('看涨吞没')).toBeInTheDocument()
    expect(screen.getByText('锤子线')).toBeInTheDocument()
  })
  it('未知板块显示未找到提示', () => {
    renderAt('/nope')
    expect(screen.getByText(/未找到/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/components/CategoryPage.test.jsx`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 CategoryPage.jsx**

```jsx
import { Link, useParams } from 'react-router-dom'
import { getCategory } from '../content/categories.js'
import { topicsByCategory } from '../content/topics/index.js'
import { getChart } from '../charts/chartRegistry.js'

export default function CategoryPage() {
  const { category } = useParams()
  const cat = getCategory(category)
  if (!cat || !cat.enabled) {
    return <p style={{ color: 'var(--text-dim)' }}>未找到该板块，或暂未开放。<Link to="/" style={{ color: 'var(--primary-text)' }}>返回首页</Link></p>
  }
  const topics = topicsByCategory(category)
  return (
    <div>
      <div style={{ color: 'var(--text-mute)', fontSize: 12 }}><Link to="/">首页</Link> / {cat.name}</div>
      <h1 style={{ fontSize: 22, marginTop: 6 }}>{cat.name}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginTop: 16 }}>
        {topics.map((t) => {
          const entry = getChart(t.chartId)
          const Chart = entry?.Component
          return (
            <Link key={t.id} to={`/${category}/${t.id}`}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14 }}>
                <span className="tag">{t.tags[0]}</span>
                <div style={{ height: 70, margin: '10px 0', pointerEvents: 'none' }}>
                  {Chart && <Chart {...entry.props} showTooltip={false} />}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.title}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/components/CategoryPage.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CategoryPage.jsx src/components/CategoryPage.test.jsx
git commit -m "feat: 板块目录页，条目卡片含迷你示意图"
```

---

## Task 15: 详情页侧栏 TopicSidebar

**Files:**
- Create: `src/components/TopicSidebar.jsx`
- Test: `src/components/TopicSidebar.test.jsx`

- [ ] **Step 1: 写失败测试**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TopicSidebar from './TopicSidebar.jsx'

describe('TopicSidebar', () => {
  it('列出同板块全部条目并高亮当前条目', () => {
    render(
      <MemoryRouter>
        <TopicSidebar category="candlestick" currentId="hammer" />
      </MemoryRouter>
    )
    expect(screen.getByText('看涨吞没')).toBeInTheDocument()
    const current = screen.getByText('锤子线')
    expect(current.className).toMatch(/active/)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/components/TopicSidebar.test.jsx`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 TopicSidebar.jsx**

```jsx
import { Link } from 'react-router-dom'
import { topicsByCategory } from '../content/topics/index.js'
import { getCategory } from '../content/categories.js'

export default function TopicSidebar({ category, currentId }) {
  const cat = getCategory(category)
  const topics = topicsByCategory(category)
  return (
    <aside style={{ width: 150, flexShrink: 0 }}>
      <div style={{ color: 'var(--text-mute)', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
        {cat?.name}
      </div>
      {topics.map((t) => {
        const active = t.id === currentId
        return (
          <Link
            key={t.id}
            to={`/${category}/${t.id}`}
            className={active ? 'active' : ''}
            style={{
              display: 'block', fontSize: 13, padding: '6px 8px', marginBottom: 2, borderRadius: 6,
              color: active ? 'var(--text)' : 'var(--text-dim)',
              background: active ? 'var(--primary-soft)' : 'transparent',
            }}
          >
            {t.title}
          </Link>
        )
      })}
    </aside>
  )
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/components/TopicSidebar.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/TopicSidebar.jsx src/components/TopicSidebar.test.jsx
git commit -m "feat: 详情页同板块侧栏导航"
```

---

## Task 16: 条目详情页 TopicPage（核心渲染器）

**Files:**
- Create: `src/components/TopicPage.jsx`
- Test: `src/components/TopicPage.test.jsx`

- [ ] **Step 1: 写失败测试**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import TopicPage from './TopicPage.jsx'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/:category/:topic" element={<TopicPage />} /></Routes>
    </MemoryRouter>
  )
}

describe('TopicPage', () => {
  it('渲染标题、标签、含义、识别要点、局限', () => {
    renderAt('/candlestick/bullish-engulfing')
    expect(screen.getByRole('heading', { name: '看涨吞没' })).toBeInTheDocument()
    expect(screen.getByText('含义')).toBeInTheDocument()
    expect(screen.getByText('识别要点')).toBeInTheDocument()
    expect(screen.getByText('局限')).toBeInTheDocument()
    expect(screen.getByText(/震荡市中信号频繁/)).toBeInTheDocument()
  })
  it('指标条目额外渲染计算原理', () => {
    renderAt('/indicator/macd')
    expect(screen.getByText('计算原理')).toBeInTheDocument()
  })
  it('K线条目不渲染计算原理', () => {
    renderAt('/candlestick/hammer')
    expect(screen.queryByText('计算原理')).not.toBeInTheDocument()
  })
  it('渲染延伸阅读链接', () => {
    renderAt('/candlestick/bullish-engulfing')
    expect(screen.getByText(/延伸阅读/)).toBeInTheDocument()
    expect(screen.getByText('看跌吞没')).toBeInTheDocument()
  })
  it('未知条目显示未找到', () => {
    renderAt('/candlestick/nope')
    expect(screen.getByText(/未找到/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/components/TopicPage.test.jsx`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 TopicPage.jsx**

```jsx
import { Link, useParams } from 'react-router-dom'
import { getTopic } from '../content/topics/index.js'
import { getChart } from '../charts/chartRegistry.js'
import TopicSidebar from './TopicSidebar.jsx'

function Bullets({ items }) {
  return (
    <ul style={{ margin: '4px 0 16px', paddingLeft: 18, color: '#cbd5e1', lineHeight: 1.8 }}>
      {items.map((x, i) => <li key={i}>{x}</li>)}
    </ul>
  )
}

function SectionTitle({ children }) {
  return <div style={{ color: 'var(--primary-text)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{children}</div>
}

export default function TopicPage() {
  const { category, topic } = useParams()
  const t = getTopic(topic)
  if (!t || t.category !== category) {
    return <p style={{ color: 'var(--text-dim)' }}>未找到该条目。<Link to="/" style={{ color: 'var(--primary-text)' }}>返回首页</Link></p>
  }
  const entry = getChart(t.chartId)
  const Chart = entry?.Component
  const s = t.sections

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div className="topic-sidebar-wrap"><TopicSidebar category={category} currentId={t.id} /></div>
      <article style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'var(--text-mute)', fontSize: 12 }}>
          <Link to="/">首页</Link> / <Link to={`/${category}`}>{t.category === 'candlestick' ? 'K线基础' : '技术指标'}</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '8px 0 16px' }}>
          <h1 style={{ fontSize: 22, margin: 0 }}>{t.title}</h1>
          {t.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>

        {/* 图表区 */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
          {Chart && <Chart {...entry.props} />}
        </div>

        {/* 正文 */}
        <div style={{ marginTop: 18 }}>
          <SectionTitle>含义</SectionTitle>
          <p style={{ color: '#cbd5e1', marginTop: 0 }}>{s.meaning}</p>

          {s.formula && (<><SectionTitle>计算原理</SectionTitle><p style={{ color: '#cbd5e1' }}>{s.formula}</p></>)}

          <SectionTitle>识别要点</SectionTitle>
          <Bullets items={s.identify} />

          <SectionTitle>使用提示</SectionTitle>
          <Bullets items={s.usage} />

          <div style={{ background: 'rgba(244,63,94,0.08)', borderLeft: '3px solid var(--warn)', borderRadius: '0 6px 6px 0', padding: '10px 14px', marginTop: 8 }}>
            <div style={{ color: '#f87a8a', fontSize: 13, fontWeight: 700 }}>⚠ 局限</div>
            <p style={{ color: '#cbd5e1', margin: '4px 0 0' }}>{s.limitation}</p>
          </div>
        </div>

        {/* 延伸阅读 */}
        {t.related?.length > 0 && (
          <div style={{ marginTop: 24, color: 'var(--text-dim)', fontSize: 14 }}>
            延伸阅读：{t.related.map((rid, i) => {
              const rt = getTopic(rid)
              if (!rt) return null
              return (
                <span key={rid}>
                  {i > 0 && ' · '}
                  <Link to={`/${rt.category}/${rt.id}`} style={{ color: 'var(--primary-text)' }}>{rt.title}</Link>
                </span>
              )
            })}
          </div>
        )}
      </article>
    </div>
  )
}
```

- [ ] **Step 4: 追加移动端侧栏隐藏样式到 layout.css**

在 `src/components/layout/layout.css` 末尾追加：

```css
@media (max-width: 720px) {
  .topic-sidebar-wrap { display: none; }
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npx vitest run src/components/TopicPage.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/TopicPage.jsx src/components/TopicPage.test.jsx src/components/layout/layout.css
git commit -m "feat: 条目详情页核心渲染器（图表+结构化正文+延伸阅读）"
```

---

## Task 17: 路由装配 + 404

**Files:**
- Create: `src/components/NotFound.jsx`
- Create: `src/router.jsx`
- Modify: `src/App.jsx`
- Test: `src/router.test.jsx`

- [ ] **Step 1: 写失败测试**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from './router.jsx'

function renderAt(path) {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>)
}

describe('routing', () => {
  it('/ 渲染首页', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: '技术分析图谱' })).toBeInTheDocument()
  })
  it('/candlestick 渲染板块页', () => {
    renderAt('/candlestick')
    expect(screen.getByText('看涨吞没')).toBeInTheDocument()
  })
  it('/candlestick/macd 类目不匹配显示未找到', () => {
    renderAt('/candlestick/macd')
    expect(screen.getByText(/未找到/)).toBeInTheDocument()
  })
  it('完全未知路径显示 404', () => {
    renderAt('/totally/unknown/path')
    expect(screen.getByText(/页面不存在/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/router.test.jsx`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 NotFound.jsx**

```jsx
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <h1 style={{ fontSize: 22 }}>页面不存在</h1>
      <p style={{ color: 'var(--text-dim)' }}>
        你访问的页面找不到了。<Link to="/" style={{ color: 'var(--primary-text)' }}>返回首页</Link>
      </p>
    </div>
  )
}
```

- [ ] **Step 4: 实现 router.jsx**

```jsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import HomePage from './components/HomePage.jsx'
import CategoryPage from './components/CategoryPage.jsx'
import TopicPage from './components/TopicPage.jsx'
import NotFound from './components/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:category" element={<CategoryPage />} />
        <Route path="/:category/:topic" element={<TopicPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
```

- [ ] **Step 5: 替换 App.jsx**

```jsx
import AppRoutes from './router.jsx'

export default function App() {
  return <AppRoutes />
}
```

- [ ] **Step 6: 运行测试确认通过**

Run: `npx vitest run src/router.test.jsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/router.jsx src/App.jsx src/components/NotFound.jsx src/router.test.jsx
git commit -m "feat: 路由装配三级页面与 404"
```

---

## Task 18: 全量测试 + 构建 + 人工验收

**Files:** 无新增

- [ ] **Step 1: 运行全部测试**

Run: `npm run test`
Expected: 全部 PASS，无失败用例。

- [ ] **Step 2: 生产构建**

Run: `npm run build`
Expected: 构建成功，输出 `dist/`，无报错。

- [ ] **Step 3: 启动 dev 人工验收**

Run: `npm run dev`
人工检查清单（浏览器打开 dev 地址）：
- 首页 6 个板块卡片，前 2 个可点、后 4 个灰色"敬请期待"
- 进入「K线基础」，6 个条目卡片含迷你示意图
- 进入「看涨吞没」详情：标题+标签、K线图带"吞没区"框、含义/识别要点/使用提示/⚠局限、延伸阅读
- 进入「MACD」详情：有"计算原理"段，图为红绿柱+双线
- 「MA 均线」详情：勾选框可切换 MA5/10/20 显示
- K线图悬停显示 OHLC
- 颜色确认：上涨/阳线=红，下跌/阴线=绿
- 缩到手机宽度：导航变汉堡菜单、侧栏隐藏、内容单列可读
- 页脚显示免责声明
- 访问不存在的 URL 显示 404

- [ ] **Step 4: 修正发现的问题后提交**

```bash
git add -A
git commit -m "chore: 第一版验收修正"
```

---

## 自查记录（Self-Review）

- **Spec 覆盖**：技术栈(Task1)、6板块(Task2)、数据结构与校验(Task9-11)、CandleChart与交互(Task4)、指标计算与图表(Task5,7)、注册表(Task8)、首页/目录/详情/导航/免责(Task12-16)、路由与404(Task17)、测试策略(各任务TDD + Task18)、内容清单9条(Task9-10)。均有对应任务。
- **Placeholder 扫描**：无 TBD/TODO；所有代码步骤含完整代码。
- **类型/命名一致**：`getChart` 返回 `{Component, props}`（Task8 定义，Task14/16 使用一致）；`getTopic/topicsByCategory/getCategory/enabledCategories/validateTopic/validateAll/layoutCandles/sma/ema/macd/kdj` 命名跨任务一致；`chartId` 字段贯穿数据与注册表。
- **风险点**：`CandleChart` 的 `annotations` 中 `highlight` 用于指标/单根高亮，`box` 用于区域框，组件已分别处理。
