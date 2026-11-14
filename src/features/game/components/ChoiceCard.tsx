import type { CSSProperties, ReactNode } from 'react'
import type { AnswerPos } from '../api/types'
import s from '../styles/game.module.css'

const LensIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l5 5" />
  </svg>
)

type Props = {
  pos: AnswerPos
  text: ReactNode
  /** 길게 누르기 진행도 0~1 */
  progress: number
  holding: boolean
  /** 고른 뒤(정답 공개 중)면 결과 표시 */
  result?: { isTarget: boolean; stamp: string; mine: boolean }
  disabled: boolean
  handlers: Record<string, unknown>
}

export function ChoiceCard({ pos, text, progress, holding, result, disabled, handlers }: Props) {
  const cls = [
    s.choice,
    holding && s.holding,
    (disabled || result) && s.disabled,
    result && (result.isTarget ? s.isTarget : s.isCredible),
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cls}
      style={{ '--p': progress } as CSSProperties}
      role="button"
      aria-label={`${pos} 선택지 길게 눌러 고르기`}
      aria-disabled={disabled || Boolean(result)}
      {...(result || disabled ? {} : handlers)}
    >
      <div className={s.choiceHead}>{pos}</div>
      <div className={s.choiceText}>{text}</div>
      {!result && (
        <div className={s.lens}>
          <LensIcon />
        </div>
      )}
      {result && (
        <>
          <span className={`${s.stamp} ${result.isTarget ? s.stampTarget : s.stampCredible}`}>{result.stamp}</span>
          {result.mine && <span className={s.mine}>내 선택</span>}
        </>
      )}
    </div>
  )
}
