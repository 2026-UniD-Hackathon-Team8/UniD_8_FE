// 문제 화면 본문: 지시문 → 질문/상황/앞선 대화 → 선택지 2개 → 안내 → (정답 공개 후) 두 AI 답 비교
import { HINT_TEXT, QUESTION_TYPE_UI, SHORT_TAP_TEXT } from '../constants'
import { useHoldToSelect } from '../hooks/useHoldToSelect'
import { parseDialogue } from '../lib/dialogue'
import { aiAnswersByPos, hasAiAnswers, stampFor } from '../lib/reveal'
import type { AnswerPos, AnswerRevealResponse, GameQuestionItem } from '../api/types'
import { ChoiceCard } from './ChoiceCard'
import s from '../styles/game.module.css'

type Props = {
  question: GameQuestionItem
  /** 정답 공개 정보 (고르기 전이면 null) */
  reveal: AnswerRevealResponse | null
  submitting: boolean
  onSelect: (pos: AnswerPos) => void
}

const POSITIONS: AnswerPos[] = ['A', 'B']

export function QuestionView({ question, reveal, submitting, onSelect }: Props) {
  const hold = useHoldToSelect({ onSelect, disabled: submitting || Boolean(reveal) })
  const ui = QUESTION_TYPE_UI[question.questionType]
  const isQuestionPick = question.questionType === 'CHOICE_QUESTION'
  const optionText = (pos: AnswerPos) => {
    const t = pos === 'A' ? question.optionA : question.optionB
    return isQuestionPick ? `“${t}”` : t
  }

  return (
    <div className={s.stage}>
      <div className={s.task}>{ui.task}</div>
      <Context question={question} />

      <div className={s.choices}>
        {POSITIONS.map((pos) => (
          <ChoiceCard
            key={pos}
            pos={pos}
            text={optionText(pos)}
            progress={hold.progressOf(pos)}
            holding={hold.holding === pos}
            disabled={submitting}
            handlers={hold.bind(pos)}
            result={
              reveal
                ? {
                    isTarget: pos === reveal.correctPos,
                    stamp: stampFor(question.questionType, pos, reveal.correctPos),
                    mine: pos === reveal.selectedPos,
                  }
                : undefined
            }
          />
        ))}
      </div>

      {!reveal && (
        <div className={`${s.hint} ${hold.shortTap ? s.hintWarn : ''}`}>
          {submitting ? '확인하는 중…' : hold.shortTap ? SHORT_TAP_TEXT : HINT_TEXT}
        </div>
      )}

      {reveal && hasAiAnswers(reveal) && <AiAnswers reveal={reveal} isQuestionPick={isQuestionPick} />}
    </div>
  )
}

function Context({ question }: { question: GameQuestionItem }) {
  if (question.questionType !== 'CHOICE_DIALOGUE') {
    return <div className={s.prompt}>{question.prompt}</div>
  }
  const turns = parseDialogue(question.prompt)
  return (
    <div className={s.chat}>
      <div className={s.chatLabel}>앞선 대화</div>
      {turns ? (
        turns.map((t, i) => (
          <div key={i} className={s.chatMsg}>
            <span className={s.who}>{t.who === 'AI' ? 'AI' : '사용자'}</span>
            {t.text}
          </div>
        ))
      ) : (
        <div className={s.chatMsg}>{question.prompt}</div>
      )}
    </div>
  )
}

function AiAnswers({ reveal, isQuestionPick }: { reveal: AnswerRevealResponse; isQuestionPick: boolean }) {
  const byPos = aiAnswersByPos(reveal)
  return (
    <>
      <div className={`${s.label} ${s.compareTitle}`}>{isQuestionPick ? '두 질문에 AI가 한 답' : '두 쪽의 AI 답'}</div>
      <div className={s.compare}>
        {POSITIONS.map((pos) => (
          <div
            key={pos}
            className={`${s.compareItem} ${pos === reveal.correctPos ? s.compareTarget : s.compareCredible}`}
          >
            <div className={s.label}>{pos}에 대한 AI 답변</div>
            <div style={{ marginTop: 4 }}>{byPos[pos] ?? '—'}</div>
          </div>
        ))}
      </div>
    </>
  )
}
