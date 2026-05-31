import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <h1 style={{ fontSize: 22 }}>页面不存在</h1>
      <p style={{ color: 'var(--text-dim)' }}>
        你访问的页面找不到了。<Link to="/" style={{ color: 'var(--primary-text)' }}>返回首页</Link>
      </p>
    </div>
  )
}
