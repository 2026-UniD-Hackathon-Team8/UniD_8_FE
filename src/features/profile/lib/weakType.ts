// 프로필 응답의 백엔드 코드를 shared/constants/domain.ts의 프론트 키로 바꾼다
import { CAT_FROM_API, TYPE_FROM_API } from '../../../shared/constants/domain'
import type { CatKey, TypeKey } from '../../../shared/constants/domain'
import type { WeakTypeView } from '../api/types'

/** 현재 약점 유형 키 (CATS, CHARACTER_SVG 등에 쓴다). 판정 전이면 null */
export function weakTypeKey(weakType: WeakTypeView): TypeKey | null {
  return weakType.status === 'DECIDED' ? (TYPE_FROM_API[weakType.code] ?? null) : null
}

/** 약한 계열 키. 판정 전이거나 탐정형이면 null */
export function weakCatKey(weakType: WeakTypeView): CatKey | null {
  return weakType.weakCategory ? (CAT_FROM_API[weakType.weakCategory] ?? null) : null
}

/** 정답률이 가장 높은 계열 키. 판정 전이면 null */
export function strongCatKey(weakType: WeakTypeView): CatKey | null {
  return weakType.strongCategory ? (CAT_FROM_API[weakType.strongCategory] ?? null) : null
}
