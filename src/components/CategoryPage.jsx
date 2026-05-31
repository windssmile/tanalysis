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
