// 닉네임 변경 훅. 성공하면 바뀐 닉네임을, 실패하면 null을 돌려준다(에러는 error에 담긴다).
//
// 사용 예:
//   const { profile, setNickname } = useProfile()
//   const { update, saving, error } = useUpdateNickname({ onSuccess: setNickname })
//   <button disabled={saving} onClick={() => update(input)}>저장</button>
import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../../game/api/http'
import { updateNickname } from '../api/profileApi'
import { validateNickname } from '../constants'
import { updateMockNickname, USE_PROFILE_MOCK } from '../mock/profileMock'

const sendNickname = USE_PROFILE_MOCK ? updateMockNickname : updateNickname

type Options = {
  onSuccess?: (nickname: string) => void
}

export function useUpdateNickname({ onSuccess }: Options = {}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const onSuccessRef = useRef(onSuccess)

  useEffect(() => {
    onSuccessRef.current = onSuccess
  })

  useEffect(() => () => controllerRef.current?.abort(), [])

  const update = useCallback(async (nickname: string): Promise<string | null> => {
    const trimmed = nickname.trim()
    const invalid = validateNickname(trimmed)
    if (invalid) {
      setError(new ApiError(400, 'INVALID_INPUT', invalid, { nickname: invalid }))
      return null
    }

    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setSaving(true)
    setError(null)

    try {
      const res = await sendNickname(trimmed, controller.signal)
      onSuccessRef.current?.(res.nickname)
      return res.nickname
    } catch (e) {
      if (controller.signal.aborted) return null
      setError(e instanceof ApiError ? e : new ApiError(0, 'INTERNAL_ERROR', '닉네임을 바꾸지 못했습니다.'))
      return null
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null
        setSaving(false)
      }
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { update, saving, error, clearError }
}
