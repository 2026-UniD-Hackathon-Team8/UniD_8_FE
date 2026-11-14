// 판 결과로 보여 줄 유형 판정 (기획안 임시 규칙).
// 백엔드가 판 결과에 유형을 주게 되면 이 함수만 응답 값을 쓰도록 바꾼다.
import type { TypeKey } from '../../../shared/constants/domain'
import type { GameResultResponse } from '../api/types'
import { mostWrongCatKey } from './resultView'

/** 이 수 이하로 틀리면 탐정형 */
export const DETECTIVE_MAX_WRONG = 1

export function judgeResultType(result: GameResultResponse): TypeKey {
  const wrong = result.totalCount - result.correctCount
  if (wrong <= DETECTIVE_MAX_WRONG) return 'detective'
  return mostWrongCatKey(result) ?? 'detective'
}
