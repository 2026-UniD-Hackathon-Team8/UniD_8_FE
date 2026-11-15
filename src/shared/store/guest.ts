// 게스트 정보. 로그인 없이 기기 ID(UUID)로 사용자를 구분한다.
// 저장 키 'damideo:deviceId'는 FE A의 기본 키와 같다.
const DEVICE_KEY = 'damideo:deviceId'
const NICK_KEY = 'damideo:nickname'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export const getDeviceId = () => read(DEVICE_KEY)
export const getNickname = () => read(NICK_KEY)

/** 기기 ID가 없으면 새로 만든다 (게스트 계정 생성 직전에 호출) */
export function ensureDeviceId(): string {
  const cur = read(DEVICE_KEY)
  if (cur) return cur
  const id = crypto.randomUUID()
  localStorage.setItem(DEVICE_KEY, id)
  return id
}

export function saveNickname(nickname: string): void {
  localStorage.setItem(NICK_KEY, nickname)
}

/** 서버에 없는 기기(USER_NOT_FOUND)일 때 지운다 */
export function clearGuest(): void {
  localStorage.removeItem(DEVICE_KEY)
  localStorage.removeItem(NICK_KEY)
}

export const hasGuest = () => !!getDeviceId() && !!getNickname()

export const validNickname = (v: string) => v.trim().length >= 2 && v.trim().length <= 10
