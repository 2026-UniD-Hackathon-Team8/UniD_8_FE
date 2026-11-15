// 약점 유형 캐릭터 모션 SVG (다믿어? 프로토타입 typeAv() 도형 + CSS 애니메이션)
// <img src={CHARACTER_SVG.evidence} />로 써도 애니메이션이 재생된다.
import context from './context-motion.svg'
import detective from './detective-motion.svg'
import evidence from './evidence-motion.svg'
import logic from './logic-motion.svg'
import question from './question-motion.svg'
import time from './time-motion.svg'

export type CharacterKey = 'evidence' | 'context' | 'logic' | 'time' | 'question' | 'detective'

export const CHARACTER_SVG: Record<CharacterKey, string> = {
  evidence,
  context,
  logic,
  time,
  question,
  detective,
}

export const CHARACTER_NAME: Record<CharacterKey, string> = {
  evidence: '근거 맹신형',
  context: '맥락 놓침형',
  logic: '논리 착시형',
  time: '시점 착각형',
  question: '끌려가기형',
  detective: '탐정형',
}
