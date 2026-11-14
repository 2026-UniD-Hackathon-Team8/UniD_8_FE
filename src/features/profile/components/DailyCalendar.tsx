// 최근 4주 데일리 달력 자리 (데이터는 /api/users/me/daily-calendar 연결 후 채운다)
import s from '../styles/profile.module.css'

const WEEKS = 4
const DAYS = 7

/** 월요일 시작 기준 오늘의 요일 칸 (0~6) */
const todayColumn = () => (new Date().getDay() + 6) % 7

export function DailyCalendar({ completedToday }: { completedToday: boolean }) {
  const todayIndex = (WEEKS - 1) * DAYS + todayColumn()
  return (
    <section className={s.card}>
      <div className={s.sectionHead}>
        <h2 className="t-h2">최근 4주 데일리</h2>
        <span className="t-cap">{completedToday ? '오늘 완료' : '오늘 아직'}</span>
      </div>
      <ol className={s.calendar} aria-label="최근 4주 데일리 기록">
        {Array.from({ length: WEEKS * DAYS }, (_, i) => (
          <li
            key={i}
            className={`${s.day} ${i === todayIndex ? s.dayToday : ''} ${i > todayIndex ? s.dayFuture : ''} ${
              i === todayIndex && completedToday ? s.dayDone : ''
            }`}
            aria-current={i === todayIndex ? 'date' : undefined}
          />
        ))}
      </ol>
    </section>
  )
}
