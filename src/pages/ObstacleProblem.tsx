import { useMemo, useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
import { ObstacleDiagram } from '../components/Visuals/ObstacleDiagram'

const K = 10
const S_MAX = 15

type NodeRow = {
  i: number
  S: number
  payoff: number
  value: number
  gap: number
  curvature: number
  product: number
  region: 'exercise' | 'continuation'
}

function fmt(value: number, digits = 4) {
  if (Math.abs(value) < 1e-10) return '0'
  return value.toFixed(digits)
}

function payoff(S: number) {
  return Math.max(K - S, 0)
}

function freeBoundary(tau: number) {
  return K - 3.2 * (1 - Math.exp(-2.4 * tau))
}

function americanValue(S: number, tau: number) {
  const sf = freeBoundary(tau)
  const g = payoff(S)
  if (S <= sf) return g

  const distance = Math.max(0, S - sf)
  const timePremium = (0.38 + 1.15 * tau) * Math.exp(-((S - (sf + 2.5)) ** 2) / (9 + 6 * tau))
  const smoothing = 1 - Math.exp(-distance / 0.85)
  return g + timePremium * smoothing * (1 - 0.2 * S / S_MAX)
}

function unconstrainedValue(S: number, tau: number) {
  const sf = freeBoundary(tau)
  const violation = (0.55 + 0.75 * tau) * Math.exp(-((S - sf * 0.72) ** 2) / (2.6 + tau))
  const continuationPremium = 0.38 * tau * Math.exp(-((S - (sf + 2.8)) ** 2) / 12)
  return payoff(S) - violation + continuationPremium
}

function makeRows(tau: number): NodeRow[] {
  const count = 11
  const h = S_MAX / (count - 1)
  const nodes = Array.from({ length: count }, (_, i) => {
    const S = i * h
    return {
      S,
      payoff: payoff(S),
      value: americanValue(S, tau),
    }
  })

  return nodes.slice(1, -1).map((node, index) => {
    const i = index + 1
    const previous = nodes[i - 1].value
    const next = nodes[i + 1].value
    const curvature = Math.max(0, -next + 2 * node.value - previous)
    const gap = Math.max(0, node.value - node.payoff)
    return {
      i,
      S: node.S,
      payoff: node.payoff,
      value: node.value,
      gap,
      curvature,
      product: gap * curvature,
      region: gap <= 0.04 ? 'exercise' : 'continuation',
    }
  })
}

function RegionLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-rose-100 ring-1 ring-rose-200" />
        exercise / stopping region
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-emerald-100 ring-1 ring-emerald-200" />
        continuation region
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-0.5 w-6 bg-slate-500" />
        payoff obstacle
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-0.5 w-6 bg-blue-600" />
        admissible American value
      </span>
    </div>
  )
}

function HeaderEquation({ latex }: { latex: string }) {
  return (
    <span className="inline-flex justify-end [&_.katex]:text-[1em]">
      <InlineEquation latex={latex} />
    </span>
  )
}

function ObstacleSimulation() {
  const [tau, setTau] = useState(0.55)
  const [showUnconstrained, setShowUnconstrained] = useState(true)
  const rows = useMemo(() => makeRows(tau), [tau])
  const sf = freeBoundary(tau)

  const width = 760
  const height = 370
  const margin = { top: 34, right: 32, bottom: 52, left: 62 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const n = 140
  const xs = Array.from({ length: n + 1 }, (_, i) => (S_MAX * i) / n)
  const yMax = K + 1.2
  const x = (S: number) => margin.left + (S / S_MAX) * plotWidth
  const y = (value: number) => margin.top + (1 - value / yMax) * plotHeight
  const path = (fn: (S: number) => number) => xs.map((S) => `${x(S)},${y(fn(S))}`).join(' ')
  const nodePoints = rows.map((row) => ({ ...row, x: x(row.S), y: y(row.value) }))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <label>
          <span className="mb-1 flex items-center justify-between gap-3 font-medium">
            <span>time to maturity variable</span>
            <span className="font-mono text-slate-900">tau = {fmt(tau, 2)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={tau}
            onChange={(event) => setTau(Number(event.target.value))}
            className="w-full"
          />
        </label>
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={showUnconstrained}
            onChange={(event) => setShowUnconstrained(event.target.checked)}
          />
          show unconstrained European-like curve
        </label>
      </div>

      <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Obstacle problem simulation">
          <rect x={margin.left} y={margin.top} width={x(sf) - margin.left} height={plotHeight} className="fill-rose-50" />
          <rect x={x(sf)} y={margin.top} width={width - margin.right - x(sf)} height={plotHeight} className="fill-emerald-50" />

          {[0, 5, 10, 15].map((tick) => (
            <g key={tick}>
              <line x1={x(tick)} y1={margin.top} x2={x(tick)} y2={height - margin.bottom} className="stroke-slate-200" />
              <text x={x(tick)} y={height - 22} textAnchor="middle" className="fill-slate-600 text-xs">
                {tick}
              </text>
            </g>
          ))}
          {[0, 5, 10].map((tick) => (
            <g key={tick}>
              <line x1={margin.left} y1={y(tick)} x2={width - margin.right} y2={y(tick)} className="stroke-slate-100" />
              <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-slate-600 text-xs">
                {tick}
              </text>
            </g>
          ))}

          <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-700" />
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-700" />

          <polyline points={path(payoff)} fill="none" className="stroke-slate-500" strokeWidth={2.2} strokeDasharray="6 4" />
          {showUnconstrained && (
            <polyline points={path((S) => unconstrainedValue(S, tau))} fill="none" className="stroke-rose-500" strokeWidth={2} strokeDasharray="4 4" />
          )}
          <polyline points={path((S) => americanValue(S, tau))} fill="none" className="stroke-blue-600" strokeWidth={3} />
          <line x1={x(sf)} y1={margin.top} x2={x(sf)} y2={height - margin.bottom} className="stroke-emerald-700" strokeWidth={1.7} strokeDasharray="4 3" />

          {nodePoints.map((point) => (
            <circle
              key={point.i}
              cx={point.x}
              cy={point.y}
              r={4}
              className={point.region === 'exercise' ? 'fill-rose-600' : 'fill-emerald-600'}
            />
          ))}

          <text x={x(sf)} y={margin.top - 10} textAnchor="middle" className="fill-emerald-800 text-xs font-semibold">
            S_f(tau)
          </text>
          <text x={margin.left + 14} y={margin.top + 20} className="fill-rose-700 text-xs font-semibold">
            exercise
          </text>
          <text x={x(sf) + 12} y={margin.top + 20} className="fill-emerald-700 text-xs font-semibold">
            continuation
          </text>
          <text x={width - margin.right} y={height - 8} textAnchor="end" className="fill-slate-600 text-xs">
            S
          </text>
          <text x={14} y={margin.top + 8} className="fill-slate-600 text-xs">
            value
          </text>
        </svg>
        <figcaption className="mt-2 space-y-2 text-sm text-slate-600">
          <RegionLegend />
          <p>
            The blue curve is constrained to remain above the dashed payoff. Where it touches the payoff,
            exercising is optimal. Where it stays strictly above, the holder continues.
          </p>
        </figcaption>
      </figure>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="min-w-full text-right text-sm text-slate-700">
          <thead>
            <tr>
              <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">node</th>
              <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
                <HeaderEquation latex="S_i" />
              </th>
              <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
                <HeaderEquation latex="g_i" />
              </th>
              <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
                <HeaderEquation latex="w_i" />
              </th>
              <th className="border border-slate-200 bg-blue-50 px-3 py-2 font-semibold text-blue-700">
                <HeaderEquation latex="w_i-g_i" />
              </th>
              <th className="border border-slate-200 bg-amber-50 px-3 py-2 font-semibold text-amber-700">
                <HeaderEquation latex="-w_{i+1}+2w_i-w_{i-1}" />
              </th>
              <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">region</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.i}>
                <td className="border border-slate-200 px-3 py-2 text-left font-mono">i = {row.i}</td>
                <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.S, 2)}</td>
                <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.payoff)}</td>
                <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.value)}</td>
                <td className="border border-slate-200 bg-blue-50 px-3 py-2 font-mono">{fmt(row.gap)}</td>
                <td className="border border-slate-200 bg-amber-50 px-3 py-2 font-mono">{fmt(row.curvature)}</td>
                <td
                  className={`border border-slate-200 px-3 py-2 text-left font-semibold ${
                    row.region === 'exercise' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {row.region}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MatrixObstacleView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
        <p className="mb-2 text-sm font-semibold text-slate-900">Continuous complementarity</p>
        <EquationBlock latex="\begin{aligned}u-g&\geq0,\\ -u''&\geq0,\\ (-u'')(u-g)&=0,\\ u(-1)&=u(1)=0.\end{aligned}" />
        <p className="text-sm text-slate-600">
          Either the string is above the obstacle and is locally straight, or it touches the obstacle and
          the inequality force is active.
        </p>
      </div>
      <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
        <p className="mb-2 text-sm font-semibold text-slate-900">Discrete complementarity</p>
        <EquationBlock latex="\begin{aligned}(\mathbf w-\mathbf g)^TA\mathbf w&=0,\\ A\mathbf w&\geq0,\\ \mathbf w-\mathbf g&\geq0.\end{aligned}" />
        <p className="text-sm text-slate-600">
          This version avoids explicitly locating the unknown contact points. They are recovered after the
          solution by checking where <InlineEquation latex="w_i=g_i" />.
        </p>
      </div>
    </div>
  )
}

export default function ObstacleProblem() {
  return (
    <PageLayout
      title="Obstacle Problem"
      rightPanel={{
        known: 'The payoff obstacle g(S), the continuation PDE, and the boundary/initial data.',
        unknown: 'The option value and the free boundary separating exercise from continuation.',
        method: 'Replace a PDE equality by a complementarity problem with the constraint U >= g.',
        takeaway:
          'An American put is not solved by the PDE everywhere: in the exercise region the value is pinned to the payoff, while in the continuation region the Black-Scholes equation is active.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Why an Obstacle Appears</h2>
        <p className="text-slate-700">
          An American option can be exercised before maturity. For an American put, immediate exercise gives
          the payoff <InlineEquation latex="g(S)=(K-S)^+" />. Therefore the option value cannot be below
          this payoff:
        </p>
        <EquationBlock latex="V_A^P(S,t)\geq (K-S)^+,\qquad 0\leq t\leq T." />
        <p className="text-slate-700">
          If the value were below the payoff, one could buy the option and exercise immediately to obtain a
          risk-free gain. The payoff is therefore an obstacle or floor for the value function.
        </p>
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-slate-700">
          <p className="font-semibold text-slate-900">Key distinction</p>
          <p className="mt-1">
            A European put may lie below the immediate exercise payoff for small asset prices before
            maturity, because early exercise is not allowed. An American put cannot: the holder may stop
            and receive <InlineEquation latex="K-S" /> immediately.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Free Boundary View</h2>
        <p className="text-slate-700">
          For a put, there is typically a critical asset price <InlineEquation latex="S_f(t)" />. Below it,
          exercise is optimal and the option value coincides with the payoff. Above it, it is better to keep
          the option alive:
        </p>
        <EquationBlock latex="\begin{aligned}V_A^P(S,t)&=K-S, && S\leq S_f(t),\\ V_A^P(S,t)&>(K-S)^+, && S>S_f(t).\end{aligned}" />
        <p className="text-slate-700">
          The curve <InlineEquation latex="\Gamma_{S_f}=\{(S,t):S=S_f(t)\}" /> is called a free boundary
          because its location is not known in advance. At the contact curve, the solution touches the payoff
          smoothly:
        </p>
        <EquationBlock latex="V_A^P(S_f(t),t)=K-S_f(t),\qquad \frac{\partial V_A^P}{\partial S}(S_f(t),t)=-1." />
        <ObstacleDiagram showProjection />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Classical Obstacle Analogy</h2>
        <p className="text-slate-700">
          A useful way to understand the mathematics is a string stretched above an obstacle. The string
          must stay above the obstacle <InlineEquation latex="g" />. Where it is not touching the obstacle,
          it is straight; where it touches, the obstacle constraint is active.
        </p>
        <EquationBlock latex="\text{if }u>g,\text{ then }u''=0,\qquad \text{if }u=g,\text{ then }-u''\geq0." />
        <p className="text-slate-700">
          The strength of the complementarity formulation is that it does not require knowing the contact
          points in advance. It solves for the function and the contact set at the same time.
        </p>
        <MatrixObstacleView />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Discrete Obstacle Problem</h2>
        <p className="text-slate-700">
          On a grid <InlineEquation latex="x_i=-1+ih_x" />, let <InlineEquation latex="w_i\approx u(x_i)" />
          and <InlineEquation latex="g_i=g(x_i)" />. The second derivative is represented by the centered
          stencil
        </p>
        <EquationBlock latex="-w_{i+1}+2w_i-w_{i-1}\geq0,\qquad i=1,\ldots,N_x-1." />
        <p className="text-slate-700">
          With <InlineEquation latex="\mathbf w=(w_1,\ldots,w_{N_x-1})^T" /> and{' '}
          <InlineEquation latex="\mathbf g=(g_1,\ldots,g_{N_x-1})^T" />, the matrix form uses the positive
          tridiagonal matrix
        </p>
        <EquationBlock latex="A=\begin{pmatrix}2&-1&0&\cdots&0\\-1&2&-1&\ddots&\vdots\\0&-1&2&\ddots&0\\\vdots&\ddots&\ddots&\ddots&-1\\0&\cdots&0&-1&2\end{pmatrix}" />
        <EquationBlock latex="\begin{aligned}(\mathbf w-\mathbf g)^TA\mathbf w&=0,\\ A\mathbf w&\geq0,\\ \mathbf w&\geq\mathbf g.\end{aligned}" />
        <p className="text-slate-700">
          A node cannot simultaneously be strictly above the obstacle and have a positive obstacle reaction.
          That is the meaning of the product condition.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation: Exercise Versus Continuation</h2>
        <p className="text-slate-700">
          The visual example below shows the American constraint as a projection above the payoff. The
          red dashed curve is an unconstrained European-like value that may violate the obstacle. The blue
          curve is admissible: it either touches the payoff or remains strictly above it.
        </p>
        <ObstacleSimulation />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Connection with American Put Pricing</h2>
        <p className="text-slate-700">
          After a finite-difference time step, the European Crank-Nicolson method would solve a linear
          system such as <InlineEquation latex="A_{CN}\mathbf w=\mathbf r" />. For an American put, the new
          vector must also satisfy the payoff constraint. The time step becomes a linear complementarity
          problem:
        </p>
        <EquationBlock latex="\begin{aligned}\mathbf w-\mathbf g&\geq0,\\ A_{CN}\mathbf w-\mathbf r&\geq0,\\ (\mathbf w-\mathbf g)^T(A_{CN}\mathbf w-\mathbf r)&=0.\end{aligned}" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="mb-1 text-sm font-semibold text-emerald-900">Continuation node</p>
            <Katex math="w_i>g_i\quad\Rightarrow\quad (A_{CN}\mathbf w-\mathbf r)_i=0" display />
            <p className="text-sm text-slate-700">The PDE equality is active; waiting is optimal.</p>
          </div>
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="mb-1 text-sm font-semibold text-rose-900">Exercise node</p>
            <Katex math="w_i=g_i\quad\Rightarrow\quad (A_{CN}\mathbf w-\mathbf r)_i\geq0" display />
            <p className="text-sm text-slate-700">The obstacle is active; immediate exercise is optimal.</p>
          </div>
        </div>
        <p className="text-slate-700">
          The next page solves this complementarity system with PSOR: each relaxation step is followed by a
          projection, ensuring the computed value never falls below the payoff.
        </p>
      </section>
    </PageLayout>
  )
}
