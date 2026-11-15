// 나의 성장(PF_03)과 데일리 달력(PF_05) API
//   GET /api/users/me/growth          — 점수 추이, 처음 3회 vs 최근 3회 계열별 정답률, 지나온 유형
//   GET /api/users/me/daily-calendar  — 오늘을 포함한 최근 28일
// 응답 형식은 백엔드 GrowthResponse, DailyCalendarResponse 그대로다.
import { mockDelay, request, USE_MOCK } from '../../shared/api/http'
import { dayShift } from '../../shared/utils/date'

export type SessionType = 'GAME' | 'DAILY'

export interface ScorePoint {
  /** YYYY-MM-DD (KST) */
  date: string
  sessionType: SessionType
  score: number
  total: number
}

export interface CategoryAccuracy {
  /** 백엔드 계열 코드 (EVIDENCE, CONTEXT, LOGIC, TIMELINE, QUESTION) */
  category: string
  categoryName: string
  /** 처음 3회 정답률 0~1. 그 계열 문제가 없었으면 null */
  early: number | null
  /** 최근 3회 정답률 0~1. 그 계열 문제가 없었으면 null */
  recent: number | null
}

export interface TypeRecord {
  /** 백엔드 유형 코드 (EVIDENCE_TRUSTER …, DETECTIVE) */
  code: string
  name: string
  recordedDate: string
}

export interface GrowthResponse {
  /** 판·데일리를 3회 이상 마쳐야 true */
  available: boolean
  /** 성장 기록이 열리기까지 남은 회 수 */
  remainingSessions: number
  /** 일반 판 + 데일리, 날짜순 (약점 재도전은 빠진다) */
  scoreTrend: ScorePoint[]
  /** available이 false면 빈 배열 */
  categoryAccuracy: CategoryAccuracy[]
  typeHistory: TypeRecord[]
}

export interface CalendarDay {
  date: string
  completed: boolean
  correctCount: number
}

export async function fetchGrowth(): Promise<GrowthResponse> {
  if (USE_MOCK) {
    await mockDelay()
    return MOCK_GROWTH()
  }
  return request<GrowthResponse>('GET', '/api/users/me/growth')
}

export async function fetchCalendar(): Promise<CalendarDay[]> {
  if (USE_MOCK) {
    await mockDelay()
    return MOCK_CALENDAR()
  }
  const res = await request<{ days: CalendarDay[] }>('GET', '/api/users/me/daily-calendar')
  return res.days
}

// ---------- 가짜 데이터 (VITE_USE_MOCK=true) ----------

/** 3주 동안 데일리와 실전을 섞어 풀면서 점수가 오르는 모습 */
function MOCK_GROWTH(): GrowthResponse {
  const plan: [number, SessionType, number, number][] = [
    [-20, 'DAILY', 2, 5],
    [-19, 'GAME', 5, 10],
    [-17, 'DAILY', 3, 5],
    [-16, 'GAME', 5, 10],
    [-14, 'DAILY', 2, 5],
    [-13, 'GAME', 6, 10],
    [-11, 'DAILY', 3, 5],
    [-10, 'GAME', 6, 10],
    [-8, 'DAILY', 4, 5],
    [-7, 'GAME', 7, 10],
    [-5, 'DAILY', 4, 5],
    [-4, 'GAME', 8, 10],
    [-2, 'DAILY', 5, 5],
    [-1, 'GAME', 8, 10],
  ]
  return {
    available: true,
    remainingSessions: 0,
    scoreTrend: plan.map(([d, sessionType, score, total]) => ({ date: dayShift(d), sessionType, score, total })),
    categoryAccuracy: [
      { category: 'EVIDENCE', categoryName: '근거', early: 0.33, recent: 0.83 },
      { category: 'CONTEXT', categoryName: '맥락', early: 0.5, recent: 0.67 },
      { category: 'LOGIC', categoryName: '논리', early: 0.5, recent: 0.83 },
      { category: 'TIMELINE', categoryName: '시점', early: 0.5, recent: 0.5 },
      { category: 'QUESTION', categoryName: '질문', early: 0.67, recent: null },
    ],
    typeHistory: [
      { code: 'EVIDENCE_TRUSTER', name: '근거 맹신형', recordedDate: dayShift(-15) },
      { code: 'TIME_CONFUSED', name: '시점 착각형', recordedDate: dayShift(-4) },
    ],
  }
}

/** 최근 28일. 가끔 빠지고, 맞힌 개수가 날마다 다르다 */
function MOCK_CALENDAR(): CalendarDay[] {
  return Array.from({ length: 28 }, (_, i) => {
    const back = 27 - i
    const completed = back > 0 && back % 6 !== 4 && back < 24
    const correctCount = completed ? [2, 3, 5, 4, 3, 1, 5][back % 7] : 0
    return { date: dayShift(-back), completed, correctCount }
  })
}
