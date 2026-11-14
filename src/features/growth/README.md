# features/growth — 나의 성장(PF_03)·데일리 달력(PF_05)

기능명세서상 FE B(프로필) 범위인데, 팀 요청으로 FE A가 컴포넌트로 만들었다.
프로필 화면(`/profile`, FE B)에서 가져다 넣기만 하면 된다. 라우터와 프로필 파일은 건드리지 않았다.

## 쓰는 법

```tsx
import { DailyCalendar, GrowthPanel } from '../growth'

// 프로필 탭: 연속 기록 카드 아래
<DailyCalendar />

// 나의 성장 탭
<GrowthPanel />
```

두 컴포넌트 모두 스스로 API를 부르고, 불러오는 중·실패(다시 시도)·잠김 상태를 그린다.

## 구조

| 파일 | 내용 |
| --- | --- |
| `api.ts` | `fetchGrowth`(`GET /api/users/me/growth`), `fetchCalendar`(`GET /api/users/me/daily-calendar`), 타입, 가짜 데이터 |
| `components/DailyCalendar.tsx` | 최근 4주(월~일) 칸. 맞힌 개수 0~2 / 3~4 / 5에 따라 진하기, 칸을 누르면 그날 기록 표시 |
| `components/GrowthPanel.tsx` | 처음 3회 vs 최근 3회 요약, 점수 추이, 계열별 정답률, 지나온 유형. 3회 미만이면 "N번 더 풀면 성장 기록이 열려요" |
| `components/ScoreTrendChart.tsx` | 회차별 정답률 선 그래프. 실전 = 꽉 찬 점, 데일리 = 빈 고리. 누르거나 올리면 날짜·점수 말풍선 |
| `growth.module.css` | 스타일. 색은 디자인 토큰만 쓴다 |
| `dev/` | 개발용 미리보기 (실제 앱에서는 안 씀) |

## 백엔드 응답과 화면

- 점수 추이: `scoreTrend`(일반 판 + 데일리, 약점 재도전 제외)를 정답률(%)로 바꿔 날짜순으로 그린다.
- 요약 첫 줄: `scoreTrend`의 처음 3회 평균 → 최근 3회 평균.
- 가장 많이 오른 계열·아직 약한 곳: `categoryAccuracy`의 `early`/`recent`(0~1, 안 푼 계열은 null → '—').
- 지나온 유형: `typeHistory`의 `code`를 `TYPE_FROM_API`로 캐릭터에 연결.

## 혼자 확인하기

`.env.local`에 `VITE_USE_MOCK=true`를 두거나 PowerShell에서 `$env:VITE_USE_MOCK="true"; npm run dev` 후
`http://localhost:5173/growth-dev.html`을 연다. 빌드에는 들어가지 않는다.
