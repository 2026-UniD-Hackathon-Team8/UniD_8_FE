// 프로필(PF_01, PF_02)과 닉네임 변경(ST_03) 타입.
// 백엔드 DTO를 아직 못 봐서 화면(docs/screens/07, 08) 기준으로 필드를 정했다.
// 백엔드가 확정되면 Swagger(/swagger-ui.html)를 보고 여기만 고친다.
import type { QuestionCategory } from '../../game/api/types'

/** 약점 유형. 다섯 '?' 유형은 계열과 같고, 1문제 이하로 틀리면 '!' 탐정형 */
export type WeaknessType = QuestionCategory | 'DETECTIVE'

/** 프로필 조회 응답 (GET /api/users/me/profile) */
export type ProfileResponse = {
  userId: number
  nickname: string
  /** 게스트 계정이면 true (이름 아래 '게스트' 표시) */
  guest: boolean
  /** 데일리 연속 일수 (상단 '연속 N일', 통계 '데일리 연속') */
  dailyStreak: number
  /** 최장 데일리 연속 일수 (통계 '최장 연속') */
  bestDailyStreak: number
  /** 연승 챌린지 최고 기록 (이름 아래 '최장 N연승') */
  bestWinStreak: number
  /** 지금까지 푼 문제 수 */
  solvedCount: number
  /** 현재 약점 유형. 실전을 한 판도 안 마쳤으면 null ('아직 없어요') */
  weaknessType: WeaknessType | null
  /** 오답노트에 쌓인 문제 수 */
  wrongAnswerCount: number
}

/** 닉네임 변경 요청 (PATCH /api/users/me/nickname) */
export type UpdateNicknameRequest = { nickname: string }

/** 닉네임 변경 응답 */
export type UpdateNicknameResponse = { nickname: string }
