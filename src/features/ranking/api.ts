// 랭킹 API
//   연승 랭킹: GET /api/rankings?size=20 — 최고 연승 내림차순, 같으면 먼저 달성한 순, 동점은 같은 순위
//   데일리 랭킹: GET /api/rankings/daily?size=20 — 오늘의 5문제 연속 학습 일수 순 (백엔드에 아직 없음, 제안한 형태)
import { mockDelay, request, USE_MOCK } from '../../shared/api/http'
import { getNickname } from '../../shared/store/guest'

export type RankingKind = 'streak' | 'daily'

/** 화면에서 쓰는 한 줄 */
export interface RankRow {
  rank: number | null // 기록이 없으면 null
  nickname: string
  value: number // 연승: 최고 연승 / 데일리: 현재 연속 일수
  sub?: number // 데일리: 최장 연속 일수
  isMe?: boolean
}

export interface RankingView {
  top: RankRow[]
  me: RankRow
}

interface StreakRankingResponse {
  top: { rank: number; nickname: string; bestWinStreak: number; achievedAt: string }[]
  me: { rank: number | null; nickname: string; bestWinStreak: number }
}

interface DailyRankingResponse {
  top: { rank: number; nickname: string; currentStreak: number; longestStreak: number }[]
  me: { rank: number | null; nickname: string; currentStreak: number; longestStreak: number }
}

const NAMES = [
  '근거수집가',
  '맥락탐정',
  '의심한스푼',
  '물음표',
  '팩트체커J',
  '출처요정',
  '반박왕',
  '데이터읽는곰',
  '조건부박사',
  '느긋한탐정',
  '오늘도확인',
  '문장해부학',
  '시점감별사',
  '질문장인',
  '숫자의심러',
  '한번더확인',
  '첫판러',
  '검증중',
  '사실만말해',
  '다믿진않아',
]

function mockStreak(): StreakRankingResponse {
  const runs = [21, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 7, 6, 5, 4, 3, 3, 2]
  return {
    top: NAMES.map((nickname, i) => ({ rank: i + 1, nickname, bestWinStreak: runs[i], achievedAt: '' })),
    me: { rank: 11, nickname: getNickname() ?? '나', bestWinStreak: 9 },
  }
}

function mockDaily(): DailyRankingResponse {
  const cur = [64, 51, 43, 38, 33, 29, 26, 22, 19, 17, 14, 12, 10, 9, 7, 6, 4, 3, 2, 1]
  return {
    top: NAMES.map((nickname, i) => ({
      rank: i + 1,
      nickname,
      currentStreak: cur[i],
      longestStreak: cur[i] + (i % 3) * 4,
    })),
    me: { rank: 16, nickname: getNickname() ?? '나', currentStreak: 5, longestStreak: 9 },
  }
}

export async function fetchRanking(kind: RankingKind): Promise<RankingView> {
  if (kind === 'streak') {
    const r = USE_MOCK
      ? (await mockDelay(), mockStreak())
      : await request<StreakRankingResponse>('GET', '/api/rankings?size=20')
    return {
      top: r.top.map((t) => ({ rank: t.rank, nickname: t.nickname, value: t.bestWinStreak })),
      me: { rank: r.me.rank, nickname: r.me.nickname, value: r.me.bestWinStreak, isMe: true },
    }
  }
  const r = USE_MOCK
    ? (await mockDelay(), mockDaily())
    : await request<DailyRankingResponse>('GET', '/api/rankings/daily?size=20')
  return {
    top: r.top.map((t) => ({ rank: t.rank, nickname: t.nickname, value: t.currentStreak, sub: t.longestStreak })),
    me: { rank: r.me.rank, nickname: r.me.nickname, value: r.me.currentStreak, sub: r.me.longestStreak, isMe: true },
  }
}
