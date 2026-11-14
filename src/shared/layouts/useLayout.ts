import { useOutletContext } from 'react-router-dom'
import type { Summary } from '../api/home'

export interface LayoutContext {
  /** 아직 불러오는 중이면 null */
  summary: Summary | null
  reloadSummary: () => void
}

/** 탭 화면(홈·랭킹 등)에서 상단 바와 같은 요약 정보를 꺼낼 때 쓴다 */
export const useLayout = () => useOutletContext<LayoutContext>()
