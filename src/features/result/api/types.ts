// 판 결과(GM_04) 타입. 백엔드 UniD_8_BE dev 브랜치의 GameController.getGameResult, GameResultResponse 기준.
// 백엔드가 바뀌면 Swagger(/swagger-ui.html)를 보고 여기만 고친다.
// 응답에 약점 유형은 없다. 유형은 프로필 조회(weakType)로 받는다.
import type { AnswerPos, GameMode, QuestionCategory } from '../../game'

/** 계열별 오답 수. 오답이 있는 계열만, 많이 틀린 순(같으면 계열 순서)으로 온다. 다 맞히면 빈 배열 */
export interface CategoryWrongCount {
  category: QuestionCategory
  categoryName: string
  wrongCount: number
}

/** 판에서 푼 문제 1개의 결과 (seq 순) */
export interface GameResultItem {
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

/** 판 결과 조회 응답 (GET /api/games/{gameSessionId}/result) */
export interface GameResultResponse {
  gameSessionId: number
  gameMode: GameMode
  totalCount: number
  correctCount: number
  categoryWrongCounts: CategoryWrongCount[]
  questions: GameResultItem[]
}
