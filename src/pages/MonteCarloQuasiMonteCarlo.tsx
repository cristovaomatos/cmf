import { useMemo, useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'

const PARK_MILLER_M = 2 ** 31 - 1
const PARK_MILLER_A = 16807
const PARK_MILLER_B = 0
const DEFAULT_N = 10000
const MAX_N = 100000
const DISPLAY_LIMIT = 3500
const REFERENCE_ALPHA = 0.5
const REFERENCE_VALUE = 0.7301544
const DEFAULT_SAMPLE_SIZES = [1000, 10000, 100000]

type Point2D = {
  x: number
  y: number
}

type CurvePoint = {
  alpha: number
  mc: number
  qmc: number
}

function fmt(value: number, digits = 6) {
  return value.toFixed(digits)
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
    state = (PARK_MILLER_A * state + PARK_MILLER_B) % PARK_MILLER_M
    return state / PARK_MILLER_M
  }
}

function uniformNodes(count: number, seed: number) {
  const nextUniform = createLcg(seed)
  return Array.from({ length: count }, () => ({
    x: nextUniform(),
    y: nextUniform(),
  }))
}

function radicalInverse(n: number, base: number) {
  let value = n
  let factor = 1 / base
  let result = 0

  while (value > 0) {
    const digit = value % base
    result += digit * factor
    value = Math.floor(value / base)
    factor /= base
  }

  return result
}

function haltonNodes(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    return {
      x: radicalInverse(n, 2),
      y: radicalInverse(n, 3),
    }
  })
}

function projectFunction(point: Point2D) {
  return Math.sin(10 * (point.x ** 2 - Math.sin(3 * point.y)))
}

function estimateArea(points: Point2D[], alpha: number) {
  let inside = 0
  points.forEach((point) => {
    if (projectFunction(point) < alpha) inside += 1
  })
  return inside / points.length
}

function areaCurve(mcPoints: Point2D[], qmcPoints: Point2D[], steps = 81): CurvePoint[] {
  return Array.from({ length: steps }, (_, index) => {
    const alpha = -1 + (2 * index) / (steps - 1)
    return {
      alpha,
      mc: estimateArea(mcPoints, alpha),
      qmc: estimateArea(qmcPoints, alpha),
    }
  })
}

function SimulationSizeInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span className="font-mono text-slate-900">{formatInteger(value)}</span>
      </span>
      <input
        type="range"
        min={500}
        max={MAX_N}
        step={500}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </label>
  )
}

function AlphaInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>alpha</span>
        <span className="font-mono text-slate-900">{fmt(value, 2)}</span>
      </span>
      <input
        type="range"
        min={-1}
        max={1}
        step={0.05}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </label>
  )
}

function PointRegionPlot({
  points,
  alpha,
  title,
}: {
  points: Point2D[]
  alpha: number
  title: string
}) {
  const width = 430
  const height = 430
  const margin = { top: 34, right: 20, bottom: 42, left: 48 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const x = (value: number) => margin.left + value * plotWidth
  const y = (value: number) => margin.top + (1 - value) * plotHeight
  const shownPoints = points.slice(0, DISPLAY_LIMIT)
  const radius = shownPoints.length <= 1000 ? 2.1 : 1.45
  const area = estimateArea(points, alpha)

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        <text x={margin.left} y={20} className="fill-slate-900 text-sm font-semibold">
          {title}
        </text>
        <rect
          x={margin.left}
          y={margin.top}
          width={plotWidth}
          height={plotHeight}
          fill="white"
          className="stroke-slate-300"
        />
        {[0.25, 0.5, 0.75].map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} y1={margin.top} x2={x(tick)} y2={height - margin.bottom} className="stroke-slate-200" />
            <line x1={margin.left} y1={y(tick)} x2={width - margin.right} y2={y(tick)} className="stroke-slate-200" />
          </g>
        ))}
        {shownPoints.map((point, index) => {
          const inside = projectFunction(point) < alpha
          return (
            <circle
              key={index}
              cx={x(point.x)}
              cy={y(point.y)}
              r={radius}
              className={inside ? 'fill-emerald-500' : 'fill-slate-300'}
              opacity={inside ? 0.84 : 0.55}
            />
          )
        })}
        <rect x={margin.left + 10} y={margin.top + 10} width={112} height={34} rx={5} className="fill-white stroke-slate-300" opacity={0.86} />
        <text x={margin.left + 66} y={margin.top + 32} textAnchor="middle" className="fill-slate-900 text-xs font-semibold">
          estimate = {fmt(area, 4)}
        </text>
        {[0, 0.5, 1].map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={x(tick)} y1={height - margin.bottom} x2={x(tick)} y2={height - margin.bottom + 5} className="stroke-slate-500" />
            <text x={x(tick)} y={height - 18} textAnchor="middle" className="fill-slate-600 text-xs">
              {tick}
            </text>
          </g>
        ))}
        {[0, 0.5, 1].map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={margin.left - 5} y1={y(tick)} x2={margin.left} y2={y(tick)} className="stroke-slate-500" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-slate-600 text-xs">
              {tick}
            </text>
          </g>
        ))}
        <text x={width - margin.right} y={height - 8} textAnchor="end" className="fill-slate-600 text-xs">
          x
        </text>
        <text x={12} y={margin.top + 8} className="fill-slate-600 text-xs">
          y
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-slate-600">
        Green points satisfy <InlineEquation latex="f(x,y)<\alpha" />. Grey points are outside. The estimate uses all
        <span className="font-mono"> {formatInteger(points.length)} </span>
        points; the plot displays at most <span className="font-mono">{formatInteger(DISPLAY_LIMIT)}</span>.
      </figcaption>
    </figure>
  )
}

function AreaCurvePlot({ curve }: { curve: CurvePoint[] }) {
  const width = 820
  const height = 320
  const margin = { top: 28, right: 24, bottom: 44, left: 52 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const x = (alpha: number) => margin.left + ((alpha + 1) / 2) * plotWidth
  const y = (value: number) => margin.top + (1 - value) * plotHeight
  const path = (key: 'mc' | 'qmc') =>
    curve.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.alpha)} ${y(point[key])}`).join(' ')

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Area curve">
        <text x={margin.left} y={18} className="fill-slate-900 text-sm font-semibold">
          alpha to area estimate
        </text>
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-700" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-700" />
        {[-1, -0.5, 0, 0.5, 1].map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={x(tick)} y1={height - margin.bottom} x2={x(tick)} y2={height - margin.bottom + 5} className="stroke-slate-500" />
            <text x={x(tick)} y={height - 18} textAnchor="middle" className="fill-slate-600 text-xs">
              {tick}
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={margin.left - 5} y1={y(tick)} x2={margin.left} y2={y(tick)} className="stroke-slate-500" />
            <line x1={margin.left} y1={y(tick)} x2={width - margin.right} y2={y(tick)} className="stroke-slate-100" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-slate-600 text-xs">
              {tick}
            </text>
          </g>
        ))}
        <path d={path('mc')} fill="none" className="stroke-blue-600" strokeWidth={2.2} />
        <path d={path('qmc')} fill="none" className="stroke-emerald-600" strokeWidth={2.2} />
        <circle cx={width - 154} cy={margin.top + 8} r={4} className="fill-blue-600" />
        <text x={width - 144} y={margin.top + 12} className="fill-slate-700 text-xs">
          MC
        </text>
        <circle cx={width - 94} cy={margin.top + 8} r={4} className="fill-emerald-600" />
        <text x={width - 84} y={margin.top + 12} className="fill-slate-700 text-xs">
          QMC
        </text>
        <text x={width - margin.right} y={height - 8} textAnchor="end" className="fill-slate-600 text-xs">
          alpha
        </text>
        <text x={12} y={margin.top + 8} className="fill-slate-600 text-xs">
          area
        </text>
      </svg>
    </figure>
  )
}

function ComparisonTable({
  sizes,
  seed,
}: {
  sizes: number[]
  seed: number
}) {
  const maxSize = Math.max(...sizes)
  const mcPoints = useMemo(() => uniformNodes(maxSize, seed), [maxSize, seed])
  const qmcPoints = useMemo(() => haltonNodes(maxSize), [maxSize])

  const rows = sizes.map((N) => {
    const mc = estimateArea(mcPoints.slice(0, N), REFERENCE_ALPHA)
    const qmc = estimateArea(qmcPoints.slice(0, N), REFERENCE_ALPHA)
    return {
      N,
      mc,
      qmc,
      mcError: Math.abs(REFERENCE_VALUE - mc),
      qmcError: Math.abs(REFERENCE_VALUE - qmc),
    }
  })

  return (
    <div className="overflow-x-auto">
      <table className="text-right text-sm text-slate-700">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">N</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">MC estimate</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">MC error</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">QMC estimate</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">QMC error</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.N}>
              <td className="border border-slate-200 px-3 py-2 text-left font-mono">{formatInteger(row.N)}</td>
              <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.mc, 8)}</td>
              <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.mcError, 8)}</td>
              <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">{fmt(row.qmc, 8)}</td>
              <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">{fmt(row.qmcError, 8)}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td className="border border-slate-200 bg-slate-50 px-3 py-2 text-left">Reference</td>
            <td className="border border-slate-200 bg-slate-50 px-3 py-2" colSpan={4}>
              <Katex math={`I_{\\mathrm{ref}}\\approx ${fmt(REFERENCE_VALUE, 8)}\\quad \\text{for}\\quad \\alpha=${REFERENCE_ALPHA}`} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function MonteCarloQuasiMonteCarlo() {
  const [nodeCount, setNodeCount] = useState(DEFAULT_N)
  const [alpha, setAlpha] = useState(REFERENCE_ALPHA)
  const [seed, setSeed] = useState(123)

  const safeNodeCount = Math.min(MAX_N, Math.max(500, Math.trunc(nodeCount || 500)))
  const mcPoints = useMemo(() => uniformNodes(safeNodeCount, seed), [safeNodeCount, seed])
  const qmcPoints = useMemo(() => haltonNodes(safeNodeCount), [safeNodeCount])
  const curve = useMemo(() => areaCurve(mcPoints, qmcPoints), [mcPoints, qmcPoints])
  const mcEstimate = useMemo(() => estimateArea(mcPoints, alpha), [mcPoints, alpha])
  const qmcEstimate = useMemo(() => estimateArea(qmcPoints, alpha), [qmcPoints, alpha])

  return (
    <PageLayout
      title="Monte Carlo and Quasi-Monte Carlo"
      rightPanel={{
        known: 'A function g or indicator g_alpha on the unit square.',
        unknown: 'An integral or area written as an expectation.',
        method: 'Average the function over pseudo-random points for MC or deterministic Halton nodes for QMC.',
        takeaway:
          'Both methods use averages; the difference is the geometry of the points used to sample the region.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Context</h2>
        <p className="text-slate-700">
          Monte Carlo integration estimates an integral by sampling random points and averaging function
          values. Quasi-Monte Carlo uses the same averaging idea, but replaces pseudo-random points by
          low-discrepancy deterministic points such as Halton nodes.
        </p>
        <p className="text-slate-700">
          The simulation below uses the area-estimation problem from the project:
        </p>
        <EquationBlock latex="f(x,y)=\sin\left(10\left(x^2-\sin(3y)\right)\right),\qquad (x,y)\in[0,1]^2." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Theory</h2>
        <p className="text-slate-700">
          Let <InlineEquation latex="R\subset\mathbb R^d" /> be a rectangular integration region and let
          <InlineEquation latex="|R|" /> denote its volume. If
          <InlineEquation latex="X" /> is uniformly distributed on <InlineEquation latex="R" />, then its density is
        </p>
        <EquationBlock latex="\rho(x)=\frac{1}{|R|},\qquad x\in R." />
        <p className="text-slate-700">
          Therefore, for any integrable function <InlineEquation latex="g" />,
        </p>
        <EquationBlock latex="\mathbb E[g(X)]=\int_R g(x)\rho(x)\,dx=\frac{1}{|R|}\int_R g(x)\,dx." />
        <p className="text-slate-700">
          Rearranging gives the key Monte Carlo identity:
        </p>
        <EquationBlock latex="\int_R g(x)\,dx=|R|\,\mathbb E[g(X)]." />
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-slate-700">
            The practical idea is now simple: approximate the expected value by an average. With
            <InlineEquation latex="X_1,\ldots,X_N" /> uniformly sampled in <InlineEquation latex="R" />,
          </p>
          <EquationBlock latex="\int_R g(x)\,dx\approx |R|\,\frac{1}{N}\sum_{i=1}^{N}g(X_i)." />
        </div>
        <p className="text-slate-700">
          In the simulation we take <InlineEquation latex="R=[0,1]^2" />, so
          <InlineEquation latex="|R|=1" />. For each <InlineEquation latex="\alpha\in[-1,1]" />, define
        </p>
        <EquationBlock latex="A_\alpha=\{(x,y)\in[0,1]^2:\ f(x,y)<\alpha\}." />
        <p className="text-slate-700">
          To compute its area, use the indicator function
          <InlineEquation latex="g_\alpha(x,y)=\mathbf 1_{\{f(x,y)<\alpha\}}" />. Then
        </p>
        <EquationBlock latex="|A_\alpha|=\int_0^1\int_0^1 \mathbf 1_{\{f(x,y)<\alpha\}}\,dx\,dy." />
        <p className="text-slate-700">
          Since <InlineEquation latex="g_\alpha" /> only takes the values 0 and 1, the average is exactly a
          counting estimate: count how many sampled points fall in <InlineEquation latex="A_\alpha" /> and divide
          by the total number of points. If <InlineEquation latex="X_i=(X_{i,1},X_{i,2})" /> are pseudo-random
          uniform points, the Monte Carlo estimator is
        </p>
        <EquationBlock latex="\widehat I_{N,\alpha}=\frac{1}{N}\sum_{i=1}^{N}\mathbf 1_{\{f(X_{i,1},X_{i,2})<\alpha\}}." />
        <EquationBlock latex="\widehat I_{N,\alpha}=\frac{\#\{i:\ f(X_{i,1},X_{i,2})<\alpha\}}{N}." />
        <p className="text-slate-700">
          With Halton nodes <InlineEquation latex="z_i=(z_{i,1},z_{i,2})" />, the quasi-Monte Carlo estimator uses
          the same counting formula, but with deterministic low-discrepancy points:
        </p>
        <EquationBlock latex="\widetilde I_{N,\alpha}=\frac{1}{N}\sum_{i=1}^{N}\mathbf 1_{\{f(z_{i,1},z_{i,2})<\alpha\}}." />
        <EquationBlock latex="\widetilde I_{N,\alpha}=\frac{\#\{i:\ f(z_{i,1},z_{i,2})<\alpha\}}{N}." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Monte Carlo</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              <li>Generate <InlineEquation latex="N" /> pseudo-random points in <InlineEquation latex="[0,1]^2" />.</li>
              <li>Evaluate <InlineEquation latex="f(x_i,y_i)" /> at each point.</li>
              <li>Count the proportion satisfying <InlineEquation latex="f(x_i,y_i)<\alpha" />.</li>
            </ol>
          </div>
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Quasi-Monte Carlo</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              <li>Generate <InlineEquation latex="N" /> Halton nodes <InlineEquation latex="z_i=(\phi_2(i),\phi_3(i))" />.</li>
              <li>Evaluate <InlineEquation latex="f(z_{i,1},z_{i,2})" /> at each node.</li>
              <li>Use the same average, but over the deterministic low-discrepancy points.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation 1: Area Estimate for One Alpha</h2>
        <p className="text-slate-700">
          Move <InlineEquation latex="\alpha" /> to change the set
          <InlineEquation latex="A_\alpha" />. The green points are the sampled points that fall inside the set.
        </p>
        <div className="grid gap-4 text-sm text-slate-700 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,240px)]">
          <SimulationSizeInput label="number of points" value={safeNodeCount} onChange={setNodeCount} />
          <AlphaInput value={alpha} onChange={setAlpha} />
          <label>
            <span className="mb-1 block font-medium">MC seed</span>
            <input
              type="number"
              step={1}
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
            />
          </label>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <PointRegionPlot points={mcPoints} alpha={alpha} title={`MC, N = ${formatInteger(safeNodeCount)}`} />
          <PointRegionPlot points={qmcPoints} alpha={alpha} title={`QMC, N = ${formatInteger(safeNodeCount)}`} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Monte Carlo estimate</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{fmt(mcEstimate, 8)}</p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Quasi-Monte Carlo estimate</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{fmt(qmcEstimate, 8)}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation 2: Area Curve and Error Comparison</h2>
        <p className="text-slate-700">
          The curve approximates <InlineEquation latex="\alpha\mapsto |A_\alpha|" /> on
          <InlineEquation latex="[-1,1]" />. The table compares both estimators at
          <InlineEquation latex="\alpha=0.5" /> against a high-resolution Halton reference value.
        </p>
        <AreaCurvePlot curve={curve} />
        <ComparisonTable sizes={DEFAULT_SAMPLE_SIZES} seed={seed} />
      </section>
    </PageLayout>
  )
}
