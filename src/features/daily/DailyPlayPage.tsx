// DL_01 오늘의 5문제 풀기 · DL_02/03 데일리 결과
// 문제 화면·정답 공개 시트는 FE A(실전)의 컴포넌트를 그대로 쓴다.
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayHeader, ProgressSegments } from '../game/components/PlayHeader'
import { QuestionView } from '../game/components/QuestionView'
import { RevealSheet } from '../game/components/RevealSheet'
import s from '../game/styles/game.module.css'
import { clearGuest } from '../../shared/store/guest'
import DailyResult from './DailyResult'
import { useDailyPlay } from './useDailyPlay'

export default function DailyPlayPage() {
  const nav = useNavigate()
  const d = useDailyPlay()
  const home = () => nav('/')

  useEffect(() => {
    if (d.error?.code === 'USER_NOT_FOUND') {
      clearGuest()
      nav('/start', { replace: true })
    }
  }, [d.error, nav])

  if (d.phase === 'loading') {
    return (
      <div className={s.root}>
        <div className={s.center}>오늘의 문제를 준비하는 중…</div>
      </div>
    )
  }

  if (d.phase === 'error') {
    return (
      <div className={s.root}>
        <PlayHeader backLabel="홈" onBack={home} />
        <div className={s.wrap}>
          <div className={s.error}>{d.error?.message ?? '문제가 생겼어요.'}</div>
          <div className={s.stack}>
            <button className={s.btn} onClick={d.retry}>
              다시 시도
            </button>
            <button className={`${s.btn} ${s.btnDark}`} onClick={home}>
              홈으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (d.phase === 'done' || !d.daily || !d.current) {
    return <DailyResult onHome={home} />
  }

  const { daily, current, reveal } = d
  return (
    <div className={s.root}>
      <PlayHeader backLabel="오늘의 5문제" onBack={home}>
        <ProgressSegments states={d.segments} index={d.index} total={daily.totalCount} />
      </PlayHeader>

      <QuestionView
        key={current.questionId}
        question={current}
        reveal={reveal}
        submitting={d.submitting}
        onSelect={(pos) => void d.submit(pos)}
      />

      {reveal && (
        <RevealSheet
          reveal={reveal}
          questionType={current.questionType}
          nextLabel={reveal.completed ? '오늘 결과 보기' : '다음 문제'}
          onNext={d.next}
        />
      )}
    </div>
  )
}
