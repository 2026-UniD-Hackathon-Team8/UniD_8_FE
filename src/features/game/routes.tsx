// 라우터(App.tsx)에 붙이는 FE A 화면: /play, /play/weak, /streak
import { useNavigate } from 'react-router-dom'
import { clearGuest } from '../../shared/store/guest'
import { installMockServer } from './dev/mockServer'
import { GamePlayScreen } from './screens/GamePlayScreen'
import { StreakPlayScreen } from './screens/StreakPlayScreen'

// .env.local의 VITE_USE_MOCK=true면 FE C 화면처럼 A 화면도 가짜 서버로 동작한다
if (import.meta.env.VITE_USE_MOCK === 'true') installMockServer()

function useGameNav() {
  const nav = useNavigate()
  return {
    home: () => nav('/'),
    result: (id: number) => nav(`/games/${id}/result`),
    rankings: () => nav('/rankings'),
    unauthorized: () => {
      clearGuest()
      nav('/start', { replace: true })
    },
  }
}

/** /play — 실전 */
export function PlayPage() {
  const go = useGameNav()
  return <GamePlayScreen mode="NORMAL" onExit={go.home} onFinished={go.result} onUnauthorized={go.unauthorized} />
}

/** /play/weak — 약점 재도전 */
export function WeakPlayPage() {
  const go = useGameNav()
  return <GamePlayScreen mode="WEAKNESS_RETRY" onExit={go.home} onFinished={go.result} onUnauthorized={go.unauthorized} />
}

/** /streak — 연승 챌린지 */
export function StreakPage() {
  const go = useGameNav()
  return <StreakPlayScreen onExit={go.home} onRanking={go.rankings} onUnauthorized={go.unauthorized} />
}
