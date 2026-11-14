// 오답노트 API
//   GET /api/users/me/wrong-answers[?category=EVIDENCE]  — 틀린 답 최신순, 같은 문제는 최신 1건
//   PUT /api/users/me/wrong-answers/{questionId}/memo { memo } — 메모 저장(있으면 덮어쓰기, 1~500자)
import type { QuestionCategory, QuestionType } from '../game'
import { mockDelay, request, USE_MOCK } from '../../shared/api/http'

/** 틀린 답이므로 내가 고른 쪽 = 믿을 쪽(credible), 정답 = 골라낼 쪽(target) */
export interface WrongAnswerItem {
  questionId: number
  questionType: QuestionType
  questionTypeName: string
  prompt: string
  myChoiceText: string
  answerChoiceText: string
  category: QuestionCategory
  categoryName: string
  tactic: string
  tacticName: string
  explanation: string
  checkQuestion: string
  source: string
  /** 믿을 쪽(내가 고른 쪽)에 대한 AI 답. 질문 고르기에서만 */
  credibleAiAnswer: string | null
  /** 골라낼 쪽에 대한 AI 답. 질문 고르기에서만 */
  targetAiAnswer: string | null
  answeredAt: string
  memo: string | null
}

export interface WrongAnswersResponse {
  items: WrongAnswerItem[]
  /** 메모를 남긴 문제 수 */
  memoCount: number
}

export async function fetchWrongAnswers(): Promise<WrongAnswersResponse> {
  if (USE_MOCK) {
    await mockDelay()
    return { items: MOCK.map((m) => ({ ...m })), memoCount: MOCK.filter((m) => m.memo).length }
  }
  return request<WrongAnswersResponse>('GET', '/api/users/me/wrong-answers')
}

export async function saveMemo(questionId: number, memo: string): Promise<{ questionId: number; memo: string }> {
  if (USE_MOCK) {
    await mockDelay()
    const it = MOCK.find((m) => m.questionId === questionId)
    if (it) it.memo = memo
    return { questionId, memo }
  }
  return request('PUT', `/api/users/me/wrong-answers/${questionId}/memo`, { body: { memo } })
}

// ---------- 가짜 데이터 (VITE_USE_MOCK=true) ----------
const base = { credibleAiAnswer: null, targetAiAnswer: null, answeredAt: '2026-11-14T21:00:00+09:00', memo: null }
const MOCK: WrongAnswerItem[] = [
  {
    ...base,
    questionId: 1,
    questionType: 'CHOICE_ANSWER',
    questionTypeName: '답 고르기',
    prompt: "'짜장면'은 표준어일까요?",
    myChoiceText: "국립국어원은 2011년에 '짜장면'을 표준어로 추가해, 지금은 '자장면'과 '짜장면' 둘 다 표준어예요.",
    answerChoiceText: "국립국어원의 2019년 '외래 음식명 표기 지침'에 따라, 지금은 '짜장면'만 표준어로 인정돼요.",
    category: 'EVIDENCE',
    categoryName: '근거',
    tactic: 'FAKE_SOURCE',
    tacticName: '가짜 출처',
    explanation: "'외래 음식명 표기 지침'은 존재하지 않는 문서예요. 실제 기관명에 가짜 문서를 붙였어요.",
    checkQuestion: '근거가 실제로 있나?',
    source: '국립국어원',
    memo: '출처·기관명이 있어서',
  },
  {
    ...base,
    questionId: 2,
    questionType: 'CHOICE_ANSWER',
    questionTypeName: '답 고르기',
    prompt: '갓난아기의 뼈는 어른보다 많을까요, 적을까요?',
    myChoiceText: '갓난아기는 뼈가 약 300개로, 자라면서 일부가 서로 붙어 어른이 되면 약 206개가 돼요.',
    answerChoiceText: '갓난아기는 뼈가 약 150개로, 자라면서 새 뼈가 생겨 어른이 되면 약 206개가 돼요.',
    category: 'EVIDENCE',
    categoryName: '근거',
    tactic: 'NUMBER',
    tacticName: '그럴듯한 숫자',
    explanation: "아기 뼈는 오히려 더 많고(약 270~300개) 자라며 붙어요. '150개'는 근거 없는 숫자예요.",
    checkQuestion: '근거가 실제로 있나?',
    source: '국가건강정보포털',
    memo: '숫자가 구체적이어서',
  },
  {
    ...base,
    questionId: 3,
    questionType: 'CHOICE_ANSWER',
    questionTypeName: '답 고르기',
    prompt: '해외직구 물건은 얼마까지 세금이 없을까요?',
    myChoiceText: '자가사용 목적이면 보통 150달러, 미국에서 오는 목록통관 물품은 200달러 이하까지 관세 등이 면제돼요.',
    answerChoiceText: '자가사용 목적이면 어느 나라에서 사든 똑같이 150달러 이하까지 관세 등이 면제돼요.',
    category: 'CONTEXT',
    categoryName: '맥락',
    tactic: 'CONDITION',
    tacticName: '조건 빼먹기',
    explanation: "미국발 목록통관 물품은 200달러까지예요. '어느 나라든 똑같이'로 예외를 지웠어요.",
    checkQuestion: '빠진 조건·예외는 없나?',
    source: '관세청',
    memo: '숫자가 구체적이어서 — 150달러만 기억하고 있었음',
  },
  {
    ...base,
    questionId: 4,
    questionType: 'CHOICE_ANSWER',
    questionTypeName: '답 고르기',
    prompt: '서울에서 버린 종량제 봉투 쓰레기는 수도권매립지에 그대로 묻히나요?',
    myChoiceText:
      '2026년 1월 1일부터 수도권은 종량제 생활폐기물을 그대로 묻는 직매립이 원칙적으로 금지돼, 소각·재활용 후 남은 재만 묻어요.',
    answerChoiceText:
      '생활폐기물 직매립 금지는 2030년부터 시행돼서, 아직은 수도권 종량제 쓰레기도 매립지에 그대로 묻어요.',
    category: 'TIMELINE',
    categoryName: '시점',
    tactic: 'OUTDATED',
    tacticName: '철 지난 정보',
    explanation: '2030년은 수도권 밖 지역의 시행 시점이에요. 수도권은 2026년 1월부터 이미 시행 중이에요.',
    checkQuestion: '언제 기준인가?',
    source: '국가법령정보센터 · 폐기물관리법 시행규칙',
  },
  {
    ...base,
    questionId: 5,
    questionType: 'CHOICE_QUESTION',
    questionTypeName: '질문 고르기',
    prompt: 'MSG가 걱정돼서 AI에게 물어보려고 해요. 어떤 질문이 더 믿을 만한 답을 받을까요?',
    myChoiceText: 'MSG가 몸에 해로운지, 찬반 근거를 모두 알려 줘.',
    answerChoiceText: 'MSG는 몸에 해로우니까 안 먹는 게 맞지?',
    category: 'QUESTION',
    categoryName: '질문',
    tactic: 'SYCOPHANCY',
    tacticName: '맞장구',
    explanation: '답을 정해 둔 질문은 AI가 맞장구치게 만들어요.',
    checkQuestion: '내 질문이 답을 끌고 가지 않았나?',
    source: '식품의약품안전처',
    credibleAiAnswer: '식약처와 미국 FDA는 일반적인 섭취량의 MSG를 안전하다고 평가해요. 다만 개인차는 있어요.',
    targetAiAnswer: '네, 맞아요! MSG는 몸에 해로울 수 있으니 되도록 피하는 게 좋아요.',
    memo: '내 생각과 같아서',
  },
  {
    ...base,
    questionId: 6,
    questionType: 'CHOICE_DIALOGUE',
    questionTypeName: '대화 고르기',
    prompt:
      '사용자: 솜 1kg과 쇠 1kg, 어느 쪽이 더 무거워?\nAI: 둘 다 1kg이라 무게는 같아요.\n사용자: 정말? 쇠가 더 무거운 것 같은데.',
    myChoiceText: '느낌은 그럴 수 있지만 질량이 같으니 무게도 같아요. 쇠는 부피가 작아 더 무겁게 느껴질 뿐이에요.',
    answerChoiceText: '죄송해요, 제가 틀렸어요. 쇠가 밀도가 높아서 더 무거워요.',
    category: 'QUESTION',
    categoryName: '질문',
    tactic: 'FLIP',
    tacticName: '반박하면 말 바꾸기',
    explanation: '처음 답이 맞았는데, 반박 한마디에 근거 없이 말을 바꿨어요.',
    checkQuestion: '내 질문이 답을 끌고 가지 않았나?',
    source: '국가표준기본법 · 질량 단위',
  },
]
