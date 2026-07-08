export function SectionProgress({ currentIndex, total }: { currentIndex: number; total: number }) {
  const pct = total > 0 ? ((currentIndex + 1) / total) * 100 : 0

  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div
        className="h-1.5 rounded-full bg-blue-600 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
