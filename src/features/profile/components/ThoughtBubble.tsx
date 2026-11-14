// 생각 말풍선: 구름 모양 + 아래 왼쪽으로 이어지는 작은 원 2개. 누르면 닫힌다.
// 위치는 부모가 className으로 정한다 (position: absolute 권장).
import s from '../styles/thoughtBubble.module.css'

type Props = {
  text: string
  onClose: () => void
  className?: string
}

const CLOUD_PATH =
  'M40 30a28 28 0 0 1 50-12a30 30 0 0 1 50 4a26 26 0 0 1 38 28a24 24 0 0 1-6 46' +
  'a28 28 0 0 1-44 18a30 30 0 0 1-52 0a28 28 0 0 1-44-20a24 24 0 0 1 8-64z'

export function ThoughtBubble({ text, onClose, className }: Props) {
  return (
    <button
      type="button"
      className={`${s.bubble} ${className ?? ''}`}
      onClick={onClose}
      aria-label={`${text} (누르면 닫혀요)`}
    >
      <svg className={s.cloud} viewBox="0 0 202 134" preserveAspectRatio="none" aria-hidden>
        <path d={CLOUD_PATH} />
      </svg>
      <span className={s.text}>{text}</span>
      <i className={`${s.dot} ${s.dotBig}`} aria-hidden />
      <i className={`${s.dot} ${s.dotSmall}`} aria-hidden />
    </button>
  )
}
