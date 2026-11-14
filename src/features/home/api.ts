// 홈 화면 전용 API
//   GET /api/users/me/daily-calendar — 오늘을 포함한 최근 28일 (이번 주 7칸에 사용)
//   GET /api/daily/result            — 오늘 데일리를 다 풀었을 때 문제별 정답 여부·계열
import { mockDelay, request, USE_MOCK } from '../../shared/api/http'
import { dayShift, mondayOffset } from '../../shared/utils/date'

export interface CalendarDay {
  date: string
  completed: boolean
  correctCount: number
}

export interface DailyResultItem {
  seq: number
  /** 백엔드 계열 코드 (EVIDENCE, CONTEXT, LOGIC, TIMELINE, QUESTION) */
  category: string
  correct: boolean
}

export async function fetchDailyCalendar(): Promise<CalendarDay[]> {
  if (USE_MOCK) {
    await mockDelay()
    const dow = mondayOffset()
    return Array.from({ length: 28 }, (_, i) => {
      const back = 27 - i
      return { date: dayShift(-back), completed: back > 0 && back !== dow - 2 && back < 20, correctCount: 3 }
    })
  }
  const res = await request<{ days: CalendarDay[] }>('GET', '/api/users/me/daily-calendar')
  return res.days
}

export async function fetchDailyResult(): Promise<DailyResultItem[]> {
  if (USE_MOCK) {
    await mockDelay()
    const cats = ['LOGIC', 'TIMELINE', 'QUESTION', 'EVIDENCE', 'CONTEXT']
    return cats.map((category, i) => ({ seq: i + 1, category, correct: i !== 1 && i !== 2 }))
  }
  const res = await request<{ questions: DailyResultItem[] }>('GET', '/api/daily/result')
  return res.questions
}
