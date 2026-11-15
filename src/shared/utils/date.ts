/* 날짜 도우미 — 모두 사용자의 현지 날짜 기준 'YYYY-MM-DD' */
export function todayStr(d: Date = new Date()): string {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
export function dayShift(n: number, base: Date = new Date()): string {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return todayStr(d)
}
/** 오늘이 이번 주 월요일로부터 며칠째인지 (월=0 … 일=6) */
export function mondayOffset(d: Date = new Date()): number {
  return (d.getDay() + 6) % 7
}
export const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일']
