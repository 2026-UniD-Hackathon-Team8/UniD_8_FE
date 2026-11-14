// ST_02 홈 — 실전 시작/이어 하기 · 오늘의 5문제(데일리) · 연속 기록 · 연승 챌린지 · 약점 재도전
import { useLayout } from '../../shared/layouts/useLayout'
import DailyCard from './DailyCard'
import HeroCard from './HeroCard'
import { RunCard, WeakCard } from './MiniCards'
import './HomePage.css'

export default function HomePage() {
  const { summary } = useLayout()
  if (!summary) {
    return (
      <main className="page">
        <p className="t-cap mt24">불러오는 중…</p>
      </main>
    )
  }
  const { home } = summary
  return (
    <main className="page">
      <HeroCard inProgress={home.inProgressGameId !== null} />
      <DailyCard daily={home.daily} streak={home.streak} />
      <div className="duo">
        <RunCard best={home.bestWinStreak} />
        <WeakCard type={summary.type} />
      </div>
    </main>
  )
}
