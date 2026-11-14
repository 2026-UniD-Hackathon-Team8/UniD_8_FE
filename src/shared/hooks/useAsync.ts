/* 데이터 불러오기 공통 훅
   const { data, loading, error, reload } = useAsync(fetchRanking, kind)
   fetcher 는 컴포넌트 밖(모듈)에서 만든 함수를 넘깁니다. */
import { useEffect, useState } from 'react'

interface State<T> {
  key: string | null
  data: T | null
  error: Error | null
}

export function useAsync<T, A>(fetcher: (arg: A) => Promise<T>, arg: A) {
  const [tick, setTick] = useState(0)
  const [state, setState] = useState<State<T>>({ key: null, data: null, error: null })
  const reqKey = `${String(arg)}#${tick}`

  useEffect(() => {
    let alive = true
    fetcher(arg)
      .then((data) => {
        if (alive) setState({ key: reqKey, data, error: null })
      })
      .catch((e: unknown) => {
        if (alive)
          setState((s) => ({ key: reqKey, data: s.data, error: e instanceof Error ? e : new Error(String(e)) }))
      })
    return () => {
      alive = false
    }
  }, [fetcher, arg, reqKey])

  return {
    data: state.data,
    error: state.key === reqKey ? state.error : null,
    loading: state.key !== reqKey,
    reload: () => setTick((t) => t + 1),
  }
}
