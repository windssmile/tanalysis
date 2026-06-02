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
