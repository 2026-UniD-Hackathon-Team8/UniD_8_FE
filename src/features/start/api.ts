// POST /api/users — 게스트 계정 생성. 같은 기기면 기존 계정을 돌려준다(X-Device-Id 헤더 없이 호출).
import { mockDelay, request, USE_MOCK } from '../../shared/api/http'

export interface CreateUserResponse {
  userId: number
  nickname: string
  /** false면 이 기기의 기존 계정을 불러온 것 */
  created: boolean
}

export async function createGuest(deviceId: string, nickname: string): Promise<CreateUserResponse> {
  if (USE_MOCK) {
    await mockDelay()
    return { userId: 1, nickname, created: true }
  }
  return request<CreateUserResponse>('POST', '/api/users', { body: { deviceId, nickname }, withDevice: false })
}
