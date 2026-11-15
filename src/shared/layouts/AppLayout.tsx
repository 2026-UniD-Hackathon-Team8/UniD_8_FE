// 하단 탭이 있는 화면(홈·오답노트·랭킹·프로필)의 공통 틀.
// 요약(연속 기록·유형)을 한 번 불러와 상단 바와 하위 화면에 나눠 준다.
import { Navigate, Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'
import TopBar from '../components/TopBar'
import { fetchSummary } from '../api/home'
import { isApiError } from '../api/http'
import { useAsync } from '../hooks/useAsync'
import { clearGuest, hasGuest } from '../store/guest'
import type { LayoutContext } from './useLayout'

export default function AppLayout() {
  const { data, error, reload } = useAsync(fetchSummary, null)

  if (!hasGuest()) return <Navigate to="/start" replace />
  if (isApiError(error, 'USER_NOT_FOUND')) {
    clearGuest()
    return <Navigate to="/start" replace />
  }

  const ctx: LayoutContext = { summary: data, reloadSummary: reload }
  return (
    <>
      <TopBar
        streak={data?.home.streak.current ?? 0}
        todayDone={data?.home.streak.completedToday ?? false}
        typeKey={data?.type ?? null}
      />
      {error && !data ? (
        <main className="page">
          <div className="card mt16">
            <p className="t-h2">정보를 불러오지 못했어요</p>
            <p className="t-cap mt4">{error.message}</p>
            <button className="btn dark mt16" onClick={reload}>
              다시 시도
            </button>
          </div>
        </main>
      ) : (
        <Outlet context={ctx} />
      )}
      <NavBar />
    </>
  )
}
