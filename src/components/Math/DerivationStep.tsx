import type { ReactNode } from 'react'

export function DerivationStep({
  index,
  total,
  title,
  children,
}: {
  index: number
  total: number
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {index + 1}
        </span>
        <span className="text-xs font-medium text-slate-400">
          Step {index + 1} of {total}
        </span>
      </div>
      <h3 className="mb-3 text-base font-semibold text-slate-900">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
