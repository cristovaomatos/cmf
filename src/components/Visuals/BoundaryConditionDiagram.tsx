export function BoundaryConditionDiagram({ mode }: { mode: 'european' | 'american' }) {
  const W = 480
  const H = 280
  const margin = 40

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl">
      <rect
        x={margin}
        y={margin}
        width={W - 2 * margin}
        height={H - 2 * margin}
        className="fill-amber-50 stroke-slate-300"
        strokeWidth={1}
      />
      <text x={W / 2} y={margin - 12} textAnchor="middle" className="fill-slate-500 text-xs">
        interior: unknown, solved by the PDE
      </text>

      {/* initial condition, lower edge */}
      <line x1={margin} y1={H - margin} x2={W - margin} y2={H - margin} className="stroke-blue-600" strokeWidth={3} />
      <text x={W / 2} y={H - margin + 18} textAnchor="middle" className="fill-blue-700 text-xs font-medium">
        U(S,0) = u₀(S) {mode === 'american' && '= max(K−S,0)'}
      </text>

      {/* left boundary S=0 */}
      <line x1={margin} y1={margin} x2={margin} y2={H - margin} className="stroke-emerald-600" strokeWidth={3} />
      <text
        x={margin - 8}
        y={H / 2}
        textAnchor="end"
        className="fill-emerald-700 text-xs font-medium"
      >
        U(0,t)={mode === 'european' ? 'Ke⁻ʳᵗ' : 'K'}
      </text>

      {/* right boundary S=S* */}
      <line x1={W - margin} y1={margin} x2={W - margin} y2={H - margin} className="stroke-emerald-600" strokeWidth={3} />
      <text x={W - margin + 8} y={H / 2} className="fill-emerald-700 text-xs font-medium">
        U(S*,t)=0
      </text>

      {mode === 'american' && (
        <path
          d={`M ${margin} ${H - margin - 60} Q ${W / 2} ${H - margin - 90} ${W - margin} ${H - margin}`}
          className="fill-none stroke-red-500"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
      )}
      {mode === 'american' && (
        <text x={W / 2} y={H - margin - 95} textAnchor="middle" className="fill-red-600 text-xs font-medium">
          obstacle g(S)=max(K−S,0)
        </text>
      )}

      <text x={W / 2} y={H - 10} textAnchor="middle" className="fill-slate-400 text-xs">S →</text>
      <text x={16} y={H / 2} className="fill-slate-400 text-xs">t</text>
    </svg>
  )
}
