// 유형 캐릭터. 그림은 src/assets/characters(공용)의 모션 SVG를 쓴다.
// type이 없으면(아직 유형 분석 전) 회색 물음표를 그린다.
import { CHARACTER_NAME, CHARACTER_SVG } from '../../assets/characters'
import type { TypeKey } from '../constants/domain'

interface Props {
  type: TypeKey | null | undefined
  size?: number
}

export default function TypeAvatar({ type, size = 64 }: Props) {
  if (!type) {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="유형 분석 전">
        <path
          d="M33 34C33 16 67 15 67 34C67 48 50 50 50 63"
          stroke="#3a5a4f"
          strokeWidth="17"
          fill="none"
          strokeLinecap="round"
          transform="translate(2.5 2.5)"
        />
        <path
          d="M33 34C33 16 67 15 67 34C67 48 50 50 50 63"
          stroke="#4d7466"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="52.5" cy="85.5" r="8.5" fill="#3a5a4f" />
        <circle cx="50" cy="83" r="8.5" fill="#4d7466" />
      </svg>
    )
  }
  return <img src={CHARACTER_SVG[type]} width={size} height={size} alt={CHARACTER_NAME[type]} draggable={false} />
}
