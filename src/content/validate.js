import { hasChart } from '../charts/chartRegistry.js'
import { getCategory } from './categories.js'

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
