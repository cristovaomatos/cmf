import type { MatlabSnippet } from '../../data/matlabSnippets'

export function MatlabCodePanel({ file, snippets }: { file: string; snippets: MatlabSnippet[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-900 p-4">
      <div className="mb-3 font-mono text-xs text-slate-400">{file}</div>
      <div className="space-y-4">
        {snippets.map((s) => (
          <div key={s.id}>
            <div className="mb-1 text-xs font-medium text-slate-400">{s.label}</div>
            <pre className="overflow-x-auto rounded bg-slate-950 p-3 text-xs leading-relaxed text-slate-100">
              <code>{s.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
