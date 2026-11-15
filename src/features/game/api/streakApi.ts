// 연승 챌린지 API (GM_07). 랭킹(GET /api/rankings)은 랭킹 화면 담당(FE C)이 만든다.
import { request } from './http'
import type { AnswerPos, StreakAnswerRequest, StreakAnswerResponse, StreakStartResponse } from './types'

/**
 * 새 도전을 시작하고 첫 문제를 받는다.
 * 진행 중인 도전이 있으면 서버가 그때까지의 연승으로 끝낸다. 조회 API가 없어서 새로고침하면 이어 할 수 없다.
 */
export function startStreakChallenge(signal?: AbortSignal) {
  return request<StreakStartResponse>('POST', '/api/streak-challenges', undefined, signal)
}

/** 답을 내고 정답 공개 + 다음 문제(또는 종료 정보)를 받는다. */
export function submitStreakAnswer(
  challengeId: number,
  questionId: number,
  selectedPos: AnswerPos,
  signal?: AbortSignal,
) {
  const body: StreakAnswerRequest = { questionId, selectedPos }
  return request<StreakAnswerResponse>('POST', `/api/streak-challenges/${challengeId}/answers`, body, signal)
}
