// 오늘의 5문제(데일리) API — 백엔드 DailyController 기준
//   GET  /api/daily         오늘 5문제와 내 진행 상태 (정답·계열 없음)
//   POST /api/daily/answers { questionId, selectedPos } → 정답 공개 (실전과 같은 AnswerRevealResponse)
//   GET  /api/daily/result  5문제를 다 푼 뒤 결과 (다 안 풀었으면 DAILY_NOT_COMPLETED)
// 5문제를 처음 다 푸는 순간 서버가 연속 기록을 올린다.
import type { AnswerPos, AnswerRevealResponse, GameQuestionItem, QuestionCategory } from '../game'
import { ApiError, mockDelay, request, USE_MOCK } from '../../shared/api/http'
import { todayStr } from '../../shared/utils/date'

export interface DailyResponse {
  dailyDate: string
  completed: boolean
  solvedCount: number
  totalCount: number
  /** 실전 판 문제와 같은 형식 (questionId, seq, questionType, prompt, optionA/B, answered, selectedPos) */
  questions: GameQuestionItem[]
}

export interface DailyResultItem {
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

export interface DailyResultResponse {
  dailyDate: string
  totalCount: number
  correctCount: number
  questions: DailyResultItem[]
}

export async function fetchDaily(): Promise<DailyResponse> {
  if (USE_MOCK) {
    await mockDelay()
    return mock.daily()
  }
  return request<DailyResponse>('GET', '/api/daily')
}

export async function submitDailyAnswer(questionId: number, selectedPos: AnswerPos): Promise<AnswerRevealResponse> {
  if (USE_MOCK) {
    await mockDelay(250)
    return mock.answer(questionId, selectedPos)
  }
  return request<AnswerRevealResponse>('POST', '/api/daily/answers', { body: { questionId, selectedPos } })
}

export async function fetchDailyResult(): Promise<DailyResultResponse> {
  if (USE_MOCK) {
    await mockDelay()
    return mock.result()
  }
  return request<DailyResultResponse>('GET', '/api/daily/result')
}

// ---------- 가짜 데이터 (VITE_USE_MOCK=true). 새로고침하면 처음부터 ----------
interface MockQ {
  q: Omit<GameQuestionItem, 'answered' | 'selectedPos'>
  /** 골라낼 쪽(= 정답) 위치 */
  correctPos: AnswerPos
  category: QuestionCategory
  categoryName: string
  tactic: string
  tacticName: string
  explanation: string
  checkQuestion: string
  source: string
  credibleAiAnswer: string | null
  targetAiAnswer: string | null
}

const MOCK_QS: MockQ[] = [
  {
    q: {
      questionId: 101,
      seq: 1,
      questionType: 'CHOICE_ANSWER',
      questionTypeName: '답 고르기',
      prompt: '갓난아기의 뼈는 어른보다 많을까요, 적을까요?',
      optionA: '갓난아기는 뼈가 약 150개로, 자라면서 새 뼈가 생겨 어른이 되면 약 206개가 돼요.',
      optionB: '갓난아기는 뼈가 약 300개로, 자라면서 일부가 서로 붙어 어른이 되면 약 206개가 돼요.',
    },
    correctPos: 'A',
    category: 'EVIDENCE',
    categoryName: '근거',
    tactic: 'NUMBER',
    tacticName: '그럴듯한 숫자',
    explanation: "아기 뼈는 오히려 더 많고(약 270~300개) 자라며 붙어요. '150개'는 근거 없는 숫자예요.",
    checkQuestion: '근거가 실제로 있나?',
    source: '국가건강정보포털',
    credibleAiAnswer: null,
    targetAiAnswer: null,
  },
  {
    q: {
      questionId: 102,
      seq: 2,
      questionType: 'CHOICE_ANSWER',
      questionTypeName: '답 고르기',
      prompt: '해외직구 물건은 얼마까지 세금이 없을까요?',
      optionA: '자가사용 목적이면 보통 150달러, 미국에서 오는 목록통관 물품은 200달러 이하까지 관세 등이 면제돼요.',
      optionB: '자가사용 목적이면 어느 나라에서 사든 똑같이 150달러 이하까지 관세 등이 면제돼요.',
    },
    correctPos: 'B',
    category: 'CONTEXT',
    categoryName: '맥락',
    tactic: 'CONDITION',
    tacticName: '조건 빼먹기',
    explanation: "미국발 목록통관 물품은 200달러까지예요. '어느 나라든 똑같이'로 예외를 지웠어요.",
    checkQuestion: '빠진 조건·예외는 없나?',
    source: '관세청',
    credibleAiAnswer: null,
    targetAiAnswer: null,
  },
  {
    q: {
      questionId: 103,
      seq: 3,
      questionType: 'CHOICE_ANSWER',
      questionTypeName: '답 고르기',
      prompt: '아이스크림 판매량이 늘면 물놀이 사고도 늘어요. 아이스크림이 사고를 부를까요?',
      optionA: '둘 다 더운 날씨에 함께 늘어나는 것이라, 아이스크림이 사고의 원인이라고 볼 수 없어요.',
      optionB: '아이스크림을 먹으면 몸이 차가워져 근육이 굳기 때문에 물놀이 사고가 늘어나요.',
    },
    correctPos: 'B',
    category: 'LOGIC',
    categoryName: '논리',
    tactic: 'CAUSATION',
    tacticName: '상관을 인과로',
    explanation: '같이 늘어난다고 원인은 아니에요. 더운 날씨라는 공통 원인이 있어요.',
    checkQuestion: '따져 보면 말이 되나?',
    source: '통계청 통계교육원',
    credibleAiAnswer: null,
    targetAiAnswer: null,
  },
  {
    q: {
      questionId: 104,
      seq: 4,
      questionType: 'CHOICE_QUESTION',
      questionTypeName: '질문 고르기',
      prompt: 'MSG가 걱정돼서 AI에게 물어보려고 해요. 어떤 질문이 AI를 한쪽으로 끌고 갈까요?',
      optionA: 'MSG는 몸에 해로우니까 안 먹는 게 맞지?',
      optionB: 'MSG가 몸에 해로운지, 찬반 근거를 모두 알려 줘.',
    },
    correctPos: 'A',
    category: 'QUESTION',
    categoryName: '질문',
    tactic: 'SYCOPHANCY',
    tacticName: '맞장구',
    explanation: '답을 정해 둔 질문은 AI가 맞장구치게 만들어요.',
    checkQuestion: '내 질문이 답을 끌고 가지 않았나?',
    source: '식품의약품안전처',
    credibleAiAnswer: '식약처와 미국 FDA는 일반적인 섭취량의 MSG를 안전하다고 평가해요. 다만 개인차는 있어요.',
    targetAiAnswer: '네, 맞아요! MSG는 몸에 해로울 수 있으니 되도록 피하는 게 좋아요.',
  },
  {
    q: {
      questionId: 105,
      seq: 5,
      questionType: 'CHOICE_ANSWER',
      questionTypeName: '답 고르기',
      prompt: '서울에서 버린 종량제 봉투 쓰레기는 수도권매립지에 그대로 묻히나요?',
      optionA:
        '2026년 1월부터 수도권은 종량제 생활폐기물을 그대로 묻는 직매립이 원칙적으로 금지돼, 소각·재활용 후 남은 재만 묻어요.',
      optionB: '생활폐기물 직매립 금지는 2030년부터 시행돼서, 아직은 수도권 종량제 쓰레기도 매립지에 그대로 묻어요.',
    },
    correctPos: 'B',
    category: 'TIMELINE',
    categoryName: '시점',
    tactic: 'OUTDATED',
    tacticName: '철 지난 정보',
    explanation: '2030년은 수도권 밖 지역의 시행 시점이에요. 수도권은 2026년 1월부터 이미 시행 중이에요.',
    checkQuestion: '언제 기준인가?',
    source: '국가법령정보센터 · 폐기물관리법 시행규칙',
    credibleAiAnswer: null,
    targetAiAnswer: null,
  },
]

const mockAnswers = new Map<number, AnswerPos>()

const mock = {
  daily(): DailyResponse {
    const questions = MOCK_QS.map((m) => ({
      ...m.q,
      answered: mockAnswers.has(m.q.questionId),
      selectedPos: mockAnswers.get(m.q.questionId) ?? null,
    }))
    return {
      dailyDate: todayStr(),
      completed: mockAnswers.size === MOCK_QS.length,
      solvedCount: mockAnswers.size,
      totalCount: MOCK_QS.length,
      questions,
    }
  },
  answer(questionId: number, selectedPos: AnswerPos): AnswerRevealResponse {
    const m = MOCK_QS.find((x) => x.q.questionId === questionId)
    if (!m) throw new ApiError(400, 'DAILY_QUESTION_NOT_FOUND', '오늘의 데일리 문제가 아닙니다.')
    if (!mockAnswers.has(questionId)) mockAnswers.set(questionId, selectedPos)
    const { q, correctPos, ...rest } = m
    return {
      ...rest,
      questionId: q.questionId,
      selectedPos,
      correctPos,
      correct: selectedPos === correctPos,
      completed: mockAnswers.size === MOCK_QS.length,
    }
  },
  result(): DailyResultResponse {
    if (mockAnswers.size < MOCK_QS.length) {
      throw new ApiError(400, 'DAILY_NOT_COMPLETED', '오늘의 데일리 5문제를 모두 풀어야 결과를 볼 수 있습니다.')
    }
    const questions = MOCK_QS.map((m) => {
      const selectedPos = mockAnswers.get(m.q.questionId) ?? 'A'
      return {
        questionId: m.q.questionId,
        seq: m.q.seq,
        category: m.category,
        categoryName: m.categoryName,
        tactic: m.tactic,
        tacticName: m.tacticName,
        selectedPos,
        correctPos: m.correctPos,
        correct: selectedPos === m.correctPos,
        explanation: m.explanation,
        checkQuestion: m.checkQuestion,
        source: m.source,
      }
    })
    return {
      dailyDate: todayStr(),
      totalCount: questions.length,
      correctCount: questions.filter((x) => x.correct).length,
      questions,
    }
  },
}
