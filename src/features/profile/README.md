# features/profile — 프로필

담당 범위: 마이페이지 프로필 탭(PF_01, PF_02), 닉네임 변경(ST_03).
다른 사람 파일과 겹치지 않도록 이 폴더만 쓴다. HTTP는 `shared/api/http.ts`의 `request()`를, 계열·유형 키는 `shared/constants/domain.ts`를, 닉네임 규칙은 `shared/store/guest.ts`의 `validNickname`을 쓴다.

## 구조

| 파일 | 내용 |
| --- | --- |
| `api/types.ts` | 백엔드 실제 코드(UniD_8_BE `dev`) 기준 프로필·닉네임 변경 타입, 에러 코드 |
| `api/profileApi.ts` | `getMyProfile`, `updateNickname` |
| `constants.ts` | 닉네임 규칙 문구와 `validateNickname` (`validNickname` 사용) |
| `lib/weakType.ts` | 백엔드 유형·계열 코드 → shared 키 (`weakTypeKey`, `weakCatKey`, `strongCatKey`) |
| `mock/profileMock.ts` | 가짜 프로필 3종(유형 판정 전, 근거 맹신형, 탐정형)과 가짜 API |
| `hooks/useProfile.ts` | 프로필 불러오기 훅 (`profile`, `loading`, `error`, `reload`, `setNickname`) |
| `hooks/useUpdateNickname.ts` | 닉네임 변경 훅 (`update`, `saving`, `error`, `clearError`) |

| `screens/ProfileScreen.tsx` | 마이페이지 화면. 라우터에 이 컴포넌트 하나만 붙인다 |
| `components/NicknameSheet.tsx` | 닉네임 수정 바텀시트 (`validNickname`, `useUpdateNickname`) |
| `components/TypeGuide.tsx` | 유형 도감 6장 (`features/result`의 `TYPE_DETAIL`, `TYPE_ORDER`, `typeCheckLine`) |
| `components/ThoughtBubble.tsx` | 구름 모양 생각 말풍선 (재사용 가능, 위치는 `className`으로, `onClick`이 있으면 버튼) |
| `thoughtLines.ts` | 말풍선 대사 모음: 상황별(`daily`, `comeback`, `newbie`), 유형별(`TypeKey` 6유형) |
| `hooks/useRotatingLine.ts` | 대사 묶음을 6초마다 페이드로 돌림 (처음 무작위, 같은 대사 연속 없음, 누르면 바로 다음) |
| `hooks/useLastVisit.ts` | 마지막 방문 날짜를 localStorage(`damideo:profileLastVisit`)에 저장하고 지난 일수를 돌려줌 |
| `lib/thought.ts` | 대사 묶음 고르기 `pickThoughtGroup` (3일 이상 만의 방문 → 오늘 데일리 전 → 유형(탐정형 포함) → 견습) |
| `lib/typeColor.ts` | 유형 색 (`CATS` 계열 색, 탐정형은 `--c-detective`) |
| `styles/profile.module.css` | 마이페이지 스타일 (`tokens.css` 변수만 사용) |

## 마이페이지 화면

`App.tsx`의 `/profile`(하단 탭 화면, `AppLayout` 안)에 `<ProfileScreen />`을 붙인다. 상단 바·하단 탭은 `AppLayout`이 그린다.

- 탭: [프로필] [나의 성장]. 나의 성장은 `features/growth`의 `<GrowthPanel />`(props 없음, 스스로 `/api/users/me/growth`를 부른다)
- 프로필 탭: 프로필 카드(닉네임 수정) → 통계 3칸 → 최근 4주 데일리(`features/growth`의 `<DailyCalendar />`) → 현재 약점 유형 → 오답노트 바로가기 → 유형 도감
- 오답 개수는 프로필 응답에 없어서 `features/notes/api`의 `fetchWrongAnswers`로 센다.
- 닉네임을 바꾸면 `shared/store/guest`의 `saveNickname`으로 저장된 닉네임도 바꾼다.
- 설정 영역(캡처 09 아래, 10)은 아직 없다.

## 흐름

```ts
const { profile, loading, error, setNickname } = useProfile()
const nick = useUpdateNickname({ onSuccess: setNickname })

// 닉네임 수정 → 저장
const saved = await nick.update(input)
if (saved) { /* 입력창 닫기 */ }
```

에러: `ApiError.code`로 분기한다.
- `INVALID_INPUT`(400): `error.errors.nickname`을 입력창 아래에 띄운다. 2~10자 검사는 보내기 전에도 한다.
- `NICKNAME_DUPLICATED`(409): 이미 쓰는 닉네임
- `USER_NOT_FOUND`(401): 게스트 시작으로 보낸다.

## 화면 값과 응답 필드

| 화면 | 필드 |
| --- | --- |
| 상단 '연속 N일', 통계 '데일리 연속' | `streak.current` |
| 통계 '최장 연속' | `streak.longest` |
| '최근 4주 데일리'의 '오늘 아직' | `streak.completedToday` |
| 이름 아래 '최장 N연승' | `bestWinStreak` |
| 통계 '푼 문제' | `weakType.progress.solved` |
| '현재 약점 유형' | `weakTypeKey(weakType)`가 `null`이면 '아직 없어요', 아니면 그 키 |

`weakTypeKey`는 `TypeKey`(`'evidence'` … `'detective'`)를 돌려주므로 `CHARACTER_SVG`, `CHARACTER_NAME`에 바로 쓴다.
계열은 `weakCatKey`·`strongCatKey`로 바꿔 `CATS`(이름·확인 질문·색)에 쓴다.

## mock 쓰기

`.env.local`에 `VITE_USE_MOCK=true`(팀 공용 값)를 두면 훅이 실제 API 대신 `mock/profileMock.ts`를 쓴다.
다른 상태를 보려면 `setMockProfile(MOCK_PROFILE_PLAYED)`를 먼저 부른다. 닉네임을 `다믿어`로 바꾸면 중복 에러가 난다.

## 백엔드와 미정인 것

- 이름 아래 '게스트' 표시: 프로필 응답에 게스트 여부가 없다. 지금은 모두 게스트라 고정 문구로 둬도 된다.
- '오답노트 N문제': 프로필 응답에 없다. 오답노트 조회(`/api/users/me/wrong-answers`)에서 센다.
- '푼 문제'는 처음 푼 답 수(`progress.solved`)다. 다시 푼 문제는 세지 않는다.
- '최근 4주 데일리'는 `features/growth`의 `DailyCalendar`가 데일리 달력 API(`/api/users/me/daily-calendar`, PF_05)를 직접 부른다.
- '나의 성장' 탭은 `/api/users/me/growth`(PF_03)로 따로 받는다.
