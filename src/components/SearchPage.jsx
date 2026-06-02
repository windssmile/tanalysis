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
