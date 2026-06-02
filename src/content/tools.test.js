import { describe, it, expect } from 'vitest'
import { tools, enabledTools } from './tools.js'

describe('tools 注册表', () => {
  it('包含适用性矩阵且 path 为 /matrix', () => {
    const m = tools.find((t) => t.id === 'matrix')
    expect(m).toBeTruthy()
    expect(m.path).toBe('/matrix')
  })
  it('enabledTools 只返回 enabled 的工具', () => {
    expect(enabledTools().every((t) => t.enabled)).toBe(true)
  })
  it('包含术语速查且 path 为 /glossary', () => {
    const g = tools.find((t) => t.id === 'glossary')
    expect(g).toBeTruthy()
    expect(g.path).toBe('/glossary')
  })
})
