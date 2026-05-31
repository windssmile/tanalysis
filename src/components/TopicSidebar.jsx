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
