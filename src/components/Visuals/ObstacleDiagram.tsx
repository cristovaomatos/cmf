import { useState } from 'react'
import { europeanParams } from '../../data/parameters'

const { K, Smax } = europeanParams

function payoff(S: number) {
  return Math.max(K - S, 0)
}

// Synthetic unconstrained curve that dips below the payoff floor near S slightly below K,
// illustrating why a naive (unconstrained) solve would violate the early-exercise constraint.
function unconstrained(S: number) {
  const base = payoff(S) - 0.9 * Math.exp(-((S - K * 0.55) ** 2) / 6)
  return base
}

export function ObstacleDiagram({ showProjection }: { showProjection: boolean }) {
  const [showRegions, setShowRegions] = useState(true)
  const width = 520
  const height = 260
  const margin = 30
  const n = 80
  const xs = Array.from({ length: n + 1 }, (_, i) => (Smax * i) / n)

  const sx = (S: number) => margin + (S / Smax) * (width - 2 * margin)
  const sy = (V: number) => height - margin - (V / K) * (height - 2 * margin)

  const payoffPoints = xs.map((S) => `${sx(S)},${sy(payoff(S))}`).join(' ')
  const rawPoints = xs.map((S) => `${sx(S)},${sy(unconstrained(S))}`).join(' ')
  const projectedPoints = xs.map((S) => `${sx(S)},${sy(Math.max(unconstrained(S), payoff(S)))}`).join(' ')

  // Crossing point between payoff and the synthetic curve approximates the illustrative free boundary.
  const crossing = xs.find((S) => unconstrained(S) >= payoff(S)) ?? Smax * 0.6

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl">
        {showRegions && (
          <>
            <rect x={margin} y={margin} width={sx(crossing) - margin} height={height - 2 * margin} className="fill-red-50" />
            <rect x={sx(crossing)} y={margin} width={width - margin - sx(crossing)} height={height - 2 * margin} className="fill-emerald-50" />
          </>
        )}
        <polyline points={payoffPoints} className="fill-none stroke-slate-500" strokeWidth={2} strokeDasharray="5 3" />
        {!showProjection && (
          <polyline points={rawPoints} className="fill-none stroke-red-500" strokeWidth={2} />
        )}
        {showProjection && (
          <polyline points={projectedPoints} className="fill-none stroke-blue-600" strokeWidth={2.5} />
        )}
        <line x1={sx(crossing)} y1={margin} x2={sx(crossing)} y2={height - margin} className="stroke-emerald-600" strokeWidth={1.5} strokeDasharray="3 3" />
        <text x={sx(crossing)} y={margin - 8} textAnchor="middle" className="fill-emerald-700 text-[10px]">S_f</text>
        <text x={sx(crossing) - 4} y={height - 10} textAnchor="end" className="fill-red-600 text-[10px]">exercise</text>
        <text x={sx(crossing) + 4} y={height - 10} className="fill-emerald-700 text-[10px]">continuation</text>
      </svg>
      <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={showRegions} onChange={(e) => setShowRegions(e.target.checked)} />
        Shade continuation / exercise regions
      </label>
      <p className="mt-1 text-xs text-slate-500">
        Dashed line: payoff <code>g(S)</code>. {showProjection ? 'Blue' : 'Red'} line: {showProjection ? 'projected (admissible) solution' : 'unconstrained solution dipping below the payoff'}.
      </p>
    </div>
  )
}
