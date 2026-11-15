# features/result — 판 결과

담당 범위: 실전 판 결과 화면(GM_04)과 약점 유형 도감 내용.
다른 사람 파일과 겹치지 않도록 이 폴더만 쓴다.

- HTTP: `shared/api/http.ts`의 `request`
- mock: 팀 공용 `VITE_USE_MOCK`(`USE_MOCK`)과 `mockDelay`
- 불러오기 훅: `shared/hooks/useAsync.ts`
- 계열 이름·확인 질문·색, 백엔드 코드 → 프론트 키: `shared/constants/domain.ts` (`CATS`, `CAT_ORDER`, `CAT_FROM_API`, `TYPE_FROM_API`)
- 유형 이름·캐릭터: `assets/characters`(`CHARACTER_NAME`, `CHARACTER_SVG`), `shared/components/TypeAvatar`

## 구조

| 파일 | 내용 |
| --- | --- |
| `api/types.ts` | 백엔드 실제 코드(UniD_8_BE `dev`) 기준 판 결과 응답 타입 |
| `api/resultApi.ts` | `getGameResult(gameSessionId)` (`USE_MOCK`이면 mock) |
| `constants.ts` | shared에 없는 유형 정보: 설명·대사·`?`/`!` 표시(`TYPE_DETAIL`), 탐정형 강점 문구, 도감 순서, 도감 문구 |
| `lib/resultView.ts` | `mostWrongCatKey`, `strongCatKeys`, `wrongCountByCat` (백엔드 계열 코드 → `CatKey`) |
| `mock/resultMock.ts` | 가짜 결과 2종(근거 계열 4개 오답, 다 맞힌 판) |
| `lib/judgeType.ts` | 결과 화면 유형 판정 `judgeResultType` (기획안 임시 규칙) |
| `lib/share.ts` | 공유: `navigator.share`, 없으면 클립보드 복사 |
| `hooks/useGameResult.ts` | `useAsync(getGameResult, gameSessionId)` → `data`, `loading`, `error`, `reload` |
| `screens/ResultScreen.tsx` | 판 결과 화면. 라우터에 이 컴포넌트 하나만 붙인다 |
| `styles/result.module.css` | 결과 화면 스타일 (`tokens.css` 변수만 사용) |

## 결과 화면

`App.tsx`의 `/games/:gameSessionId/result`에 `<ResultScreen />`을 붙인다. 하단 탭 없는 화면이다.

- 위에서부터: 유형 캐릭터·이름·대사 → 점수 → 많이 틀린 계열 → 💪 강점(안 틀린 계열, 없으면 생략) → 확인 질문 → 버튼
- 버튼: 오답노트 보기(`/notes`), 약한 계열 다시 풀기(`/play/weak`, `WEAKNESS_RETRY` 판), 공유하기
- 잘못된 id, 로딩, 에러(`GAME_NOT_COMPLETED`, 없는 판·남의 판, 그 밖) 화면이 있다. `USER_NOT_FOUND`는 `clearGuest()` 후 `/start`로 보낸다.

유형 판정은 `judgeResultType` 하나에 있다. 틀린 문제가 `DETECTIVE_MAX_WRONG`(1) 이하면 탐정형, 아니면 가장 많이 틀린 계열의 유형.
백엔드가 판 결과에 유형을 주게 되면 이 함수만 바꾼다.

## 흐름

실전이 끝나면 game이 `/games/:gameSessionId/result`로 이동한다(`features/game/routes.tsx`의 `useGameNav().result`).
gameSessionId는 URL 경로로만 넘어오므로 결과 화면은 `useParams`로 읽는다.

```ts
const { gameSessionId } = useParams()
const { data: result, loading, error } = useGameResult(Number(gameSessionId))
const cat = result && mostWrongCatKey(result) // 다 맞히면 null
cat && CATS[cat].name                         // '근거'
```

에러: `isApiError(error, code)`로 분기한다.
- `GAME_NOT_COMPLETED`(400): 이어 하기(`/play`)로
- `GAME_SESSION_NOT_FOUND`(404), `GAME_SESSION_FORBIDDEN`(403): 홈으로
- `USER_NOT_FOUND`(401): `clearGuest()` 후 게스트 시작(`/start`)으로

판 결과 응답에는 약점 유형이 없다. 유형은 서버가 최근 기록(20문제 이상)으로 따로 판정하고, 프로필 조회의 `weakType`으로 받는다.

## 유형 도감 (프로필과 공유)

키는 shared의 `TypeKey`(`'evidence'` … `'detective'`)다. 프로필은 `features/profile`의 `weakTypeKey(weakType)`로 키를 얻는다.

```ts
TYPE_ORDER.map((type) => ({
  avatar: <TypeAvatar type={type} />,
  name: CHARACTER_NAME[type],
  ...TYPE_DETAIL[type],          // mark, description, quote
  checkLine: typeCheckLine(type), // 5유형은 CATS[type].check, 탐정형은 '모든 계열 강점'
}))
```

## mock 쓰기

`.env.local`에 `VITE_USE_MOCK=true`를 두면 `getGameResult`가 `mock/resultMock.ts`를 쓴다.
다 맞힌 판을 보려면 `setMockResult(MOCK_RESULT_PERFECT)`를 먼저 부른다.

## 백엔드·디자인과 미정인 것

- 도감 문구(캡처 08)와 백엔드 판정 규칙이 다르다. 캡처는 '1문제 이하로 틀리면 탐정형', '실전 한 판을 마치면 유형이 정해짐'인데,
  백엔드는 '20문제 이상 풀어야 유형이 열리고, 모든 계열 정답률이 80% 이상이면 탐정형'이다.
- 탐정형 색: `CATS`에는 5계열 색만 있어서 화면에서 `var(--c-detective)`를 직접 쓴다.
- 약한 계열 다시 풀기: 백엔드 `WEAKNESS_RETRY`는 이번 판이 아니라 사용자 전체 계열별 정답률로 출제 비중을 정한다. 특정 계열을 지정하는 API는 없다.
- 확인 질문 앞 상황 문구(`CHECK_LEAD`)는 근거 외 계열과 탐정형 문구를 임시로 썼다. 기획 확인이 필요하다.
