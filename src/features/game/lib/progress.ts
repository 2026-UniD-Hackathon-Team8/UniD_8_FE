// 판 진행 상태 계산 (이어 하기, 진행 바)
import type { AnswerRevealResponse, GameQuestionItem, GameSessionResponse } from '../api/types'

/** answered = 이어 하기로 들어와서 답은 했지만 맞았는지 모르는 칸 */
export type SegmentState = 'correct' | 'wrong' | 'answered' | 'current' | 'todo'

/** 다음에 풀 문제. 다 풀었으면 null */
export function nextQuestion(session: GameSessionResponse): GameQuestionItem | null {
  const sorted = [...session.questions].sort((a, b) => a.seq - b.seq)
  return sorted.find((q) => q.seq === session.nextSeq && !q.answered) ?? sorted.find((q) => !q.answered) ?? null
}

/** 이어 하기 안내 문구: "10문제 중 3문제를 풀었어요" */
export function resumeText(session: GameSessionResponse): string {
  return `${session.totalCount}문제 중 ${session.solvedCount}문제를 풀었어요`
}

/**
 * 진행 바 칸 상태.
 * 서버 문제 목록에는 정답 여부가 없으므로, 이번 접속에서 받은 정답 공개 결과(results)로 O/X를 칠한다.
 * 이어 하기 전에 푼 문제는 결과를 모르니 'answered'로 둔다.
 */
export function segments(
  session: GameSessionResponse,
  results: ReadonlyMap<number, AnswerRevealResponse>,
  currentQuestionId: number | null,
): { questionId: number; state: SegmentState }[] {
  return [...session.questions]
    .sort((a, b) => a.seq - b.seq)
    .map((q) => {
      const r = results.get(q.questionId)
      let state: SegmentState = 'todo'
      if (r) state = r.correct ? 'correct' : 'wrong'
      else if (q.answered) state = 'answered'
      else if (q.questionId === currentQuestionId) state = 'current'
      return { questionId: q.questionId, state }
    })
}

/** 답 제출 후 로컬 판 상태를 갱신한다 (다시 조회하지 않고 화면을 이어 가기 위해) */
export function applyAnswer(session: GameSessionResponse, reveal: AnswerRevealResponse): GameSessionResponse {
  const questions = session.questions.map((q) =>
    q.questionId === reveal.questionId ? { ...q, answered: true, selectedPos: reveal.selectedPos } : q,
  )
  const solvedCount = questions.filter((q) => q.answered).length
  const remaining = questions.filter((q) => !q.answered).sort((a, b) => a.seq - b.seq)
  return {
    ...session,
    questions,
    solvedCount,
    nextSeq: remaining[0]?.seq ?? session.totalCount + 1,
    status: reveal.completed ? 'COMPLETED' : session.status,
  }
}
