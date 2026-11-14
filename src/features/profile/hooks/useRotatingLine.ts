// 대사 묶음을 일정 시간마다 돌려 보여 준다. 처음은 무작위, 같은 대사 연속 없음.
// next()를 부르면 바로 다음 대사로 바뀌고, 다음 자동 전환까지 시간을 다시 센다.
import { useCallback, useEffect, useRef, useState } from 'react'
import { nextIndex } from '../lib/thought'

const FADE_MS = 200

const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function useRotatingLine(lines: readonly string[], intervalMs = 6000) {
  const [index, setIndex] = useState(() => nextIndex(lines.length, null))
  const [fading, setFading] = useState(false)
  const fadeTimer = useRef<number | undefined>(undefined)

  const next = useCallback(() => {
    window.clearTimeout(fadeTimer.current)
    if (prefersReducedMotion()) {
      setIndex((i) => nextIndex(lines.length, i))
      return
    }
    setFading(true)
    fadeTimer.current = window.setTimeout(() => {
      setIndex((i) => nextIndex(lines.length, i))
      setFading(false)
    }, FADE_MS)
  }, [lines.length])

  useEffect(() => {
    if (lines.length <= 1) return
    const id = window.setTimeout(next, intervalMs)
    return () => window.clearTimeout(id)
  }, [index, lines.length, intervalMs, next])

  useEffect(() => () => window.clearTimeout(fadeTimer.current), [])

  return { line: lines[index] ?? '', fading, next }
}
