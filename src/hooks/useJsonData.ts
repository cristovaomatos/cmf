import { useEffect, useState } from 'react'
import { loadJson } from '../data/loadSurface'

export interface JsonDataState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useJsonData<T>(path: string): JsonDataState<T> {
  const [state, setState] = useState<JsonDataState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    loadJson<T>(path)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [path])

  return state
}
