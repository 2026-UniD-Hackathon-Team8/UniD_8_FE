// GM_04 판 결과 조회 화면 (서버 결과만 사용, 브라우저에서 점수 재계산하지 않음)
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { isApiError } from '../../../shared/api/http'
import { useAsync } from '../../../shared/hooks/useAsync'
import { clearGuest } from '../../../shared/store/guest'
import { fetchGameResult } from '../api/resultApi'
import { PlayHeader } from '../components/PlayHeader'
import s from '../styles/game.module.css'

export default function GameResultPage() {
  const nav = useNavigate()
  const { gameSessionId } = useParams()
  const { data, loading, error, reload } = useAsync(fetchGameResult, Number(gameSessionId))

  useEffect(() => {
    if (isApiError(error, 'USER_NOT_FOUND')) {
      clearGuest()
      nav('/start', { replace: true })
    }
  }, [error, nav])

  return <div className={s.root}>
    <PlayHeader backLabel="홈" onBack={() => nav('/')} />
    <main className={s.wrap}>
      {loading && <div className={s.center}>결과를 불러오는 중…</div>}
      {!loading && error && <div className={s.error}>
        {error.message}
        <button className={s.btn} style={{ marginTop: 12 }} onClick={reload}>다시 시도</button>
      </div>}
      {!loading && data && <>
        <h1 className={s.h1}>{data.gameMode === 'WEAKNESS_RETRY' ? '약점 재도전 결과' : '실전 결과'}</h1>
        <p className={s.cap}>문제별 확인 질문을 보며 다시 점검해 보세요.</p>
        <div className={s.scoreBox}>
          <div><div className={s.label}>맞힌 문제</div><div className={s.big}>{data.correctCount} / {data.totalCount}</div></div>
        </div>
        <h2 className={s.h1} style={{ marginTop: 24, fontSize: 20 }}>계열별 오답</h2>
        {data.categoryWrongCounts.map((c) => (
          <div className={s.card} key={c.category} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <strong>{c.categoryName}</strong><strong>{c.wrongCount}개</strong>
          </div>
        ))}
        <h2 className={s.h1} style={{ marginTop: 24, fontSize: 20 }}>문제별 결과</h2>
        {[...data.questions].sort((a, b) => a.seq - b.seq).map((q) => (
          <div className={s.card} key={q.questionId}>
            <strong>{q.seq}번 · {q.correct ? '정답' : '오답'} · {q.categoryName}</strong>
            <p className={s.cap}>{q.tacticName}</p>
            <p style={{ marginTop: 8 }}>{q.explanation}</p>
            <p className={s.cap} style={{ marginTop: 8 }}>확인 질문 · {q.checkQuestion}</p>
          </div>
        ))}
        <div className={s.stack}>
          <button className={s.btn} onClick={() => nav('/play')}>새 실전 시작하기</button>
          <button className={`${s.btn} ${s.btnDark}`} onClick={() => nav('/notes')}>오답노트 보기</button>
          <button className={`${s.btn} ${s.btnDark}`} onClick={() => nav('/')}>홈으로</button>
        </div>
      </>}
    </main>
  </div>
}
