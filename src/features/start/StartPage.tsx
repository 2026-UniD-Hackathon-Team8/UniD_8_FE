// ST_01 게스트 시작 — 닉네임(2~10자)만 받고 시작한다. 로그인 없음.
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isApiError } from '../../shared/api/http'
import { ensureDeviceId, hasGuest, saveNickname, validNickname } from '../../shared/store/guest'
import { createGuest } from './api'
import './StartPage.css'

export default function StartPage() {
  const nav = useNavigate()
  const [nick, setNick] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (hasGuest()) return <Navigate to="/" replace />

  async function start() {
    const v = nick.trim()
    if (!validNickname(v)) {
      setMsg('닉네임은 2–10자로 입력해 주세요.')
      return
    }
    setBusy(true)
    try {
      const res = await createGuest(ensureDeviceId(), v)
      saveNickname(res.nickname)
      nav('/', { replace: true })
    } catch (e) {
      setMsg(isApiError(e) ? e.message : '잠시 후 다시 시도해 주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gate">
      <svg className="gate-art" viewBox="0 0 340 250" aria-hidden="true">
        <rect width="340" height="250" rx="16" fill="#0B2B26" />
        <polygon points="90,226 250,226 330,250 10,250" fill="#FFF7E6" opacity=".08" />
        <rect x="96" y="22" width="148" height="204" fill="#051F20" />
        <rect x="104" y="30" width="132" height="196" fill="#163832" />
        <rect x="170" y="30" width="66" height="196" fill="#123029" />
        <rect x="118" y="46" width="104" height="84" fill="#FFF7E6" />
        <rect x="170" y="46" width="52" height="84" fill="#E8DCC4" />
        <text
          x="170"
          y="96"
          textAnchor="middle"
          fontFamily="Pretendard,sans-serif"
          fontWeight="800"
          fontSize="24"
          fill="#10201c"
        >
          다믿어<tspan fontFamily="Courier Prime,monospace">?</tspan>
        </text>
        <circle cx="222" cy="152" r="6" fill="#FFF7E6" />
      </svg>
      <h1 className="t-h1 mt24 center">
        AI가 지어낸 답,
        <br />
        골라낼 수 있나요?
      </h1>
      <p className="t-cap mt8 center">두 답 중 잘못된 쪽을 고르며 AI 답변을 검증하는 습관을 길러요.</p>
      <div className="spacer" />
      <label className="t-lbl mt24" htmlFor="nick">
        닉네임
      </label>
      <input
        id="nick"
        className="inp mt8"
        maxLength={10}
        placeholder="예) 문장수집가"
        autoComplete="off"
        value={nick}
        onChange={(e) => {
          setNick(e.target.value)
          setMsg(null)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void start()
        }}
      />
      <p className="t-cap mt8" style={msg ? { color: 'var(--red-tx)' } : undefined}>
        {msg ?? '2–10자로 입력해 주세요.'}
      </p>
      <button className="btn mt16" onClick={() => void start()} disabled={busy}>
        시작하기 →
      </button>
      <p className="foot-note">게스트로 진행돼요 · 기록은 이 기기에 연결돼요</p>
    </div>
  )
}
