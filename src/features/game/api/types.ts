// 백엔드 실제 코드(UniD_8_BE dev 브랜치) 기준 타입.
// md 명세와 필드 이름이 다르다. 백엔드가 바뀌면 Swagger(/swagger-ui.html)를 보고 여기만 고친다.

export type AnswerPos = 'A' | 'B'
export type GameMode = 'NORMAL' | 'WEAKNESS_RETRY'
export type GameStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
export type QuestionType = 'CHOICE_ANSWER' | 'CHOICE_QUESTION' | 'CHOICE_DIALOGUE'
export type QuestionCategory = 'EVIDENCE' | 'CONTEXT' | 'LOGIC' | 'TIMELINE' | 'QUESTION'

/** 공통 응답 형식 */
export type ApiSuccess<T> = { success: true; code: string; message: string; data: T }
export type ApiFailure = {
  success: false
  code: string
  message: string
  errors?: Record<string, string>
}
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure

/** 백엔드 에러 코드 (GameErrorCode + CommonErrorCode) + 프론트 전용 NETWORK_ERROR */
export type GameErrorCode =
  | 'GAME_SESSION_NOT_FOUND' // 404 진행 중인 판 없음
  | 'GAME_SESSION_FORBIDDEN' // 403 남의 판
  | 'GAME_NOT_IN_PROGRESS' // 400 끝났거나 버려진 판
  | 'GAME_NOT_COMPLETED' // 400 아직 안 끝난 판의 결과 조회
  | 'GAME_QUESTION_NOT_FOUND' // 400 이 판의 문제가 아님
  | 'NO_ACTIVE_QUESTIONS' // 500 낼 문제가 없음
  | 'INVALID_INPUT' // 400
  | 'USER_NOT_FOUND' // 401 등록되지 않은 기기 → 게스트 시작으로
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'

/** 판 문제 1개. 정답·계열은 들어 있지 않다(답한 뒤 reveal로 받는다). */
export type GameQuestionItem = {
  questionId: number
  seq: number
  questionType: QuestionType
  questionTypeName: string
  /** 질문/상황. 대화 고르기는 앞선 대화가 이 안에 텍스트로 들어 있다(형식 미정). */
  prompt: string
  optionA: string
  optionB: string
  answered: boolean
  selectedPos: AnswerPos | null
}

/** 판 시작 / 이어 하기 응답 */
export type GameSessionResponse = {
  gameSessionId: number
  gameMode: GameMode
  status: GameStatus
  solvedCount: number
  totalCount: number
  /** 다음에 풀 문제의 seq */
  nextSeq: number
  questions: GameQuestionItem[]
}

/** 답 제출 → 정답 공개 응답 (데일리와 공통) */
export type AnswerRevealResponse = {
  questionId: number
  selectedPos: AnswerPos
  /** 골라낼 쪽(= 정답) 위치 */
  correctPos: AnswerPos
  correct: boolean
  category: QuestionCategory
  categoryName: string
  tactic: string
  tacticName: string
  explanation: string
  checkQuestion: string
  /** 출처. 지금은 문자열 하나(여러 개일 때 형식 미정) */
  source: string
  /** 믿을 쪽(correctPos의 반대) 선택지에 대한 AI 답. 유형에 따라 null */
  credibleAiAnswer: string | null
  /** 골라낼 쪽(correctPos) 선택지에 대한 AI 답. 유형에 따라 null */
  targetAiAnswer: string | null
  /** 이 답으로 판(또는 데일리)이 끝났는지 */
  completed: boolean
}

export type StartGameRequest = { gameMode?: GameMode }
export type GameAnswerRequest = { questionId: number; selectedPos: AnswerPos }
