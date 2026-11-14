// 개발용 미리보기 (game-dev.html). 라우터·홈(FE C)이 생기기 전에 A 화면을 혼자 확인하는 용도.
import { useState } from 'react'
import { DEFAULT_DEVICE_ID_KEY, request } from '../api/http'
import type { GameMode } from '../api/types'
import { GamePlayScreen } from '../screens/GamePlayScreen'
import { StreakPlayScreen } from '../screens/StreakPlayScreen'
import s from '../styles/game.module.css'

type Screen = { name: 'menu' } | { name: 'game'; mode: GameMode } | { name: 'streak' } | { name: 'result'; id: number }

const readDeviceId = () => {
  try {
    return localStorage.getItem(DEFAULT_DEVICE_ID_KEY)
  } catch {
    return null
  }
}

export function DevApp({ mock }: { mock: boolean }) {
  const [screen, setScreen] = useState<Screen>({ name: 'menu' })
  const [deviceId, setDeviceId] = useState<string | null>(mock ? 'mock' : readDeviceId())
  const [nickname, setNickname] = useState('')
  const [msg, setMsg] = useState('')
  const home = () => setScreen({ name: 'menu' })

  const createGuest = async () => {
    const id = crypto.randomUUID()
    try {
      await request('POST', '/api/users', { deviceId: id, nickname })
      localStorage.setItem(DEFAULT_DEVICE_ID_KEY, id)
      setDeviceId(id)
      setMsg('')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e))
    }
  }

  if (screen.name === 'game')
    return <GamePlayScreen mode={screen.mode} onExit={home} onFinished={(id) => setScreen({ name: 'result', id })} onUnauthorized={() => setDeviceId(null)} />
  if (screen.name === 'streak') return <StreakPlayScreen onExit={home} onUnauthorized={() => setDeviceId(null)} />

  return (
    <div className={s.root}>
      <div className={s.wrap}>
        <div className={s.h1} style={{ marginTop: 24 }}>
          실전 2지선다 미리보기
        </div>
        <div className={s.cap}>{mock ? '가짜 서버(?mock) 모드' : `실제 서버: ${import.meta.env.VITE_API_BASE_URL ?? '같은 출처 /api'}`}</div>

        {screen.name === 'result' && <div className={s.card}>판 {screen.id} 완료 → 여기서 판 결과 화면(FE B)으로 넘어가요.</div>}

        {!deviceId ? (
          <div className={s.card}>
            <div className={s.label}>게스트 계정 만들기 (개발용)</div>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 2~10자"
              style={{ marginTop: 8, width: '100%', padding: 10, fontSize: 15 }}
            />
            <button className={s.btn} style={{ marginTop: 10 }} onClick={() => void createGuest()}>
              만들기
            </button>
            {msg && <div className={s.error}>{msg}</div>}
          </div>
        ) : (
          <div className={s.stack}>
            <button className={s.btn} onClick={() => setScreen({ name: 'game', mode: 'NORMAL' })}>
              실전 시작 →
            </button>
            <button className={`${s.btn} ${s.btnDark}`} onClick={() => setScreen({ name: 'game', mode: 'WEAKNESS_RETRY' })}>
              약점 재도전
            </button>
            <button className={`${s.btn} ${s.btnDark}`} onClick={() => setScreen({ name: 'streak' })}>
              연승 챌린지
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
