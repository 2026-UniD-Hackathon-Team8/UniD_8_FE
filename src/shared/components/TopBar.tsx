/* 상단 바: 로고 · 데일리 연속 기록 · 내 유형(→ 프로필) */
import { Link } from 'react-router-dom'
import TypeAvatar from './TypeAvatar'
import type { TypeKey } from '../constants/domain'
import './TopBar.css'

interface Props {
  streak: number
  todayDone: boolean
  typeKey: TypeKey | null
}

export default function TopBar({ streak, todayDone, typeKey }: Props) {
  return (
    <header className="topbar">
      <Link to="/" className="logo">
        다믿어<b>?</b>
      </Link>
      <div className="spacer" />
      <div className={`pill ${todayDone ? 'on' : ''}`} title="데일리 연속 기록">
        <span className="d" />
        연속 <span className="num">{streak}일</span>
      </div>
      <Link to="/profile" className="avbtn" aria-label="프로필">
        <TypeAvatar type={typeKey} size={30} />
      </Link>
    </header>
  )
}
