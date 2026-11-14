// RK_01 랭킹 — 연승 랭킹(연승 챌린지 최고 기록) / 데일리 랭킹(오늘의 5문제 연속 학습 일수)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from '../../shared/hooks/useAsync'
import { useLayout } from '../../shared/layouts/useLayout'
import { fetchRanking } from './api'
import type { RankingKind, RankRow } from './api'
import './RankingPage.css'

const META: Record<RankingKind, { tab: string; desc: string; unit: string }> = {
  streak: { tab: '연승 랭킹', desc: '연승 챌린지 최고 기록 · 상위 20명 · 같으면 먼저 달성한 순', unit: '연승' },
  daily: { tab: '데일리 랭킹', desc: '오늘의 5문제 연속 학습 일수 · 상위 20명 · 같으면 최장 기록 순', unit: '일' },
}

function Row({ r, kind, me }: { r: RankRow; kind: RankingKind; me: boolean }) {
  return (
    <li className={`lrow ${me ? 'me' : ''}`}>
      <span className="n">{r.rank === null ? '–' : String(r.rank).padStart(2, '0')}</span>
      <span className="nm">
        {r.nickname}
        {me ? ' (나)' : ''}
        {kind === 'daily' && r.sub !== undefined && <span className="t-cap"> · 최장 {r.sub}일</span>}
      </span>
      <span className="v">
        {r.value}
        {META[kind].unit}
      </span>
    </li>
  )
}

export default function RankingPage() {
  const [kind, setKind] = useState<RankingKind>('streak')
  const { data, loading, error, reload } = useAsync(fetchRanking, 'streak')
  const { summary } = useLayout()
  const nav = useNavigate()
  const m = META[kind]
  const todayDone = summary?.home.streak.completedToday ?? false

  return (
    <main className="page">
      <h1 className="t-h1 mt12">랭킹</h1>
      <div className="tabs mt12" role="tablist">
        {(Object.keys(META) as RankingKind[]).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={kind === k}
            className={kind === k ? 'on' : ''}
            onClick={() => setKind(k)}
          >
            {META[k].tab}
          </button>
        ))}
      </div>
      <p className="t-cap mt12">{m.desc}</p>

      {kind === 'streak' && loading && <p className="t-cap mt12">불러오는 중…</p>}

      {kind === 'daily' && <div className="card mt12">
        <p className="t-h2">데일리 랭킹은 준비 중이에요</p>
        <p className="t-cap mt4">현재 백엔드는 연승 랭킹만 제공하고 있어요.</p>
      </div>}
      {kind === 'streak' && !loading && error && (
        <div className="card mt12">
          <p className="t-h2">순위를 불러오지 못했어요</p>
          <button className="link mt8" onClick={reload}>다시 시도 →</button>
        </div>
      )}

      {kind === 'streak' && !loading && data && (
        <>
          <ol className="list mt12">
            {data.top.map((r) => (
              <Row
                key={`${r.rank}-${r.nickname}`}
                r={r}
                kind={kind}
                me={r.nickname === data.me.nickname && r.rank === data.me.rank}
              />
            ))}
          </ol>
          <div className="card mt12 minirow">
            <div className="t-h2">
              내 순위 ·{' '}
              {data.me.rank === null ? '기록 없음' : `${data.me.rank}위${data.me.rank > 20 ? ' (20위 밖)' : ''}`}
            </div>
            <div className="num my-v">
              {data.me.value}
              {m.unit}
            </div>
          </div>
        </>
      )}

      <div className="mt12">
        {kind === 'streak' && (
          <button className="btn" onClick={() => nav('/streak')}>
            연승 도전 →
          </button>
        )}
        {kind === 'daily' && !todayDone && (
          <button className="btn" onClick={() => nav('/daily')}>
            오늘의 5문제 풀고 연속 기록 잇기 →
          </button>
        )}
      </div>
    </main>
  )
}
