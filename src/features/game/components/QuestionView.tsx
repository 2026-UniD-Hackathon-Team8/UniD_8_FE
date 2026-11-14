// 문제 화면 본문: 지시문 → 질문/상황/앞선 대화(채팅 말풍선) → 선택지 2개(좌우 나란히) → 안내 → (정답 공개 후) 두 AI 답 비교
import { HINT_TEXT, QUESTION_TYPE_UI, SHORT_TAP_TEXT } from '../constants'
import { useHoldToSelect } from '../hooks/useHoldToSelect'
import { splitDialogue, stripSpeaker } from '../lib/dialogue'
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
    if (isQuestionPick) return `“${t}”`
    // 대화 고르기 선택지는 이어지는 AI 말 하나: "AI: "…"" 앞머리·따옴표를 뗀다
    return question.questionType === 'CHOICE_DIALOGUE' ? stripSpeaker(t) : t
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

/**
 * 질문·상황을 채팅 말풍선으로 보여 준다 (흰 말풍선 · 검정 글씨).
 * - 답 고르기: 내가 AI에게 한 질문 → 오른쪽
 * - 질문 고르기: 상황 안내 → 왼쪽 (고를 질문이 선택지)
 * - 대화 고르기: 앞선 대화를 사용자는 오른쪽, AI는 왼쪽
 */
function Context({ question }: { question: GameQuestionItem }) {
  if (question.questionType === 'CHOICE_DIALOGUE') {
    const { intro, turns, note } = splitDialogue(question.prompt)
    return (
      <div className={s.thread}>
        <div className={s.chatLabel}>앞선 대화</div>
        {intro && <div className={s.dialogNote}>{intro}</div>}
        {turns.length ? (
          turns.map((t, i) => (
            <Bubble key={i} side={t.who === 'AI' ? 'left' : 'right'} who={t.who === 'AI' ? 'AI' : '나'} text={t.text} />
          ))
        ) : (
          <Bubble side="left" text={question.prompt} />
        )}
        {note && <div className={s.dialogNote}>{note}</div>}
      </div>
    )
  }
  return (
    <div className={s.thread}>
      <Bubble side={question.questionType === 'CHOICE_ANSWER' ? 'right' : 'left'} text={question.prompt} />
    </div>
  )
}

function Bubble({ side, who, text }: { side: 'left' | 'right'; who?: string; text: string }) {
  return (
    <div className={`${s.bubbleRow} ${side === 'right' ? s.bubbleRight : s.bubbleLeft}`}>
      {who && <span className={s.bubbleWho}>{who}</span>}
      <div className={s.bubble}>{text}</div>
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
