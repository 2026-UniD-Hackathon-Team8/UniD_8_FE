// 프로필(PF_01, PF_02)과 닉네임 변경(ST_03) 타입. 백엔드 UniD_8_BE dev 브랜치의 ProfileResponse 기준.
// 백엔드가 바뀌면 Swagger(/swagger-ui.html)를 보고 여기만 고친다.
import type { QuestionCategory } from '../../game/api/types'

/** 약점 유형 코드 (백엔드 WeakType) */
export type WeakTypeCode =
  | 'EVIDENCE_TRUSTER'
  | 'CONTEXT_MISSER'
  | 'LOGIC_ILLUSION'
  | 'TIME_CONFUSED'
  | 'LED_ALONG'
  | 'DETECTIVE'

/** 백엔드 에러 코드 중 닉네임 변경에서 오는 것 */
export type ProfileErrorCode =
  | 'NICKNAME_DUPLICATED' // 409 이미 쓰는 닉네임
  | 'INVALID_INPUT' // 400 2~10자가 아님 (errors.nickname에 문구)
  | 'USER_NOT_FOUND' // 401 등록되지 않은 기기 → 게스트 시작으로

/** 데일리 연속 기록 */
export type ProfileStreak = {
  /** 지금 이어지는 연속 일수 (상단 '연속 N일', 통계 '데일리 연속') */
  current: number
  /** 최장 연속 일수 (통계 '최장 연속') */
  longest: number
  /** 오늘 데일리를 마쳤는지 ('오늘 아직' 표시) */
  completedToday: boolean
}

/** 유형 판정 진행도. solved가 required(20) 이상이어야 유형이 열린다 */
export type WeakTypeProgress = {
  /** 처음 푼 답 수 (통계 '푼 문제') */
  solved: number
  required: number
}

/** 아직 유형을 판정할 만큼 풀지 않았을 때 ('아직 없어요') */
export type WeakTypeAnalyzing = {
  status: 'ANALYZING'
  code: null
  name: null
  weakCategory: null
  strongCategory: null
  checkQuestion: null
  progress: WeakTypeProgress
}

/** 유형이 정해졌을 때 */
export type WeakTypeDecided = {
  status: 'DECIDED'
  code: WeakTypeCode
  /** 유형 이름 (예: 근거 맹신형) */
  name: string
  /** 약한 계열. 탐정형이면 null */
  weakCategory: QuestionCategory | null
  /** 정답률이 가장 높은 계열 */
  strongCategory: QuestionCategory | null
  /** 확인 질문. 탐정형이면 null */
  checkQuestion: string | null
  progress: WeakTypeProgress
}

export type WeakTypeView = WeakTypeAnalyzing | WeakTypeDecided

/** 프로필 조회 응답 (GET /api/users/me/profile) */
export type ProfileResponse = {
  nickname: string
  streak: ProfileStreak
  /** 연승 챌린지 최고 기록 (이름 아래 '최장 N연승') */
  bestWinStreak: number
  weakType: WeakTypeView
}

/** 닉네임 변경 요청 (PATCH /api/users/me/nickname) */
export type UpdateNicknameRequest = { nickname: string }

/** 닉네임 변경 응답 */
export type NicknameResponse = { nickname: string }
