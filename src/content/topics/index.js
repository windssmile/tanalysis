import { candlestickTopics } from './candlestick.js'
import { indicatorTopics } from './indicator.js'

export const allTopics = [...candlestickTopics, ...indicatorTopics]

export function getTopic(id) {
  return allTopics.find((t) => t.id === id)
}

export function topicsByCategory(categoryId) {
  return allTopics.filter((t) => t.category === categoryId)
}
