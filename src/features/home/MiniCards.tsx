// 연승 챌린지 · 약점 재도전 진입 카드 (홈 아래 두 칸)
import { useNavigate } from 'react-router-dom'
import { CATS } from '../../shared/constants/domain'
import type { TypeKey } from '../../shared/constants/domain'

export function RunCard({ best }: { best: number }) {
  const nav = useNavigate()
  return (
    <button className="card mini run" onClick={() => nav('/streak')}>
      <h2 className="t-h2">연승 챌린지</h2>
      <div className="big num">
        {best}
        <small>연승</small>
      </div>
      <p className="t-cap">최고 기록 · 도전하기 →</p>
    </button>
  )
}

/** type: 현재 약점 유형(가장 많이 틀린 계열). 분석 전이거나 탐정형이면 계열 대신 안내 문구 */
export function WeakCard({ type }: { type: TypeKey | null }) {
  const nav = useNavigate()
  const cat = type && type !== 'detective' ? CATS[type] : null
  return (
    <button className="card mini weak" onClick={() => nav('/play/weak')}>
      <h2 className="t-h2">약점 재도전</h2>
      <div className="big">{cat ? cat.name : '골고루'}</div>
      <p className="t-cap">{cat ? '가장 많이 틀린 계열 →' : '자주 틀린 계열이 더 나와요 →'}</p>
    </button>
  )
}
