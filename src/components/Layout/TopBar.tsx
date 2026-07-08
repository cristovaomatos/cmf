import { useLocation } from 'react-router-dom'
import { routeIndex, routeList } from '../../routes'

export function TopBar() {
  const location = useLocation()
  const index = routeIndex(location.pathname)
  const current = routeList[index]

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-semibold text-slate-900">Computational Finance</span>
        {current && <span className="text-sm text-slate-500">{current.label}</span>}
      </div>
      {index >= 0 && (
        <span className="text-xs font-medium text-slate-400">
          Page {index + 1} of {routeList.length}
        </span>
      )}
    </header>
  )
}
