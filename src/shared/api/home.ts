// GET /api/home — 상단 바(연속 기록)와 홈 화면이 함께 쓰는 요약
// GET /api/users/me/profile — 상단 바 캐릭터에 쓸 현재 유형만 꺼낸다 (프로필 화면 자체는 FE B)
import { TYPE_FROM_API } from '../constants/domain'
import type { TypeKey } from '../constants/domain'
import { getNickname } from '../store/guest'
import { todayStr } from '../utils/date'
import { mockDelay, request, USE_MOCK } from './http'

export type DailyStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface HomeResponse {
  nickname: string
  daily: { date: string; status: DailyStatus; solvedCount: number; total: number }
  /** current: 연속 데일리(끊기면 0), longest: 최장, completedToday: 오늘 완료 */
  streak: { current: number; longest: number; completedToday: boolean }
  /** 끝내지 않은 실전 판이 없으면 null */
  inProgressGameId: number | null
  bestWinStreak: number
}

interface ProfileResponse {
  weakType: { status: 'ANALYZING' | 'DECIDED'; code: string | null }
}

export async function fetchHome(): Promise<HomeResponse> {
  if (USE_MOCK) {
    await mockDelay()
    return {
      nickname: getNickname() ?? '게스트',
      daily: { date: todayStr(), status: 'IN_PROGRESS', solvedCount: 2, total: 5 },
      streak: { current: 5, longest: 9, completedToday: false },
      inProgressGameId: 12,
      bestWinStreak: 9,
    }
  }
  return request<HomeResponse>('GET', '/api/home')
}

/** 현재 약점 유형. 분석 전이면 null */
export async function fetchMyType(): Promise<TypeKey | null> {
  if (USE_MOCK) {
    await mockDelay()
    return 'time'
  }
  const p = await request<ProfileResponse>('GET', '/api/users/me/profile')
  return p.weakType.status === 'DECIDED' && p.weakType.code ? (TYPE_FROM_API[p.weakType.code] ?? null) : null
}

/** 상단 바와 탭 화면이 함께 쓰는 정보 */
export interface Summary {
  home: HomeResponse
  type: TypeKey | null
}

export async function fetchSummary(): Promise<Summary> {
  const [home, type] = await Promise.all([fetchHome(), fetchMyType().catch(() => null)])
  return { home, type }
}
