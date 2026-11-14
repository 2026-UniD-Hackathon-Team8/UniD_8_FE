// 정답 공개 시트: 맞았는지 → 어느 쪽이 잘못됐는지 → 확인 질문(가장 크게) → 계열·수법(작게) → 해설 → 출처 → 다음
import { CATEGORY_UI } from '../constants'
import { revealSubline, verdictText } from '../lib/reveal'
import type { AnswerRevealResponse, QuestionType } from '../api/types'
import s from '../styles/game.module.css'

type Props = {
  reveal: AnswerRevealResponse
  questionType: QuestionType
  /** 연승 챌린지면 현재 연승 수 */
  winStreak?: number
  nextLabel: string
  onNext: () => void
}

export function RevealSheet({ reveal, questionType, winStreak, nextLabel, onNext }: Props) {
  const cat = CATEGORY_UI[reveal.category]
  const isUrl = /^https?:\/\//i.test(reveal.source)

  return (
    <div className={`${s.sheet} ${reveal.correct ? '' : s.sheetWrong}`} role="dialog" aria-live="polite">
      <div className={s.verdict}>{verdictText(reveal.correct, reveal.correct ? winStreak : undefined)}</div>
      <div className={s.sub}>{revealSubline(questionType, reveal.correctPos)}</div>

      <div className={s.checkBox}>
        <div className={s.checkLabel}>확인 질문</div>
        <div className={s.checkQuestion}>{reveal.checkQuestion || cat?.checkQuestion}</div>
      </div>

      <div className={s.tags}>
        <span className={s.tag}>
          <i className={s.dot} style={{ background: cat ? `var(${cat.colorVar}, ${cat.color})` : 'var(--gm-tx3)' }} />
          {reveal.categoryName} · {reveal.tacticName}
        </span>
      </div>

      <div className={s.explanation}>{reveal.explanation}</div>

      {reveal.source && (
        <div className={s.source}>
          출처 ·{' '}
          {isUrl ? (
            <a href={reveal.source} target="_blank" rel="noopener noreferrer">
              {reveal.source}
            </a>
          ) : (
            reveal.source
          )}
        </div>
      )}

      <button className={`${s.btn} ${reveal.correct ? '' : s.btnRed}`} onClick={onNext}>
        {nextLabel} →
      </button>
    </div>
  )
}
