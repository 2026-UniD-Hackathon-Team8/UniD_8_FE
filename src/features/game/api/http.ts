// 게임 기능 전용 HTTP 헬퍼.
// 팀 공용 API 클라이언트가 생기면 그쪽으로 옮기고 이 파일은 지운다.
import type { ApiEnvelope, GameErrorCode, StreakErrorCode } from './types'

type ErrorCode = GameErrorCode | StreakErrorCode

/** VITE_API_BASE_URL이 없으면 같은 출처(/api)로 보낸다. 로컬에서는 Vite 프록시를 쓴다(README 참고). */
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

/** 기기 UUID 저장 키. 게스트 시작(ST_01) 담당이 키를 정하면 setDeviceIdProvider로 바꾼다. */
export const DEFAULT_DEVICE_ID_KEY = 'damideo:deviceId'

let deviceIdProvider: () => string | null = () => {
  try {
    return localStorage.getItem(DEFAULT_DEVICE_ID_KEY)
  } catch {
    return null
  }
}

/** 게스트 계정 담당 코드가 기기 ID를 어디서 읽을지 지정한다. */
export function setDeviceIdProvider(provider: () => string | null): void {
  deviceIdProvider = provider
}

export class ApiError extends Error {
  readonly status: number
  readonly code: ErrorCode | string
  readonly errors: Record<string, string>

  constructor(status: number, code: string, message: string, errors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

export function isApiError(e: unknown, code?: ErrorCode): e is ApiError {
  return e instanceof ApiError && (code === undefined || e.code === code)
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const deviceId = deviceIdProvider()
  if (deviceId) headers['X-Device-Id'] = deviceId
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해주세요.')
  }

  // 204 No Content: 본문이 없는 정상 응답 (예: 진행 중인 판이 없을 때 GET /api/games/current)
  if (res.status === 204) return undefined as T

  let json: ApiEnvelope<T> | null = null
  try {
    json = (await res.json()) as ApiEnvelope<T>
  } catch {
    // 본문이 JSON이 아니면 아래에서 상태 코드로만 처리한다.
  }

  if (json && json.success && res.ok) return json.data
  if (json && !json.success) {
    throw new ApiError(res.status, json.code, json.message, json.errors ?? {})
  }
  // 502·503·504에 JSON 본문이 없으면 백엔드까지 못 간 것 (로컬 백엔드가 꺼져 있어 Vite 프록시가 502를 주는 경우 등)
  if ([502, 503, 504].includes(res.status)) {
    throw new ApiError(res.status, 'NETWORK_ERROR', '서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.')
  }
  throw new ApiError(res.status, 'INTERNAL_ERROR', '서버에서 문제가 발생했습니다.')
}
