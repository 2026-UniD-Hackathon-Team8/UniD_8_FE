// 개발용 미리보기 화면 (growth-dev.html). 프로필 화면(FE B)에 붙이기 전에 혼자 확인하는 용도.
import { useState } from 'react'
import { DailyCalendar, GrowthPanel } from '..'

export function Preview() {
  const [tab, setTab] = useState<'basic' | 'growth'>('basic')
  return (
    <main className="page">
      <h1 className="t-h1 mt12">{tab === 'basic' ? '마이페이지' : '나의 성장'}</h1>
      <div className="tabs mt12">
        <button className={tab === 'basic' ? 'on' : ''} onClick={() => setTab('basic')}>
          프로필
        </button>
        <button className={tab === 'growth' ? 'on' : ''} onClick={() => setTab('growth')}>
          나의 성장
        </button>
      </div>
      {tab === 'basic' ? (
        <div className="mt16">
          <DailyCalendar />
        </div>
      ) : (
        <GrowthPanel />
      )}
    </main>
  )
}
