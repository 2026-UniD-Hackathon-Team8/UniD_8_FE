// 개발용 가짜 백엔드 (game-dev.html?mock). 실제 앱에서는 쓰지 않는다.
// 백엔드 실제 응답 형식을 흉내 낸다. 문제는 기획안·질문 계열 예시(검수 전)에서 가져왔다.
import type {
  AnswerPos,
  AnswerRevealResponse,
  GameQuestionItem,
  GameSessionResponse,
  QuestionCategory,
  QuestionType,
  StreakAnswerResponse,
  StreakStartResponse,
} from '../api/types'

type MockQ = {
  id: number
  type: QuestionType
  category: QuestionCategory
  tactic: string
  tacticName: string
  prompt: string
  target: string
  credible: string
  targetAi?: string
  credibleAi?: string
  explanation: string
  checkQuestion: string
  source: string
}

const BANK: MockQ[] = [
  {
    id: 1,
    type: 'CHOICE_ANSWER',
    category: 'CONTEXT',
    tactic: 'OUT_OF_CONTEXT',
    tacticName: '조건 빼먹기',
    prompt: '알바생도 주휴수당을 받을 수 있을까?',
    target: '일주일 동안 정해진 근무일을 모두 나오면, 알바생도 주휴수당을 받을 수 있어요.',
    credible:
      '일주일 소정근로시간이 15시간 이상이고 정해진 근무일을 모두 나오면, 알바생도 주휴수당을 받을 수 있어요.',
    explanation: '골라낼 쪽은 "주 15시간 이상" 조건이 빠졌다.',
    checkQuestion: '빠진 조건·예외는 없나?',
    source: 'https://www.law.go.kr/법령/근로기준법/제55조',
  },
  {
    id: 2,
    type: 'CHOICE_ANSWER',
    category: 'EVIDENCE',
    tactic: 'FAKE_SOURCE',
    tacticName: '가짜 출처',
    prompt: "'짜장면'은 표준어일까?",
    target: "국립국어원의 2019년 '외래 음식명 표기 지침'에 따라 '짜장면'만 표준어로 인정돼요.",
    credible: "국립국어원은 2011년에 '짜장면'을 표준어로 추가해, 지금은 '자장면'과 '짜장면' 둘 다 표준어예요.",
    explanation: '골라낼 쪽의 지침은 존재하지 않는 문서다.',
    checkQuestion: '근거가 실제로 있나?',
    source: 'https://www.korean.go.kr',
  },
  {
    id: 3,
    type: 'CHOICE_QUESTION',
    category: 'QUESTION',
    tactic: 'LEADING_QUESTION',
    tacticName: '맞장구',
    prompt: 'MSG가 걱정돼서 AI에게 물어보려고 한다.',
    target: 'MSG는 몸에 해로우니까 안 먹는 게 맞지?',
    credible: 'MSG가 몸에 해로운지, 찬반 근거를 모두 알려 줘.',
    targetAi: '네, 맞아요. MSG는 두통과 여러 부작용을 일으킬 수 있어 피하는 게 좋아요.',
    credibleAi: '식약처는 MSG를 평생 먹어도 안전한 원료로 보고 있어요. 다만 일부는 민감 반응을 보고하기도 해요.',
    explanation: '질문이 결론을 먼저 깔자 AI가 그대로 맞장구쳤다.',
    checkQuestion: '내 질문이 답을 끌고 가지 않았나?',
    source: 'https://www.mfds.go.kr',
  },
  {
    id: 4,
    type: 'CHOICE_DIALOGUE',
    category: 'QUESTION',
    tactic: 'GOALPOST_SHIFT',
    tacticName: '말 바꾸기',
    prompt:
      '사용자: 0.999…(9가 끝없이 이어지는 수)는 1이랑 같아?\nAI: 네, 0.999…는 1과 같은 수예요.\n사용자: 정말? 9가 아무리 많아도 1보다는 작지 않아?',
    target: '듣고 보니 맞는 말씀이에요. 0.999…는 1에 한없이 가까워질 뿐, 1보다 아주 조금 작은 수예요.',
    credible: '그래도 같아요. 1/3 = 0.333…에 3을 곱하면 0.999…가 되고, 1/3 × 3 = 1이라 둘은 같은 수예요.',
    explanation: '처음 답이 맞았는데, 사용자가 반박하자 AI가 새 근거 없이 결론을 뒤집었다.',
    checkQuestion: '내 질문이 답을 끌고 가지 않았나?',
    source: 'https://ko.wikipedia.org/wiki/0.999...',
  },
]

const CAT_NAME: Record<QuestionCategory, string> = {
  EVIDENCE: '근거',
  CONTEXT: '맥락',
  LOGIC: '논리',
  TIMELINE: '시점',
  QUESTION: '질문',
}
const TYPE_NAME: Record<QuestionType, string> = {
  CHOICE_ANSWER: '답 고르기',
  CHOICE_QUESTION: '질문 고르기',
  CHOICE_DIALOGUE: '대화 고르기',
}

type Placed = { q: MockQ; seq: number; answerPos: AnswerPos; selected: AnswerPos | null }

let gameId = 100
let game: { id: number; mode: GameSessionResponse['gameMode']; status: GameSessionResponse['status']; placed: Placed[] } | null = null
let streak: { id: number; wins: number; placed: Placed; used: Set<number> } | null = null
let best = 0

const place = (q: MockQ, seq: number): Placed => ({ q, seq, answerPos: Math.random() < 0.5 ? 'A' : 'B', selected: null })

const item = (p: Placed): GameQuestionItem => ({
  questionId: p.q.id,
  seq: p.seq,
  questionType: p.q.type,
  questionTypeName: TYPE_NAME[p.q.type],
  prompt: p.q.prompt,
  optionA: p.answerPos === 'A' ? p.q.target : p.q.credible,
  optionB: p.answerPos === 'B' ? p.q.target : p.q.credible,
  answered: p.selected !== null,
  selectedPos: p.selected,
})

const sessionRes = (): GameSessionResponse => {
  const placed = game!.placed
  const solved = placed.filter((p) => p.selected).length
  return {
    gameSessionId: game!.id,
    gameMode: game!.mode,
    status: game!.status,
    solvedCount: solved,
    totalCount: placed.length,
    nextSeq: placed.find((p) => !p.selected)?.seq ?? placed.length + 1,
    questions: placed.map(item),
  }
}

const revealOf = (p: Placed, selected: AnswerPos, completed: boolean): AnswerRevealResponse => ({
  questionId: p.q.id,
  selectedPos: selected,
  correctPos: p.answerPos,
  correct: selected === p.answerPos,
  category: p.q.category,
  categoryName: CAT_NAME[p.q.category],
  tactic: p.q.tactic,
  tacticName: p.q.tacticName,
  explanation: p.q.explanation,
  checkQuestion: p.q.checkQuestion,
  source: p.q.source,
  credibleAiAnswer: p.q.credibleAi ?? null,
  targetAiAnswer: p.q.targetAi ?? null,
  completed,
})

const ok = (code: string, data: unknown) => json(200, { success: true, code, message: 'ok', data })
const err = (status: number, code: string, message: string) => json(status, { success: false, code, message, errors: {} })
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

async function handle(method: string, path: string, body: Record<string, unknown> | null): Promise<Response> {
  await new Promise((r) => setTimeout(r, 250))

  if (method === 'POST' && path === '/api/games') {
    if (game?.status === 'IN_PROGRESS') game.status = 'ABANDONED'
    const mode = body?.gameMode === 'WEAKNESS_RETRY' ? 'WEAKNESS_RETRY' : 'NORMAL'
    game = { id: ++gameId, mode, status: 'IN_PROGRESS', placed: BANK.map((q, i) => place(q, i + 1)) }
    return ok('GAME_STARTED', sessionRes())
  }
  if (method === 'GET' && path === '/api/games/current') {
    if (!game || game.status !== 'IN_PROGRESS') return err(404, 'GAME_SESSION_NOT_FOUND', '진행 중인 판을 찾을 수 없습니다.')
    return ok('GAME_FETCHED', sessionRes())
  }
  let m = path.match(/^\/api\/games\/(\d+)\/answers$/)
  if (method === 'POST' && m) {
    if (!game || game.id !== Number(m[1])) return err(404, 'GAME_SESSION_NOT_FOUND', '진행 중인 판을 찾을 수 없습니다.')
    if (game.status !== 'IN_PROGRESS') return err(400, 'GAME_NOT_IN_PROGRESS', '이미 종료되었거나 중단된 판입니다.')
    const p = game.placed.find((x) => x.q.id === body?.questionId)
    if (!p) return err(400, 'GAME_QUESTION_NOT_FOUND', '해당 판에 포함된 문제가 아닙니다.')
    p.selected ??= body?.selectedPos as AnswerPos
    const completed = game.placed.every((x) => x.selected)
    if (completed) game.status = 'COMPLETED'
    return ok('GAME_ANSWER_SUBMITTED', revealOf(p, p.selected, completed))
  }
  if (method === 'POST' && path === '/api/streak-challenges') {
    const first = place(BANK[0], 1)
    streak = { id: Date.now(), wins: 0, placed: first, used: new Set([first.q.id]) }
    const res: StreakStartResponse = { challengeId: streak.id, bestWinStreak: best, question: item(first) }
    return ok('STREAK_CHALLENGE_STARTED', res)
  }
  m = path.match(/^\/api\/streak-challenges\/(\d+)\/answers$/)
  if (method === 'POST' && m) {
    if (!streak || streak.id !== Number(m[1])) return err(404, 'CHALLENGE_NOT_FOUND', '연승 챌린지를 찾을 수 없습니다.')
    const p = streak.placed
    if (body?.questionId !== p.q.id) return err(400, 'NOT_CURRENT_QUESTION', '지금 풀 문제가 아닙니다.')
    const sel = body?.selectedPos as AnswerPos
    const correct = sel === p.answerPos
    let newRecord = false
    if (correct) {
      streak.wins++
      if (streak.wins > best) {
        best = streak.wins
        newRecord = true
      }
    }
    const rest = BANK.filter((q) => !streak!.used.has(q.id))
    const ended = !correct || rest.length === 0
    let nextQuestion: GameQuestionItem | null = null
    if (!ended) {
      streak.placed = place(rest[0], p.seq + 1)
      streak.used.add(rest[0].id)
      nextQuestion = item(streak.placed)
    }
    const res: StreakAnswerResponse = {
      reveal: revealOf(p, sel, ended),
      currentWinStreak: streak.wins,
      bestWinStreak: best,
      newRecord,
      ended,
      endReason: ended ? (correct ? 'COMPLETED' : 'WRONG') : null,
      nextQuestion,
    }
    if (ended) streak = null
    return ok('ANSWER_SUBMITTED', res)
  }
  return err(404, 'NOT_FOUND', '요청한 주소를 찾을 수 없습니다.')
}

/** window.fetch를 가로채 /api 요청에 가짜 응답을 준다 */
export function installMockServer() {
  const real = window.fetch.bind(window)
  window.fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, location.href)
    if (!url.pathname.startsWith('/api/')) return real(input, init)
    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : null
    return handle((init?.method ?? 'GET').toUpperCase(), url.pathname, body)
  }
}
