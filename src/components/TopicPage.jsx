import { Link, useParams } from 'react-router-dom'
import { getTopic } from '../content/topics/index.js'
import { getCategory } from '../content/categories.js'
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

// Sidebar component is exported for use in layout wrappers (e.g. CategoryPage / App route)
export { TopicSidebar }

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
        <Link to="/">首页</Link> / <Link to={`/${category}`}>{getCategory(category)?.name || category}</Link>
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

        {Array.isArray(s.quant) && s.quant.length > 0 && (
          <div style={{ background: 'var(--primary-soft)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', margin: '4px 0 16px' }}>
            <div style={{ color: 'var(--primary-text)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>📐 <span>量化视角</span></div>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', lineHeight: 1.8 }}>
              {s.quant.map((x, i) => <li key={i}>{x}</li>)}
            </ul>
          </div>
        )}

        <div style={{ background: 'rgba(244,63,94,0.08)', borderLeft: '3px solid var(--warn)', borderRadius: '0 6px 6px 0', padding: '10px 14px', marginTop: 8 }}>
          <div style={{ color: '#f87a8a', fontSize: 13, fontWeight: 700 }}>⚠ <span>局限</span></div>
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
