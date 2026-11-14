// 생각 말풍선: 구름 모양 + 아래 왼쪽으로 이어지는 작은 원 2개.
// 위치는 부모가 className으로 정한다 (position: absolute 권장).
// onClick이 있으면 누를 수 있는 버튼, 없으면 그냥 말풍선.
import s from '../styles/thoughtBubble.module.css'

type Props = {
  text: string
  /** true면 글자를 잠깐 숨긴다 (대사 바꿀 때 페이드) */
  fading?: boolean
  onClick?: () => void
  /** 버튼일 때 화면 읽기 도구에 들려줄 동작 설명 */
  actionLabel?: string
  className?: string
}

const CLOUD_PATH =
  'M40 30a28 28 0 0 1 50-12a30 30 0 0 1 50 4a26 26 0 0 1 38 28a24 24 0 0 1-6 46' +
  'a28 28 0 0 1-44 18a30 30 0 0 1-52 0a28 28 0 0 1-44-20a24 24 0 0 1 8-64z'

export function ThoughtBubble({ text, fading = false, onClick, actionLabel, className }: Props) {
  const classes = `${s.bubble} ${onClick ? s.clickable : ''} ${fading ? s.fading : ''} ${className ?? ''}`
  const body = (
    <>
      <svg className={s.cloud} viewBox="0 0 202 134" preserveAspectRatio="none" aria-hidden>
        <path d={CLOUD_PATH} />
      </svg>
      <span className={s.text}>{text}</span>
      <i className={`${s.dot} ${s.dotBig}`} aria-hidden />
      <i className={`${s.dot} ${s.dotSmall}`} aria-hidden />
    </>
  )

  if (!onClick) return <div className={classes}>{body}</div>
  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-label={actionLabel ? `${text} (${actionLabel})` : undefined}
    >
      {body}
    </button>
  )
}
