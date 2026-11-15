// 유형 도감 (캡처 08, 09): 6유형 카드 2열
import type { CSSProperties } from 'react'
import { CHARACTER_NAME } from '../../../assets/characters'
import TypeAvatar from '../../../shared/components/TypeAvatar'
import type { TypeKey } from '../../../shared/constants/domain'
import { TYPE_DETAIL, TYPE_GUIDE_TEXT, TYPE_ORDER, typeCheckLine } from '../../result'
import { typeColor } from '../lib/typeColor'
import s from '../styles/profile.module.css'

export function TypeGuide({ current }: { current: TypeKey | null }) {
  return (
    <section className={s.section}>
      <div className={s.sectionHead}>
        <h2 className="t-h2">{TYPE_GUIDE_TEXT.guideTitle}</h2>
        <span className="t-cap">{TYPE_GUIDE_TEXT.guideRule}</span>
      </div>
      <p className={s.guideIntro}>{TYPE_GUIDE_TEXT.guideIntro}</p>
      <ul className={s.guide}>
        {TYPE_ORDER.map((type) => {
          const detail = TYPE_DETAIL[type]
          const mine = type === current
          return (
            <li
              key={type}
              className={`${s.typeCard} ${mine ? s.typeCardMine : ''}`}
              style={{ '--accent': typeColor(type) } as CSSProperties}
            >
              <div className={s.typeAvatar}>
                <TypeAvatar type={type} size={60} />
              </div>
              <div className={s.typeName}>
                {CHARACTER_NAME[type]}
                {mine && <span className={s.mineTag}>내 유형</span>}
              </div>
              <p className={s.typeDesc}>{detail.description}</p>
              <p className={s.typeQuote}>“{detail.quote}”</p>
              <p className={s.typeCheck}>{typeCheckLine(type)}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
