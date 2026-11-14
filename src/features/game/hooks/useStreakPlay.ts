// 연승 챌린지 흐름 (GM_07): 시작 → 문제 → 정답 공개 → (맞히면) 다음 문제 / (틀리면·완주) 종료
import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/http'
import { startStreakChallenge, submitStreakAnswer } from '../api/streakApi'
import type { AnswerPos, GameQuestionItem, StreakAnswerResponse } from '../api/types'

export type StreakPhase = 'loading' | 'playing' | 'ended' | 'error'

const toApiError = (e: unknown) =>
  e instanceof ApiError ? e : new ApiError(0, 'INTERNAL_ERROR', '알 수 없는 오류가 났어요.')

export function useStreakPlay() {
  const [phase, setPhase] = useState<StreakPhase>('loading')
  const [challengeId, setChallengeId] = useState<number | null>(null)
  const [question, setQuestion] = useState<GameQuestionItem | null>(null)
  const [winStreak, setWinStreak] = useState(0)
  const [bestWinStreak, setBestWinStreak] = useState(0)
  const [last, setLast] = useState<StreakAnswerResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const startedRef = useRef(false)
  const busyRef = useRef(false)

  const fail = useCallback((e: unknown) => {
    setError(toApiError(e))
    setPhase('error')
  }, [])

  /** 새 도전. 진행 중인 도전이 있으면 서버가 끝낸다. */
  const start = useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    setPhase('loading')
    setError(null)
    setLast(null)
    setWinStreak(0)
    try {
      const r = await startStreakChallenge()
      setChallengeId(r.challengeId)
      setBestWinStreak(r.bestWinStreak)
      setQuestion(r.question)
      setPhase('playing')
    } catch (e) {
      fail(e)
    } finally {
      busyRef.current = false
    }
  }, [fail])

  useEffect(() => {
    // StrictMode에서 두 번 실행돼도 도전을 두 번 만들지 않게 막는다
    if (startedRef.current) return
    startedRef.current = true
    void start()
  }, [start])

  const submit = useCallback(
    async (pos: AnswerPos) => {
      if (challengeId === null || !question || submitting || last) return
      setSubmitting(true)
      try {
        const r = await submitStreakAnswer(challengeId, question.questionId, pos)
        setLast(r)
        setWinStreak(r.currentWinStreak)
        setBestWinStreak(r.bestWinStreak)
      } catch (e) {
        fail(e)
      } finally {
        setSubmitting(false)
      }
    },
    [challengeId, fail, last, question, submitting],
  )

  const next = useCallback(() => {
    if (!last) return
    if (last.ended || !last.nextQuestion) {
      setPhase('ended')
      return
    }
    setQuestion(last.nextQuestion)
    setLast(null)
  }, [last])

  return {
    phase,
    question,
    reveal: last?.reveal ?? null,
    last,
    winStreak,
    bestWinStreak,
    submitting,
    error,
    submit,
    next,
    restart: start,
  }
}
