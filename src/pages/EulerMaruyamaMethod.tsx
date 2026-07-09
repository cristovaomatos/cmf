import { useMemo, useState } from 'react'
import { MatlabCodePanel } from '../components/Code/MatlabCodePanel'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { eulerMaruyamaSnippets } from '../data/matlabSnippets'
import { createLcg } from '../utils/lcg'

const S0 = 10
const T = 1
const MU = 0.6
const SIGMA = 0.25
const DEFAULT_PATH_STEPS = 1000
const DEFAULT_PATH_SEED = 123

type PathPoint = {
  t: number
  exact: number
  em: number
}

type CalculationStep = {
  i: number
  t: number
  z: number
  dB: number
  start: number
  drift: number
  diffusion: number
  next: number
}

function fmt(value: number, digits = 6) {
  return value.toFixed(digits)
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
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

function eulerMaruyamaPath(N: number, seed: number): PathPoint[] {
  const h = T / N
  const sqrtH = Math.sqrt(h)
  const normal = createNormal(seed)
  const points: PathPoint[] = [{ t: 0, exact: S0, em: S0 }]
  let brownian = 0
  let em = S0

  for (let i = 0; i < N; i += 1) {
    const dB = sqrtH * normal()
    brownian += dB
    em = em + MU * em * h + SIGMA * em * dB
    const t = (i + 1) * h
    const exact = S0 * Math.exp((MU - 0.5 * SIGMA ** 2) * t + SIGMA * brownian)
    points.push({ t, exact, em })
  }

  return points
}

function eulerMaruyamaSteps(N: number, seed: number, count = 10): CalculationStep[] {
  const h = T / N
  const sqrtH = Math.sqrt(h)
  const normal = createNormal(seed)
  const rows: CalculationStep[] = []
  let em = S0

  for (let i = 0; i < Math.min(count, N); i += 1) {
    const z = normal()
    const dB = sqrtH * z
    const drift = MU * em * h
    const diffusion = SIGMA * em * dB
    const next = em + drift + diffusion

    rows.push({
      i,
      t: i * h,
      z,
      dB,
      start: em,
      drift,
      diffusion,
      next,
    })

    em = next
  }

  return rows
}

function DownsampledPathPlot({ points }: { points: PathPoint[] }) {
  const width = 840
  const height = 360
  const margin = { top: 30, right: 24, bottom: 44, left: 58 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const values = points.flatMap((point) => [point.exact, point.em])
  const minY = Math.min(...values) * 0.985
  const maxY = Math.max(...values) * 1.015
  const stride = Math.max(1, Math.floor(points.length / 500))
  const displayed = points.filter((_, index) => index % stride === 0 || index === points.length - 1)
  const x = (t: number) => margin.left + (t / T) * plotWidth
  const y = (value: number) => margin.top + (1 - (value - minY) / (maxY - minY)) * plotHeight
  const path = (key: 'exact' | 'em') =>
    displayed.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.t)} ${y(point[key])}`).join(' ')

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Pathwise comparison">
        <text x={margin.left} y={18} className="fill-slate-900 text-sm font-semibold">
          Exact geometric Brownian motion vs Euler-Maruyama
        </text>
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-700" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-700" />
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={x(tick)} y1={height - margin.bottom} x2={x(tick)} y2={height - margin.bottom + 5} className="stroke-slate-500" />
            <text x={x(tick)} y={height - 18} textAnchor="middle" className="fill-slate-600 text-xs">
              {tick}
            </text>
          </g>
        ))}
        {[minY, (minY + maxY) / 2, maxY].map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={margin.left - 5} y1={y(tick)} x2={margin.left} y2={y(tick)} className="stroke-slate-500" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-slate-600 text-xs">
              {fmt(tick, 1)}
            </text>
          </g>
        ))}
        <path d={path('exact')} fill="none" className="stroke-slate-900" strokeWidth={2.2} />
        <path d={path('em')} fill="none" className="stroke-blue-600" strokeWidth={2.2} strokeDasharray="6 5" />
        <circle cx={width - 198} cy={margin.top + 10} r={4} className="fill-slate-900" />
        <text x={width - 188} y={margin.top + 14} className="fill-slate-700 text-xs">
          exact
        </text>
        <circle cx={width - 126} cy={margin.top + 10} r={4} className="fill-blue-600" />
        <text x={width - 116} y={margin.top + 14} className="fill-slate-700 text-xs">
          Euler-Maruyama
        </text>
        <text x={width - margin.right} y={height - 8} textAnchor="end" className="fill-slate-600 text-xs">
          t
        </text>
        <text x={12} y={margin.top + 8} className="fill-slate-600 text-xs">
          S(t)
        </text>
      </svg>
    </figure>
  )
}

function StepCalculationTable({ rows }: { rows: CalculationStep[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full text-right text-sm text-slate-700">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">
              <InlineEquation latex="i" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
              <InlineEquation latex="t_i" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
              <InlineEquation latex="Z_i" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
              <InlineEquation latex="\Delta B_i" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
              <InlineEquation latex="S_i" />
            </th>
            <th className="border border-slate-200 bg-amber-50 px-3 py-2 font-semibold text-amber-700">
              <InlineEquation latex="\mu S_i h" />
            </th>
            <th className="border border-slate-200 bg-blue-50 px-3 py-2 font-semibold text-blue-700">
              <InlineEquation latex="\sigma S_i\Delta B_i" />
            </th>
            <th className="border border-slate-200 bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">
              <InlineEquation latex="S_{i+1}" />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.i}>
              <td className="border border-slate-200 px-3 py-2 text-left font-mono">{row.i}</td>
              <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.t, 4)}</td>
              <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.z, 5)}</td>
              <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.dB, 5)}</td>
              <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.start, 5)}</td>
              <td className="border border-slate-200 bg-amber-50 px-3 py-2 font-mono">{fmt(row.drift, 5)}</td>
              <td className="border border-slate-200 bg-blue-50 px-3 py-2 font-mono">{fmt(row.diffusion, 5)}</td>
              <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono font-semibold">{fmt(row.next, 5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function EulerMaruyamaMethod() {
  const [pathSteps, setPathSteps] = useState(DEFAULT_PATH_STEPS)
  const [seed, setSeed] = useState(DEFAULT_PATH_SEED)

  const safePathSteps = Math.min(5000, Math.max(50, Math.trunc(pathSteps || 50)))
  const path = useMemo(() => eulerMaruyamaPath(safePathSteps, seed), [safePathSteps, seed])
  const firstSteps = useMemo(() => eulerMaruyamaSteps(safePathSteps, seed), [safePathSteps, seed])
  const finalPoint = path[path.length - 1]

  return (
    <PageLayout
      title="Euler-Maruyama Method"
      rightPanel={{
        known: 'SDE coefficients a(t,x), b(t,x), initial value, time step, and Brownian increments.',
        unknown: 'A pathwise numerical approximation X_i approx X(t_i).',
        method: 'Freeze drift and diffusion at the left endpoint of each time step.',
        takeaway:
          'Euler-Maruyama is simple and robust, with strong order 1/2 and weak order 1 under regularity assumptions.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Derivation</h2>
        <p className="text-slate-700">
          Start from the Ito SDE
        </p>
        <EquationBlock latex="dX(t)=a(t,X(t))\,dt+b(t,X(t))\,dB(t),\qquad X(0)=x_0." />
        <p className="text-slate-700">
          On a time interval <InlineEquation latex="[t_i,t_{i+1}]" />, the integral form is
        </p>
        <EquationBlock latex="X(t_{i+1})=X(t_i)+\int_{t_i}^{t_{i+1}}a(s,X(s))\,ds+\int_{t_i}^{t_{i+1}}b(s,X(s))\,dB(s)." />
        <p className="text-slate-700">
          Euler-Maruyama freezes both coefficients at the left endpoint:
        </p>
        <EquationBlock latex="\int_{t_i}^{t_{i+1}}a(s,X(s))\,ds\approx a(t_i,X_i)h,\qquad \int_{t_i}^{t_{i+1}}b(s,X(s))\,dB(s)\approx b(t_i,X_i)\Delta B_i." />
        <EquationBlock latex="X_{i+1}=X_i+a(t_i,X_i)h+b(t_i,X_i)\Delta B_i,\qquad \Delta B_i=\sqrt{h}\,Z_i,\quad Z_i\sim N(0,1)." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>Choose <InlineEquation latex="N" /> and set <InlineEquation latex="h=T/N" />.</li>
            <li>Set <InlineEquation latex="X_0=x_0" />.</li>
            <li>For <InlineEquation latex="i=0,\ldots,N-1" />, generate <InlineEquation latex="\Delta B_i=\sqrt h Z_i" />.</li>
            <li>Update <InlineEquation latex="X_{i+1}=X_i+a(t_i,X_i)h+b(t_i,X_i)\Delta B_i" />.</li>
          </ol>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation 1: Step-by-Step and Pathwise Comparison</h2>
        <p className="text-slate-700">
          We use geometric Brownian motion, because it has an exact solution and can be compared path by path
          using the same Brownian realisation:
        </p>
        <EquationBlock latex="dS(t)=\mu S(t)\,dt+\sigma S(t)\,dB(t),\qquad S(t)=S_0\exp\left(\left(\mu-\frac{\sigma^2}{2}\right)t+\sigma B(t)\right)." />
        <div className="grid gap-4 text-sm text-slate-700 lg:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
          <label className="block">
            <span className="mb-1 flex items-center justify-between gap-3 font-medium">
              <span>time steps</span>
              <span className="font-mono text-slate-900">{formatInteger(safePathSteps)}</span>
            </span>
            <input
              type="range"
              min={50}
              max={5000}
              step={50}
              value={safePathSteps}
              onChange={(event) => setPathSteps(Number(event.target.value))}
              className="w-full"
            />
          </label>
          <label>
            <span className="mb-1 block font-medium">seed</span>
            <input
              type="number"
              step={1}
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
            />
          </label>
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-slate-900">First 10 Euler-Maruyama updates</h3>
          <p className="text-sm text-slate-700">
            Each row applies <InlineEquation latex="S_{i+1}=S_i+\mu S_i h+\sigma S_i\Delta B_i" /> with the
            same Brownian increments used in the pathwise plot.
          </p>
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
              <InlineEquation latex={`N=${safePathSteps}`} />
            </span>
            <span>
              <InlineEquation latex={`h=T/N=${fmt(T / safePathSteps, 6)}`} />
            </span>
          </div>
          <StepCalculationTable rows={firstSteps} />
        </div>
        <DownsampledPathPlot points={path} />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Parameters</p>
            <p className="mt-1 text-sm text-slate-700">
              <InlineEquation latex={`S_0=${S0}`} />, <InlineEquation latex={`T=${T}`} />,
              <InlineEquation latex={`\\mu=${MU}`} />, <InlineEquation latex={`\\sigma=${SIGMA}`} />
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Terminal exact</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{fmt(finalPoint.exact, 6)}</p>
          </div>
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Terminal EM error</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{fmt(Math.abs(finalPoint.exact - finalPoint.em), 6)}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">MATLAB Implementation Example</h2>
        <p className="text-slate-700">
          The implementation receives the drift <InlineEquation latex="a(t,x)" />, diffusion{' '}
          <InlineEquation latex="b(t,x)" />, initial value, horizon, number of time steps, and seed. It
          returns the time grid, simulated path, Brownian increments, and accumulated Brownian path.
        </p>
        <MatlabCodePanel file="euler_maruyama.m" snippets={eulerMaruyamaSnippets} />
      </section>
    </PageLayout>
  )
}
