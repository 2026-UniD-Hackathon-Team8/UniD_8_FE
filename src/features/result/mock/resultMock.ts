// 백엔드 없이 화면을 만들 때 쓰는 가짜 데이터 (.env.local의 VITE_USE_MOCK=true)
import { mockDelay } from '../../../shared/api/http'
import { CAT_FROM_API, CATS } from '../../../shared/constants/domain'
import type { AnswerPos, QuestionCategory } from '../../game'
import type { CategoryWrongCount, GameResultItem, GameResultResponse } from '../api/types'

const catOf = (category: QuestionCategory) => CATS[CAT_FROM_API[category]]

function item(seq: number, category: QuestionCategory, selectedPos: AnswerPos, correctPos: AnswerPos): GameResultItem {
  return {
    questionId: 100 + seq,
    seq,
    category,
    categoryName: catOf(category).name,
    tactic: 'FAKE_STAT',
    tacticName: '그럴듯한 숫자',
    selectedPos,
    correctPos,
    correct: selectedPos === correctPos,
    explanation: '출처 없이 소수점까지 적힌 통계는 지어낸 숫자일 수 있어요.',
    checkQuestion: catOf(category).check,
    source: '통계청 국가통계포털',
  }
}

/** 백엔드처럼 오답이 있는 계열만, 많이 틀린 순(같으면 계열 순서)으로 센다 */
function wrongCountsOf(questions: GameResultItem[]): CategoryWrongCount[] {
  const counts = new Map<QuestionCategory, number>()
  for (const q of questions) if (!q.correct) counts.set(q.category, (counts.get(q.category) ?? 0) + 1)
  return [...counts]
    .sort(([a, x], [b, y]) => y - x || catOf(a).no - catOf(b).no)
    .map(([category, wrongCount]) => ({ category, categoryName: catOf(category).name, wrongCount }))
}

function resultOf(gameSessionId: number, questions: GameResultItem[]): GameResultResponse {
  return {
    gameSessionId,
    gameMode: 'NORMAL',
    totalCount: questions.length,
    correctCount: questions.filter((q) => q.correct).length,
    categoryWrongCounts: wrongCountsOf(questions),
    questions,
  }
}

/** 근거 계열을 가장 많이 틀린 판 (10문제 중 4개 오답) */
export const MOCK_RESULT_WEAK: GameResultResponse = resultOf(1, [
  item(1, 'EVIDENCE', 'A', 'B'),
  item(2, 'QUESTION', 'B', 'B'),
  item(3, 'EVIDENCE', 'B', 'A'),
  item(4, 'LOGIC', 'A', 'A'),
  item(5, 'TIMELINE', 'A', 'B'),
  item(6, 'CONTEXT', 'B', 'B'),
  item(7, 'EVIDENCE', 'A', 'B'),
  item(8, 'QUESTION', 'A', 'A'),
  item(9, 'LOGIC', 'B', 'B'),
  item(10, 'CONTEXT', 'A', 'A'),
])

/** 하나도 안 틀린 판 (categoryWrongCounts가 빈 배열) */
export const MOCK_RESULT_PERFECT: GameResultResponse = resultOf(
  2,
  MOCK_RESULT_WEAK.questions.map((q) => ({ ...q, selectedPos: q.correctPos, correct: true })),
)

let mockResult: GameResultResponse = MOCK_RESULT_WEAK

/** 가짜 결과를 바꾼다 (예: setMockResult(MOCK_RESULT_PERFECT)) */
export function setMockResult(result: GameResultResponse): void {
  mockResult = result
}

export async function getMockGameResult(gameSessionId: number): Promise<GameResultResponse> {
  await mockDelay()
  return { ...mockResult, gameSessionId }
}
