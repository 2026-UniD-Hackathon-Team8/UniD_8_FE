// 마지막 방문 날짜를 localStorage에 남기고, 직전 방문 후 며칠 지났는지 돌려준다.
// 서버 API에 방문 기록이 없어서 이 기기·이 브라우저 기준이다.
import { useEffect, useState } from 'react'
import { todayStr } from '../../../shared/utils/date'

const LAST_VISIT_KEY = 'damideo:profileLastVisit'
const DAY_MS = 24 * 60 * 60 * 1000

function readLastVisit(): string | null {
  try {
    return localStorage.getItem(LAST_VISIT_KEY)
  } catch {
    return null
  }
}

function writeLastVisit(date: string): void {
  try {
    localStorage.setItem(LAST_VISIT_KEY, date)
  } catch {
    // 저장소를 못 쓰면 다음 방문 때 첫 방문으로 본다.
  }
}

/** 'YYYY-MM-DD' 두 날짜 사이 일수. 형식이 이상하면 null */
function daysBetween(from: string, to: string): number | null {
  const a = Date.parse(`${from}T00:00:00`)
  const b = Date.parse(`${to}T00:00:00`)
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.round((b - a) / DAY_MS)
}

/** 직전 방문 후 지난 일수. 첫 방문이면 null */
export function useLastVisit(): number | null {
  const [daysAway] = useState(() => {
    const prev = readLastVisit()
    return prev ? daysBetween(prev, todayStr()) : null
  })

  useEffect(() => {
    writeLastVisit(todayStr())
  }, [])

  return daysAway
}
