// 연승 챌린지 화면 (GM_07): 문제 → 정답 공개 → 다음 문제 … 틀리면 종료 화면
import { useEffect } from 'react'
import { CHARACTER_SVG } from '../../../assets/characters'
import { useStreakPlay } from '../hooks/useStreakPlay'
import { PlayHeader, StreakCounter } from '../components/PlayHeader'
import { QuestionView } from '../components/QuestionView'
import { RevealSheet } from '../components/RevealSheet'
import s from '../styles/game.module.css'

type Props = {
  onExit: () => void
  /** 연승 랭킹 화면(FE C)으로 */
  onRanking?: () => void
  onUnauthorized?: () => void
}

export function StreakPlayScreen({ onExit, onRanking, onUnauthorized }: Props) {
  const g = useStreakPlay()

  useEffect(() => {
    if (g.error?.code === 'USER_NOT_FOUND') onUnauthorized?.()
  }, [g.error, onUnauthorized])

  if (g.phase === 'loading') {
    return (
      <div className={s.root}>
        <div className={s.center}>도전을 준비하는 중…</div>
      </div>
    )
  }

  if (g.phase === 'error') {
    const noQuestion = g.error?.code === 'NO_QUESTION_AVAILABLE'
    return (
      <div className={s.root}>
        <PlayHeader backLabel="홈" onBack={onExit} />
        <div className={s.wrap}>
          <div className={s.error}>{noQuestion ? '지금은 낼 수 있는 문제가 없어요.' : (g.error?.message ?? '문제가 생겼어요.')}</div>
          <div className={s.stack}>
            <button className={s.btn} onClick={() => void g.restart()}>
              새로 도전
            </button>
            <button className={`${s.btn} ${s.btnDark}`} onClick={onExit}>
              홈으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (g.phase === 'ended') {
    const completed = g.last?.endReason === 'COMPLETED'
    return (
      <div className={s.root}>
        <PlayHeader backLabel="홈" onBack={onExit}>
          <div className={s.spacer} />
          <span className={s.cnt}>도전 종료</span>
        </PlayHeader>
        <div className={s.wrap}>
          <div className={s.h1} style={{ marginTop: 16 }}>
            {completed ? `${g.winStreak}연승, 모든 문제를 맞혔어요!` : `${g.winStreak}연승으로 마쳤어요`}
          </div>
          <div className={s.scoreBox}>
            <div>
              <div className={s.label}>내 최고 기록{g.last?.newRecord ? ' · 신기록!' : ''}</div>
              <div className={s.big}>{g.bestWinStreak}연승</div>
            </div>
            <img src={CHARACTER_SVG.detective} width={72} height={72} alt="" />
          </div>
          <div className={s.stack}>
            <button className={s.btn} onClick={() => void g.restart()}>
              다시 도전 →
            </button>
            {onRanking && (
              <button className={`${s.btn} ${s.btnDark}`} onClick={onRanking}>
                연승 랭킹 보기
              </button>
            )}
            <button className={`${s.btn} ${s.btnDark}`} onClick={onExit}>
              홈으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!g.question) return null
  const { question, reveal, last } = g

  return (
    <div className={s.root}>
      <PlayHeader backLabel="연승 챌린지" onBack={onExit}>
        <StreakCounter current={g.winStreak} best={g.bestWinStreak} />
      </PlayHeader>

      <QuestionView key={question.questionId} question={question} reveal={reveal} submitting={g.submitting} onSelect={g.submit} />

      {reveal && last && (
        <RevealSheet
          reveal={reveal}
          questionType={question.questionType}
          winStreak={g.winStreak}
          nextLabel={last.ended ? '결과 보기' : '다음 문제'}
          onNext={g.next}
        />
      )}
    </div>
  )
}
