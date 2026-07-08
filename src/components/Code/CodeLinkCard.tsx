export function CodeLinkCard({ file, onClick }: { file: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 enabled:hover:border-blue-300 enabled:hover:bg-blue-50"
    >
      <span aria-hidden className="text-slate-400">{'</>'}</span>
      <span className="font-mono">{file}</span>
    </button>
  )
}
