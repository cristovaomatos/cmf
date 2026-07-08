type OptionKind = 'call' | 'put'
type ChartMode = 'payoff' | 'profit'

function payoff(kind: OptionKind, S: number, K: number) {
  return kind === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0)
}

function format(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function PayoffChart({
  kind,
  mode = 'payoff',
  K = 10,
  premium = 1.5,
}: {
  kind: OptionKind
  mode?: ChartMode
  K?: number
  premium?: number
}) {
  const width = 420
  const height = 260
  const margin = { top: 28, right: 24, bottom: 42, left: 48 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const Smax = 2 * K
  const yMin = mode === 'profit' ? -2 * premium : 0
  const yMax = K + premium
  const value = (S: number) => payoff(kind, S, K) - (mode === 'profit' ? premium : 0)
  const x = (S: number) => margin.left + (S / Smax) * plotWidth
  const y = (v: number) => margin.top + ((yMax - v) / (yMax - yMin)) * plotHeight
  const samples = Array.from({ length: 81 }, (_, index) => (index / 80) * Smax)
  const line = samples.map((S) => `${x(S)},${y(value(S))}`).join(' ')
  const zeroY = y(0)
  const breakEven = kind === 'call' ? K + premium : K - premium
  const title =
    mode === 'payoff'
      ? `${kind === 'call' ? 'Call' : 'Put'} payoff at maturity`
      : `${kind === 'call' ? 'Call' : 'Put'} profit after premium`

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        <text x={margin.left} y={18} className="fill-slate-900 text-sm font-semibold">
          {title}
        </text>
        <line x1={margin.left} y1={zeroY} x2={width - margin.right} y2={zeroY} className="stroke-slate-300" />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-700" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-700" />
        <line
          x1={x(K)}
          y1={margin.top}
          x2={x(K)}
          y2={height - margin.bottom}
          className="stroke-slate-400"
          strokeDasharray="4 4"
        />
        {mode === 'profit' && breakEven > 0 && breakEven < Smax && (
          <line
            x1={x(breakEven)}
            y1={margin.top}
            x2={x(breakEven)}
            y2={height - margin.bottom}
            className="stroke-amber-500"
            strokeDasharray="4 4"
          />
        )}
        <polyline
          points={line}
          fill="none"
          className={kind === 'call' ? 'stroke-blue-600' : 'stroke-emerald-600'}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x={width - margin.right} y={height - 12} textAnchor="end" className="fill-slate-600 text-xs">
          S_T
        </text>
        <text x={13} y={margin.top + 8} className="fill-slate-600 text-xs">
          {mode === 'payoff' ? 'payoff' : 'profit'}
        </text>
        <text x={x(K)} y={height - 18} textAnchor="middle" className="fill-slate-600 text-xs">
          K={format(K)}
        </text>
        {mode === 'profit' && breakEven > 0 && breakEven < Smax && (
          <text x={x(breakEven)} y={margin.top - 7} textAnchor="middle" className="fill-amber-700 text-xs">
            BE={format(breakEven)}
          </text>
        )}
        <text x={margin.left - 8} y={zeroY + 4} textAnchor="end" className="fill-slate-500 text-xs">
          0
        </text>
        {mode === 'profit' && (
          <text x={margin.left - 8} y={y(-premium) + 4} textAnchor="end" className="fill-slate-500 text-xs">
            -premium
          </text>
        )}
      </svg>
      <figcaption className="mt-2 text-xs text-slate-600">
        {mode === 'payoff'
          ? 'The payoff ignores the premium paid today.'
          : 'Profit subtracts the premium from the payoff.'}
      </figcaption>
    </figure>
  )
}
