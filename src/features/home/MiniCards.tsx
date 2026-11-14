// 연승 챌린지 · 약점 재도전 진입 카드
import { useNavigate } from 'react-router-dom'

export function RunCard({ best }: { best: number }) {
  const nav = useNavigate()
  return (
    <section className="blk">
      <div className="minirow">
        <div>
          <h2 className="t-h2">연승 챌린지</h2>
          <p className="t-cap mt4">틀리면 끝 · 최고 기록이 랭킹에 올라가요</p>
        </div>
        <span className="num best">최고 {best}연승</span>
      </div>
      <button className="btn dark" onClick={() => nav('/streak')}>
        도전하기
      </button>
    </section>
  )
}

export function WeakCard() {
  const nav = useNavigate()
  return (
    <section className="blk">
      <div className="minirow">
        <div>
          <h2 className="t-h2">약점 재도전</h2>
          <p className="t-cap mt4">자주 틀린 계열이 더 많이 나와요</p>
        </div>
        <button className="link" onClick={() => nav('/play/weak')}>
          풀기 →
        </button>
      </div>
    </section>
  )
}
