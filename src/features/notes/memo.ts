// 오답 메모 = "왜 이 답을 믿었나요?" 이유 하나 + 자유 메모(선택).
// 백엔드는 문자열 하나(1~500자)로 저장하므로 "이유 — 메모" 형태로 합쳐 보내고, 읽을 때 다시 나눈다.
export const MEMO_REASONS = [
  '숫자가 구체적이어서',
  '출처·기관명이 있어서',
  '말투가 확실해서',
  '내 생각과 같아서',
  '그냥 감',
] as const
export type MemoReason = (typeof MEMO_REASONS)[number]

const SEP = ' — '
export const MEMO_MAX = 500

export function buildMemo(reason: MemoReason | null, text: string): string {
  const t = text.trim()
  if (reason && t) return `${reason}${SEP}${t}`
  return reason ?? t
}

export function parseMemo(memo: string | null): { reason: MemoReason | null; text: string } {
  if (!memo) return { reason: null, text: '' }
  const reason = MEMO_REASONS.find((r) => memo === r || memo.startsWith(r + SEP)) ?? null
  if (!reason) return { reason: null, text: memo }
  return { reason, text: memo.slice(reason.length + SEP.length).trim() }
}
