import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CAT_FROM_API, CATS } from '../../shared/constants/domain'
import TypeAvatar from '../../shared/components/TypeAvatar'
import { useAsync } from '../../shared/hooks/useAsync'
import { useLayout } from '../../shared/layouts/useLayout'
import { saveNickname } from '../../shared/store/guest'
import { fetchDailyCalendar } from '../home/api'
import { weakTypeKey } from './lib/weakType'
import { getMyGrowth } from './api/growthApi'
import { useProfile } from './hooks/useProfile'
import { useUpdateNickname } from './hooks/useUpdateNickname'

export default function ProfilePage() {
  const nav = useNavigate()
  const { profile, loading, error, reload, setNickname } = useProfile()
  const { reloadSummary } = useLayout()
  const { data: calendar, loading: calendarLoading, error: calendarError, reload: reloadCalendar } = useAsync(fetchDailyCalendar, null)
  const { data: growth, loading: growthLoading, error: growthError, reload: reloadGrowth } = useAsync(getMyGrowth, null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const nickname = useUpdateNickname({ onSuccess: (name) => {
    setNickname(name)
    saveNickname(name)
    reloadSummary()
  } })

  async function save() {
    const saved = await nickname.update(draft)
    if (saved) setEditing(false)
  }

  return <main className="page">
    <h1 className="t-h1 mt12">마이페이지</h1>
    {loading && <p className="t-cap mt16">프로필을 불러오는 중…</p>}
    {!loading && error && <div className="card mt16">
      <p className="t-h2">프로필을 불러오지 못했어요</p>
      <p className="t-cap mt8">{error.message}</p>
      <button className="btn dark mt16" onClick={reload}>다시 시도</button>
    </div>}
    {profile && <>
      <section className="card mt16" style={{ textAlign: 'center' }}>
        <TypeAvatar type={weakTypeKey(profile.weakType)} size={108} />
        <h2 className="t-h1 mt8">{profile.nickname}</h2>
        <p className="t-cap">게스트 · 최고 {profile.bestWinStreak}연승</p>
        {!editing ? <button className="link mt12" onClick={() => { setDraft(profile.nickname); nickname.clearError(); setEditing(true) }}>닉네임 변경 →</button> : (
          <div className="mt12">
            <input className="inp" maxLength={10} aria-label="새 닉네임" value={draft} onChange={(e) => { setDraft(e.target.value); nickname.clearError() }} />
            {nickname.error && <p className="t-cap mt8" role="alert">{nickname.error.errors.nickname ?? nickname.error.message}</p>}
            <button className="btn mt8" disabled={nickname.saving} onClick={() => void save()}>저장</button>
            <button className="btn dark mt8" onClick={() => setEditing(false)}>취소</button>
          </div>
        )}
      </section>
      <section className="card mt12">
        <h2 className="t-h2">학습 기록</h2>
        <p className="mt8">데일리 연속 {profile.streak.current}일 · 최장 {profile.streak.longest}일</p>
        <p className="t-cap mt4">총 {profile.weakType.progress.solved}문제 풀이</p>
        <p className="t-cap">{profile.streak.completedToday ? '오늘 데일리 완료' : '오늘 데일리 아직 미완료'}</p>
      </section>
      <section className="card mt12">
        <h2 className="t-h2">나의 AI 검증 유형</h2>
        {profile.weakType.status === 'DECIDED' ? <>
          <p className="mt8"><strong>{profile.weakType.name}</strong></p>
          {profile.weakType.weakCategory && <p className="t-cap mt4">약한 계열: {CATS[CAT_FROM_API[profile.weakType.weakCategory]]?.name ?? profile.weakType.weakCategory}</p>}
          {profile.weakType.strongCategory && <p className="t-cap mt4">강한 계열: {CATS[CAT_FROM_API[profile.weakType.strongCategory]]?.name ?? profile.weakType.strongCategory}</p>}
          {profile.weakType.checkQuestion && <p className="mt8">확인 질문 · {profile.weakType.checkQuestion}</p>}
        </> : <>
          <p className="mt8">아직 유형을 분석 중이에요.</p>
          <p className="t-cap mt4">{profile.weakType.progress.solved} / {profile.weakType.progress.required}문제 풀이</p>
        </>}
      </section>
    </>}
    <section className="card mt12">
      <h2 className="t-h2">최근 4주 데일리</h2>
      {calendarLoading && <p className="t-cap mt8">달력을 불러오는 중…</p>}
      {calendarError && <><p className="t-cap mt8">{calendarError.message}</p><button className="link mt8" onClick={reloadCalendar}>다시 시도 →</button></>}
      {calendar && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 12 }}>
        {calendar.map((day) => <div key={day.date} title={day.date} style={{ borderRadius: 8, background: day.completed ? 'var(--y)' : 'var(--g2)', color: day.completed ? 'var(--ink)' : 'var(--tx3)', textAlign: 'center', padding: '8px 2px', fontSize: 12 }}>{Number(day.date.slice(-2))}</div>)}
      </div>}
    </section>
    <section className="card mt12">
      <h2 className="t-h2">나의 성장</h2>
      {growthLoading && <p className="t-cap mt8">성장 기록을 불러오는 중…</p>}
      {growthError && <><p className="t-cap mt8">{growthError.message}</p><button className="link mt8" onClick={reloadGrowth}>다시 시도 →</button></>}
      {growth && (!growth.available ? <p className="t-cap mt8">성장 기록을 확인하려면 {growth.remainingSessions}회 더 완료해 주세요.</p> : <>
        <h3 className="t-lbl mt12">최근 점수</h3>
        {growth.scoreTrend.length === 0 && <p className="t-cap mt4">아직 기록이 없어요.</p>}
        {growth.scoreTrend.map((item, i) => <p key={i} className="t-cap mt4">{item.date} · {item.sessionType === 'GAME' ? '실전' : '데일리'} · {item.score}/{item.total}</p>)}
        <h3 className="t-lbl mt12">계열별 정답률 변화</h3>
        {growth.categoryAccuracy.map((item) => <p key={item.category} className="t-cap mt4">{item.categoryName} · 처음 {item.early === null ? '기록 없음' : Math.round(item.early * 100) + '%'} → 최근 {item.recent === null ? '기록 없음' : Math.round(item.recent * 100) + '%'}</p>)}
        <h3 className="t-lbl mt12">지나온 유형</h3>
        {growth.typeHistory.map((item, i) => <p key={i} className="t-cap mt4">{item.recordedDate} · {item.name}</p>)}
      </>)}
    </section>
    <button className="btn mt16" onClick={() => nav('/daily')}>오늘의 5문제 풀기 →</button>
  </main>
}
