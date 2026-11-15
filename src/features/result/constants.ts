// 약점 유형 도감 내용 (결과 화면, 프로필 유형 도감에서 같이 쓴다). 내용은 docs/screens/08, 09 기준.
// 유형 이름·캐릭터는 assets/characters(CHARACTER_NAME, CHARACTER_SVG)와 shared/components/TypeAvatar,
// 계열 이름·확인 질문·색은 shared/constants/domain.ts(CATS)를 쓰고, 여기에는 shared에 없는 것만 둔다.
import { CAT_ORDER, CATS } from '../../shared/constants/domain'
import type { TypeKey } from '../../shared/constants/domain'

export interface TypeDetail {
  /** '?' 약점 유형 / '!' 탐정형 */
  mark: '?' | '!'
  /** 캐릭터 모습 설명 */
  description: string
  /** 캐릭터 대사 (따옴표 없이) */
  quote: string
}

export const TYPE_DETAIL: Record<TypeKey, TypeDetail> = {
  evidence: { mark: '?', description: '서류 뭉치를 끌어안고, 숫자를 보면 눈이 반짝', quote: '73.4%? 이렇게 정확한데!' },
  context: {
    mark: '?',
    description: '돋보기를 너무 가까이 대서 전체를 못 봄, 서류 한 장이 빠져 있음',
    quote: '맞는 말인데 뭐가 문제야?',
  },
  logic: { mark: '?', description: '빙글빙글 눈, 보드에 엉뚱한 실이 연결됨', quote: '같이 일어났으니까 원인이지!' },
  time: { mark: '?', description: '멈춘 회중시계, 먼지 쌓인 옛날 신문', quote: '예전에 그렇게 나왔는데?' },
  question: { mark: '?', description: '고개를 끄덕이며 상대 말을 그대로 받아 적음', quote: '네 말이 맞아!' },
  detective: { mark: '!', description: '꼿꼿하게 서서 탐정 모자 + 돋보기, 한 팔을 위로', quote: '찾았다!' },
}

/** 결과 화면에서 확인 질문 앞에 붙이는 상황 문구 */
export const CHECK_LEAD: Record<TypeKey, string> = {
  evidence: '구체적인 숫자나 출처를 보면 먼저 물어보세요',
  context: '맞는 말처럼 들려도 딱 잘라 말하면 먼저 물어보세요',
  logic: "'그래서', '때문에'로 이어지는 설명을 보면 먼저 물어보세요",
  time: "'최근', '현재' 같은 말을 보면 먼저 물어보세요",
  question: 'AI에게 묻기 전에 내 질문부터 물어보세요',
  detective: '지금처럼 모든 답을 한 번 더 따져 보세요',
}

/** 탐정형 카드의 확인 질문 자리에 쓰는 강점 문구 */
export const DETECTIVE_STRENGTH = '모든 계열 강점'

/** 유형 도감에 보여 주는 순서: 5계열 순서 + 탐정형 */
export const TYPE_ORDER: readonly TypeKey[] = [...CAT_ORDER, 'detective']

/** 도감 카드 맨 아래 줄. 5유형은 그 계열의 확인 질문(CATS), 탐정형은 강점 문구 */
export function typeCheckLine(type: TypeKey): string {
  return type === 'detective' ? DETECTIVE_STRENGTH : CATS[type].check
}

/** 유형 도감·약점 카드 문구 (캡처 08 그대로) */
export const TYPE_GUIDE_TEXT = {
  guideTitle: '유형 도감',
  guideRule: '가장 많이 틀린 계열로 결정',
  guideIntro: "약점이 다른 '?' 다섯 유형과, 1문제 이하로 틀리면 되는 '!' 탐정형이 있어요.",
  currentLabel: '현재 약점 유형',
  emptyTitle: '아직 없어요',
  emptyDescription: '실전을 한 판 마치면 가장 많이 틀린 계열로 유형이 정해져요.',
} as const
