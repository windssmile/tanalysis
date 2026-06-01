import { candlestickTopics } from './candlestick.js'
import { indicatorTopics } from './indicator.js'
import { patternTopics } from './pattern.js'
import { theoryTopics } from './theory.js'
import { volumeTopics } from './volume.js'
import { intradayTopics } from './intraday.js'
import { strategyTopics } from './strategy.js'

export const allTopics = [
  ...candlestickTopics,
  ...indicatorTopics,
  ...patternTopics,
  ...theoryTopics,
  ...volumeTopics,
  ...intradayTopics,
  ...strategyTopics,
]

export function getTopic(id) {
  return allTopics.find((t) => t.id === id)
}

export function topicsByCategory(categoryId) {
  return allTopics.filter((t) => t.category === categoryId)
}
