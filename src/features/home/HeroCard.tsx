// 실전 카드. 진행 중인 판이 있으면 이어 하기로 보여 준다(이어 하기/새로 시작 선택은 실전 화면에서 묻는다).
import { useNavigate } from 'react-router-dom'

export default function HeroCard({ inProgress }: { inProgress: boolean }) {
  const nav = useNavigate()
  return (
    <section className="hero">
      <div className="hero-inner light">
        <div className="t-lbl">실전</div>
        {inProgress ? (
          <>
            <h2 className="t-h1">이어서 풀까요?</h2>
            <p className="t-cap mt4">끝내지 않은 판이 있어요. 풀던 문제부터 이어서 풀 수 있어요.</p>
            <button className="btn" onClick={() => nav('/play')}>
              이어 하기 →
            </button>
          </>
        ) : (
          <>
            <h2 className="t-h1">
              두 답 중 AI가
              <br />
              지어낸 쪽을 골라 보세요
            </h2>
            <p className="t-cap mt4">틀려도 끝까지 풀고, 결과로 내 유형을 확인해요.</p>
            <button className="btn" onClick={() => nav('/play')}>
              실전 시작 →
            </button>
          </>
        )}
      </div>
    </section>
  )
}
