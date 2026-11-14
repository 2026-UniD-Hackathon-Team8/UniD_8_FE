// 백엔드 없이 화면을 만들 때 쓰는 가짜 데이터.
// .env.local에 VITE_PROFILE_MOCK=true를 두면 훅이 실제 API 대신 이 파일을 쓴다.
import type { ProfileResponse, UpdateNicknameResponse } from '../api/types'

export const USE_PROFILE_MOCK: boolean = import.meta.env.VITE_PROFILE_MOCK === 'true'

/** 막 시작한 게스트 (캡처 07, 08 화면 그대로) */
export const MOCK_PROFILE_NEW: ProfileResponse = {
  userId: 1,
  nickname: '서영',
  guest: true,
  dailyStreak: 0,
  bestDailyStreak: 0,
  bestWinStreak: 0,
  solvedCount: 0,
  weaknessType: null,
  wrongAnswerCount: 0,
}

/** 몇 판 풀어 약점 유형이 정해진 사용자 */
export const MOCK_PROFILE_PLAYED: ProfileResponse = {
  userId: 1,
  nickname: '서영',
  guest: true,
  dailyStreak: 3,
  bestDailyStreak: 5,
  bestWinStreak: 7,
  solvedCount: 42,
  weaknessType: 'EVIDENCE',
  wrongAnswerCount: 9,
}

const MOCK_DELAY_MS = 300

let mockProfile: ProfileResponse = { ...MOCK_PROFILE_NEW }

function wait<T>(value: T, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const id = setTimeout(() => resolve(value), MOCK_DELAY_MS)
    signal?.addEventListener('abort', () => {
      clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

/** 가짜 프로필로 바꾼다 (예: setMockProfile(MOCK_PROFILE_PLAYED)) */
export function setMockProfile(profile: ProfileResponse): void {
  mockProfile = { ...profile }
}

export function getMockProfile(signal?: AbortSignal): Promise<ProfileResponse> {
  return wait({ ...mockProfile }, signal)
}

export function updateMockNickname(nickname: string, signal?: AbortSignal): Promise<UpdateNicknameResponse> {
  mockProfile = { ...mockProfile, nickname: nickname.trim() }
  return wait({ nickname: mockProfile.nickname }, signal)
}
