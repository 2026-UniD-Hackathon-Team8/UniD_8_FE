// 실전 판 흐름 (GM_01 시작, GM_03 답 제출, GM_05 이어 하기, GM_06 약점 재도전)
//
// loading → (진행 중인 판이 있으면) resume → playing ⇄ (정답 공개) → finished
import { useCallback, useEffect, useRef, useState } from 'react'
import { getCurrentGame, startGame, submitGameAnswer } from '../api/gameApi'
import { ApiError } from '../api/http'
import { applyAnswer, nextQuestion } from '../lib/progress'
import type { AnswerPos, AnswerRevealResponse, GameMode, GameQuestionItem, GameSessionResponse } from '../api/types'

export type GamePhase = 'loading' | 'resume' | 'playing' | 'finished' | 'error'

const toApiError = (e: unknown) =>
  e instanceof ApiError ? e : new ApiError(0, 'INTERNAL_ERROR', '알 수 없는 오류가 났어요.')

export function useGamePlay(mode: GameMode) {
  const [phase, setPhase] = useState<GamePhase>('loading')
  const [session, setSession] = useState<GameSessionResponse | null>(null)
  const [current, setCurrent] = useState<GameQuestionItem | null>(null)
  const [reveal, setReveal] = useState<AnswerRevealResponse | null>(null)
  const [results, setResults] = useState<ReadonlyMap<number, AnswerRevealResponse>>(new Map())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const startedRef = useRef(false)
  const busyRef = useRef(false)

  const enter = useCallback((s: GameSessionResponse) => {
    setSession(s)
    setResults(new Map())
    setReveal(null)
    const q = nextQuestion(s)
    setCurrent(q)
    setPhase(q ? 'playing' : 'finished')
  }, [])

  const fail = useCallback((e: unknown) => {
    setError(toApiError(e))
    setPhase('error')
  }, [])

  /** 새 판 시작 (진행 중인 판은 서버가 버린다) */
  const startNew = useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    setPhase('loading')
    setError(null)
    try {
      enter(await startGame(mode))
    } catch (e) {
      fail(e)
    } finally {
      busyRef.current = false
    }
  }, [enter, fail, mode])

  /** 처음 들어왔을 때: 진행 중인 판이 있으면 이어 할지 묻는다 */
  const init = useCallback(async () => {
    setPhase('loading')
    setError(null)
    try {
      const cur = await getCurrentGame()
      if (cur) {
        setSession(cur)
        setPhase('resume')
      } else {
        await startNew()
      }
    } catch (e) {
      fail(e)
    }
  }, [fail, startNew])

  useEffect(() => {
    // StrictMode에서 두 번 실행돼도 판을 두 번 만들지 않게 막는다
    if (startedRef.current) return
    startedRef.current = true
    void init()
  }, [init])

  const resume = useCallback(() => {
    if (session) enter(session)
  }, [enter, session])

  const submit = useCallback(
    async (pos: AnswerPos) => {
      if (!session || !current || submitting || reveal) return
      setSubmitting(true)
      try {
        const r = await submitGameAnswer(session.gameSessionId, current.questionId, pos)
        setReveal(r)
        setResults((prev) => new Map(prev).set(r.questionId, r))
        setSession((prev) => (prev ? applyAnswer(prev, r) : prev))
      } catch (e) {
        fail(e)
      } finally {
        setSubmitting(false)
      }
    },
    [current, fail, reveal, session, submitting],
  )

  /** 정답 공개 시트의 [다음 문제] / [결과 보기] */
  const next = useCallback(() => {
    if (!session) return
    if (reveal?.completed) {
      setReveal(null)
      setPhase('finished')
      return
    }
    const q = nextQuestion(session)
    setReveal(null)
    setCurrent(q)
    if (!q) setPhase('finished')
  }, [reveal, session])

  return { phase, session, current, reveal, results, submitting, error, resume, startNew, retry: init, submit, next }
}
