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
