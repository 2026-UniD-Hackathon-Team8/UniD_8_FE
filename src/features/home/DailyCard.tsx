// 오늘의 5문제 — 5칸 진행 · 연속 기록 · 이번 주 7칸
// 계열은 문제를 푼 뒤에만 보여 준다: 다 풀면 결과 API로 칸마다 O/X와 계열을 채우고, 푸는 중에는 푼 칸만 표시한다.
import { useNavigate } from 'react-router-dom'
import { CAT_FROM_API, CATS } from '../../shared/constants/domain'
import type { HomeResponse } from '../../shared/api/home'
import { useAsync } from '../../shared/hooks/useAsync'
import { dayShift, mondayOffset, todayStr, WEEK_LABELS } from '../../shared/utils/date'
import { fetchDailyCalendar, fetchDailyResult } from './api'
import type { DailyResultItem } from './api'

interface Props {
  daily: HomeResponse['daily']
  streak: HomeResponse['streak']
}

const loadResult = (done: boolean): Promise<DailyResultItem[] | null> =>
  done ? fetchDailyResult() : Promise.resolve(null)

export default function DailyCard({ daily, streak }: Props) {
  const nav = useNavigate()
  const done = daily.status === 'COMPLETED'
  const { data: result } = useAsync(loadResult, done)
  const { data: calendar } = useAsync(fetchDailyCalendar, null)

  const doneDates = new Set((calendar ?? []).filter((d) => d.completed).map((d) => d.date))
  const dow = mondayOffset()
  const week = WEEK_LABELS.map((label, i) => ({ label, date: dayShift(i - dow) }))
  const total = daily.total || 5
  const label = done ? '오늘 완료 · 내일 또 만나요' : daily.solvedCount > 0 ? '데일리 이어 하기' : '오늘의 5문제 풀기'

  return (
    <section className="blk">
      <div className="hd">
        <h2 className="t-h2">오늘의 5문제</h2>
        <span className="st">{done ? `${total} / ${total} 완료` : `${daily.solvedCount} / ${total}`}</span>
      </div>
      <p className="t-cap mt4">
        연속 <b className="streak-n">{streak.current}일</b> · 최장 {streak.longest}일 · 하루 한 번 끝내면 1일 늘어요
      </p>

      <div className="slots">
        {Array.from({ length: total }, (_, i) => {
          const r = result?.find((q) => q.seq === i + 1)
          if (r) {
            const cat = CAT_FROM_API[r.category]
            return (
              <div key={i} className={`slot ${r.correct ? 'ok' : 'no'}`}>
                {r.correct ? 'O' : 'X'}
                <small>{cat ? CATS[cat].name : ''}</small>
              </div>
            )
          }
          if (i < daily.solvedCount) {
            return (
              <div key={i} className="slot solved">
                ✓<small>풀었음</small>
              </div>
            )
          }
          return (
            <div key={i} className={`slot ${!done && i === daily.solvedCount ? 'next' : ''}`}>
              {i + 1}
              <small>&nbsp;</small>
            </div>
          )
        })}
      </div>

      <div className="week" aria-label="이번 주 데일리 기록">
        {week.map((d) => (
          <div key={d.date}>
            {d.label}
            <b className={`${doneDates.has(d.date) ? 'on' : ''} ${d.date === todayStr() ? 'today' : ''}`} />
          </div>
        ))}
      </div>

      <button className={`btn ${done ? 'dark' : ''}`} disabled={done} onClick={() => nav('/daily')}>
        {label}
      </button>
    </section>
  )
}
