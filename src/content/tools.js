// 横切工具页（不属于 8 大知识板块）。后续 search/glossary/playground 追加到此数组。
export const tools = [
  { id: 'matrix', path: '/matrix', name: '适用性矩阵', icon: '🧭', desc: '趋势市 vs 震荡市的有效性对照', enabled: true },
  { id: 'glossary', path: '/glossary', name: '术语速查', icon: '📖', desc: '高频术语简明定义与延伸条目', enabled: true },
]

export function enabledTools() {
  return tools.filter((t) => t.enabled)
}
