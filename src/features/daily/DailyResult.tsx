// DL_02/03 오늘의 데일리 결과: 오늘의 점수 · 데일리 연속 기록 · 오늘 푼 문제(계열 ✓✗)
import { useNavigate } from 'react-router-dom'
import { fetchHome } from '../../shared/api/home'
import { CAT_FROM_API, CATS } from '../../shared/constants/domain'
import { useAsync } from '../../shared/hooks/useAsync'
import { fetchDailyResult } from './api'
import './DailyResult.css'

export default function DailyResult({ onHome }: { onHome: () => void }) {
  const nav = useNavigate()
  const { data: result, error, reload } = useAsync(fetchDailyResult, null)
  const { data: home } = useAsync(fetchHome, null)

  if (error) {
    return (
      <main className="daily-result page">
        <div className="card mt24">
          <p className="t-h2">결과를 불러오지 못했어요</p>
          <p className="t-cap mt4">{error.message}</p>
          <button className="btn mt16" onClick={reload}>
            다시 시도
          </button>
          <button className="btn dark mt8" onClick={onHome}>
            홈으로
          </button>
        </div>
      </main>
    )
  }
  if (!result) {
    return (
      <main className="daily-result page">
        <p className="t-cap mt24">결과를 불러오는 중…</p>
      </main>
    )
  }

  const wrong = result.questions.filter((q) => !q.correct).length
  const items = [...result.questions].sort((a, b) => a.seq - b.seq)

  return (
    <main className="daily-result page">
      <div className="t-lbl mt24">오늘의 5문제 · {result.dailyDate}</div>
      <h1 className="t-h1 mt4">오늘 학습 완료!</h1>

      <section className="score">
        <div>
          <div className="t-lbl">오늘의 점수</div>
          <div className="big num">
            {result.correctCount} / {result.totalCount}
          </div>
        </div>
        <div className="streak">
          <div className="t-lbl">데일리 연속 기록</div>
          <div className="n num">{home ? `${home.streak.current}일` : '…'}</div>
          {home && <div className="t-cap">최장 {home.streak.longest}일</div>}
        </div>
      </section>

      <h2 className="t-h2 mt24">오늘 푼 문제</h2>
      <ul className="dr-list mt8">
        {items.map((q) => {
          const cat = CAT_FROM_API[q.category]
          return (
            <li key={q.questionId}>
              <details>
                <summary>
                  <span className="seq num">{q.seq}</span>
                  <span className="cat">
                    <i style={{ background: cat ? CATS[cat].color : 'var(--tx3)' }} />
                    {q.categoryName}
                  </span>
                  <span className="tac type">{q.tacticName}</span>
                  <span className={`ox ${q.correct ? 'ok' : 'no'}`}>{q.correct ? '✓' : '✗'}</span>
                </summary>
                <div className="body">
                  <div className="ck">
                    <div className="t-lbl">확인 질문</div>
                    <div className="v">{q.checkQuestion}</div>
                  </div>
                  <p className="exp">{q.explanation}</p>
                  {q.source && <p className="t-cap">출처 · {q.source}</p>}
                </div>
              </details>
            </li>
          )
        })}
      </ul>
      <p className="t-cap mt8">문제를 누르면 확인 질문과 해설을 다시 볼 수 있어요.</p>

      <div className="mt24">
        <button className="btn" onClick={onHome}>
          홈으로
        </button>
        {wrong > 0 && (
          <button className="btn dark mt8" onClick={() => nav('/notes')}>
            틀린 {wrong}문제 오답노트에서 보기
          </button>
        )}
        <button className="btn dark mt8" onClick={() => nav('/streak')}>
          연승 챌린지 도전
        </button>
      </div>
    </main>
  )
}
