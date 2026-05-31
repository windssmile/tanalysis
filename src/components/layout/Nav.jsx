import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { enabledCategories } from '../../content/categories.js'
import './layout.css'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const cats = enabledCategories()
  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        <span className="nav-logo" />
        技术分析图谱
      </Link>
      <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="菜单">☰</button>
      <div className={`nav-links ${open ? 'open' : ''}`}>
        {cats.map((c) => (
          <NavLink key={c.id} to={`/${c.id}`} onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? 'active' : '')}>
            {c.name}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
