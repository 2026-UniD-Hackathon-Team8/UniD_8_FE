// 실전 판 화면 (일반 / 약점 재도전). 라우터에 붙일 때 이 컴포넌트 하나만 쓰면 된다.
import { useEffect } from 'react'
import { GAME_MODE_NAME } from '../constants'
import { useGamePlay } from '../hooks/useGamePlay'
import { resumeText, segments } from '../lib/progress'
import type { GameMode } from '../api/types'
import { PlayHeader, ProgressSegments } from '../components/PlayHeader'
import { QuestionView } from '../components/QuestionView'
import { RevealSheet } from '../components/RevealSheet'
import s from '../styles/game.module.css'

type Props = {
  mode?: GameMode
  /** 홈으로 나가기 (진행 상황은 서버에 남아 있어 이어 할 수 있다) */
  onExit: () => void
  /** 마지막 문제를 풀고 [결과 보기]를 눌렀을 때 → 판 결과 화면(FE B)으로 */
  onFinished: (gameSessionId: number) => void
  /** 등록되지 않은 기기(401) → 게스트 시작으로 */
  onUnauthorized?: () => void
}

export function GamePlayScreen({ mode = 'NORMAL', onExit, onFinished, onUnauthorized }: Props) {
  const g = useGamePlay(mode)
  const modeName = GAME_MODE_NAME[g.session?.gameMode ?? mode]

  useEffect(() => {
    if (g.error?.code === 'USER_NOT_FOUND') onUnauthorized?.()
  }, [g.error, onUnauthorized])

  if (g.phase === 'loading') {
    return (
      <div className={s.root}>
        <div className={s.center}>문제를 준비하는 중…</div>
      </div>
    )
  }

  if (g.phase === 'error') {
    return (
      <div className={s.root}>
        <PlayHeader backLabel="홈" onBack={onExit} />
        <div className={s.wrap}>
          <div className={s.error}>{g.error?.message ?? '문제가 생겼어요.'}</div>
          <div className={s.stack}>
            <button className={s.btn} onClick={() => void g.retry()}>
              다시 시도
            </button>
            <button className={`${s.btn} ${s.btnDark}`} onClick={onExit}>
              홈으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (g.phase === 'resume' && g.session) {
    return (
      <div className={s.root}>
        <PlayHeader backLabel="홈" onBack={onExit}>
          <div className={s.spacer} />
          <span className={s.cnt}>{GAME_MODE_NAME[g.session.gameMode]}</span>
        </PlayHeader>
        <div className={s.wrap}>
          <div className={s.card}>
            <div className={s.h1}>이어서 풀까요?</div>
            <div className={s.cap}>{resumeText(g.session)}</div>
          </div>
          <div className={s.stack}>
            <button className={s.btn} onClick={g.resume}>
              이어 하기 →
            </button>
            <button className={`${s.btn} ${s.btnDark}`} onClick={() => void g.startNew()}>
              새로 시작
            </button>
          </div>
          <div className={s.cap} style={{ marginTop: 12 }}>
            새로 시작하면 진행 중인 판이 종료돼요.
          </div>
        </div>
      </div>
    )
  }

  if (g.phase === 'finished' || !g.session || !g.current) {
    const id = g.session?.gameSessionId
    return (
      <div className={s.root}>
        <PlayHeader backLabel="홈" onBack={onExit} />
        <div className={s.wrap}>
          <div className={s.card}>
            <div className={s.h1}>한 판을 다 풀었어요</div>
            <div className={s.cap}>결과에서 많이 틀린 계열을 확인해 보세요.</div>
          </div>
          <div className={s.stack}>
            {id !== undefined && (
              <button className={s.btn} onClick={() => onFinished(id)}>
                결과 보기 →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const { session, current, reveal } = g
  const order = [...session.questions].sort((a, b) => a.seq - b.seq)
  const index = order.findIndex((q) => q.questionId === current.questionId) + 1

  return (
    <div className={s.root}>
      <PlayHeader backLabel={modeName} onBack={onExit}>
        <ProgressSegments
          states={segments(session, g.results, current.questionId).map((x) => x.state)}
          index={index}
          total={session.totalCount}
        />
      </PlayHeader>

      <QuestionView key={current.questionId} question={current} reveal={reveal} submitting={g.submitting} onSelect={g.submit} />

      {reveal && (
        <RevealSheet
          reveal={reveal}
          questionType={current.questionType}
          nextLabel={reveal.completed ? '결과 보기' : '다음 문제'}
          onNext={reveal.completed ? () => onFinished(session.gameSessionId) : g.next}
        />
      )}
    </div>
  )
}
