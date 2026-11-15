// 데일리 달력 (PF_05): 최근 4주(월~일) 데일리 완료 여부, 맞힌 개수에 따라 색 농도
// 프로필의 연속 기록 카드 아래에 그대로 넣으면 된다: <DailyCalendar />
import { useState } from 'react'
import { useAsync } from '../../../shared/hooks/useAsync'
import { dayShift, mondayOffset, todayStr, WEEK_LABELS } from '../../../shared/utils/date'
import { fetchCalendar } from '../api'
import type { CalendarDay } from '../api'
import s from '../growth.module.css'

const level = (d: CalendarDay | undefined) => {
  if (!d?.completed) return ''
  if (d.correctCount >= 5) return s.l3
  if (d.correctCount >= 3) return s.l2
  return s.l1
}

const fmt = (date: string) => {
  const [, m, d] = date.split('-').map(Number)
  const dow = WEEK_LABELS[mondayOffset(new Date(date + 'T00:00:00'))]
  return `${m}월 ${d}일(${dow})`
}

const describe = (date: string, d: CalendarDay | undefined) =>
  d?.completed ? `${fmt(date)} · 5문제 중 ${d.correctCount}개 맞힘` : `${fmt(date)} · 안 풀었어요`

export function DailyCalendar() {
  const { data, error, loading, reload } = useAsync(fetchCalendar, 'calendar')
  const [focus, setFocus] = useState<string | null>(null)

  if (error)
    return (
      <div className="card">
        <p className="t-cap">달력을 불러오지 못했어요.</p>
        <button className="link mt8" onClick={reload}>
          다시 시도 →
        </button>
      </div>
    )

  const byDate = new Map((data ?? []).map((d) => [d.date, d]))
  const start = -(21 + mondayOffset()) // 3주 전 월요일
  const today = todayStr()
  const cells = Array.from({ length: 28 }, (_, i) => {
    const offset = start + i
    const date = dayShift(offset)
    return { date, future: offset > 0, day: byDate.get(date) }
  })
  const done = cells.filter((c) => c.day?.completed).length

  return (
    <div className="card">
      <div className="minirow">
        <span className="t-h2">최근 4주 데일리</span>
        <span className="t-cap">{loading ? '불러오는 중…' : `${done}일 완료`}</span>
      </div>

      <div className={s.weekHead} aria-hidden="true">
        {WEEK_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className={s.heat} role="list" aria-label={`최근 4주 중 ${done}일 데일리 완료`}>
        {cells.map(({ date, future, day }) => (
          <i
            key={date}
            role="listitem"
            tabIndex={future ? -1 : 0}
            className={[s.cell, level(day), future && s.future, date === today && s.today].filter(Boolean).join(' ')}
            aria-label={future ? `${fmt(date)} · 아직 오지 않은 날` : describe(date, day)}
            title={future ? undefined : describe(date, day)}
            onPointerEnter={() => !future && setFocus(date)}
            onPointerLeave={() => setFocus(null)}
            onFocus={() => !future && setFocus(date)}
            onBlur={() => setFocus(null)}
            onClick={() => !future && setFocus(date)}
          />
        ))}
      </div>

      <div className="minirow mt8">
        <span className="t-cap" aria-live="polite">
          {focus ? describe(focus, byDate.get(focus)) : '칸을 누르면 그날 기록이 보여요'}
        </span>
        <span className={s.legend} aria-hidden="true">
          적음<i className={`${s.cell} ${s.l1}`} />
          <i className={`${s.cell} ${s.l2}`} />
          <i className={`${s.cell} ${s.l3}`} />
          많음
        </span>
      </div>
    </div>
  )
}
