// 오늘의 5문제 흐름: 불러오기 → (다 풀었으면 결과) → 풀기 → 정답 공개 → 다음 문제 / 결과
import { useCallback, useEffect, useState } from 'react'
import type { AnswerPos, AnswerRevealResponse, GameQuestionItem } from '../game'
import { ApiError } from '../../shared/api/http'
import { fetchDaily, submitDailyAnswer } from './api'
import type { DailyResponse } from './api'

export type DailyPhase = 'loading' | 'error' | 'play' | 'done'

/** 진행 바 칸: 이번에 풀어서 결과를 아는 칸은 O/X, 전에 풀어 둔 칸은 answered */
export type DailySegment = 'correct' | 'wrong' | 'answered' | 'current' | 'todo'

const toApiError = (e: unknown) =>
  e instanceof ApiError ? e : new ApiError(0, 'INTERNAL_ERROR', '문제가 생겼어요. 잠시 후 다시 시도해 주세요.')

const firstUnanswered = (d: DailyResponse) =>
  [...d.questions].sort((a, b) => a.seq - b.seq).find((q) => !q.answered) ?? null

export function useDailyPlay() {
  const [tick, setTick] = useState(0)
  const [daily, setDaily] = useState<DailyResponse | null>(null)
  const [phase, setPhase] = useState<DailyPhase>('loading')
  const [error, setError] = useState<ApiError | null>(null)
  const [current, setCurrent] = useState<GameQuestionItem | null>(null)
  const [reveal, setReveal] = useState<AnswerRevealResponse | null>(null)
  const [results, setResults] = useState<ReadonlyMap<number, AnswerRevealResponse>>(new Map())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let alive = true
    fetchDaily()
      .then((d) => {
        if (!alive) return
        setDaily(d)
        setError(null)
        setReveal(null)
        setCurrent(firstUnanswered(d))
        setPhase(d.completed ? 'done' : 'play')
      })
      .catch((e: unknown) => {
        if (!alive) return
        setError(toApiError(e))
        setPhase('error')
      })
    return () => {
      alive = false
    }
  }, [tick])

  const retry = useCallback(() => {
    setPhase('loading')
    setTick((t) => t + 1)
  }, [])

  const submit = useCallback(
    async (pos: AnswerPos) => {
      if (!current || submitting || reveal) return
      setSubmitting(true)
      try {
        const r = await submitDailyAnswer(current.questionId, pos)
        setReveal(r)
        setResults((m) => new Map(m).set(r.questionId, r))
        setDaily((d) =>
          d
            ? {
                ...d,
                solvedCount: Math.min(d.totalCount, d.solvedCount + (current.answered ? 0 : 1)),
                completed: r.completed,
                questions: d.questions.map((q) =>
                  q.questionId === r.questionId ? { ...q, answered: true, selectedPos: r.selectedPos } : q,
                ),
              }
            : d,
        )
      } catch (e) {
        const err = toApiError(e)
        // 자정이 지나 문제 세트가 바뀌었으면 오늘 문제를 다시 받는다
        if (err.code === 'DAILY_QUESTION_NOT_FOUND') retry()
        else {
          setError(err)
          setPhase('error')
        }
      } finally {
        setSubmitting(false)
      }
    },
    [current, submitting, reveal, retry],
  )

  const next = useCallback(() => {
    if (!daily) return
    if (reveal?.completed || daily.completed) {
      setPhase('done')
      return
    }
    setReveal(null)
    setCurrent(firstUnanswered(daily))
  }, [daily, reveal])

  const segments: DailySegment[] = daily
    ? [...daily.questions]
        .sort((a, b) => a.seq - b.seq)
        .map((q) => {
          const r = results.get(q.questionId)
          if (r) return r.correct ? 'correct' : 'wrong'
          if (q.answered) return 'answered'
          return q.questionId === current?.questionId ? 'current' : 'todo'
        })
    : []

  const index =
    daily && current
      ? [...daily.questions].sort((a, b) => a.seq - b.seq).findIndex((q) => q.questionId === current.questionId) + 1
      : 0

  return { phase, daily, error, current, reveal, submitting, segments, index, submit, next, retry }
}
