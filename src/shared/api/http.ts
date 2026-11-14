// 팀 공용 API 클라이언트. 백엔드 공통 응답({ success, code, message, data })을 풀고, 실패는 ApiError로 던진다.
// 기기 ID는 X-Device-Id 헤더로 보낸다 (FE A의 features/game/api/http.ts와 같은 규칙·같은 저장 키).
import { getDeviceId } from '../store/guest'

/** VITE_API_BASE_URL이 없으면 같은 출처(/api)로 보낸다. 로컬에서는 Vite 프록시가 받는다. */
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ''

/** true면 FE C 화면이 가짜 데이터로 동작한다 (.env.local의 VITE_USE_MOCK) */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

type Envelope<T> =
  | { success: true; code: string; message: string; data: T }
  | { success: false; code: string; message: string; errors?: Record<string, string> }

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly errors: Record<string, string>

  constructor(status: number, code: string, message: string, errors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

export function isApiError(e: unknown, code?: string): e is ApiError {
  return e instanceof ApiError && (code === undefined || e.code === code)
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface Options {
  body?: unknown
  /** false면 X-Device-Id를 보내지 않는다 (게스트 계정 생성) */
  withDevice?: boolean
  signal?: AbortSignal
}

export async function request<T>(method: Method, path: string, opts: Options = {}): Promise<T> {
  const { body, withDevice = true, signal } = opts
  const headers: Record<string, string> = { Accept: 'application/json' }
  const deviceId = withDevice ? getDeviceId() : null
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

  let json: Envelope<T> | null = null
  try {
    json = (await res.json()) as Envelope<T>
  } catch {
    // 본문이 JSON이 아니면 아래에서 상태 코드로만 처리한다.
  }

  if (json && json.success && res.ok) return json.data
  if (json && !json.success) throw new ApiError(res.status, json.code, json.message, json.errors ?? {})
  throw new ApiError(res.status, res.status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR', '서버에서 문제가 발생했습니다.')
}

/** 가짜 데이터 응답을 조금 늦게 돌려준다 (로딩 화면 확인용) */
export const mockDelay = (ms = 150) => new Promise<void>((r) => setTimeout(r, ms))
