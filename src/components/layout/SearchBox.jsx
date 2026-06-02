import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { search } from '../../search/index.js'

export default function SearchBox() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const navigate = useNavigate()
  const results = q.trim() ? search(q.trim(), 6) : []

  function go(path) {
    setOpen(false)
    setQ('')
    setActive(-1)
    navigate(path)
  }

  function submit(e) {
    e.preventDefault()
    if (!q.trim()) return
    if (active >= 0 && results[active]) return go(results[active].path)
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  function onKeyDown(e) {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <form className="nav-search" role="search" onSubmit={submit}>
      <input
        type="search"
        className="nav-search-input"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder="搜索条目 / 术语…"
        aria-label="搜索"
        aria-activedescendant={active >= 0 ? `nav-search-opt-${active}` : undefined}
      />
      {open && results.length > 0 && (
        <ul className="nav-search-suggest" role="listbox">
          {results.map((r, i) => (
            <li
              key={r.type + '-' + r.id}
              id={`nav-search-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
            >
              <Link to={r.path} onClick={() => go(r.path)}>
                <span>{r.title}</span>
                <span className="nav-search-kind">{r.type === 'term' ? '术语' : '条目'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
