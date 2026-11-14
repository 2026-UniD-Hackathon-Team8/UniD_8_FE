// 나의 성장 (PF_03): 점수 추이, 계열별 정답률 처음 3회 vs 최근 3회, 지나온 유형.
// 프로필의 '나의 성장' 탭에 그대로 넣으면 된다: <GrowthPanel />
import TypeAvatar from '../../../shared/components/TypeAvatar'
import { CAT_FROM_API, CAT_ORDER, CATS, TYPE_FROM_API } from '../../../shared/constants/domain'
import { useAsync } from '../../../shared/hooks/useAsync'
import { fetchGrowth } from '../api'
import type { CategoryAccuracy, GrowthResponse, ScorePoint } from '../api'
import s from '../growth.module.css'
import { ScoreTrendChart } from './ScoreTrendChart'

const toPct = (v: number | null) => (v === null ? null : Math.round(v * 100))
const avgPct = (ps: ScorePoint[]) =>
  ps.length ? Math.round((ps.reduce((sum, p) => sum + (p.total ? p.score / p.total : 0), 0) / ps.length) * 100) : 0

/** 가장 많이 오른 계열과 지금 가장 약한 계열 */
function highlights(rows: CategoryAccuracy[]) {
  let best: { row: CategoryAccuracy; diff: number } | null = null
  let weak: CategoryAccuracy | null = null
  for (const row of rows) {
    if (row.early !== null && row.recent !== null) {
      const diff = row.recent - row.early
      if (diff > 0 && (!best || diff > best.diff)) best = { row, diff }
    }
    if (row.recent !== null && (!weak || row.recent < (weak.recent ?? 1))) weak = row
  }
  return { best: best?.row ?? null, weak }
}

export function GrowthPanel() {
  const { data, error, loading, reload } = useAsync(fetchGrowth, 'growth')

  if (error)
    return (
      <div className="card mt12">
        <p className="t-h2">성장 기록을 불러오지 못했어요</p>
        <button className="link mt8" onClick={reload}>
          다시 시도 →
        </button>
      </div>
    )
  if (loading && !data) return <p className="t-cap mt12">성장 기록을 불러오는 중…</p>
  if (!data) return null

  return <GrowthBody g={data} />
}

function GrowthBody({ g }: { g: GrowthResponse }) {
  if (!g.available) {
    return (
      <div className={`card mt12 ${s.locked}`}>
        <div className={s.lockedBig}>{g.remainingSessions}</div>
        <p className="t-h2 mt8">{g.remainingSessions}번 더 풀면 성장 기록이 열려요</p>
        <p className="t-cap mt4">실전이나 오늘의 5문제를 3번 마치면 처음과 지금을 비교해 드려요.</p>
      </div>
    )
  }

  const trend = g.scoreTrend
  const first = avgPct(trend.slice(0, 3))
  const recent = avgPct(trend.slice(-3))
  const { best, weak } = highlights(g.categoryAccuracy)
  const byCat = new Map(g.categoryAccuracy.map((r) => [CAT_FROM_API[r.category], r]))

  return (
    <>
      <div className="card mt12">
        <div className={s.headline}>
          처음 3회 {first}% → 최근 3회 <b>{recent}%</b>
        </div>
        {best && (
          <p className={s.note}>
            {best.categoryName} 계열 {toPct(best.early)}% → {toPct(best.recent)}% · 가장 많이 올랐어요
          </p>
        )}
        {weak && CAT_FROM_API[weak.category] && (
          <p className={s.weak}>
            아직 약한 곳 · {weak.categoryName} {toPct(weak.recent)}% → “{CATS[CAT_FROM_API[weak.category]].check}”
          </p>
        )}

        <div className={s.chartHead}>
          <span className="t-lbl">회차별 정답률</span>
          <span>
            <span className={s.key}>
              <svg width="10" height="10" aria-hidden="true">
                <circle cx="5" cy="5" r="4" style={{ fill: 'var(--y)' }} />
              </svg>
              실전
            </span>
            <span className={s.key}>
              <svg width="10" height="10" aria-hidden="true">
                <circle cx="5" cy="5" r="3.5" style={{ fill: 'none', stroke: 'var(--y)', strokeWidth: 1.5 }} />
              </svg>
              데일리
            </span>
          </span>
        </div>
        <ScoreTrendChart points={trend} />
      </div>

      <div className={s.section}>
        <span className="t-h2">계열별 정답률</span>
        <span className={`t-cap ${s.sectionCap}`}>처음 3회 → 최근 3회</span>
      </div>
      <div className="card">
        <div className={s.pairs}>
          {CAT_ORDER.map((key) => {
            const row = byCat.get(key)
            const e = toPct(row?.early ?? null)
            const r = toPct(row?.recent ?? null)
            const diff = e !== null && r !== null ? r - e : null
            return (
              <div key={key} className={s.pair}>
                <span>{CATS[key].name}</span>
                <div className={s.bars} aria-hidden="true">
                  <div className={s.track}>
                    {e !== null && <div className={`${s.bar} ${s.barEarly}`} style={{ width: `${e}%` }} />}
                  </div>
                  <div className={s.track}>
                    {r !== null && <div className={s.bar} style={{ width: `${r}%`, background: CATS[key].color }} />}
                  </div>
                </div>
                <span className={s.val}>
                  {e === null ? '—' : `${e}%`} → <b>{r === null ? '—' : `${r}%`}</b>
                  {diff !== null && diff > 0 && <span className={s.up}> +{diff}</span>}
                </span>
              </div>
            )
          })}
        </div>
        <p className="t-cap mt12">위 막대는 처음 3회, 아래 막대는 최근 3회예요. ‘—’는 그 계열 문제를 안 푼 경우예요.</p>
      </div>

      <div className={s.section}>
        <span className="t-h2">지나온 유형</span>
      </div>
      <div className={s.chain}>
        {g.typeHistory.length ? (
          g.typeHistory.map((t, i) => (
            <span key={t.code + t.recordedDate} style={{ display: 'contents' }}>
              {i > 0 && <em className={s.arrow}>→</em>}
              <span className={s.chip} title={t.recordedDate}>
                <TypeAvatar type={TYPE_FROM_API[t.code]} size={24} />
                {t.name}
              </span>
            </span>
          ))
        ) : (
          <span className="t-cap">아직 유형 기록이 없어요. 계열마다 4문제씩, 총 20문제를 풀면 유형이 정해져요.</span>
        )}
      </div>
    </>
  )
}
