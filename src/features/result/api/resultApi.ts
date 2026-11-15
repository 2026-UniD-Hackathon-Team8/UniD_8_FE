// 판 결과 API (GM_04)
import { request, USE_MOCK } from '../../../shared/api/http'
import { getMockGameResult } from '../mock/resultMock'
import type { GameResultResponse } from './types'

/**
 * 끝난 판의 결과.
 * 아직 안 끝난 판이면 ApiError(GAME_NOT_COMPLETED), 남의 판이면 GAME_SESSION_FORBIDDEN,
 * 없는 판이면 GAME_SESSION_NOT_FOUND.
 */
export function getGameResult(gameSessionId: number): Promise<GameResultResponse> {
  if (USE_MOCK) return getMockGameResult(gameSessionId)
  return request<GameResultResponse>('GET', `/api/games/${gameSessionId}/result`)
}
