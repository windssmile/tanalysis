import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { enabledCategories } from '../../content/categories.js'
import { enabledTools } from '../../content/tools.js'
import SearchBox from './SearchBox.jsx'
import './layout.css'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const cats = enabledCategories()
  const toolLinks = enabledTools()
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
        {toolLinks.map((t) => (
          <NavLink key={t.id} to={t.path} onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? 'active' : '')}>
            {t.name}
          </NavLink>
        ))}
      </div>
      <SearchBox />
    </nav>
  )
}
