// 생각 말풍선 문구 고르기. 우선순위: 오랜만 방문 → 오늘 데일리 전 → 약점 유형. 해당 없으면 null
import type { TypeKey } from '../../../shared/constants/domain'
import { THOUGHT_AWAY_DAYS, THOUGHT_TEXT, WEAK_TYPE_THOUGHT } from '../constants'

type Input = {
  /** 직전 방문 후 지난 일수. 첫 방문이면 null */
  daysAway: number | null
  completedToday: boolean
  type: TypeKey | null
}

export function pickThought({ daysAway, completedToday, type }: Input): string | null {
  if (daysAway !== null && daysAway >= THOUGHT_AWAY_DAYS) return THOUGHT_TEXT.away
  if (!completedToday) return THOUGHT_TEXT.daily
  if (type && type !== 'detective') return WEAK_TYPE_THOUGHT[type]
  return null
}
