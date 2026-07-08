import { useNavigate, useLocation } from 'react-router-dom'
import { routeIndex, routeList } from '../../routes'

export function PreviousNext() {
  const navigate = useNavigate()
  const location = useLocation()
  const index = routeIndex(location.pathname)
  const prev = index > 0 ? routeList[index - 1] : null
  const next = index >= 0 && index < routeList.length - 1 ? routeList[index + 1] : null

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        disabled={!prev}
        onClick={() => prev && navigate(prev.path)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-slate-50"
      >
        ← {prev ? prev.label : 'Previous'}
      </button>
      <button
        type="button"
        disabled={!next}
        onClick={() => next && navigate(next.path)}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-blue-700"
      >
        {next ? next.label : 'Next'} →
      </button>
    </div>
  )
}
