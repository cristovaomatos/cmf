import { Katex } from './Katex'

export function EquationBlock({ latex, caption }: { latex: string; caption?: string }) {
  return (
    <div className="overflow-x-auto rounded-md bg-slate-50 px-4 py-3">
      <Katex math={latex} display />
      {caption && <p className="mt-1 text-center text-xs text-slate-500">{caption}</p>}
    </div>
  )
}

export function InlineEquation({ latex }: { latex: string }) {
  return <Katex math={latex} />
}
