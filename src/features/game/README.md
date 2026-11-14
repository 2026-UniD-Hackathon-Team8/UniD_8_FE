# features/game — 실전 2지선다 (프론트 A)

담당 범위: 문제 화면(답 고르기·질문 고르기·대화 고르기), 정답 공개, 판 시작·이어 하기·약점 재도전, 연승 챌린지.
다른 사람 파일과 겹치지 않도록 이 폴더와 `src/assets/characters/`만 쓴다.

## 구조

| 파일 | 내용 |
| --- | --- |
| `api/types.ts` | 백엔드 실제 코드(UniD_8_BE `dev`) 기준 요청·응답 타입 |
| `api/http.ts` | fetch 래퍼. `X-Device-Id` 헤더, 공통 응답 풀기, `ApiError` |
| `api/gameApi.ts` | `startGame`, `getCurrentGame`(없으면 `null`), `submitGameAnswer` |
| `api/streakApi.ts` | `startStreakChallenge`, `submitStreakAnswer` (연승 챌린지) |
| `constants.ts` | 길게 누르기 시간, 유형별 지시문·도장 문구, 계열별 확인 질문·색·캐릭터 |
| `lib/reveal.ts` | 정답 공개용 함수: AI 답 A/B 매핑, 도장 문구, 결과 문구 |
| `lib/progress.ts` | 다음 문제, 이어 하기 문구, 진행 바 칸 상태, 답 제출 후 상태 갱신 |
| `hooks/useHoldToSelect.ts` | 길게 눌러 고르기 훅 (스타일 없음) |
| `hooks/useGamePlay.ts` | 실전 판 흐름: 이어 하기 확인 → 풀기 → 정답 공개 → 다음/완료 |
| `hooks/useStreakPlay.ts` | 연승 챌린지 흐름: 시작 → 풀기 → 정답 공개 → 다음/종료 |
| `lib/dialogue.ts` | 대화 고르기 앞선 대화를 말풍선으로 나누기 (임시 규칙) |
| `components/` | 선택지 카드, 문제 본문, 정답 공개 시트, 상단 바 |
| `screens/GamePlayScreen.tsx` | 실전 판 화면 (일반 / 약점 재도전) |
| `screens/StreakPlayScreen.tsx` | 연승 챌린지 화면 (종료 화면 포함) |
| `styles/game.module.css` | 화면 스타일. 전역 토큰(`--y`, `--g0` 등)이 있으면 그 값을 쓴다 |
| `dev/` | 개발용 미리보기와 가짜 서버 (실제 앱에서는 안 씀) |

## 라우터에 붙이기 (홈·라우터 담당과 합칠 때)

```tsx
<GamePlayScreen
  mode="NORMAL"                // 약점 재도전은 "WEAKNESS_RETRY"
  onExit={() => navigate('/')}
  onFinished={(id) => navigate(`/games/${id}/result`)}   // 판 결과 화면(FE B)
  onUnauthorized={() => navigate('/start')}               // 게스트 시작
/>
<StreakPlayScreen onExit={() => navigate('/')} onRanking={() => navigate('/rankings')} />
```

버튼은 지금 임시 스타일이다. FE C의 Button 등이 나오면 `components/`와 `screens/`에서 바꿔 끼운다.

## 혼자 확인하기 (미리보기)

`npm run dev` 후 아래 주소를 연다. `game-dev.html`은 개발 서버 전용이고 빌드에는 안 들어간다.

- `http://localhost:5173/game-dev.html?mock` — 가짜 서버 (기획안·질문 계열 예시 4문제)
- `http://localhost:5173/game-dev.html` — 실제 서버. 게스트 계정을 만들어 기기 ID를 저장한다. `.env.local`에 `VITE_API_BASE_URL=http://localhost:8080`

## 흐름 (화면 없이 함수만 쓸 때)

```ts
// 실전 시작 버튼
const current = await getCurrentGame()
if (current) { /* 이어 하기 / 새로 시작 묻기 → resumeText(current) */ }
else { const session = await startGame('NORMAL') }

// 선택지를 길게 눌러 골랐을 때
const reveal = await submitGameAnswer(session.gameSessionId, q.questionId, pos)
session = applyAnswer(session, reveal)
if (reveal.completed) { /* 결과 화면(FE B)으로 gameSessionId 넘기기 */ }
```

에러: `ApiError.code`로 분기한다. `USER_NOT_FOUND`(401)는 게스트 시작으로 보낸다.

## 같이 정해야 하는 것 (공용 파일이라 여기서 안 건드림)

- **기기 ID 저장 키**: 기본은 `localStorage['damideo:deviceId']`. 게스트 시작 담당이 다른 키를 쓰면 `setDeviceIdProvider(() => …)`로 바꾼다.
- **로컬 개발 프록시**: `vite.config.ts`에 아래를 넣거나 `.env.local`에 `VITE_API_BASE_URL=http://localhost:8080`을 둔다(백엔드에 CORS 설정 필요).
  ```ts
  server: { proxy: { '/api': 'http://localhost:8080' } }
  ```

## 백엔드와 미정인 것

- 대화 고르기: 앞선 대화(사용자 질문 → AI 첫 답 → 사용자 반박)가 `prompt` 문자열 하나에 들어 있다. 나누는 형식 필요.
- 출처: `source` 문자열 하나. 여러 개·링크 이름 표시 형식 필요.
- '가짜 같은 진짜' 표시 값이 없다.
- 연승 챌린지: 진행 중인 도전 조회 API가 없어서 새로고침하면 이어 할 수 없다(새로 시작하면 이전 도전은 그때까지 연승으로 끝남).
