// 프로필 API (PF_01·PF_02 프로필 조회, ST_03 닉네임 변경)
import { request } from '../../../shared/api/http'
import type { NicknameResponse, ProfileResponse, UpdateNicknameRequest } from './types'

/** 내 프로필. 등록되지 않은 기기면 ApiError(USER_NOT_FOUND). */
export function getMyProfile(signal?: AbortSignal) {
  return request<ProfileResponse>('GET', '/api/users/me/profile', { signal })
}

/**
 * 닉네임을 바꾼다. 앞뒤 공백은 지워서 보낸다.
 * 2~10자가 아니면 ApiError(INVALID_INPUT), 이미 쓰는 닉네임이면 NICKNAME_DUPLICATED.
 */
export function updateNickname(nickname: string, signal?: AbortSignal) {
  const body: UpdateNicknameRequest = { nickname: nickname.trim() }
  return request<NicknameResponse>('PATCH', '/api/users/me/nickname', { body, signal })
}
