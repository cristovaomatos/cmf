import { useMemo, useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'

type StageId = 'f1' | 'f2' | 'f3' | 'f4' | 'update'

const stages: Array<{
  id: StageId
  label: string
  labelLatex: string
  title: string
  latex: string
  description: string
}> = [
  {
    id: 'f1',
    label: 'f1',
    labelLatex: '\\mathbf f_1',
    title: 'Initial slope',
    latex: '\\mathbf f_1=h_tF(t_j,\\mathbf U^j)',
    description: 'Evaluate the derivative at the known beginning of the time step.',
  },
  {
    id: 'f2',
    label: 'f2',
    labelLatex: '\\mathbf f_2',
    title: 'First midpoint slope',
    latex: '\\mathbf f_2=h_tF\\left(t_j+\\frac{h_t}{2},\\mathbf U^j+\\frac{\\mathbf f_1}{2}\\right)',
    description: 'Use f1 to estimate a midpoint state, then evaluate the derivative there.',
  },
  {
    id: 'f3',
    label: 'f3',
    labelLatex: '\\mathbf f_3',
    title: 'Second midpoint slope',
    latex: '\\mathbf f_3=h_tF\\left(t_j+\\frac{h_t}{2},\\mathbf U^j+\\frac{\\mathbf f_2}{2}\\right)',
    description: 'Use f2 to build a second midpoint estimate and sample the derivative again.',
  },
  {
    id: 'f4',
    label: 'f4',
    labelLatex: '\\mathbf f_4',
    title: 'Endpoint slope',
    latex: '\\mathbf f_4=h_tF(t_j+h_t,\\mathbf U^j+\\mathbf f_3)',
    description: 'Use f3 to estimate the end-of-step state and evaluate the final derivative.',
  },
  {
    id: 'update',
    label: 'update',
    labelLatex: '\\text{update}',
    title: 'Weighted average update',
    latex:
      '\\mathbf U^{j+1}=\\mathbf U^j+\\frac{1}{6}\\left(\\mathbf f_1+2\\mathbf f_2+2\\mathbf f_3+\\mathbf f_4\\right)',
    description: 'Combine the four increments with Simpson-type weights: 1, 2, 2, 1.',
  },
]

const stageColor: Record<StageId, string> = {
  f1: '#2563eb',
  f2: '#d97706',
  f3: '#d97706',
  f4: '#dc2626',
  update: '#059669',
}

function ode(t: number, u: number) {
  return u - 0.45 * t + 0.35
}

function rk4Example() {
  const h = 0.5
  const t0 = 0
  const u0 = 1
  const k1Slope = ode(t0, u0)
  const f1 = h * k1Slope
  const uMid1 = u0 + f1 / 2
  const k2Slope = ode(t0 + h / 2, uMid1)
  const f2 = h * k2Slope
  const uMid2 = u0 + f2 / 2
  const k3Slope = ode(t0 + h / 2, uMid2)
  const f3 = h * k3Slope
  const uEndEstimate = u0 + f3
  const k4Slope = ode(t0 + h, uEndEstimate)
  const f4 = h * k4Slope
  const increment = (f1 + 2 * f2 + 2 * f3 + f4) / 6
  const u1 = u0 + increment
  const averageSlope = increment / h

  return {
    h,
    t0,
    u0,
    tMid: t0 + h / 2,
    t1: t0 + h,
    f1,
    f2,
    f3,
    f4,
    uMid1,
    uMid2,
    uEndEstimate,
    u1,
    averageSlope,
    k1Slope,
    k2Slope,
    k3Slope,
    k4Slope,
  }
}

function fmt(value: number, digits = 4) {
  return value.toFixed(digits)
}

function SvgStageLabel({ id, x, y }: { id: StageId; x: number; y: number }) {
  if (id === 'update') return null
  return (
    <text x={x} y={y} className="fill-slate-800 text-xs font-semibold">
      <tspan>f</tspan>
      <tspan baselineShift="sub" fontSize="10">
        {id.slice(1)}
      </tspan>
    </text>
  )
}

function SvgUjLabel({ x, y, colorClass, next = false, anchor }: { x: number; y: number; colorClass: string; next?: boolean; anchor?: 'start' | 'end' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={`${colorClass} text-sm font-semibold`}>
      <tspan>U</tspan>
      <tspan baselineShift="super" fontSize="10">
        {next ? 'j+1' : 'j'}
      </tspan>
    </text>
  )
}

function SvgTimeLabel({ kind, x, y }: { kind: 'start' | 'mid' | 'end'; x: number; y: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" className="fill-slate-600 text-xs">
      <tspan>t</tspan>
      <tspan baselineShift="sub" fontSize="10">
        j
      </tspan>
      {kind !== 'start' && <tspan> + h</tspan>}
      {kind !== 'start' && (
        <tspan baselineShift="sub" fontSize="10">
          t
        </tspan>
      )}
      {kind === 'mid' && <tspan>/2</tspan>}
    </text>
  )
}

function StageDiagram({ active }: { active: StageId }) {
  const example = useMemo(() => rk4Example(), [])
  const width = 680
  const height = 380
  const margin = { top: 34, right: 32, bottom: 52, left: 62 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const tMin = -0.04
  const tMax = 0.58
  const uMin = 0.88
  const uMax = 1.78
  const x = (t: number) => margin.left + ((t - tMin) / (tMax - tMin)) * plotWidth
  const y = (u: number) => margin.top + (1 - (u - uMin) / (uMax - uMin)) * plotHeight
  const tangent = (t: number, u: number, slope: number, length = 0.17) => {
    const leftT = t - length / 2
    const rightT = t + length / 2
    const leftU = u - (slope * length) / 2
    const rightU = u + (slope * length) / 2
    return { x1: x(leftT), y1: y(leftU), x2: x(rightT), y2: y(rightU) }
  }
  const activeColor = stageColor[active]
  const points = [
    { id: 'f1' as StageId, t: example.t0, u: example.u0, slope: example.k1Slope },
    { id: 'f2' as StageId, t: example.tMid, u: example.uMid1, slope: example.k2Slope },
    { id: 'f3' as StageId, t: example.tMid, u: example.uMid2, slope: example.k3Slope },
    { id: 'f4' as StageId, t: example.t1, u: example.uEndEstimate, slope: example.k4Slope },
  ]
  const solutionPoints = [
    `${x(example.t0)},${y(example.u0)}`,
    `${x(example.tMid)},${y(example.u0 + example.averageSlope * (example.h / 2))}`,
    `${x(example.t1)},${y(example.u1)}`,
  ].join(' ')

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="RK4 stage diagram">
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-700" />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-700" />
        {[example.t0, example.tMid, example.t1].map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} y1={margin.top} x2={x(tick)} y2={height - margin.bottom} className="stroke-slate-200" strokeDasharray="4 5" />
            <SvgTimeLabel
              kind={tick === example.t0 ? 'start' : tick === example.t1 ? 'end' : 'mid'}
              x={x(tick)}
              y={height - 22}
            />
          </g>
        ))}

        <polyline points={solutionPoints} fill="none" className="stroke-emerald-600" strokeWidth={3} />
        <circle cx={x(example.t0)} cy={y(example.u0)} r={5} className="fill-blue-600" />
        <circle cx={x(example.t1)} cy={y(example.u1)} r={5} className="fill-emerald-600" />
        <SvgUjLabel x={x(example.t0) - 10} y={y(example.u0) - 12} anchor="end" colorClass="fill-blue-700" />
        <SvgUjLabel x={x(example.t1) + 10} y={y(example.u1) - 10} next colorClass="fill-emerald-700" />

        {points.map((point) => {
          const isActive = active === point.id || active === 'update'
          const line = tangent(point.t, point.u, point.slope)
          return (
            <g key={point.id} opacity={isActive ? 1 : 0.28}>
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={stageColor[point.id]}
                strokeWidth={isActive ? 4 : 2}
                strokeLinecap="round"
              />
              <circle
                cx={x(point.t)}
                cy={y(point.u)}
                r={isActive ? 6 : 4}
                fill={stageColor[point.id]}
                className="stroke-white"
                strokeWidth={2}
              />
              <SvgStageLabel
                id={point.id}
                x={x(point.t) + (point.id === 'f2' ? -80 : 12)}
                y={y(point.u) + (point.id === 'f3' ? 22 : -10)}
              />
            </g>
          )
        })}

        {active === 'update' && (
          <g>
            <rect x={width - 240} y={margin.top + 8} width={205} height={54} rx={6} className="fill-emerald-50 stroke-emerald-200" />
            <text x={width - 226} y={margin.top + 30} className="fill-emerald-800 text-xs font-semibold">
              average derivative
            </text>
            <text x={width - 226} y={margin.top + 48} className="fill-emerald-800 text-xs">
              weighted RK4 increment
            </text>
          </g>
        )}

        {active !== 'update' && (
          <g>
            <rect x={width - 220} y={margin.top + 8} width={185} height={48} rx={6} fill={`${activeColor}18`} stroke={activeColor} />
            <text x={width - 207} y={margin.top + 28} className="fill-slate-900 text-xs font-semibold">
              selected derivative stage
            </text>
            <SvgStageLabel id={active} x={width - 207} y={margin.top + 45} />
          </g>
        )}

        <text x={width - margin.right} y={height - 8} textAnchor="end" className="fill-slate-600 text-xs">
          t
        </text>
        <text x={14} y={margin.top + 6} className="fill-slate-600 text-xs">
          U
        </text>
      </svg>
      <figcaption className="mt-2 text-sm text-slate-600">
        Each colored segment is a derivative evaluation. The green curve is the final RK4 step obtained
        from their weighted average.
      </figcaption>
    </figure>
  )
}

function StageTable({ active }: { active: StageId }) {
  const example = useMemo(() => rk4Example(), [])
  const rows = [
    { id: 'f1' as StageId, stage: '\\mathbf f_1', state: '\\mathbf U^j', time: 't_j', value: example.f1 },
    { id: 'f2' as StageId, stage: '\\mathbf f_2', state: '\\mathbf U^j+\\mathbf f_1/2', time: 't_j+h_t/2', value: example.f2 },
    { id: 'f3' as StageId, stage: '\\mathbf f_3', state: '\\mathbf U^j+\\mathbf f_2/2', time: 't_j+h_t/2', value: example.f3 },
    { id: 'f4' as StageId, stage: '\\mathbf f_4', state: '\\mathbf U^j+\\mathbf f_3', time: 't_j+h_t', value: example.f4 },
  ]

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full text-right text-sm text-slate-700">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">stage</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">time</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">state estimate</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">increment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={active === row.id ? 'bg-blue-50' : undefined}>
              <td className="border border-slate-200 px-3 py-2 text-left font-semibold">
                <InlineEquation latex={row.stage} />
              </td>
              <td className="border border-slate-200 px-3 py-2">
                <InlineEquation latex={row.time} />
              </td>
              <td className="border border-slate-200 px-3 py-2">
                <InlineEquation latex={row.state} />
              </td>
              <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.value)}</td>
            </tr>
          ))}
          <tr className="bg-emerald-50 font-semibold">
            <td className="border border-slate-200 px-3 py-2 text-left">update</td>
            <td className="border border-slate-200 px-3 py-2">
              <InlineEquation latex="t_j+h_t" />
            </td>
            <td className="border border-slate-200 px-3 py-2">
              <InlineEquation latex="\mathbf U^j+\text{weighted average}" />
            </td>
            <td className="border border-slate-200 px-3 py-2">
              <InlineEquation latex={`\\mathbf U^{j+1}=${fmt(example.u1)}`} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function RungeKutta4Method() {
  const [active, setActive] = useState<StageId>('f1')
  const activeStage = stages.find((stage) => stage.id === active) ?? stages[0]

  return (
    <PageLayout
      title="Classical Runge-Kutta 4 Method"
      rightPanel={{
        known: 'The current value U^j and a right-hand side F(t,U) for an ODE or ODE system.',
        unknown: 'The next value U^{j+1}.',
        method: 'Sample the derivative four times inside the time step and average the increments.',
        takeaway:
          'RK4 is explicit and fourth order in time. It estimates the average derivative over one time step using four staged evaluations.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Motivation</h2>
        <p className="text-slate-700">
          After a PDE has been discretised in space, or when we start directly from an ODE, the remaining
          time evolution can often be written as
        </p>
        <EquationBlock latex="\frac{d\mathbf U}{dt}=F(t,\mathbf U),\qquad \mathbf U(t_j)\approx \mathbf U^j." />
        <p className="text-slate-700">
          A first-order explicit step would use only the derivative at the beginning of the interval.
          Runge-Kutta 4 improves this by sampling the derivative at the beginning, two midpoint estimates,
          and the end of the interval.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Derivation</h2>
        <p className="text-slate-700">
          Integrating the ODE over one time step gives the exact relation
        </p>
        <EquationBlock latex="\mathbf U(t_j+h_t)=\mathbf U(t_j)+\int_{t_j}^{t_j+h_t}F(t,\mathbf U(t))\,dt." />
        <p className="text-slate-700">
          RK4 approximates this integral by a weighted average of four derivative evaluations. We write the
          four quantities as increments, not as solution values:
        </p>
        <EquationBlock latex="\begin{aligned}\mathbf f_1&=h_tF(t_j,\mathbf U^j),\\ \mathbf f_2&=h_tF\left(t_j+\frac{h_t}{2},\mathbf U^j+\frac{\mathbf f_1}{2}\right),\\ \mathbf f_3&=h_tF\left(t_j+\frac{h_t}{2},\mathbf U^j+\frac{\mathbf f_2}{2}\right),\\ \mathbf f_4&=h_tF(t_j+h_t,\mathbf U^j+\mathbf f_3),\\ \mathbf U^{j+1}&=\mathbf U^j+\frac{1}{6}\left(\mathbf f_1+2\mathbf f_2+2\mathbf f_3+\mathbf f_4\right).\end{aligned}" />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Visual Interpretation</h2>
        <p className="text-slate-700">
          The derivative <InlineEquation latex="F(t,\mathbf U)" /> is the local slope of the solution. RK4
          does not trust a single slope. It builds temporary states inside the time step, evaluates the
          derivative there, and then combines the four increments.
        </p>
        <div className="flex flex-wrap gap-2">
          {stages.map((stage) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActive(stage.id)}
              className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${
                active === stage.id
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <InlineEquation latex={stage.labelLatex} />
            </button>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] xl:items-start">
          <StageDiagram active={active} />
          <div className="space-y-3">
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{activeStage.title}</p>
              <div className="mt-2">
                <EquationBlock latex={activeStage.latex} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{activeStage.description}</p>
            </div>
            <StageTable active={active} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>Start with the known state <InlineEquation latex="\mathbf U^j" /> at time <InlineEquation latex="t_j" />.</li>
            <li>Evaluate the first increment <InlineEquation latex="\mathbf f_1" /> at the beginning of the step.</li>
            <li>Use <InlineEquation latex="\mathbf f_1/2" /> to estimate a midpoint state and compute <InlineEquation latex="\mathbf f_2" />.</li>
            <li>Use <InlineEquation latex="\mathbf f_2/2" /> to estimate another midpoint state and compute <InlineEquation latex="\mathbf f_3" />.</li>
            <li>Use <InlineEquation latex="\mathbf f_3" /> to estimate the endpoint state and compute <InlineEquation latex="\mathbf f_4" />.</li>
            <li>Advance the solution with the weighted average <InlineEquation latex="(\mathbf f_1+2\mathbf f_2+2\mathbf f_3+\mathbf f_4)/6" />.</li>
          </ol>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Approximation Order</h2>
        <div className="rounded-md border border-cyan-200 bg-cyan-50 px-4 py-3 text-slate-700">
          Classical RK4 is fourth order in time:
          <div className="mt-2">
            <InlineEquation latex="\mathbf U(t_{j+1})-\mathbf U^{j+1}=O(h_t^5)\quad\text{locally},\qquad O(h_t^4)\quad\text{globally}." />
          </div>
        </div>
        <p className="text-slate-700">
          The next page uses this method after the spatial part of the Black-Scholes equation has been
          converted into a system of ODEs by the Method of Lines.
        </p>
      </section>
    </PageLayout>
  )
}
