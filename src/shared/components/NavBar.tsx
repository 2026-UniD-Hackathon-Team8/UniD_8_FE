/* 하단 탭: 홈 · 오답노트 · 랭킹 · 프로필 */
import { NavLink } from 'react-router-dom'
import './NavBar.css'

const ICONS: Record<string, string> = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  notes: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12l2 2 4-4',
  rank: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3',
  profile: 'M12 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8zM4 21c1-4 4-6 8-6s7 2 8 6',
}

const TABS = [
  { to: '/', key: 'home', label: '홈' },
  { to: '/notes', key: 'notes', label: '오답노트' },
  { to: '/rankings', key: 'rank', label: '랭킹' },
  { to: '/profile', key: 'profile', label: '프로필' },
]

export default function NavBar() {
  return (
    <nav className="nav">
      {TABS.map((t) => (
        <NavLink key={t.key} to={t.to} end={t.to === '/'} className={({ isActive }) => (isActive ? 'on' : '')}>
          <svg viewBox="0 0 24 24">
            <path d={ICONS[t.key]} />
          </svg>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
