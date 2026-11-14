// 실전 판 API (GM_01 판 시작, GM_03 답 제출, GM_05 이어 하기, GM_06 약점 재도전)
// 판 결과(GET /api/games/{id}/result)는 결과 화면 담당(FE B)이 만든다.
import { isApiError, request } from './http'
import type {
  AnswerPos,
  AnswerRevealResponse,
  GameAnswerRequest,
  GameMode,
  GameSessionResponse,
  StartGameRequest,
} from './types'

/** 새 판을 시작한다. 진행 중인 판이 있으면 서버가 ABANDONED로 바꾼다. */
export function startGame(gameMode: GameMode = 'NORMAL', signal?: AbortSignal) {
  const body: StartGameRequest = { gameMode }
  return request<GameSessionResponse>('POST', '/api/games', body, signal)
}

/** 진행 중인 판. 없으면 null (서버 404 GAME_SESSION_NOT_FOUND). */
export async function getCurrentGame(signal?: AbortSignal): Promise<GameSessionResponse | null> {
  try {
    return await request<GameSessionResponse>('GET', '/api/games/current', undefined, signal)
  } catch (e) {
    if (isApiError(e, 'GAME_SESSION_NOT_FOUND')) return null
    throw e
  }
}

/** 답을 내고 정답 공개 정보를 받는다. 같은 문제를 다시 보내면 처음 답 기준으로 돌려준다. */
export function submitGameAnswer(
  gameSessionId: number,
  questionId: number,
  selectedPos: AnswerPos,
  signal?: AbortSignal,
) {
  const body: GameAnswerRequest = { questionId, selectedPos }
  return request<AnswerRevealResponse>('POST', `/api/games/${gameSessionId}/answers`, body, signal)
}
