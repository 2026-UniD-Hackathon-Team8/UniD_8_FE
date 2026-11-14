// DL_01~03 데일리 5문제 조회·답 제출·완료 결과. game의 문제/공개 UI를 재사용한다.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../shared/api/http'
import { clearGuest } from '../../shared/store/guest'
import { PlayHeader, ProgressSegments } from '../game/components/PlayHeader'
import { QuestionView } from '../game/components/QuestionView'
import { RevealSheet } from '../game/components/RevealSheet'
import type { AnswerPos, AnswerRevealResponse } from '../game/api/types'
import s from '../game/styles/game.module.css'
import { getTodayDaily, getTodayDailyResult, submitDailyAnswer } from './api'
import type { DailyResponse, DailyResultResponse } from './api'

export default function DailyPage() {
  const nav = useNavigate()
  const [daily, setDaily] = useState<DailyResponse | null>(null)
  const [result, setResult] = useState<DailyResultResponse | null>(null)
  const [reveal, setReveal] = useState<AnswerRevealResponse | null>(null)
  const [known, setKnown] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const busyRef = useRef(false)

  const fail = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.code === 'USER_NOT_FOUND') {
      clearGuest()
      nav('/start', { replace: true })
      return
    }
    setError(e instanceof Error ? e.message : '문제를 불러오지 못했어요.')
  }, [nav])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setReveal(null)
    try {
      const today = await getTodayDaily()
      setDaily(today)
      setKnown({})
      setResult(today.completed ? await getTodayDailyResult() : null)
    } catch (e) {
      fail(e)
    } finally {
      setLoading(false)
    }
  }, [fail])

  useEffect(() => { void load() }, [load])

  const current = daily?.questions.find((q) => !q.answered) ?? null

  async function submit(pos: AnswerPos) {
    if (!daily || !current || busyRef.current || reveal) return
    busyRef.current = true
    setSubmitting(true)
    setError(null)
    try {
      const r = await submitDailyAnswer(current.questionId, pos)
      setReveal(r)
      setKnown((prev) => ({ ...prev, [r.questionId]: r.correct }))
      setDaily((prev) => prev ? {
        ...prev,
        completed: r.completed,
        solvedCount: prev.solvedCount + 1,
        questions: prev.questions.map((q) => q.questionId === r.questionId ? { ...q, answered: true, selectedPos: r.selectedPos } : q),
      } : prev)
    } catch (e) {
      fail(e)
    } finally {
      busyRef.current = false
      setSubmitting(false)
    }
  }

  async function next() {
    if (!reveal) return
    if (reveal.completed) {
      setLoading(true)
      try {
        setResult(await getTodayDailyResult())
        setReveal(null)
        setError(null)
      } catch (e) {
        fail(e)
      } finally {
        setLoading(false)
      }
    } else {
      setReveal(null)
    }
  }

  if (loading) return <div className={s.root}><div className={s.center}>오늘의 문제를 불러오는 중…</div></div>

  if (error) {
    return <div className={s.root}>
      <PlayHeader backLabel="홈" onBack={() => nav('/')} />
      <div className={s.wrap}>
        <div className={s.error}>{error}</div>
        <button className={s.btn} style={{ marginTop: 16 }} onClick={() => void load()}>다시 시도</button>
      </div>
    </div>
  }

  if (result) {
    return <div className={s.root}>
      <PlayHeader backLabel="홈" onBack={() => nav('/')} />
      <main className={s.wrap}>
        <h1 className={s.h1}>오늘의 5문제 완료!</h1>
        <p className={s.cap}>오늘도 AI 답변을 검증하는 연습을 마쳤어요.</p>
        <div className={s.scoreBox}>
          <div><div className={s.label}>오늘 정답</div><div className={s.big}>{result.correctCount} / {result.totalCount}</div></div>
        </div>
        {[...result.questions].sort((a, b) => a.seq - b.seq).map((q) => (
          <div className={s.card} key={q.questionId}>
            <strong>{q.seq}번 · {q.correct ? '정답' : '오답'} · {q.categoryName}</strong>
            <p className={s.cap}>{q.tacticName}</p>
            <p style={{ marginTop: 8 }}>{q.explanation}</p>
            <p className={s.cap} style={{ marginTop: 8 }}>확인 질문 · {q.checkQuestion}</p>
          </div>
        ))}
        <div className={s.stack}>
          <button className={s.btn} onClick={() => nav('/')}>홈으로 돌아가기</button>
          <button className={`${s.btn} ${s.btnDark}`} onClick={() => nav('/notes')}>오답노트 보기</button>
        </div>
      </main>
    </div>
  }

  if (!daily) return <div className={s.root}><div className={s.center}>데일리를 불러올 수 없어요.</div></div>

  // 답 제출 직후에는 answered=true가 되어도 공개 시트를 볼 수 있도록 원본 문제를 찾는다.
  const displayed = reveal ? daily.questions.find((q) => q.questionId === reveal.questionId) ?? null : current
  if (!displayed) {
    return <div className={s.root}>
      <PlayHeader backLabel="홈" onBack={() => nav('/')} />
      <div className={s.wrap}><p className={s.cap}>결과를 불러와 주세요.</p><button className={s.btn} onClick={() => void load()}>결과 조회</button></div>
    </div>
  }

  const ordered = [...daily.questions].sort((a, b) => a.seq - b.seq)
  const progress = ordered.map((q) => {
    if (q.questionId === displayed.questionId && !reveal) return 'current' as const
    if (q.questionId in known) return known[q.questionId] ? 'correct' as const : 'wrong' as const
    return q.answered ? 'answered' as const : 'todo' as const
  })

  return <div className={s.root}>
    <PlayHeader backLabel="오늘의 5문제" onBack={() => nav('/')}>
      <ProgressSegments states={progress} index={displayed.seq} total={daily.totalCount} />
    </PlayHeader>
    <QuestionView key={displayed.questionId} question={displayed} reveal={reveal} submitting={submitting} onSelect={(pos) => void submit(pos)} />
    {reveal && <RevealSheet reveal={reveal} questionType={displayed.questionType} nextLabel={reveal.completed ? '오늘 결과 보기' : '다음 문제'} onNext={() => void next()} />}
  </div>
}
