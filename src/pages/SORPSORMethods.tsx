import { useMemo, useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'

type MethodMode = 'sor' | 'psor'

const A = [
  [4, -1, 0],
  [-1, 4, -1],
  [0, -1, 3],
]
const b = [1.2, -0.45, 1.15]
const x0 = [0, 0, 0]

function fmt(value: number, digits = 4) {
  if (Math.abs(value) < 1e-10) return '0'
  return value.toFixed(digits)
}

function residual(x: number[]) {
  return A.map((row, i) => row.reduce((sum, aij, j) => sum + aij * x[j], 0) - b[i])
}

function infNorm(values: number[]) {
  return Math.max(...values.map((value) => Math.abs(value)))
}

function sorSweep(current: number[], omega: number, projected: boolean) {
  const next = [...current]
  const tentative: number[] = []

  for (let i = 0; i < current.length; i += 1) {
    const lower = A[i].slice(0, i).reduce((sum, aij, j) => sum + aij * next[j], 0)
    const upper = A[i].slice(i + 1).reduce((sum, aij, offset) => sum + aij * current[i + 1 + offset], 0)
    const gaussSeidel = (b[i] - lower - upper) / A[i][i]
    const relaxed = (1 - omega) * current[i] + omega * gaussSeidel
    tentative.push(relaxed)
    next[i] = projected ? Math.max(0, relaxed) : relaxed
  }

  return { next, tentative }
}

function iterate(method: MethodMode, omega: number, count: number) {
  const rows = [
    {
      k: 0,
      x: x0,
      tentative: x0,
      residual: residual(x0),
      error: infNorm(residual(x0)),
    },
  ]
  let current = x0

  for (let k = 1; k <= count; k += 1) {
    const step = sorSweep(current, omega, method === 'psor')
    current = step.next
    const r = residual(current)
    rows.push({
      k,
      x: current,
      tentative: step.tentative,
      residual: r,
      error: infNorm(r),
    })
  }

  return rows
}

function HeaderEquation({ latex }: { latex: string }) {
  return <InlineEquation latex={latex} />
}

function componentCalculations({
  row,
  previous,
  omega,
  method,
}: {
  row: ReturnType<typeof iterate>[number]
  previous: ReturnType<typeof iterate>[number] | undefined
  omega: number
  method: MethodMode
}) {
  if (!previous || row.k === 0) {
    return ['\\mathbf x^{(0)}=(0,0,0)^T']
  }

  const projection = (index: number) =>
    method === 'psor'
      ? `x_${index + 1}^{(${row.k})}=\\max\\left(0,\\widehat x_${index + 1}^{(${row.k})}\\right)=${fmt(row.x[index])}`
      : `x_${index + 1}^{(${row.k})}=\\widehat x_${index + 1}^{(${row.k})}=${fmt(row.x[index])}`

  return [
    `\\widehat x_1^{(${row.k})}=(1-${fmt(omega, 2)})${fmt(previous.x[0])}+${fmt(omega, 2)}\\frac{1.2+${fmt(previous.x[1])}}{4}=${fmt(row.tentative[0])},\\quad ${projection(0)}`,
    `\\widehat x_2^{(${row.k})}=(1-${fmt(omega, 2)})${fmt(previous.x[1])}+${fmt(omega, 2)}\\frac{-0.45+${fmt(row.x[0])}+${fmt(previous.x[2])}}{4}=${fmt(row.tentative[1])},\\quad ${projection(1)}`,
    `\\widehat x_3^{(${row.k})}=(1-${fmt(omega, 2)})${fmt(previous.x[2])}+${fmt(omega, 2)}\\frac{1.15+${fmt(row.x[1])}}{3}=${fmt(row.tentative[2])},\\quad ${projection(2)}`,
  ]
}

function VectorBars({ values, tentative, mode }: { values: number[]; tentative: number[]; mode: MethodMode }) {
  const width = 460
  const height = 210
  const margin = { top: 24, right: 18, bottom: 36, left: 40 }
  const plotWidth = width - margin.left - margin.right
  const axisY = height / 2
  const maxAbs = Math.max(1, ...values.map(Math.abs), ...tentative.map(Math.abs))
  const barWidth = plotWidth / values.length
  const y = (value: number) => axisY - (value / maxAbs) * 70

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Iteration vector bars">
        <line x1={margin.left} y1={axisY} x2={width - margin.right} y2={axisY} className="stroke-slate-400" />
        <text x={margin.left - 10} y={axisY + 4} textAnchor="end" className="fill-slate-500 text-xs">
          0
        </text>
        {values.map((value, index) => {
          const cx = margin.left + index * barWidth + barWidth / 2
          const top = Math.min(axisY, y(value))
          const barHeight = Math.abs(axisY - y(value))
          const projected = mode === 'psor' && tentative[index] < 0 && value === 0
          return (
            <g key={index}>
              {mode === 'psor' && (
                <line
                  x1={cx - 14}
                  x2={cx + 14}
                  y1={y(tentative[index])}
                  y2={y(tentative[index])}
                  className={tentative[index] < 0 ? 'stroke-rose-500' : 'stroke-slate-300'}
                  strokeWidth={3}
                  strokeDasharray="4 3"
                />
              )}
              <rect
                x={cx - 18}
                y={top}
                width={36}
                height={barHeight}
                rx={3}
                className={projected ? 'fill-amber-500' : value >= 0 ? 'fill-blue-600' : 'fill-rose-500'}
              />
              <text x={cx} y={height - 16} textAnchor="middle" className="fill-slate-600 text-xs">
                x{index + 1}
              </text>
              <text x={cx} y={value >= 0 ? top - 7 : top + barHeight + 14} textAnchor="middle" className="fill-slate-700 text-xs font-mono">
                {fmt(value, 2)}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-slate-600">
        {mode === 'psor'
          ? 'Dashed marks show tentative SOR values before projection. Orange bars are values projected back to zero.'
          : 'Bars show the unconstrained SOR iterate. Negative components are allowed.'}
      </figcaption>
    </figure>
  )
}

function ResidualChart({ errors }: { errors: number[] }) {
  const width = 460
  const height = 210
  const margin = { top: 24, right: 20, bottom: 38, left: 54 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const maxLog = Math.log10(Math.max(...errors, 1e-10))
  const minLog = Math.log10(Math.max(Math.min(...errors), 1e-5))
  const x = (i: number) => margin.left + (i / Math.max(1, errors.length - 1)) * plotWidth
  const y = (value: number) => {
    const lv = Math.log10(Math.max(value, 1e-5))
    const denom = Math.max(1e-6, maxLog - minLog)
    return margin.top + (1 - (lv - minLog) / denom) * plotHeight
  }
  const points = errors.map((value, index) => `${x(index)},${y(value)}`).join(' ')

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Residual chart">
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-700" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-700" />
        <polyline points={points} fill="none" className="stroke-blue-600" strokeWidth={2.2} />
        {errors.map((value, index) => (
          <circle key={index} cx={x(index)} cy={y(value)} r={3} className="fill-blue-600" />
        ))}
        <text x={width - margin.right} y={height - 10} textAnchor="end" className="fill-slate-600 text-xs">
          iteration
        </text>
        <text x={12} y={margin.top + 8} className="fill-slate-600 text-xs">
          log residual
        </text>
      </svg>
    </figure>
  )
}

function IterationTable({ rows, method, omega }: { rows: ReturnType<typeof iterate>; method: MethodMode; omega: number }) {
  const visibleRows = rows.slice(Math.max(0, rows.length - 6))
  const columnCount = method === 'psor' ? 7 : 6

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full text-right text-sm text-slate-700">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">k</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
              <HeaderEquation latex="x_1" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
              <HeaderEquation latex="x_2" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">
              <HeaderEquation latex="x_3" />
            </th>
            {method === 'psor' && (
              <th className="border border-slate-200 bg-amber-50 px-3 py-2 font-semibold text-amber-700">
                projected?
              </th>
            )}
            <th className="border border-slate-200 bg-blue-50 px-3 py-2 font-semibold text-blue-700">
              <HeaderEquation latex="\|A\mathbf x-\mathbf b\|_\infty" />
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => {
            const previous = rows[row.k - 1]
            const calculations = componentCalculations({ row, previous, omega, method })
            const projected = method === 'psor' && row.tentative.some((value, index) => value < 0 && row.x[index] === 0)
            return (
              <>
                <tr key={`${row.k}-values`}>
                  <td className="border border-slate-200 px-3 py-2 text-left font-mono">{row.k}</td>
                  {row.x.map((value, index) => (
                    <td key={index} className="border border-slate-200 px-3 py-2 font-mono">
                      {fmt(value)}
                    </td>
                  ))}
                  {method === 'psor' && (
                    <td className={`border border-slate-200 px-3 py-2 font-semibold ${projected ? 'bg-amber-50 text-amber-700' : 'text-slate-500'}`}>
                      {projected ? 'yes' : 'no'}
                    </td>
                  )}
                  <td className="border border-slate-200 bg-blue-50 px-3 py-2 font-mono">{fmt(row.error)}</td>
                </tr>
                <tr key={`${row.k}-calculation`}>
                  <td colSpan={columnCount} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left">
                    <div className="space-y-1 text-xs text-slate-700">
                      <p className="font-semibold text-slate-500">calculation for k = {row.k}</p>
                      {calculations.map((latex, index) => (
                        <div key={index} className="overflow-x-auto rounded bg-white px-2 py-1">
                          <InlineEquation latex={latex} />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SimulationPanel() {
  const [method, setMethod] = useState<MethodMode>('sor')
  const [omega, setOmega] = useState(1.15)
  const [iteration, setIteration] = useState(4)
  const rows = useMemo(() => iterate(method, omega, iteration), [method, omega, iteration])
  const current = rows[rows.length - 1]
  const errors = rows.map((row) => row.error)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(['sor', 'psor'] as MethodMode[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMethod(id)
                  setIteration(4)
                }}
                className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${
                  method === id
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {id.toUpperCase()}
              </button>
            ))}
          </div>
          <label className="block text-sm text-slate-700">
            <span className="mb-1 flex items-center justify-between gap-3 font-medium">
              <span>
                relaxation parameter <InlineEquation latex="\omega" />
              </span>
              <span className="font-mono text-slate-900">{fmt(omega, 2)}</span>
            </span>
            <input
              type="range"
              min={0.5}
              max={1.9}
              step={0.05}
              value={omega}
              onChange={(event) => setOmega(Number(event.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setIteration((value) => Math.min(18, value + 1))}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Iterate
          </button>
          <button
            type="button"
            onClick={() => setIteration(0)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Reset
          </button>
          <span className="pb-1 text-sm text-slate-500">k = {iteration}</span>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="mb-2 text-sm font-semibold text-slate-900">Toy system</p>
        <EquationBlock latex="A=\begin{pmatrix}4&-1&0\\-1&4&-1\\0&-1&3\end{pmatrix},\qquad \mathbf b=\begin{pmatrix}1.2\\-0.45\\1.15\end{pmatrix},\qquad \mathbf x^{(0)}=\mathbf 0." />
        <p className="text-sm text-slate-600">
          SOR solves the unconstrained system. PSOR uses the same relaxation step, but projects the iterate
          onto <InlineEquation latex="\mathbf x\geq0" />.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <VectorBars values={current.x} tentative={current.tentative} mode={method} />
        <ResidualChart errors={errors} />
      </div>
      <IterationTable rows={rows} method={method} omega={omega} />
    </div>
  )
}

export default function SORPSORMethods() {
  return (
    <PageLayout
      title="SOR and PSOR Methods"
      rightPanel={{
        known: 'A linear system, a current iterate, and a relaxation parameter omega.',
        unknown: 'An improved iterate, optionally constrained to remain in a feasible region.',
        method: 'SOR performs a relaxed Gauss-Seidel sweep; PSOR adds a projection after each component update.',
        takeaway:
          'SOR accelerates Gauss-Seidel for linear systems. PSOR is the projected version used for complementarity problems with inequality constraints.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Motivation</h2>
        <p className="text-slate-700">
          Many numerical methods lead to a linear system
          <InlineEquation latex="A\mathbf x=\mathbf b" />. Direct methods solve it in one factorization, but
          iterative methods build a sequence <InlineEquation latex="\mathbf x^{(0)},\mathbf x^{(1)},\ldots" />
          that converges to the solution. SOR is one such iterative method.
        </p>
        <p className="text-slate-700">
          PSOR appears when the problem is not just a linear system but a constrained or complementarity
          problem. The iteration still resembles SOR, but every component is projected back into the
          admissible set.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">From Gauss-Seidel to SOR</h2>
        <p className="text-slate-700">
          Split the matrix into diagonal, lower, and upper parts:
        </p>
        <EquationBlock latex="A=D+L+U." />
        <p className="text-slate-700">
          Gauss-Seidel updates one component at a time, immediately using the newest values already
          computed in the current sweep:
        </p>
        <EquationBlock latex="x_i^{(k+1)}=\frac{1}{a_{ii}}\left(b_i-\sum_{j<i}a_{ij}x_j^{(k+1)}-\sum_{j>i}a_{ij}x_j^{(k)}\right)." />
        <p className="text-slate-700">
          SOR then relaxes this Gauss-Seidel value. Let <InlineEquation latex="\widehat x_i^{(k+1)}" /> be
          the Gauss-Seidel candidate. The SOR update is
        </p>
        <EquationBlock latex="x_i^{(k+1)}=(1-\omega)x_i^{(k)}+\omega\widehat x_i^{(k+1)},\qquad 0<\omega<2." />
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              <InlineEquation latex="\omega=1" />
            </p>
            <p className="mt-1 text-sm text-slate-600">ordinary Gauss-Seidel</p>
          </div>
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-900">
              <InlineEquation latex="1<\omega<2" />
            </p>
            <p className="mt-1 text-sm text-slate-600">over-relaxation, often faster</p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">
              <InlineEquation latex="0<\omega<1" />
            </p>
            <p className="mt-1 text-sm text-slate-600">under-relaxation, more conservative</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Projected SOR</h2>
        <p className="text-slate-700">
          In a complementarity problem we usually seek vectors <InlineEquation latex="\mathbf x" /> and{' '}
          <InlineEquation latex="\mathbf y" /> such that
        </p>
        <EquationBlock latex="\mathbf y=A\mathbf x-\mathbf b,\qquad \mathbf x\geq0,\qquad \mathbf y\geq0,\qquad \mathbf x^T\mathbf y=0." />
        <p className="text-slate-700">
          The condition <InlineEquation latex="\mathbf x^T\mathbf y=0" /> means that, component by component,
          at least one of <InlineEquation latex="x_i" /> or <InlineEquation latex="y_i" /> must be zero. This
          is the algebraic version of “either the constraint is inactive, or the solution is pinned to the
          constraint”.
        </p>
        <p className="text-slate-700">
          PSOR computes the same tentative relaxed value as SOR, then projects it onto the feasible set:
        </p>
        <EquationBlock latex="\widehat x_i^{(k+1)}=(1-\omega)x_i^{(k)}+\frac{\omega}{a_{ii}}\left(b_i-\sum_{j<i}a_{ij}x_j^{(k+1)}-\sum_{j>i}a_{ij}x_j^{(k)}\right)" />
        <EquationBlock latex="x_i^{(k+1)}=\max\left(0,\widehat x_i^{(k+1)}\right)." />
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-slate-700">
          <p className="font-semibold text-emerald-900">The only new operation is projection.</p>
          <p className="mt-1">
            SOR is a relaxed linear-system solve. PSOR is the same sweep followed by{' '}
            <InlineEquation latex="\max(0,\cdot)" />, so infeasible negative components are reset to zero.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation</h2>
        <p className="text-slate-700">
          The example below uses a small three-variable system. Switch between SOR and PSOR and change{' '}
          <InlineEquation latex="\omega" /> to see how relaxation and projection affect the iterates.
        </p>
        <SimulationPanel />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">SOR sweep</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              <li>Choose <InlineEquation latex="\mathbf x^{(0)}" /> and <InlineEquation latex="\omega" />.</li>
              <li>For each component, compute the Gauss-Seidel candidate.</li>
              <li>Relax the candidate with <InlineEquation latex="(1-\omega)x_i^{(k)}+\omega\widehat x_i^{(k+1)}" />.</li>
              <li>Repeat until the residual is small.</li>
            </ol>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-emerald-900">PSOR sweep</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              <li>Compute the same tentative SOR value.</li>
              <li>Project it: <InlineEquation latex="x_i^{(k+1)}=\max(0,\widehat x_i^{(k+1)})" />.</li>
              <li>Continue the sweep with the projected value.</li>
              <li>Stop when successive iterates or projected residuals are below tolerance.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Connection to the Next Page</h2>
        <p className="text-slate-700">
          In American option pricing, the obstacle condition is shifted into a non-negativity constraint.
          The resulting time-step problem has exactly the complementarity structure above. That is why the
          next page uses PSOR after each Crank-Nicolson step.
        </p>
      </section>
    </PageLayout>
  )
}
