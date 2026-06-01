import { dmi } from './calc.js'

const COLORS = { pdi: '#f43f5e', mdi: '#22c55e', adx: '#fbbf24' }

export default function DMIChart({ data, width = 480, height = 160 }) {
  const { pdi, mdi, adx } = dmi(data)
  const slot = width / data.length
  const all = [...pdi, ...mdi, ...adx].filter((v) => v != null)
  const max = Math.max(40, ...all)
  function scale(v) {
    return ((max - v) / max) * height
  }
  function line(arr) {
    return arr
      .map((v, i) => (v == null ? null : `${slot * i + slot / 2},${scale(v)}`))
      .filter(Boolean)
      .join(' ')
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block' }}>
      {[20, 40].map((lvl) => (
        <line key={lvl} x1="0" y1={scale(lvl)} x2={width} y2={scale(lvl)} stroke="#1e293b" />
      ))}
      <polyline points={line(pdi)} fill="none" stroke={COLORS.pdi} strokeWidth="1.5" />
      <polyline points={line(mdi)} fill="none" stroke={COLORS.mdi} strokeWidth="1.5" />
      <polyline points={line(adx)} fill="none" stroke={COLORS.adx} strokeWidth="1.8" />
    </svg>
  )
}
