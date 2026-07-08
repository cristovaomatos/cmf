export function StepControls({
  step,
  total,
  onStep,
  onReset,
}: {
  step: number
  total: number
  onStep: (next: number) => void
  onReset: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={step <= 0}
        onClick={() => onStep(step - 1)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-slate-50"
      >
        ← Previous step
      </button>
      <button
        type="button"
        disabled={step >= total - 1}
        onClick={() => onStep(step + 1)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-slate-50"
      >
        Reveal next step →
      </button>
      <button
        type="button"
        onClick={onReset}
        className="ml-auto rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
      >
        Reset
      </button>
    </div>
  )
}
