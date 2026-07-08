import type { ReactNode } from 'react'
import { CodeLinkCard } from '../Code/CodeLinkCard'

export interface RightPanelProps {
  known?: ReactNode
  unknown?: ReactNode
  method?: ReactNode
  matlabFile?: string
  onMatlabClick?: () => void
  takeaway: ReactNode
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  )
}

export function RightPanel({ known, unknown, method, matlabFile, onMatlabClick, takeaway }: RightPanelProps) {
  return (
    <aside className="w-80 shrink-0 space-y-5 border-l border-slate-200 bg-white p-5">
      {known && <Block title="What is known?">{known}</Block>}
      {unknown && <Block title="What is unknown?">{unknown}</Block>}
      {method && <Block title="Numerical method">{method}</Block>}
      {matlabFile && (
        <Block title="MATLAB implementation">
          <CodeLinkCard file={matlabFile} onClick={onMatlabClick} />
        </Block>
      )}
      <Block title="Key takeaway">
        <p className="rounded-md bg-blue-50 p-3 text-blue-900">{takeaway}</p>
      </Block>
    </aside>
  )
}
