// 다믿어? 도메인 상수 — 5계열 · 6유형. A·B·C가 같이 쓴다. 이름을 바꿀 때는 팀에 공유한다.
import type { CharacterKey } from '../../assets/characters'

export type CatKey = 'evidence' | 'context' | 'logic' | 'time' | 'question'
export type TypeKey = CharacterKey // 5계열 유형 + detective

export interface Category {
  no: number
  name: string // 계열 이름
  check: string // 확인 질문
  type: string // 이 계열을 가장 많이 틀렸을 때의 유형 이름
  color: string // CSS 변수
}

export const CATS: Record<CatKey, Category> = {
  evidence: { no: 1, name: '근거', check: '근거가 실제로 있나?', type: '근거 맹신형', color: 'var(--c-evidence)' },
  context: { no: 2, name: '맥락', check: '빠진 조건·예외는 없나?', type: '맥락 놓침형', color: 'var(--c-context)' },
  logic: { no: 3, name: '논리', check: '따져 보면 말이 되나?', type: '논리 착시형', color: 'var(--c-logic)' },
  time: { no: 4, name: '시점', check: '언제 기준인가?', type: '시점 착각형', color: 'var(--c-time)' },
  question: {
    no: 5,
    name: '질문',
    check: '내 질문이 답을 끌고 가지 않았나?',
    type: '끌려가기형',
    color: 'var(--c-question)',
  },
}
export const CAT_ORDER: CatKey[] = ['evidence', 'context', 'logic', 'time', 'question']

/** 백엔드 계열 코드(QuestionCategory) → 프론트 키 */
export const CAT_FROM_API: Record<string, CatKey> = {
  EVIDENCE: 'evidence',
  CONTEXT: 'context',
  LOGIC: 'logic',
  TIMELINE: 'time',
  QUESTION: 'question',
}

/** 백엔드 유형 코드(WeakType) → 프론트 키 */
export const TYPE_FROM_API: Record<string, TypeKey> = {
  EVIDENCE_TRUSTER: 'evidence',
  CONTEXT_MISSER: 'context',
  LOGIC_ILLUSION: 'logic',
  TIME_CONFUSED: 'time',
  LED_ALONG: 'question',
  DETECTIVE: 'detective',
}
