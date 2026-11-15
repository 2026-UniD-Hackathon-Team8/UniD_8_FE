// ST_01 게스트 시작 — 닉네임(2~10자)만 받고 시작한다. 로그인 없음.
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { isApiError } from '../../shared/api/http'
import { ensureDeviceId, hasGuest, saveNickname, validNickname } from '../../shared/store/guest'
import { createGuest } from './api'
import logo from '../../assets/logo/damideo-logo.png'
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
    <div className="gate light">
      <div className="gate-brand">
        <img className="gate-logo" src={logo} alt="다믿어?" draggable={false} />
        <p className="gate-tag">
          고르면서 배우는 <b>AI 의심법</b>
        </p>
      </div>
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
