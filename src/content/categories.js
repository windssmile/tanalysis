export const categories = [
  { id: 'candlestick', name: 'K线基础', icon: '📊', enabled: true, order: 1, desc: 'K线构成与经典单根/组合形态' },
  { id: 'indicator', name: '技术指标', icon: '📈', enabled: true, order: 2, desc: '均线、MACD、KDJ 等常用指标' },
  { id: 'pattern', name: '经典形态', icon: '📐', enabled: false, order: 3, desc: '头肩顶底、双顶底、三角形等' },
  { id: 'theory', name: '趋势理论', icon: '🌊', enabled: false, order: 4, desc: '道氏理论、波浪理论、支撑阻力' },
  { id: 'intraday', name: '分时图分析', icon: '⏱️', enabled: false, order: 5, desc: '分时线、均价线、量价与盘口' },
  { id: 'strategy', name: '实战框架', icon: '🎯', enabled: false, order: 6, desc: '多指标组合成分析与交易体系' },
]

export function getCategory(id) {
  return categories.find((c) => c.id === id)
}

export function enabledCategories() {
  return categories.filter((c) => c.enabled).sort((a, b) => a.order - b.order)
}
