// GM_04 완료된 판의 점수, 계열별 오답, 문항별 결과
import { request } from '../../../shared/api/http'
import type { AnswerPos, GameMode, QuestionCategory } from './types'

export type GameResultItem = {
  questionId: number
  seq: number
  category: QuestionCategory
  categoryName: string
  tactic: string
  tacticName: string
  selectedPos: AnswerPos
  correctPos: AnswerPos
  correct: boolean
  explanation: string
  checkQuestion: string
  source: string
}

export type GameResultResponse = {
  gameSessionId: number
  gameMode: GameMode
  totalCount: number
  correctCount: number
  categoryWrongCounts: { category: QuestionCategory; categoryName: string; wrongCount: number }[]
  questions: GameResultItem[]
}

export function fetchGameResult(gameSessionId: number): Promise<GameResultResponse> {
  if (!Number.isInteger(gameSessionId) || gameSessionId < 1) throw new Error('올바르지 않은 판 번호입니다.')
  return request<GameResultResponse>('GET', `/api/games/${gameSessionId}/result`)
}
