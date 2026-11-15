// 대화 고르기(CHOICE_DIALOGUE)의 앞선 대화 나누기.
// 백엔드는 앞선 대화를 prompt 문자열 하나로 준다. 실제 문제은행 형식:
//   나: "질문"\nAI: "답"\n나: "반박"\n→ 이어지는 AI 답이 다른 두 대화 중 AI가 말을 바꾼 쪽은?
// - 줄이 "나:" / "사용자:" / "AI:"로 시작하면 말풍선 하나
// - "→"로 시작하는 줄은 말풍선이 아니라 안내 문구(note)
// - 말하는 사람 없이 시작하는 앞부분은 상황 설명(intro)
// - 말 앞뒤를 감싼 따옴표는 뗀다

export type DialogueTurn = { who: 'USER' | 'AI'; text: string }
export type ParsedDialogue = { intro: string | null; turns: DialogueTurn[]; note: string | null }

const SPEAKER = /^\s*(사용자|나|AI)\s*[:：]\s*/
const NOTE = /^\s*(→|->|※)\s*/
const QUOTES: [string, string][] = [
  ['"', '"'],
  ['“', '”'],
  ["'", "'"],
  ['‘', '’'],
]

/** 말 전체를 감싼 따옴표 한 쌍을 뗀다: "안녕" → 안녕 */
export function unquote(text: string): string {
  const t = text.trim()
  for (const [open, close] of QUOTES) {
    if (t.length >= 2 && t.startsWith(open) && t.endsWith(close)) return t.slice(1, -1).trim()
  }
  return t
}

export function splitDialogue(prompt: string): ParsedDialogue {
  const turns: DialogueTurn[] = []
  const intro: string[] = []
  const note: string[] = []
  for (const line of prompt.split(/\r?\n/)) {
    if (!line.trim()) continue
    const n = line.match(NOTE)
    if (n) {
      note.push(line.slice(n[0].length).trim())
      continue
    }
    const m = line.match(SPEAKER)
    if (m) turns.push({ who: m[1] === 'AI' ? 'AI' : 'USER', text: line.slice(m[0].length) })
    else if (note.length) note.push(line.trim())
    else if (turns.length) turns[turns.length - 1].text += '\n' + line
    else intro.push(line.trim())
  }
  return {
    intro: intro.length ? intro.join('\n') : null,
    turns: turns.map((t) => ({ ...t, text: unquote(t.text) })),
    note: note.length ? note.join('\n') : null,
  }
}

/** 말풍선만 필요할 때. 말하는 사람이 하나도 없으면 null → 원문 그대로 보여 준다 */
export function parseDialogue(prompt: string): DialogueTurn[] | null {
  const { turns } = splitDialogue(prompt)
  return turns.length ? turns : null
}

/** 선택지처럼 한 사람의 말 하나일 때 "AI: " 같은 앞머리와 따옴표를 뗀다 */
export function stripSpeaker(text: string): string {
  const m = text.match(SPEAKER)
  return m ? unquote(text.slice(m[0].length)) : text
}
