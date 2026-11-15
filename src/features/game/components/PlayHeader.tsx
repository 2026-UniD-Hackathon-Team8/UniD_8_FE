import type { ReactNode } from 'react'
import type { SegmentState } from '../lib/progress'
import s from '../styles/game.module.css'

const SEG_CLASS: Record<SegmentState, string> = {
  correct: s.segCorrect,
  wrong: s.segWrong,
  answered: s.segAnswered,
  current: s.segCurrent,
  todo: '',
}

type Props = {
  backLabel: string
  onBack: () => void
  children?: ReactNode
}

export function PlayHeader({ backLabel, onBack, children }: Props) {
  return (
    <div className={s.top}>
      <button className={s.back} onClick={onBack}>
        ‹ {backLabel}
      </button>
      {children}
    </div>
  )
}

/** 실전 판 진행 바 + "3 / 10" */
export function ProgressSegments({ states, index, total }: { states: SegmentState[]; index: number; total: number }) {
  return (
    <>
      <div className={s.segs}>
        {states.map((st, i) => (
          <i key={i} className={`${s.seg} ${SEG_CLASS[st]}`} />
        ))}
      </div>
      <div className={s.cnt}>
        {index} / {total}
      </div>
    </>
  )
}

/** 연승 챌린지: "현재 3연승 · 최고 12" */
export function StreakCounter({ current, best }: { current: number; best: number }) {
  return (
    <>
      <div className={s.spacer} />
      <div className={s.run}>
        현재 {current}연승 <span className={s.runBest}>· 최고 {best}</span>
      </div>
    </>
  )
}
