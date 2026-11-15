// 정답 공개 화면에서 쓰는 순수 함수들 (화면·디자인과 무관)
import { QUESTION_TYPE_UI } from '../constants'
import type { AnswerPos, AnswerRevealResponse, QuestionType } from '../api/types'

export const otherPos = (pos: AnswerPos): AnswerPos => (pos === 'A' ? 'B' : 'A')

/**
 * 서버는 AI 답을 '믿을 쪽 / 골라낼 쪽'으로 준다. 화면은 A/B 순서로 보여 주므로 위치로 바꾼다.
 * 골라낼 쪽 = correctPos, 믿을 쪽 = 그 반대.
 */
export function aiAnswersByPos(reveal: AnswerRevealResponse): Record<AnswerPos, string | null> {
  const target = reveal.correctPos
  return {
    [target]: reveal.targetAiAnswer,
    [otherPos(target)]: reveal.credibleAiAnswer,
  } as Record<AnswerPos, string | null>
}

/** 두 AI 답을 나란히 보여 줄 수 있는지 (질문 고르기 등에서만 값이 온다) */
export function hasAiAnswers(reveal: AnswerRevealResponse): boolean {
  return Boolean(reveal.targetAiAnswer || reveal.credibleAiAnswer)
}

/** 선택지에 찍을 도장 문구 */
export function stampFor(type: QuestionType, pos: AnswerPos, correctPos: AnswerPos): string {
  const ui = QUESTION_TYPE_UI[type]
  return pos === correctPos ? ui.targetStamp : ui.credibleStamp
}

/** 정답 공개 시트 첫 줄: "정답이에요" / "오답이에요" (연승 중이면 연승 수 표시) */
export function verdictText(correct: boolean, winStreak?: number): string {
  if (!correct) return '오답이에요'
  return winStreak === undefined ? '정답이에요' : `정답 · ${winStreak}연승`
}

/** 정답 공개 시트 둘째 줄: 어느 쪽이 잘못된 쪽이었는지 */
export function revealSubline(type: QuestionType, correctPos: AnswerPos): string {
  switch (type) {
    case 'CHOICE_QUESTION':
      return `${correctPos} 질문이 AI를 한쪽으로 끌고 갔어요`
    case 'CHOICE_DIALOGUE':
      return `${correctPos}에서 AI가 말을 바꿨어요`
    case 'CHOICE_ANSWER':
    default:
      return `${correctPos}가 AI가 만들어낸 오류였어요`
  }
}
