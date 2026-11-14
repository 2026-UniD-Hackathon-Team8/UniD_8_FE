// 닉네임 규칙은 shared/store/guest.ts의 validNickname(2~10자)을 따른다
import type { CatKey } from '../../shared/constants/domain'
import { validNickname } from '../../shared/store/guest'

export const NICKNAME_RULE_TEXT = '2~10자로 입력해주세요.'

/** 서버에 보내기 전에 검사한다. 문제없으면 null */
export function validateNickname(nickname: string): string | null {
  return validNickname(nickname) ? null : NICKNAME_RULE_TEXT
}

/** 마지막 방문이 이 일수 이상 전이면 '오랜만' 말풍선 */
export const THOUGHT_AWAY_DAYS = 3

/** 프로필 캐릭터 생각 말풍선 문구 (장난기 있지만 사용자 편인 친구 말투) */
export const THOUGHT_TEXT = {
  away: '너 없는 동안 AI한테 속았어…',
  daily: '오늘의 문제 5개 도착! 같이 확인해 볼래?',
} as const

/** 약점 유형별 한 줄 (탐정형은 약점이 없어서 문구 없음) */
export const WEAK_TYPE_THOUGHT: Record<CatKey, string> = {
  evidence: '너는 숫자에 약하더라?',
  context: "너는 '단, 예외'를 자주 놓치더라?",
  logic: "너는 그럴듯한 '그래서'에 잘 넘어가더라?",
  time: '너는 언제 얘기인지 자주 깜빡하더라?',
  question: '너는 AI가 맞장구치면 금방 믿더라?',
}
