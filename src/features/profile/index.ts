// 프로필 공개 모듈
export * from './api/types'
export { getMyProfile, updateNickname } from './api/profileApi'
export * from './constants'
export { strongCatKey, weakCatKey, weakTypeKey } from './lib/weakType'
export {
  MOCK_DUPLICATED_NICKNAME,
  MOCK_PROFILE_DETECTIVE,
  MOCK_PROFILE_NEW,
  MOCK_PROFILE_PLAYED,
  getMockProfile,
  setMockProfile,
  updateMockNickname,
} from './mock/profileMock'
export { useProfile } from './hooks/useProfile'
export { useUpdateNickname } from './hooks/useUpdateNickname'
export { ProfileScreen } from './screens/ProfileScreen'
