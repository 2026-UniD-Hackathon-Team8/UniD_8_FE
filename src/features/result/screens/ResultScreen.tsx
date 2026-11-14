// 실전 판 결과 화면 (/games/:gameSessionId/result). 라우터에 붙일 때 이 컴포넌트 하나만 쓰면 된다.
import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CHARACTER_NAME } from '../../../assets/characters'
import TypeAvatar from '../../../shared/components/TypeAvatar'
import { isApiError } from '../../../shared/api/http'
import { CATS } from '../../../shared/constants/domain'
import type { TypeKey } from '../../../shared/constants/domain'
import { clearGuest } from '../../../shared/store/guest'
import type { GameResultResponse } from '../api/types'
import { CHECK_LEAD, TYPE_DETAIL, typeCheckLine } from '../constants'
import { useGameResult } from '../hooks/useGameResult'
import { judgeResultType } from '../lib/judgeType'
import { strongCatKeys } from '../lib/resultView'
import { shareResult } from '../lib/share'
import type { ShareOutcome } from '../lib/share'
import s from '../styles/result.module.css'

const NOTES_PATH = '/notes'
const WEAK_RETRY_PATH = '/play/weak'

const SHARE_MESSAGE: Record<ShareOutcome, string | null> = {
  shared: null,
  cancelled: null,
  copied: '공유 문구를 복사했어요',
  failed: '복사하지 못했어요. 다시 시도해 주세요',
}

const typeColor = (type: TypeKey) => (type === 'detective' ? 'var(--c-detective)' : CATS[type].color)

/** URL의 gameSessionId가 양의 정수일 때만 숫자로 */
function parseId(raw: string | undefined): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null
  const id = Number(raw)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export function ResultScreen() {
  const { gameSessionId } = useParams()
  const id = parseId(gameSessionId)
  if (id === null) {
    return (
      <Shell>
        <Notice title="결과를 찾을 수 없어요" message="주소가 올바르지 않아요." />
      </Shell>
    )
  }
  return <ResultLoader key={id} gameSessionId={id} />
}

function ResultLoader({ gameSessionId }: { gameSessionId: number }) {
  const nav = useNavigate()
  const { data, loading, error, reload } = useGameResult(gameSessionId)
  const unauthorized = isApiError(error, 'USER_NOT_FOUND')

  useEffect(() => {
    if (!unauthorized) return
    clearGuest()
    nav('/start', { replace: true })
  }, [unauthorized, nav])

  if (data) return <ResultView result={data} />

  if (error && !unauthorized) {
    if (isApiError(error, 'GAME_NOT_COMPLETED')) {
      return (
        <Shell>
          <Notice title="아직 끝나지 않은 판이에요" message="남은 문제를 마저 풀면 결과를 볼 수 있어요.">
            <button className="btn" onClick={() => nav('/play')}>
              이어 하기 →
            </button>
          </Notice>
        </Shell>
      )
    }
    if (isApiError(error, 'GAME_SESSION_NOT_FOUND') || isApiError(error, 'GAME_SESSION_FORBIDDEN')) {
      return (
        <Shell>
          <Notice title="결과를 찾을 수 없어요" message="없는 판이거나 내 판이 아니에요." />
        </Shell>
      )
    }
    return (
      <Shell>
        <Notice title="결과를 불러오지 못했어요" message={error.message}>
          <button className="btn" onClick={reload}>
            다시 시도
          </button>
        </Notice>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className={s.center} role="status">
        {loading ? '결과를 정리하는 중…' : ''}
      </div>
    </Shell>
  )
}

function ResultView({ result }: { result: GameResultResponse }) {
  const nav = useNavigate()
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  const type = judgeResultType(result)
  const typeName = CHARACTER_NAME[type]
  const detail = TYPE_DETAIL[type]
  const wrong = result.totalCount - result.correctCount
  const top = result.categoryWrongCounts[0]
  const strong = strongCatKeys(result)

  const onShare = async () => {
    setShareMsg(SHARE_MESSAGE[await shareResult(typeName)])
  }

  return (
    <Shell>
      <section className={s.hero} style={{ '--accent': typeColor(type) } as CSSProperties}>
        <div className={s.avatar}>
          <TypeAvatar type={type} size={108} />
        </div>
        <div className={s.label}>이번 판 유형</div>
        <h1 className={s.typeName}>
          {typeName} <span className={s.mark}>{detail.mark}</span>
        </h1>
        <p className={s.quote}>“{detail.quote}”</p>
      </section>

      <section className={s.summary}>
        <p className={s.score}>
          <b className={s.num}>{result.totalCount}</b>문제 중 <b className={s.num}>{result.correctCount}</b>문제를 맞혔어요
        </p>
        {top ? (
          <p className={s.line}>
            {wrong === top.wrongCount ? (
              <>
                틀린 {wrong}문제 모두 <b>'{top.categoryName}'</b> 계열이었어요
              </>
            ) : (
              <>
                틀린 {wrong}문제 중 {top.wrongCount}문제가 <b>'{top.categoryName}'</b> 계열이었어요
              </>
            )}
          </p>
        ) : (
          <p className={s.line}>하나도 틀리지 않았어요</p>
        )}
        {strong.length > 0 && (
          <p className={s.line}>
            <span aria-hidden>💪</span> 강점: {strong.map((c) => CATS[c].name).join(' · ')} 계열은 하나도 안 틀렸어요
          </p>
        )}
      </section>

      <section className={s.check} style={{ '--accent': typeColor(type) } as CSSProperties}>
        <p className={s.checkLead}>→ {CHECK_LEAD[type]}:</p>
        <p className={s.checkQ}>{type === 'detective' ? typeCheckLine(type) : `'${typeCheckLine(type)}'`}</p>
      </section>

      <div className={s.actions}>
        <button className="btn" onClick={() => nav(NOTES_PATH)}>
          오답노트 보기
        </button>
        <button className="btn dark" onClick={() => nav(WEAK_RETRY_PATH)}>
          약한 계열 다시 풀기
        </button>
        <button className="btn dark" onClick={() => void onShare()}>
          공유하기
        </button>
        <p className={s.toast} role="status" aria-live="polite">
          {shareMsg ?? ''}
        </p>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: ReactNode }) {
  const nav = useNavigate()
  return (
    <div className={s.root}>
      <header className={s.top}>
        <button className={s.back} onClick={() => nav('/')}>
          ‹ 홈
        </button>
        <span className={s.title}>실전 결과</span>
      </header>
      <main className={s.wrap}>{children}</main>
    </div>
  )
}

function Notice({ title, message, children }: { title: string; message: string; children?: ReactNode }) {
  const nav = useNavigate()
  return (
    <div className={s.notice}>
      <div className="card">
        <p className="t-h2">{title}</p>
        <p className="t-cap mt4">{message}</p>
      </div>
      <div className={s.actions}>
        {children}
        <button className="btn dark" onClick={() => nav('/')}>
          홈으로
        </button>
      </div>
    </div>
  )
}
