// 길게 눌러 고르기 (프로토타입 bindHold를 React 훅으로 옮김). 스타일과 무관하다.
//
// 사용 예:
//   const hold = useHoldToSelect({ onSelect: (pos) => submit(pos), disabled: submitting })
//   <div {...hold.bind('A')} style={{ '--p': hold.progressOf('A') } as React.CSSProperties}>…</div>
//   {hold.shortTap && <p>{SHORT_TAP_TEXT}</p>}
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { HOLD_MS, SHORT_TAP_MS } from '../constants'
import type { AnswerPos } from '../api/types'

type Options = {
  onSelect: (pos: AnswerPos) => void
  /** 이미 골랐거나 제출 중이면 true */
  disabled?: boolean
  holdMs?: number
}

export function useHoldToSelect({ onSelect, disabled = false, holdMs = HOLD_MS }: Options) {
  const [holding, setHolding] = useState<AnswerPos | null>(null)
  const [progress, setProgress] = useState(0)
  const [shortTap, setShortTap] = useState(false)

  const rafRef = useRef(0)
  const startRef = useRef(0)
  const activeRef = useRef<AnswerPos | null>(null)
  const onSelectRef = useRef(onSelect)
  const disabledRef = useRef(disabled)

  useEffect(() => {
    onSelectRef.current = onSelect
    disabledRef.current = disabled
  })

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    activeRef.current = null
    setHolding(null)
    setProgress(0)
  }, [])

  const start = useCallback(
    (pos: AnswerPos, e: ReactPointerEvent) => {
      if (disabledRef.current || e.button > 0) return
      activeRef.current = pos
      startRef.current = performance.now()
      setHolding(pos)
      setShortTap(false)

      const tick = () => {
        if (activeRef.current !== pos) return
        const p = Math.min(1, (performance.now() - startRef.current) / holdMs)
        setProgress(p)
        if (p >= 1) {
          reset()
          if (navigator.vibrate) navigator.vibrate(20)
          onSelectRef.current(pos)
        } else {
          rafRef.current = requestAnimationFrame(tick)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    },
    [holdMs, reset],
  )

  const stop = useCallback(() => {
    if (!activeRef.current) return
    const held = performance.now() - startRef.current
    reset()
    if (held < SHORT_TAP_MS && !disabledRef.current) setShortTap(true)
  }, [reset])

  /** 선택지 요소에 펼쳐 넣을 이벤트 핸들러 */
  const bind = useCallback(
    (pos: AnswerPos) => ({
      onPointerDown: (e: ReactPointerEvent) => start(pos, e),
      onPointerUp: stop,
      onPointerLeave: stop,
      onPointerCancel: stop,
      onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    }),
    [start, stop],
  )

  /** 해당 선택지의 누름 진행도 0~1 (CSS 변수 --p 등에 넣는다) */
  const progressOf = useCallback((pos: AnswerPos) => (holding === pos ? progress : 0), [holding, progress])

  return { bind, holding, progressOf, shortTap }
}
