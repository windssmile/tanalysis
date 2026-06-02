import '@testing-library/jest-dom'

// 仅过滤 React Router v6 的两条 future-flag 告知性警告（生产已在 main.jsx 显式 opt-in）。
// 其余 console.warn 照常输出，不掩盖真实警告。
const origWarn = console.warn
console.warn = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : ''
  if (msg.includes('React Router Future Flag Warning')) return
  origWarn(...args)
}
