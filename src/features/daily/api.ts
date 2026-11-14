// 오늘의 데일리: 백엔드 DailyController 및 DailyResponse 기준
import type { AnswerPos, AnswerRevealResponse, GameQuestionItem, QuestionCategory } from '../game/api/types'
import { ApiError, mockDelay, request, USE_MOCK } from '../../shared/api/http'

export type DailyResponse = {
  dailyDate: string
  completed: boolean
  solvedCount: number
  totalCount: number
  questions: GameQuestionItem[]
}

export type DailyResultItem = {
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

export type DailyResultResponse = {
  dailyDate: string
  totalCount: number
  correctCount: number
  questions: DailyResultItem[]
}

const exampleQuestions: GameQuestionItem[] = [
  { questionId: 9001, seq: 1, questionType: 'CHOICE_ANSWER', questionTypeName: '답 고르기', prompt: 'AI가 제시한 두 답을 비교해 보세요.', optionA: '해당 사실을 확인할 때에는 공식 출처를 살펴봐야 합니다.', optionB: '인터넷에서 여러 번 보았다면 출처를 확인하지 않아도 됩니다.', answered: false, selectedPos: null },
  { questionId: 9002, seq: 2, questionType: 'CHOICE_ANSWER', questionTypeName: '답 고르기', prompt: '조건에 따라 답이 달라질 수 있을까요?', optionA: '모든 상황에서 예외 없이 동일한 결론이 적용됩니다.', optionB: '상황과 적용 조건에 따라 답이 달라질 수 있습니다.', answered: false, selectedPos: null },
  { questionId: 9003, seq: 3, questionType: 'CHOICE_ANSWER', questionTypeName: '답 고르기', prompt: 'AI의 설명이 논리적으로 맞는지 확인해 보세요.', optionA: '주장을 뒷받침하는 근거가 있는지 확인해야 합니다.', optionB: '결론이 그럴듯하면 근거가 없어도 사실입니다.', answered: false, selectedPos: null },
  { questionId: 9004, seq: 4, questionType: 'CHOICE_ANSWER', questionTypeName: '답 고르기', prompt: '정보의 기준 시점은 중요할까요?', optionA: '한 번 발표된 정보는 언제나 최신 정보입니다.', optionB: '최신 기준과 변경 여부를 확인해야 합니다.', answered: false, selectedPos: null },
  { questionId: 9005, seq: 5, questionType: 'CHOICE_QUESTION', questionTypeName: '질문 고르기', prompt: 'AI에게 어떤 질문을 하면 한쪽 답으로 유도되기 쉬울까요?', optionA: '찬성과 반대의 근거를 모두 제시해 줘.', optionB: '내 생각이 무조건 옳지?', answered: false, selectedPos: null },
]
const exampleCategories: QuestionCategory[] = ['EVIDENCE', 'CONTEXT', 'LOGIC', 'TIMELINE', 'QUESTION']
const exampleCategoryNames = ['근거', '맥락', '논리', '시점', '질문']
const exampleCorrect: AnswerPos[] = ['B', 'A', 'B', 'A', 'B']
const answers = new Map<number, AnswerPos>()
const mockDate = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })

function exampleReveal(questionId: number, selectedPos: AnswerPos): AnswerRevealResponse {
  const i = exampleQuestions.findIndex((q) => q.questionId === questionId)
  if (i < 0) throw new ApiError(400, 'INVALID_INPUT', '데일리 문제가 아닙니다.')
  const correctPos = exampleCorrect[i]
  return {
    questionId, selectedPos, correctPos, correct: selectedPos === correctPos,
    category: exampleCategories[i], categoryName: exampleCategoryNames[i], tactic: 'MISSING_CONDITION', tacticName: '확인 필요',
    explanation: 'AI 답변의 근거와 조건을 확인해 보세요. (개발용 예시 문제)',
    checkQuestion: '확인할 수 있는 근거가 있나요?', source: '',
    credibleAiAnswer: null, targetAiAnswer: null, completed: answers.size === exampleQuestions.length,
  }
}

export async function getTodayDaily(): Promise<DailyResponse> {
  if (USE_MOCK) {
    await mockDelay()
    return {
      dailyDate: mockDate(), completed: answers.size === exampleQuestions.length,
      solvedCount: answers.size, totalCount: exampleQuestions.length,
      questions: exampleQuestions.map((q) => ({ ...q, answered: answers.has(q.questionId), selectedPos: answers.get(q.questionId) ?? null })),
    }
  }
  return request<DailyResponse>('GET', '/api/daily')
}

export async function submitDailyAnswer(questionId: number, selectedPos: AnswerPos): Promise<AnswerRevealResponse> {
  if (USE_MOCK) {
    await mockDelay()
    if (!exampleQuestions.some((q) => q.questionId === questionId)) throw new ApiError(400, 'INVALID_INPUT', '데일리 문제가 아닙니다.')
    if (!answers.has(questionId)) answers.set(questionId, selectedPos)
    return exampleReveal(questionId, answers.get(questionId)!)
  }
  return request<AnswerRevealResponse>('POST', '/api/daily/answers', { body: { questionId, selectedPos } })
}

export async function getTodayDailyResult(): Promise<DailyResultResponse> {
  if (USE_MOCK) {
    await mockDelay()
    if (answers.size !== exampleQuestions.length) throw new ApiError(400, 'DAILY_NOT_COMPLETED', '아직 데일리가 끝나지 않았습니다.')
    const questions: DailyResultItem[] = exampleQuestions.map((q) => {
      const r = exampleReveal(q.questionId, answers.get(q.questionId)!)
      return { questionId: q.questionId, seq: q.seq, category: r.category, categoryName: r.categoryName, tactic: r.tactic, tacticName: r.tacticName, selectedPos: r.selectedPos, correctPos: r.correctPos, correct: r.correct, explanation: r.explanation, checkQuestion: r.checkQuestion, source: r.source }
    })
    return { dailyDate: mockDate(), totalCount: questions.length, correctCount: questions.filter((q) => q.correct).length, questions }
  }
  return request<DailyResultResponse>('GET', '/api/daily/result')
}
