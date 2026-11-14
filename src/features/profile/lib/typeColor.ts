// 유형 색. 5유형은 CATS의 계열 색, 탐정형은 토큰 --c-detective
import { CATS } from '../../../shared/constants/domain'
import type { TypeKey } from '../../../shared/constants/domain'

export const typeColor = (type: TypeKey): string =>
  type === 'detective' ? 'var(--c-detective)' : CATS[type].color
