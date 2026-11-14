// 마이페이지 (PF_01·PF_02 프로필, PF_03 나의 성장). /profile 하단 탭 화면.
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CHARACTER_NAME } from '../../../assets/characters'
import TypeAvatar from '../../../shared/components/TypeAvatar'
import { useAsync } from '../../../shared/hooks/useAsync'
import { clearGuest } from '../../../shared/store/guest'
import { DailyCalendar, GrowthPanel } from '../../growth'
import { fetchWrongAnswers } from '../../notes/api'
import { TYPE_DETAIL, TYPE_GUIDE_TEXT, typeCheckLine } from '../../result'
import type { ProfileResponse } from '../api/types'
import { NicknameSheet } from '../components/NicknameSheet'
import { TypeGuide } from '../components/TypeGuide'
import { useProfile } from '../hooks/useProfile'
import { typeColor } from '../lib/typeColor'
import { weakTypeKey } from '../lib/weakType'
import s from '../styles/profile.module.css'

type Tab = 'profile' | 'growth'

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: '프로필' },
  { key: 'growth', label: '나의 성장' },
]

export function ProfileScreen() {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <main className="page">
      <h1 className="t-h1 mt12">마이페이지</h1>
      <div className="tabs mt12" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? 'on' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'profile' ? <ProfileTab /> : <GrowthPanel />}
    </main>
  )
}

function ProfileTab() {
  const nav = useNavigate()
  const { profile, loading, error, reload, setNickname } = useProfile()
  const unauthorized = error?.code === 'USER_NOT_FOUND'

  useEffect(() => {
    if (!unauthorized) return
    clearGuest()
    nav('/start', { replace: true })
  }, [unauthorized, nav])

  if (profile) return <ProfileBody profile={profile} onNicknameSaved={setNickname} />

  if (error && !unauthorized) {
    return (
      <div className="card mt16">
        <p className="t-h2">프로필을 불러오지 못했어요</p>
        <p className="t-cap mt4">{error.message}</p>
        <button className="btn dark mt16" onClick={reload}>
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <p className="t-cap mt24" role="status">
      {loading ? '불러오는 중…' : ''}
    </p>
  )
}

function ProfileBody({ profile, onNicknameSaved }: { profile: ProfileResponse; onNicknameSaved: (n: string) => void }) {
  const [editing, setEditing] = useState(false)
  const notes = useAsync(fetchWrongAnswers, null)
  const type = weakTypeKey(profile.weakType)
  const { progress } = profile.weakType

  return (
    <>
      <section className={`${s.card} ${s.me}`}>
        <div className={s.meAvatar}>
          <TypeAvatar type={type} size={64} />
        </div>
        <div className={s.meText}>
          <div className={s.nickname}>{profile.nickname}</div>
          <div className="t-cap">게스트 · 최장 {profile.bestWinStreak}연승</div>
        </div>
        <button className={s.textBtn} onClick={() => setEditing(true)}>
          닉네임 수정
        </button>
      </section>

      <section className={s.stats}>
        <Stat label="데일리 연속" value={`${profile.streak.current}일`} />
        <Stat label="최장 연속" value={`${profile.streak.longest}일`} />
        <Stat label="푼 문제" value={String(progress.solved)} />
      </section>

      <div className={s.calendarWrap}>
        <DailyCalendar />
      </div>

      {type ? (
        <section className={`${s.card} ${s.weak}`} style={{ '--accent': typeColor(type) } as CSSProperties}>
          <div className={s.weakText}>
            <div className="t-lbl">{TYPE_GUIDE_TEXT.currentLabel}</div>
            <div className={s.weakName}>{CHARACTER_NAME[type]}</div>
            <p className={s.weakQuote}>“{TYPE_DETAIL[type].quote}”</p>
            <p className={s.weakCheck}>{typeCheckLine(type)}</p>
          </div>
          <TypeAvatar type={type} size={72} />
        </section>
      ) : (
        <section className={`${s.card} ${s.weak}`}>
          <div className={s.weakText}>
            <div className="t-lbl">{TYPE_GUIDE_TEXT.currentLabel}</div>
            <div className={s.weakName}>{TYPE_GUIDE_TEXT.emptyTitle}</div>
            <p className="t-cap mt8">{TYPE_GUIDE_TEXT.emptyDescription}</p>
            <div className={s.progress} aria-label={`유형 분석 ${progress.solved}/${progress.required}문제`}>
              <i style={{ width: `${Math.min(100, (progress.solved / progress.required) * 100)}%` }} />
            </div>
            <p className={s.progressText}>
              {Math.min(progress.solved, progress.required)} / {progress.required}문제
            </p>
          </div>
          <TypeAvatar type={null} size={72} />
        </section>
      )}

      <Link to="/notes" className={`${s.card} ${s.notesLink}`}>
        <span className="t-h2">오답노트</span>
        <span className={s.notesCount}>
          {notes.data ? `${notes.data.items.length}문제` : notes.error ? '' : '…'} →
        </span>
      </Link>

      <TypeGuide current={type} />

      {editing && (
        <NicknameSheet current={profile.nickname} onClose={() => setEditing(false)} onSaved={onNicknameSaved} />
      )}
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={s.stat}>
      <div className={s.statLabel}>{label}</div>
      <div className={s.statValue}>{value}</div>
    </div>
  )
}
