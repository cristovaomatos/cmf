import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { routeIndex, routeList } from '../../routes'
import type { RightPanelProps } from './RightPanel'
import { SectionProgress } from './SectionProgress'
import { PreviousNext } from '../Navigation/PreviousNext'

export function PageLayout({
  title,
  children,
  rightPanel: _rightPanel,
  bottomExtra,
}: {
  title: string
  children: ReactNode
  rightPanel: RightPanelProps
  bottomExtra?: ReactNode
}) {
  const location = useLocation()
  const index = routeIndex(location.pathname)

  return (
    <div className="min-h-full p-6">
      <SectionProgress currentIndex={index} total={routeList.length} />
      <h1 className="mb-6 mt-4 text-2xl font-semibold text-slate-900">{title}</h1>
      <div className="space-y-6">{children}</div>
      <div className="mt-10 space-y-4 border-t border-slate-200 pt-4">
        {bottomExtra}
        <PreviousNext />
      </div>
    </div>
  )
}
