// 판별 점수 추이 (PF_03): 일반 판·데일리 정답률을 날짜순 선 하나로.
// 실전은 채운 점, 데일리는 빈 점 — 색 하나로 그리고 모양으로 구분한다.
import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { ScorePoint } from '../api'
import s from '../growth.module.css'

const W = 320
const H = 150
const PAD = { l: 30, r: 12, t: 12, b: 22 }
const IW = W - PAD.l - PAD.r
const IH = H - PAD.t - PAD.b

const pct = (p: ScorePoint) => (p.total ? Math.round((p.score / p.total) * 100) : 0)
const md = (date: string) => {
  const [, m, d] = date.split('-').map(Number)
  return `${m}/${d}`
}
const kind = (p: ScorePoint) => (p.sessionType === 'DAILY' ? '데일리' : '실전')

export function ScoreTrendChart({ points }: { points: ScorePoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [active, setActive] = useState<number | null>(null)

  if (points.length < 2) {
    return <p className="t-cap mt8">두 번 이상 풀면 점수 추이가 그려져요.</p>
  }

  const x = (i: number) => PAD.l + (IW * i) / (points.length - 1)
  const y = (v: number) => PAD.t + IH - (IH * v) / 100
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(pct(p)).toFixed(1)}`).join('')
  const last = points.length - 1

  const pick = (e: PointerEvent<SVGSVGElement>) => {
    const box = svgRef.current?.getBoundingClientRect()
    if (!box) return
    const vx = ((e.clientX - box.left) / box.width) * W
    const i = Math.round(((vx - PAD.l) / IW) * last)
    setActive(Math.min(last, Math.max(0, i)))
  }

  const a = active === null ? null : points[active]
  const summary = `정답률 ${pct(points[0])}%에서 ${pct(points[last])}%로, ${points.length}회`

  return (
    <div className={s.chartWrap}>
      <svg
        ref={svgRef}
        className={s.chart}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`점수 추이: ${summary}`}
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={() => setActive(null)}
      >
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line className={s.grid} x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} />
            <text className={s.axisText} x={PAD.l - 6} y={y(v) + 4} textAnchor="end">
              {v}%
            </text>
          </g>
        ))}
        <text className={s.axisText} x={x(0)} y={H - 4} textAnchor="start">
          {md(points[0].date)}
        </text>
        <text className={s.axisText} x={x(last)} y={H - 4} textAnchor="end">
          {md(points[last].date)}
        </text>

        {a && <line className={s.cross} x1={x(active!)} x2={x(active!)} y1={PAD.t} y2={PAD.t + IH} />}
        <path className={s.line} d={path} />
        {points.map((p, i) => (
          <circle
            key={i}
            className={[p.sessionType === 'DAILY' ? s.dotDaily : s.dotGame, i === active && s.dotActive]
              .filter(Boolean)
              .join(' ')}
            cx={x(i)}
            cy={y(pct(p))}
            r={i === active ? 5.5 : 4}
          />
        ))}
      </svg>

      {a && (
        <div
          className={`${s.tip} ${pct(a) >= 50 ? s.tipBelow : ''}`}
          style={{
            // 양 끝에서 말풍선이 카드 밖으로 나가지 않게 15~85% 안에 둔다
            left: `${Math.min(85, Math.max(15, (x(active!) / W) * 100))}%`,
            // 점이 위쪽이면 말풍선을 점 아래에 둬서 범례를 가리지 않는다
            top: pct(a) >= 50 ? `calc(${(y(pct(a)) / H) * 100}% + 12px)` : `calc(${(y(pct(a)) / H) * 100}% - 12px)`,
          }}
        >
          {pct(a)}%
          <span>
            {md(a.date)} {kind(a)} · {a.score}/{a.total}
          </span>
        </div>
      )}

      <table className={s.srOnly}>
        <caption>회차별 점수</caption>
        <tbody>
          {points.map((p, i) => (
            <tr key={i}>
              <td>{p.date}</td>
              <td>{kind(p)}</td>
              <td>
                {p.score}/{p.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
