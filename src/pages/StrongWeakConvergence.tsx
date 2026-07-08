import { useMemo, useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'

const PARK_MILLER_M = 2 ** 31 - 1
const PARK_MILLER_A = 16807
const S0 = 10
const T = 1
const MU = 0.6
const SIGMA = 0.25
const DEFAULT_SEED = 123
const REPORT_PATH_COUNT = 1_000_000
const DEFAULT_PATH_COUNT = REPORT_PATH_COUNT
const H_VALUES: number[] = [0.005, 0.0025, 0.00125, 0.000625]
const PATH_COUNT_OPTIONS: number[] = [1000, 5000, 10000, 20000, REPORT_PATH_COUNT]

type ErrorRow = {
  h: number
  N: number
  strongEm: number
  strongMilstein: number
  weakEm: number
  weakMilstein: number
}

type ErrorKey = 'strongEm' | 'strongMilstein' | 'weakEm' | 'weakMilstein'

const REFERENCE_ROWS: ErrorRow[] = [
  { h: 0.005, N: 200, strongEm: 4.7877e-2, strongMilstein: 1.7911e-2, weakEm: 1.6384e-2, weakMilstein: 1.6384e-2 },
  { h: 0.0025, N: 400, strongEm: 3.2992e-2, strongMilstein: 8.9628e-3, weakEm: 8.2350e-3, weakMilstein: 8.1929e-3 },
  { h: 0.00125, N: 800, strongEm: 2.3007e-2, strongMilstein: 4.4827e-3, weakEm: 4.1122e-3, weakMilstein: 4.0978e-3 },
  { h: 0.000625, N: 1600, strongEm: 1.6147e-2, strongMilstein: 2.2420e-3, weakEm: 2.0407e-3, weakMilstein: 2.0499e-3 },
]

function fmt(value: number, digits = 6) {
  return value.toFixed(digits)
}

function sci(value: number) {
  return value.toExponential(4).replace('e', ' x 10^')
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function normaliseSeed(seed: number, M = PARK_MILLER_M) {
  let value = Math.trunc(seed) % M
  if (value <= 0) value += M - 1
  return value
}

function createLcg(seed: number) {
  let state = normaliseSeed(seed)
  return () => {
    state = (PARK_MILLER_A * state) % PARK_MILLER_M
    return state / PARK_MILLER_M
  }
}

function createNormal(seed: number) {
  const nextUniform = createLcg(seed)
  let spare: number | null = null

  return () => {
    if (spare !== null) {
      const value = spare
      spare = null
      return value
    }

    const u1 = Math.max(nextUniform(), Number.EPSILON)
    const u2 = nextUniform()
    const radius = Math.sqrt(-2 * Math.log(u1))
    const angle = 2 * Math.PI * u2
    spare = radius * Math.sin(angle)
    return radius * Math.cos(angle)
  }
}

function convergenceRows(pathCount: number, seed: number): ErrorRow[] {
  if (pathCount === REPORT_PATH_COUNT && seed === DEFAULT_SEED) return REFERENCE_ROWS

  return H_VALUES.map((h, hIndex) => {
    const N = Math.round(T / h)
    const sqrtH = Math.sqrt(h)
    const normal = createNormal(seed + hIndex + 1)
    const exactDrift = (MU - 0.5 * SIGMA ** 2) * T
    const milsteinCoeff = 0.5 * SIGMA ** 2
    const logEm = Array(pathCount).fill(0) as number[]
    const logMilstein = Array(pathCount).fill(0) as number[]
    const brownianT = Array(pathCount).fill(0) as number[]

    for (let i = 0; i < N; i += 1) {
      for (let path = 0; path < pathCount; path += 1) {
        const dB = sqrtH * normal()
        logEm[path] += Math.log1p(MU * h + SIGMA * dB)
        logMilstein[path] += Math.log1p(MU * h + SIGMA * dB + milsteinCoeff * (dB ** 2 - h))
        brownianT[path] += dB
      }
    }

    let strongEm = 0
    let strongMilstein = 0
    let weakEm = 0
    let weakMilstein = 0

    for (let path = 0; path < pathCount; path += 1) {
      const exact = S0 * Math.exp(exactDrift + SIGMA * brownianT[path])
      const em = S0 * Math.exp(logEm[path])
      const milstein = S0 * Math.exp(logMilstein[path])
      const emError = exact - em
      const milsteinError = exact - milstein

      strongEm += Math.abs(emError)
      strongMilstein += Math.abs(milsteinError)
      weakEm += emError
      weakMilstein += milsteinError
    }

    return {
      h,
      N,
      strongEm: strongEm / pathCount,
      strongMilstein: strongMilstein / pathCount,
      weakEm: Math.abs(weakEm / pathCount),
      weakMilstein: Math.abs(weakMilstein / pathCount),
    }
  })
}

function estimateOrder(rows: ErrorRow[], key: ErrorKey) {
  const xs = rows.map((row) => Math.log(row.h))
  const ys = rows.map((row) => Math.log(row[key]))
  const xMean = xs.reduce((sum, value) => sum + value, 0) / xs.length
  const yMean = ys.reduce((sum, value) => sum + value, 0) / ys.length
  const numerator = xs.reduce((sum, value, index) => sum + (value - xMean) * (ys[index] - yMean), 0)
  const denominator = xs.reduce((sum, value) => sum + (value - xMean) ** 2, 0)
  return numerator / denominator
}

function OrdersSummary({ rows }: { rows: ErrorRow[] }) {
  const orders = [
    { label: 'Strong EM', value: estimateOrder(rows, 'strongEm'), expected: '1/2', color: 'text-blue-700' },
    { label: 'Strong Milstein', value: estimateOrder(rows, 'strongMilstein'), expected: '1', color: 'text-emerald-700' },
    { label: 'Weak EM', value: estimateOrder(rows, 'weakEm'), expected: '1', color: 'text-blue-700' },
    { label: 'Weak Milstein', value: estimateOrder(rows, 'weakMilstein'), expected: '1', color: 'text-emerald-700' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {orders.map((order) => (
        <div key={order.label} className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{order.label}</p>
          <p className={`mt-1 font-mono text-2xl font-semibold ${order.color}`}>{fmt(order.value, 4)}</p>
          <p className="mt-1 text-xs text-slate-500">
            expected order <InlineEquation latex={order.expected} />
          </p>
        </div>
      ))}
    </div>
  )
}

function ErrorTable({ rows, title }: { rows: ErrorRow[]; title: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full text-right text-sm text-slate-700">
          <thead>
            <tr>
              <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">h</th>
              <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">N</th>
              <th className="border border-slate-200 bg-blue-50 px-3 py-2 font-semibold text-blue-700">Strong EM</th>
              <th className="border border-slate-200 bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">Strong Milstein</th>
              <th className="border border-slate-200 bg-blue-50 px-3 py-2 font-semibold text-blue-700">Weak EM</th>
              <th className="border border-slate-200 bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">Weak Milstein</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.h}>
                <td className="border border-slate-200 px-3 py-2 text-left font-mono">{fmt(row.h, 6)}</td>
                <td className="border border-slate-200 px-3 py-2 font-mono">{formatInteger(row.N)}</td>
                <td className="border border-slate-200 bg-blue-50 px-3 py-2 font-mono">{sci(row.strongEm)}</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">{sci(row.strongMilstein)}</td>
                <td className="border border-slate-200 bg-blue-50 px-3 py-2 font-mono">{sci(row.weakEm)}</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">{sci(row.weakMilstein)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ComparisonPlot({ rows, kind }: { rows: ErrorRow[]; kind: 'strong' | 'weak' }) {
  const width = 680
  const height = 360
  const margin = { top: 36, right: 24, bottom: 52, left: 66 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const emKey: ErrorKey = kind === 'strong' ? 'strongEm' : 'weakEm'
  const milsteinKey: ErrorKey = kind === 'strong' ? 'strongMilstein' : 'weakMilstein'
  const xs = rows.map((row) => Math.log10(row.h))
  const ys = rows.flatMap((row) => [Math.log10(row[emKey]), Math.log10(row[milsteinKey])])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const x = (value: number) => margin.left + ((value - minX) / (maxX - minX)) * plotWidth
  const y = (value: number) => margin.top + (1 - (value - minY) / (maxY - minY)) * plotHeight
  const polyline = (key: ErrorKey) =>
    rows.map((row) => `${x(Math.log10(row.h))},${y(Math.log10(row[key]))}`).join(' ')
  const emOrder = estimateOrder(rows, emKey)
  const milsteinOrder = estimateOrder(rows, milsteinKey)

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={`${kind} convergence comparison`}>
        <text x={margin.left} y={20} className="fill-slate-900 text-sm font-semibold">
          {kind === 'strong' ? 'Strong convergence' : 'Weak convergence'}
        </text>
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-700" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-700" />
        <polyline points={polyline(emKey)} fill="none" className="stroke-blue-600" strokeWidth={2.2} />
        <polyline points={polyline(milsteinKey)} fill="none" className="stroke-emerald-600" strokeWidth={2.2} />
        {rows.map((row) => (
          <g key={`${kind}-${row.h}`}>
            <circle cx={x(Math.log10(row.h))} cy={y(Math.log10(row[emKey]))} r={4} className="fill-blue-600" />
            <circle cx={x(Math.log10(row.h))} cy={y(Math.log10(row[milsteinKey]))} r={4} className="fill-emerald-600" />
          </g>
        ))}
        <circle cx={width - 238} cy={margin.top + 10} r={4} className="fill-blue-600" />
        <text x={width - 228} y={margin.top + 14} className="fill-slate-700 text-xs">
          EM order {fmt(emOrder, 2)}
        </text>
        <circle cx={width - 124} cy={margin.top + 10} r={4} className="fill-emerald-600" />
        <text x={width - 114} y={margin.top + 14} className="fill-slate-700 text-xs">
          Milstein order {fmt(milsteinOrder, 2)}
        </text>
        <text x={width - margin.right} y={height - 12} textAnchor="end" className="fill-slate-600 text-xs">
          log10(h)
        </text>
        <text x={14} y={margin.top + 8} className="fill-slate-600 text-xs">
          log10(error)
        </text>
      </svg>
    </figure>
  )
}

function PathCountSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>simulated paths</span>
        <span className="font-mono text-slate-900">{formatInteger(value)}</span>
      </span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
      >
        {PATH_COUNT_OPTIONS.map((count) => (
          <option key={count} value={count}>
            {formatInteger(count)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function StrongWeakConvergence() {
  const [pathCount, setPathCount] = useState<number>(DEFAULT_PATH_COUNT)
  const [seed, setSeed] = useState<number>(DEFAULT_SEED)
  const safePathCount = PATH_COUNT_OPTIONS.some((option) => option === pathCount) ? pathCount : DEFAULT_PATH_COUNT
  const usesProjectExperiment = safePathCount === REPORT_PATH_COUNT && seed === DEFAULT_SEED
  const rows = useMemo(() => convergenceRows(safePathCount, seed), [safePathCount, seed])

  return (
    <PageLayout
      title="Strong and Weak Convergence"
      rightPanel={{
        known: 'Exact GBM terminal value, Euler-Maruyama terminal value, Milstein terminal value.',
        unknown: 'Empirical convergence order as h decreases.',
        method: 'Estimate terminal errors over many Brownian paths and fit a line in log-log scale.',
        takeaway: 'EM has strong order 1/2; Milstein has strong order 1. Both are first order weakly in this GBM test.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Definitions</h2>
        <p className="text-slate-700">
          Strong convergence measures pathwise terminal accuracy. Weak convergence measures accuracy of an
          expectation. In this experiment the reference solution is geometric Brownian motion:
        </p>
        <EquationBlock latex="dS(t)=\mu S(t)\,dt+\sigma S(t)\,dB(t),\qquad S(T)=S_0\exp\left(\left(\mu-\frac{\sigma^2}{2}\right)T+\sigma B(T)\right)." />
        <EquationBlock latex="\mathrm{strong}(h)=\mathbb E\left(|S(T)-S_N|\right),\qquad \mathrm{weak}(h)=\left|\mathbb E[S(T)-S_N]\right|." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Numerical Schemes</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Euler-Maruyama</p>
            <EquationBlock latex="S_{i+1}^{EM}=S_i^{EM}+\mu S_i^{EM}h+\sigma S_i^{EM}\Delta B_i." />
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-800">Milstein</p>
            <EquationBlock latex="S_{i+1}^{M}=S_i^{M}+\mu S_i^{M}h+\sigma S_i^{M}\Delta B_i+\frac12\sigma^2S_i^{M}\left((\Delta B_i)^2-h\right)." />
          </div>
        </div>
        <p className="text-slate-700">
          For terminal-only convergence tests, the products are accumulated through logarithms for numerical
          stability. If <InlineEquation latex="\mathrm{Error}(h)\approx Ch^\gamma" />, then{' '}
          <InlineEquation latex="\gamma" /> is estimated as the slope of the log-log regression.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation</h2>
        <div className="grid gap-4 text-sm text-slate-700 lg:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
          <PathCountSlider
            value={safePathCount}
            onChange={(value) => {
              setPathCount(value)
              if (value === REPORT_PATH_COUNT) setSeed(DEFAULT_SEED)
            }}
          />
          <label>
            <span className="mb-1 block font-medium">seed</span>
            <input
              type="number"
              step={1}
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value))}
              disabled={usesProjectExperiment}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span>
            <InlineEquation latex={`S_0=${S0}`} />
          </span>
          <span>
            <InlineEquation latex={`T=${T}`} />
          </span>
          <span>
            <InlineEquation latex={`\\mu=${MU}`} />
          </span>
          <span>
            <InlineEquation latex={`\\sigma=${SIGMA}`} />
          </span>
          <span>
            <InlineEquation latex="h_i=0.005(1/2)^i,\quad i=0,1,2,3" />
          </span>
          <span>
            <InlineEquation latex={`M=${formatInteger(safePathCount)}`} />
          </span>
        </div>
        <OrdersSummary rows={rows} />
        <ErrorTable rows={rows} title="Simulation results" />
        <div className="grid gap-4 lg:grid-cols-2">
          <ComparisonPlot rows={rows} kind="strong" />
          <ComparisonPlot rows={rows} kind="weak" />
        </div>
      </section>
    </PageLayout>
  )
}
