// 백엔드 없이 화면을 만들 때 쓰는 가짜 데이터.
// .env.local에 VITE_USE_MOCK=true를 두면 훅이 실제 API 대신 이 파일을 쓴다 (shared/api/http.ts의 USE_MOCK).
import { ApiError, mockDelay } from '../../../shared/api/http'
import type { NicknameResponse, ProfileResponse } from '../api/types'

/** 막 시작한 사용자 (캡처 07, 08 화면 그대로) */
export const MOCK_PROFILE_NEW: ProfileResponse = {
  nickname: '서영',
  streak: { current: 0, longest: 0, completedToday: false },
  bestWinStreak: 0,
  weakType: {
    status: 'ANALYZING',
    code: null,
    name: null,
    weakCategory: null,
    strongCategory: null,
    checkQuestion: null,
    progress: { solved: 0, required: 20 },
  },
}

/** 20문제 넘게 풀어 근거 맹신형이 된 사용자 */
export const MOCK_PROFILE_PLAYED: ProfileResponse = {
  nickname: '서영',
  streak: { current: 3, longest: 5, completedToday: true },
  bestWinStreak: 7,
  weakType: {
    status: 'DECIDED',
    code: 'EVIDENCE_TRUSTER',
    name: '근거 맹신형',
    weakCategory: 'EVIDENCE',
    strongCategory: 'TIMELINE',
    checkQuestion: '근거가 실제로 있나?',
    progress: { solved: 42, required: 20 },
  },
}

/** 모든 계열 정답률이 80% 이상인 탐정형 사용자 */
export const MOCK_PROFILE_DETECTIVE: ProfileResponse = {
  nickname: '서영',
  streak: { current: 12, longest: 12, completedToday: true },
  bestWinStreak: 25,
  weakType: {
    status: 'DECIDED',
    code: 'DETECTIVE',
    name: '탐정형',
    weakCategory: null,
    strongCategory: 'LOGIC',
    checkQuestion: null,
    progress: { solved: 120, required: 20 },
  },
}

/** 이 닉네임으로 바꾸면 NICKNAME_DUPLICATED를 낸다 */
export const MOCK_DUPLICATED_NICKNAME = '다믿어'

const MOCK_DELAY_MS = 300

let mockProfile: ProfileResponse = MOCK_PROFILE_NEW

async function delay(signal?: AbortSignal): Promise<void> {
  await mockDelay(MOCK_DELAY_MS)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
}

/** 가짜 프로필로 바꾼다 (예: setMockProfile(MOCK_PROFILE_PLAYED)) */
export function setMockProfile(profile: ProfileResponse): void {
  mockProfile = profile
}

export async function getMockProfile(signal?: AbortSignal): Promise<ProfileResponse> {
  await delay(signal)
  return mockProfile
}

export async function updateMockNickname(nickname: string, signal?: AbortSignal): Promise<NicknameResponse> {
  await delay(signal)
  const trimmed = nickname.trim()
  if (trimmed === MOCK_DUPLICATED_NICKNAME) {
    throw new ApiError(409, 'NICKNAME_DUPLICATED', '이미 사용 중인 닉네임입니다.')
  }
  mockProfile = { ...mockProfile, nickname: trimmed }
  return { nickname: trimmed }
}
