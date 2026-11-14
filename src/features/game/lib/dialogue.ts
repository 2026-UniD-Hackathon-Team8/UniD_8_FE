// 대화 고르기(CHOICE_DIALOGUE)의 앞선 대화 나누기.
// 백엔드는 앞선 대화를 prompt 문자열 하나로 준다(형식 미정).
// 임시 규칙: 줄이 "사용자:" 또는 "AI:"로 시작하면 말풍선으로 나눈다. 하나도 없으면 null → 원문 그대로 보여 준다.
// 백엔드와 형식이 정해지면 이 함수만 고친다.

export type DialogueTurn = { who: 'USER' | 'AI'; text: string }

const SPEAKER = /^\s*(사용자|AI)\s*[:：]\s*/

export function parseDialogue(prompt: string): DialogueTurn[] | null {
  const turns: DialogueTurn[] = []
  for (const line of prompt.split(/\r?\n/)) {
    const m = line.match(SPEAKER)
    if (m) {
      turns.push({ who: m[1] === 'AI' ? 'AI' : 'USER', text: line.slice(m[0].length) })
    } else if (turns.length && line.trim()) {
      turns[turns.length - 1].text += '\n' + line
    }
  }
  return turns.length ? turns : null
}
