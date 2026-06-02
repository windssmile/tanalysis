import { describe, it, expect } from 'vitest'
import { effectivenessMatrix } from './effectiveness.js'

const VALID = ['high', 'mid', 'low']

describe('effectivenessMatrix', () => {
  it('三列固定为 趋势/震荡/反转', () => {
    expect(effectivenessMatrix.columns.map((c) => c.id)).toEqual(['trend', 'range', 'reversal'])
  })
  it('含 10 行工具/方法', () => {
    expect(effectivenessMatrix.rows).toHaveLength(10)
  })
  it('行 id 唯一', () => {
    const ids = effectivenessMatrix.rows.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('每行对每列都有合法 rating 与非空 note', () => {
    for (const r of effectivenessMatrix.rows) {
      expect(r.label).toBeTruthy()
      for (const c of effectivenessMatrix.columns) {
        expect(VALID).toContain(r.ratings[c.id])
        expect(r.notes[c.id]).toBeTruthy()
      }
    }
  })
})
