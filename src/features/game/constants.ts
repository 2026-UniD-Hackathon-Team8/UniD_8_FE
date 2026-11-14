// 문제 화면·정답 공개 화면 문구와 설정 (새 프로토타입 기준: 세 유형 모두 '잘못된 쪽'을 고른다)
import type { CharacterKey } from '../../assets/characters'
import type { QuestionCategory, QuestionType } from './api/types'

/** 길게 눌러 고르기: 이 시간(ms) 동안 누르고 있어야 선택된다 */
export const HOLD_MS = 650
/** 이보다 짧게 떼면 '살짝 눌렀다'로 보고 안내를 띄운다 */
export const SHORT_TAP_MS = 200

export const HINT_TEXT = '잘못됐다고 생각하는 쪽을 길게 눌러 고르세요 · 시간 제한 없음'
export const SHORT_TAP_TEXT = '살짝 말고, 길게 눌러야 선택돼요'

type QuestionTypeUi = {
  name: string
  /** 문제 화면 상단 지시문 (줄바꿈은 \n) */
  task: string
  /** 정답 공개 때 골라낼 쪽 / 믿을 쪽에 찍는 도장 */
  targetStamp: string
  credibleStamp: string
}

export const QUESTION_TYPE_UI: Record<QuestionType, QuestionTypeUi> = {
  CHOICE_ANSWER: {
    name: '답 고르기',
    task: 'AI가 지어낸 답을\n고르세요',
    targetStamp: '지어낸 답',
    credibleStamp: '사실',
  },
  CHOICE_QUESTION: {
    name: '질문 고르기',
    task: 'AI를 한쪽으로 끌고 가는\n질문을 고르세요',
    targetStamp: '끌고 가는 질문',
    credibleStamp: '열린 질문',
  },
  CHOICE_DIALOGUE: {
    name: '대화 고르기',
    task: 'AI가 말을 바꾼\n답을 고르세요',
    targetStamp: '말을 바꾼 답',
    credibleStamp: '근거를 지킨 답',
  },
}

type CategoryUi = {
  name: string
  checkQuestion: string
  /** 사이트 CSS 변수 이름 (디자인 토큰이 정해지면 맞춘다) */
  colorVar: string
  /** 토큰이 없을 때 쓰는 기본 색 */
  color: string
  /** 이 계열을 가장 많이 틀렸을 때의 유형 캐릭터 */
  character: CharacterKey
}

export const CATEGORY_UI: Record<QuestionCategory, CategoryUi> = {
  EVIDENCE: { name: '근거', checkQuestion: '근거가 실제로 있나?', colorVar: '--c-evidence', color: '#3B82F6', character: 'evidence' },
  CONTEXT: { name: '맥락', checkQuestion: '빠진 조건·예외는 없나?', colorVar: '--c-context', color: '#8B5CF6', character: 'context' },
  LOGIC: { name: '논리', checkQuestion: '따져 보면 말이 되나?', colorVar: '--c-logic', color: '#EC4899', character: 'logic' },
  TIMELINE: { name: '시점', checkQuestion: '언제 기준인가?', colorVar: '--c-time', color: '#14B8A6', character: 'time' },
  QUESTION: { name: '질문', checkQuestion: '내 질문이 답을 끌고 가지 않았나?', colorVar: '--c-question', color: '#F97316', character: 'question' },
}

export const GAME_MODE_NAME = {
  NORMAL: '실전',
  WEAKNESS_RETRY: '약점 재도전',
} as const
