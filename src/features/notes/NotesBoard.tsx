// 오답 보드: 계열별로 틀린 문제 카드를 붙이고, 노란 실로 이어 준다.
// 실 위치는 화면 크기에 따라 달라지므로 그린 뒤 DOM 위치를 재서 SVG에 직접 그린다(상태 변경 없음).
import { useLayoutEffect, useRef } from 'react'
import { parseDialogue } from '../game'
import TypeAvatar from '../../shared/components/TypeAvatar'
import { CAT_FROM_API, CAT_ORDER, CATS } from '../../shared/constants/domain'
import type { CatKey } from '../../shared/constants/domain'
import type { WrongAnswerItem } from './api'
import { parseMemo } from './memo'

interface Props {
  items: WrongAnswerItem[]
  title: string
  /** 전체 보기일 때만 가장 많이 틀린 계열·유형을 보여 준다 */
  showTop: boolean
  footer?: React.ReactNode
  onOpen: (item: WrongAnswerItem) => void
}

const rot = (n: number, span = 4) => (n % (span * 2 + 1)) - span

/** 카드에는 질문 첫 줄만. 대화 고르기는 '사용자:' 같은 화자 표시를 뗀다 */
const cardText = (prompt: string) => parseDialogue(prompt)?.[0]?.text ?? prompt.split('\n')[0]

function drawYarn(board: HTMLDivElement, svg: SVGSVGElement) {
  const B = board.getBoundingClientRect()
  const w = board.clientWidth
  const h = board.scrollHeight
  svg.setAttribute('width', String(w))
  svg.setAttribute('height', String(h))
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  const at = (el: Element) => {
    const r = (el.querySelector('.pin') ?? el).getBoundingClientRect()
    return [r.left + r.width / 2 - B.left, r.top + r.height / 2 - B.top]
  }
  let d = ''
  board.querySelectorAll<HTMLElement>('[data-link]').forEach((el) => {
    const parent = board.querySelector(`#${el.dataset.link}`)
    if (!parent) return
    const [x1, y1] = at(parent)
    const [x2, y2] = at(el)
    const len = Math.hypot(x2 - x1, y2 - y1)
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2 + Math.min(60, len * 0.2)
    d += `<path d="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}" stroke="var(--y)" stroke-width="1.6" fill="none" opacity=".8"/>`
  })
  svg.innerHTML = d
}

export default function NotesBoard({ items, title, showTop, footer, onOpen }: Props) {
  const boardRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const byCat = new Map<CatKey, WrongAnswerItem[]>()
  items.forEach((it) => {
    const c = CAT_FROM_API[it.category]
    if (c) byCat.set(c, [...(byCat.get(c) ?? []), it])
  })
  const cats = CAT_ORDER.filter((c) => byCat.has(c))
  const max = Math.max(0, ...cats.map((c) => byCat.get(c)!.length))
  const tops = cats.filter((c) => byCat.get(c)!.length === max)

  useLayoutEffect(() => {
    const board = boardRef.current
    const svg = svgRef.current
    if (!board || !svg) return
    const draw = () => drawYarn(board, svg)
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(board)
    void document.fonts?.ready.then(draw)
    return () => ro.disconnect()
  }, [items])

  return (
    <div className="board" ref={boardRef}>
      <svg className="yarn" ref={svgRef} aria-hidden="true" />
      <div className="paper ov bn" id="ov">
        <div className="pin" />
        <div className="t-lbl">{title}</div>
        <div className="t-h2">틀린 문제 {items.length}개</div>
        {showTop && cats.length > 0 && (
          <div className="ov-top">
            가장 많이 틀린 계열:{' '}
            {tops.length > 1 ? (
              <>
                <b>{tops.map((c) => CATS[c].name).join(' · ')}</b> (같은 수)
              </>
            ) : (
              <>
                <b>{CATS[tops[0]].name}</b> → {CATS[tops[0]].type}
              </>
            )}
          </div>
        )}
      </div>

      {cats.map((c) => (
        <div className="grp" key={c}>
          <div
            className="paper hub bn"
            id={`h-${c}`}
            data-link="ov"
            style={{ '--sc': CATS[c].color, transform: `rotate(${rot(CATS[c].no, 2)}deg)` } as React.CSSProperties}
          >
            <div className="pin" />
            <span className="cnt">{byCat.get(c)!.length}</span>
            <div className="av">
              <TypeAvatar type={c} size={84} />
            </div>
            <div className="nm">{CATS[c].name} 계열</div>
            <div className="qt">{CATS[c].check}</div>
          </div>
          {byCat.get(c)!.map((it) => {
            const { reason, text } = parseMemo(it.memo)
            return (
              <button
                key={it.questionId}
                className="paper evi bn"
                data-link={`h-${c}`}
                style={{ transform: `rotate(${rot(it.questionId)}deg)` }}
                onClick={() => onOpen(it)}
              >
                <div className="pin" />
                <div className="q">{cardText(it.prompt)}</div>
                <div className="tr">{it.tacticName}</div>
                {it.memo && <div className="sticky">{reason ?? text}</div>}
              </button>
            )
          })}
        </div>
      ))}
      {footer}
    </div>
  )
}
