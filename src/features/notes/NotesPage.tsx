// WN_01 오답노트 — 계열 필터 · 확인 질문 5개 · 오답 보드 · 믿은 근거 리포트 · 약점 재도전
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsync } from '../../shared/hooks/useAsync'
import { CAT_FROM_API, CAT_ORDER, CATS } from '../../shared/constants/domain'
import type { CatKey } from '../../shared/constants/domain'
import { fetchWrongAnswers } from './api'
import type { WrongAnswerItem } from './api'
import { MEMO_REASONS, parseMemo } from './memo'
import NotesBoard from './NotesBoard'
import WrongDetailSheet from './WrongDetailSheet'
import './NotesPage.css'

type Filter = 'all' | CatKey

function MemoReport({ items, memoCount }: { items: WrongAnswerItem[]; memoCount: number }) {
  const withReason = items.map((it) => ({ it, reason: parseMemo(it.memo).reason })).filter((x) => x.reason !== null)
  if (memoCount < 3 || withReason.length === 0) {
    return (
      <div className="paper report note bn">
        <div className="pin" />
        <div className="t-lbl">오답 메모</div>
        <div className="r">
          문제 카드를 눌러 “왜 이 답을 믿었는지” 메모를 남겨 보세요. 3개가 모이면 ‘믿은 근거 vs 실제 수법’ 리포트가
          열려요. <b>({Math.min(memoCount, 3)}/3)</b>
        </div>
      </div>
    )
  }
  const counts = MEMO_REASONS.map((r) => ({ r, list: withReason.filter((x) => x.reason === r) })).sort(
    (a, b) => b.list.length - a.list.length,
  )
  const top = counts[0]
  const tactics = [...new Set(top.list.map((x) => x.it.tacticName))]
  const others = withReason.filter((x) => x.reason !== top.r).slice(0, 3)
  return (
    <div className="report bn">
      <div className="pin" />
      <div className="t-lbl">믿은 근거 vs 실제 수법</div>
      <div className="h">
        “{top.r}” 믿은 문제가 {top.list.length}개
      </div>
      <div className="r">
        그때 실제 수법 → <b>{tactics.join(', ')}</b>
      </div>
      {others.map((x) => (
        <div className="r" key={x.it.questionId}>
          · {x.reason} → {x.it.tacticName}
        </div>
      ))}
      <div className="r strong">믿은 이유가 곧 속은 지점이에요.</div>
    </div>
  )
}

export default function NotesPage() {
  const nav = useNavigate()
  const { data, loading, error, reload } = useAsync(fetchWrongAnswers, null)
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<WrongAnswerItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const all = data?.items ?? []
  const list = filter === 'all' ? all : all.filter((it) => CAT_FROM_API[it.category] === filter)
  const countOf = (c: CatKey) => all.filter((it) => CAT_FROM_API[it.category] === c).length

  function showToast(m: string) {
    setToast(m)
    window.setTimeout(() => setToast(null), 2200)
  }

  return (
    <main className="notes">
      <header className="boardhd">
        <div className="row">
          <h1 className="t-h1">오답노트</h1>
          <span className="spacer" />
          <span className="t-lbl">오답 {all.length}개</span>
        </div>
        <p className="t-cap mt4">틀린 문제가 계열별로 모여요. 카드를 누르면 해설과 메모를 볼 수 있어요.</p>
      </header>

      <div className="filters" role="tablist">
        <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>
          전체
        </button>
        {CAT_ORDER.map((c) => (
          <button key={c} className={filter === c ? 'on' : ''} onClick={() => setFilter(c)}>
            <i style={{ background: CATS[c].color }} />
            {CATS[c].name}
            {countOf(c) > 0 && <span className="n">{countOf(c)}</span>}
          </button>
        ))}
      </div>

      <details className="checks" open={!loading && all.length === 0}>
        <summary>
          <span className="t-h2">확인 질문 5개</span>
          <span className="t-cap">오답을 고칠 때 떠올리기</span>
          <span className="ar">▼</span>
        </summary>
        {CAT_ORDER.map((c) => (
          <div className="ck" key={c}>
            <span className="no">{CATS[c].no}</span>
            <div>
              <div className="k">
                <i style={{ background: CATS[c].color }} />
                {CATS[c].name} 계열
              </div>
              <div className="q">{CATS[c].check}</div>
            </div>
          </div>
        ))}
      </details>

      {loading && <p className="t-cap pad">불러오는 중…</p>}
      {!loading && error && (
        <div className="card pad-card">
          <p className="t-h2">오답노트를 불러오지 못했어요</p>
          <button className="link mt8" onClick={reload}>
            다시 시도 →
          </button>
        </div>
      )}

      {!loading && data && list.length > 0 && (
        <NotesBoard
          items={list}
          title={filter === 'all' ? '전체 오답' : `${CATS[filter].name} 계열`}
          showTop={filter === 'all'}
          onOpen={setOpen}
          footer={filter === 'all' ? <MemoReport items={all} memoCount={data.memoCount} /> : null}
        />
      )}

      {!loading && data && list.length === 0 && (
        <div className="board">
          <div className="paper empty bn">
            <div className="pin" />
            <div className="t-h2">{all.length ? '이 계열에는 틀린 문제가 없어요' : '아직 틀린 문제가 없어요'}</div>
            <p className="t-cap ink">틀린 문제는 이 보드에 계열별로 모여요.</p>
            {all.length === 0 && (
              <button className="btn mt16 ink-btn" onClick={() => nav('/play')}>
                실전 시작
              </button>
            )}
          </div>
        </div>
      )}

      {all.length > 0 && (
        <div className="pad">
          <button className="btn mt16" onClick={() => nav('/play/weak')}>
            약점 재도전 →
          </button>
        </div>
      )}

      {open && (
        <WrongDetailSheet
          item={open}
          onClose={() => setOpen(null)}
          onSaved={() => {
            setOpen(null)
            reload()
            showToast('메모를 저장했어요')
          }}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}
