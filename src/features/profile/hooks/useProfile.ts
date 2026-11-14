// 프로필 조회 훅. 화면이 열릴 때 한 번 불러오고, reload()로 다시 불러온다.
//
// 사용 예:
//   const { profile, loading, error, reload, setNickname } = useProfile()
import { useCallback, useEffect, useState } from 'react'
import { ApiError, USE_MOCK } from '../../../shared/api/http'
import { getMyProfile } from '../api/profileApi'
import type { ProfileResponse } from '../api/types'
import { getMockProfile } from '../mock/profileMock'

const fetchProfile = USE_MOCK ? getMockProfile : getMyProfile

export function useProfile() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchProfile(controller.signal)
      .then((data) => {
        setProfile(data)
        setError(null)
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return
        setError(e instanceof ApiError ? e : new ApiError(0, 'INTERNAL_ERROR', '프로필을 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey])

  const reload = useCallback(() => {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }, [])

  /** 닉네임 변경이 성공한 뒤 다시 불러오지 않고 화면 값만 바꾼다 */
  const setNickname = useCallback((nickname: string) => {
    setProfile((p) => (p ? { ...p, nickname } : p))
  }, [])

  return { profile, loading, error, reload, setNickname }
}
