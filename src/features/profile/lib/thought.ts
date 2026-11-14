// 생각 말풍선에 보여 줄 대사 묶음 고르기. 우선순위: 오랜만 방문 → 오늘 데일리 전 → 약점 유형 → 견습
import type { TypeKey } from '../../../shared/constants/domain'
import { THOUGHT_AWAY_DAYS } from '../constants'
import { SITUATION_LINES, TYPE_LINES } from '../thoughtLines'

type Input = {
  /** 직전 방문 후 지난 일수. 첫 방문이면 null */
  daysAway: number | null
  completedToday: boolean
  type: TypeKey | null
}

export type ThoughtGroup = {
  /** 묶음이 바뀌었는지 구분하는 키 (예: 'daily', 'type:evidence') */
  key: string
  lines: readonly string[]
}

export function pickThoughtGroup({ daysAway, completedToday, type }: Input): ThoughtGroup {
  if (daysAway !== null && daysAway >= THOUGHT_AWAY_DAYS) return { key: 'comeback', lines: SITUATION_LINES.comeback }
  if (!completedToday) return { key: 'daily', lines: SITUATION_LINES.daily }
  if (type) return { key: `type:${type}`, lines: TYPE_LINES[type] }
  return { key: 'newbie', lines: SITUATION_LINES.newbie }
}

/** 묶음 안에서 current와 다른 칸을 무작위로 (칸이 하나면 그대로) */
export function nextIndex(length: number, current: number | null): number {
  if (length <= 1) return 0
  if (current === null) return Math.floor(Math.random() * length)
  const step = 1 + Math.floor(Math.random() * (length - 1))
  return (current + step) % length
}
