// 프로필 API (PF_01·PF_02 프로필 조회, ST_03 닉네임 변경)
import { request } from '../../game/api/http'
import type { ProfileResponse, UpdateNicknameRequest, UpdateNicknameResponse } from './types'

/** 내 프로필. 등록되지 않은 기기면 ApiError(USER_NOT_FOUND). */
export function getMyProfile(signal?: AbortSignal) {
  return request<ProfileResponse>('GET', '/api/users/me/profile', undefined, signal)
}

/** 닉네임을 바꾼다. 앞뒤 공백은 지워서 보낸다. */
export function updateNickname(nickname: string, signal?: AbortSignal) {
  const body: UpdateNicknameRequest = { nickname: nickname.trim() }
  return request<UpdateNicknameResponse>('PATCH', '/api/users/me/nickname', body, signal)
}
