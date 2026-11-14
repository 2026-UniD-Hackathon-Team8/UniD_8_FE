// 라우터 설정 (공용 파일). 바꿀 때는 [chore] PR로 따로 올리고 팀에 먼저 알린다.
// 각 화면이 준비되면 해당 줄의 Placeholder를 실제 화면으로 바꾼다.
//   FE A: /play, /play/weak, /streak
//   FE B: /games/:gameSessionId/result, /notes, /profile
//   FE C: /start, /, /daily, /rankings
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function Placeholder({ name }: { name: string }) {
  return (
    <main style={{ padding: 24 }}>
      <h1>{name}</h1>
      <p>개발 중인 화면이에요.</p>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/start" element={<Placeholder name="게스트 시작" />} />
        <Route path="/" element={<Placeholder name="홈" />} />
        <Route path="/daily" element={<Placeholder name="오늘의 5문제" />} />
        <Route path="/rankings" element={<Placeholder name="랭킹" />} />
        <Route path="/play" element={<Placeholder name="실전" />} />
        <Route path="/play/weak" element={<Placeholder name="약점 재도전" />} />
        <Route path="/streak" element={<Placeholder name="연승 챌린지" />} />
        <Route path="/games/:gameSessionId/result" element={<Placeholder name="실전 결과" />} />
        <Route path="/notes" element={<Placeholder name="오답노트" />} />
        <Route path="/profile" element={<Placeholder name="마이페이지" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
