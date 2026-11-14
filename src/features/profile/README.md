# features/profile — 프로필

담당 범위: 마이페이지 프로필 탭(PF_01, PF_02), 닉네임 변경(ST_03).
다른 사람 파일과 겹치지 않도록 이 폴더만 쓴다. HTTP는 `features/game/api/http.ts`의 `request()`를 가져다 쓴다.

## 구조

| 파일 | 내용 |
| --- | --- |
| `api/types.ts` | 프로필 조회·닉네임 변경 요청·응답 타입 |
| `api/profileApi.ts` | `getMyProfile`, `updateNickname` |
| `mock/profileMock.ts` | 가짜 프로필 2종(새 게스트, 몇 판 푼 사용자)과 가짜 API |
| `hooks/useProfile.ts` | 프로필 불러오기 훅 (`profile`, `loading`, `error`, `reload`, `setNickname`) |
| `hooks/useUpdateNickname.ts` | 닉네임 변경 훅 (`update`, `saving`, `error`, `clearError`) |

화면 컴포넌트는 C의 디자인 토큰·기본 컴포넌트가 나온 뒤 `components/`에 만든다.

## 흐름

```ts
const { profile, loading, error, setNickname } = useProfile()
const nick = useUpdateNickname({ onSuccess: setNickname })

// 닉네임 수정 → 저장
const saved = await nick.update(input)
if (saved) { /* 입력창 닫기 */ }
```

에러: `ApiError.code`로 분기한다. `USER_NOT_FOUND`(401)는 게스트 시작으로, `INVALID_INPUT`(400)은 `error.errors.nickname`을 입력창 아래에 띄운다.

## mock 쓰기

`.env.local`에 `VITE_PROFILE_MOCK=true`를 두면 훅이 실제 API 대신 `mock/profileMock.ts`를 쓴다.
다른 상태를 보려면 `setMockProfile(MOCK_PROFILE_PLAYED)`를 먼저 부른다.

## 백엔드와 미정인 것

- 응답 필드 이름: 백엔드 DTO를 못 봐서 화면 기준으로 정했다. Swagger 확인 후 `api/types.ts`를 맞춘다.
- 닉네임 규칙(길이·금지어·중복)과 그때의 에러 코드.
- 닉네임 변경 응답이 `{ nickname }`인지 프로필 전체인지.
- '최근 4주 데일리'는 데일리 달력 API(`/api/users/me/daily-calendar`, PF_05)로 따로 받는다.
- '나의 성장' 탭은 `/api/users/me/growth`(PF_03)로 따로 받는다.
