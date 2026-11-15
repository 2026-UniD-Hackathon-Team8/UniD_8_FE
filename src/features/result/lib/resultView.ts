// 판 결과 응답의 백엔드 계열 코드를 shared/constants/domain.ts의 프론트 키로 바꾼다
import { CAT_FROM_API, CAT_ORDER } from '../../../shared/constants/domain'
import type { CatKey } from '../../../shared/constants/domain'
import type { GameResultResponse } from '../api/types'

/** 이번 판에서 가장 많이 틀린 계열 키. 다 맞혔으면 null */
export function mostWrongCatKey(result: GameResultResponse): CatKey | null {
  const top = result.categoryWrongCounts[0]
  return top ? (CAT_FROM_API[top.category] ?? null) : null
}

/** 이번 판에 나온 계열 중 하나도 안 틀린 계열 키 (계열 순서) */
export function strongCatKeys(result: GameResultResponse): CatKey[] {
  const seen = new Set<CatKey>()
  const wrong = new Set<CatKey>()
  for (const q of result.questions) {
    const key = CAT_FROM_API[q.category]
    if (!key) continue
    seen.add(key)
    if (!q.correct) wrong.add(key)
  }
  return CAT_ORDER.filter((c) => seen.has(c) && !wrong.has(c))
}

/** 계열 키별 오답 수. 오답이 없는 계열은 0 */
export function wrongCountByCat(result: GameResultResponse): Record<CatKey, number> {
  const counts: Record<CatKey, number> = { evidence: 0, context: 0, logic: 0, time: 0, question: 0 }
  for (const c of result.categoryWrongCounts) {
    const key = CAT_FROM_API[c.category]
    if (key) counts[key] = c.wrongCount
  }
  return counts
}
