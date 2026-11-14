import { mockDelay, request, USE_MOCK } from '../../../shared/api/http'
import type { QuestionCategory } from '../../game/api/types'

export type GrowthResponse = {
  available: boolean
  remainingSessions: number
  scoreTrend: { date: string; sessionType: 'GAME' | 'DAILY'; score: number; total: number }[]
  categoryAccuracy: { category: QuestionCategory; categoryName: string; early: number | null; recent: number | null }[]
  typeHistory: { code: string; name: string; recordedDate: string }[]
}

export async function getMyGrowth(): Promise<GrowthResponse> {
  if (USE_MOCK) {
    await mockDelay()
    return { available: false, remainingSessions: 3, scoreTrend: [], categoryAccuracy: [], typeHistory: [] }
  }
  return request<GrowthResponse>('GET', '/api/users/me/growth')
}
