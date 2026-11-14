// WN_01 오답 상세 + WN_02 오답 메모
import { useState } from 'react'
import { parseDialogue, QUESTION_TYPE_UI } from '../game'
import { isApiError } from '../../shared/api/http'
import { CAT_FROM_API, CATS } from '../../shared/constants/domain'
import type { WrongAnswerItem } from './api'
import { saveMemo } from './api'
import { buildMemo, MEMO_MAX, MEMO_REASONS, parseMemo } from './memo'
import type { MemoReason } from './memo'

interface Props {
  item: WrongAnswerItem
  onClose: () => void
  onSaved: (memo: string) => void
}

export default function WrongDetailSheet({ item, onClose, onSaved }: Props) {
  const init = parseMemo(item.memo)
  const [reason, setReason] = useState<MemoReason | null>(init.reason)
  const [text, setText] = useState(init.text)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const cat = CAT_FROM_API[item.category]
  const ui = QUESTION_TYPE_UI[item.questionType]
  const isQuestion = item.questionType === 'CHOICE_QUESTION'
  const dialogue = item.questionType === 'CHOICE_DIALOGUE' ? parseDialogue(item.prompt) : null
  const memo = buildMemo(reason, text)
  const changed = memo !== (item.memo ?? '')

  async function save() {
    if (!memo) {
      setErr('이유를 고르거나 메모를 적어 주세요.')
      return
    }
    setBusy(true)
    try {
      await saveMemo(item.questionId, memo)
      onSaved(memo)
    } catch (e) {
      setErr(isApiError(e) ? e.message : '저장하지 못했어요. 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="file">
        <div className="row">
          <span className="tg type">
            {cat && <i style={{ background: CATS[cat].color }} />}
            {item.categoryName} · {item.tacticName}
          </span>
          <span className="spacer" />
          <span className="t-lbl">{ui?.name ?? item.questionTypeName}</span>
        </div>

        {dialogue ? (
          <div className="chat mt12">
            <div className="t-lbl y">앞선 대화</div>
            {dialogue.map((t, i) => (
              <div className="m" key={i}>
                <span className="who">{t.who === 'AI' ? 'AI' : '사용자'}</span>
                {t.text}
              </div>
            ))}
          </div>
        ) : (
          <div className="t-q mt12">{item.prompt}</div>
        )}

        <div className="kv">
          <span>{isQuestion ? '내가 고른 질문' : '내가 고른 답'}</span>
          <span className="was">{item.myChoiceText}</span>
          <span>{ui?.targetStamp ?? '골라낼 쪽'}</span>
          <span className="right">{item.answerChoiceText}</span>
        </div>

        {isQuestion && (item.credibleAiAnswer || item.targetAiAnswer) && (
          <>
            <div className="t-lbl mt16">두 질문에 AI가 한 답</div>
            <div className="compare">
              <div className="r v">
                <div className="t-lbl">내가 고른 질문에</div>
                <div className="mt4">{item.credibleAiAnswer ?? '—'}</div>
              </div>
              <div className="r f">
                <div className="t-lbl">끌고 가는 질문에</div>
                <div className="mt4">{item.targetAiAnswer ?? '—'}</div>
              </div>
            </div>
          </>
        )}

        <div className="checkbox">
          <div className="t-lbl">확인 질문</div>
          <div className="v">{item.checkQuestion}</div>
        </div>
        <p className="exp">{item.explanation}</p>
        {item.source && <p className="src">출처 · {item.source}</p>}

        <h3 className="t-h2 mt16">왜 이 답을 믿었나요?</h3>
        <p className="t-cap">이유를 하나 고르고, 하고 싶은 말이 있으면 적어 두세요.</p>
        <div className="radios">
          {MEMO_REASONS.map((r) => (
            <button
              key={r}
              className={reason === r ? 'on' : ''}
              onClick={() => {
                setReason(reason === r ? null : r)
                setErr(null)
              }}
            >
              <i />
              {r}
            </button>
          ))}
        </div>
        <textarea
          className="inp mt8"
          rows={2}
          maxLength={MEMO_MAX - 40}
          placeholder="메모 (선택)"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setErr(null)
          }}
        />
        {err && <p className="t-cap mt8 err">{err}</p>}
        <button className="btn mt16" disabled={busy || !changed} onClick={() => void save()}>
          메모 저장
        </button>
        <button className="btn dark mt8" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  )
}
