// 판 결과 조회 훅. gameSessionId가 바뀌면 다시 불러오고, reload()로도 다시 불러온다.
//
// 사용 예:
//   const { gameSessionId } = useParams()
//   const { data: result, loading, error, reload } = useGameResult(Number(gameSessionId))
//   if (isApiError(error, 'GAME_NOT_COMPLETED')) { /* 이어 하기로 */ }
import { useAsync } from '../../../shared/hooks/useAsync'
import { getGameResult } from '../api/resultApi'

export function useGameResult(gameSessionId: number) {
  return useAsync(getGameResult, gameSessionId)
}
