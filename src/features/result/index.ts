// 판 결과 공개 모듈
export * from './api/types'
export { getGameResult } from './api/resultApi'
export * from './constants'
export { mostWrongCatKey, wrongCountByCat } from './lib/resultView'
export { MOCK_RESULT_PERFECT, MOCK_RESULT_WEAK, getMockGameResult, setMockResult } from './mock/resultMock'
export { useGameResult } from './hooks/useGameResult'
