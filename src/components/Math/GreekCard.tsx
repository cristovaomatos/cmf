import { Katex } from './Katex'

export function GreekCard({ name, latex, description }: { name: string; latex: string; description: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4 text-center">
      <div className="text-sm font-semibold text-slate-500">{name}</div>
      <div className="my-2 text-lg">
        <Katex math={latex} />
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  )
}
