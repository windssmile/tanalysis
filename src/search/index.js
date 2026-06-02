import { allTopics, getTopic } from '../content/topics/index.js'
import { glossary } from '../content/glossary.js'

const norm = (s) => String(s || '').toLowerCase()

function topicBody(t) {
  const s = t.sections || {}
  const parts = [s.meaning, s.limitation, s.formula]
  for (const key of ['identify', 'usage', 'metrics', 'quant', 'pitfalls']) {
    if (Array.isArray(s[key])) parts.push(s[key].join(' '))
  }
  return norm(parts.filter(Boolean).join(' '))
}

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
