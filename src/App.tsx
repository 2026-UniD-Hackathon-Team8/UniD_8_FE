// 라우터 설정 (공용 파일). 바꿀 때는 [chore] PR로 따로 올리고 팀에 먼저 알린다.
// 각 화면이 준비되면 해당 줄의 Placeholder를 실제 화면으로 바꾼다.
//   FE A: /play, /play/weak, /streak
//   FE B: /games/:gameSessionId/result, /notes, /profile
//   FE C: /start, /, /daily, /rankings
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DailyPlayPage from './features/daily/DailyPlayPage'
import HomePage from './features/home/HomePage'
import NotesPage from './features/notes/NotesPage'
import RankingPage from './features/ranking/RankingPage'
import StartPage from './features/start/StartPage'
import { PlayPage, StreakPage, WeakPlayPage } from './features/game/routes'
import { ProfileScreen } from './features/profile'
import { ResultScreen } from './features/result'
import AppLayout from './shared/layouts/AppLayout'

function Placeholder({ name }: { name: string }) {
  return (
    <main className="page">
      <h1 className="t-h1 mt16">{name}</h1>
      <p className="t-cap mt8">개발 중인 화면이에요.</p>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/start" element={<StartPage />} />
        {/* 하단 탭이 있는 화면 */}
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/rankings" element={<RankingPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>
        {/* 문제 풀이·결과 화면 (하단 탭 없음) */}
        <Route path="/daily" element={<DailyPlayPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/play/weak" element={<WeakPlayPage />} />
        <Route path="/streak" element={<StreakPage />} />
        <Route path="/games/:gameSessionId/result" element={<ResultScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
