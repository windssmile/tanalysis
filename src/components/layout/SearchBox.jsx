import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { search } from '../../search/index.js'

export default function SearchBox() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const results = q.trim() ? search(q.trim(), 6) : []

  function submit(e) {
    e.preventDefault()
    if (!q.trim()) return
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <form className="nav-search" role="search" onSubmit={submit}>
      <input
        type="search"
        className="nav-search-input"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="搜索条目 / 术语…"
        aria-label="搜索"
      />
      {open && results.length > 0 && (
        <ul className="nav-search-suggest" role="listbox">
          {results.map((r) => (
            <li key={r.type + '-' + r.id} role="option" aria-selected="false">
              <Link to={r.path} onClick={() => { setOpen(false); setQ('') }}>
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
