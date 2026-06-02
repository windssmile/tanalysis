import { Link } from 'react-router-dom'
import { glossary } from '../content/glossary.js'

// 把文本里首次出现的术语切段（最长优先、每术语一次）。
// 注：纯子串匹配、无词边界判断——中文场景基本够用，但短术语理论上可能被长词误匹配；
// 当前术语表无此问题，若日后加入很短的术语需复核。
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
