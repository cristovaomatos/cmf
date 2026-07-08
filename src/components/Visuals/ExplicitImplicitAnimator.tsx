import { useEffect, useMemo, useState } from 'react'
import { Katex } from '../Math/Katex'

type Method = 'explicit' | 'implicit'
type NodeStatus = 'known' | 'interior'

function MathLabel({
  x,
  y,
  width,
  height,
  math,
  className = '',
}: {
  x: number
  y: number
  width: number
  height: number
  math: string
  className?: string
}) {
  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <div className={`flex h-full w-full items-center justify-center text-xs ${className}`}>
        <Katex math={math} />
      </div>
    </foreignObject>
  )
}

function statusOf(i: number, j: number, NS: number): NodeStatus {
  return i === 0 || i === NS || j === 0 ? 'known' : 'interior'
}

export function ExplicitImplicitAnimator({ method }: { method: Method }) {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const NS = 6
  const NT = 4
  const interiorCount = NS - 1
  const maxStep = interiorCount + 3
  const width = 660
  const height = 390
  const margin = { left: 54, right: 48, top: 34, bottom: 52 }
  const j = 1
  const nextJ = j + 1

  const x = (i: number) => margin.left + (i / NS) * (width - margin.left - margin.right)
  const y = (jj: number) => height - margin.bottom - (jj / NT) * (height - margin.top - margin.bottom)

  const activeI = Math.min(interiorCount, Math.max(1, step - 1))
  const isGridIntro = step === 0
  const isInteriorIntro = step === 1
  const isSystemStep = method === 'implicit' && step >= 2 && step < maxStep
  const showMatrix = method === 'implicit' && step >= maxStep
  const showExplicitSweep = method === 'explicit' && step >= 2
  const completedExplicit = useMemo(
    () => new Set(Array.from({ length: Math.max(0, step - 2) }, (_, k) => k + 1)),
    [step],
  )
  const equationCount = Math.min(interiorCount, Math.max(0, step - 1))

  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setInterval(() => {
      setStep((current) => (current >= maxStep ? 0 : current + 1))
    }, 1400)
    return () => window.clearInterval(timer)
  }, [isPlaying, maxStep])

  function nodeClass(i: number, jj: number) {
    const status = statusOf(i, jj, NS)
    const isActiveExplicitSource =
      showExplicitSweep && jj === j && (i === activeI - 1 || i === activeI || i === activeI + 1)
    const isActiveExplicitTarget = showExplicitSweep && jj === nextJ && i === activeI
    const isCompletedExplicitTarget = method === 'explicit' && jj === nextJ && completedExplicit.has(i)
    const isActiveImplicitUnknown =
      isSystemStep && jj === nextJ && (i === activeI - 1 || i === activeI || i === activeI + 1)
    const isImplicitFutureRow = method === 'implicit' && jj === nextJ && i > 0 && i < NS

    if (isActiveExplicitTarget || isCompletedExplicitTarget) return 'fill-emerald-500 stroke-emerald-700'
    if (isActiveExplicitSource) return 'fill-amber-300 stroke-amber-700'
    if (isActiveImplicitUnknown) return 'fill-violet-200 stroke-violet-700'
    if (isImplicitFutureRow && step >= 2) return 'fill-white stroke-violet-500'
    if (status === 'known') return 'fill-red-500 stroke-red-500'
    if (isInteriorIntro) return 'fill-blue-100 stroke-blue-700'
    return 'fill-white stroke-blue-600'
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Grid animation</h2>
          <p className="text-sm text-slate-600">
            {method === 'explicit'
              ? 'Explicit: one known stencil gives one new value.'
              : 'Implicit: one future stencil gives one equation; all equations are solved together.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((value) => !value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => setStep((current) => (current >= maxStep ? 0 : current + 1))}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] xl:items-start">
        <div>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-3xl">
            {Array.from({ length: NT + 1 }, (_, row) => (
              <line
                key={`h-${row}`}
                x1={x(0)}
                y1={y(row)}
                x2={x(NS)}
                y2={y(row)}
                strokeDasharray="3 3"
                className="stroke-slate-300"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: NS + 1 }, (_, col) => (
              <line
                key={`v-${col}`}
                x1={x(col)}
                y1={y(0)}
                x2={x(col)}
                y2={y(NT)}
                strokeDasharray="3 3"
                className="stroke-slate-300"
                strokeWidth={1}
              />
            ))}

            {showExplicitSweep && (
              <>
                <line
                  x1={x(activeI - 1)}
                  y1={y(j)}
                  x2={x(activeI + 1)}
                  y2={y(j)}
                  className="stroke-amber-500"
                  strokeWidth={2}
                />
                <line
                  x1={x(activeI)}
                  y1={y(j)}
                  x2={x(activeI)}
                  y2={y(nextJ)}
                  className="stroke-emerald-500"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />
                <MathLabel x={x(activeI - 1) - 28} y={y(j) - 44} width={56} height={28} math="a_i" className="font-semibold text-amber-700" />
                <MathLabel x={x(activeI) - 28} y={y(j) - 44} width={56} height={28} math="b_i" className="font-semibold text-amber-700" />
                <MathLabel x={x(activeI + 1) - 28} y={y(j) - 44} width={56} height={28} math="c_i" className="font-semibold text-amber-700" />
              </>
            )}

            {isSystemStep && (
              <>
                <line
                  x1={x(activeI - 1)}
                  y1={y(nextJ)}
                  x2={x(activeI + 1)}
                  y2={y(nextJ)}
                  className="stroke-violet-600"
                  strokeWidth={2}
                />
                <line
                  x1={x(activeI)}
                  y1={y(nextJ)}
                  x2={x(activeI)}
                  y2={y(j)}
                  className="stroke-slate-500"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />
                <MathLabel x={x(activeI - 1) - 36} y={y(nextJ) - 48} width={72} height={30} math="\alpha_i" className="font-semibold text-violet-700" />
                <MathLabel x={x(activeI) - 36} y={y(nextJ) - 48} width={72} height={30} math="\beta_i" className="font-semibold text-violet-700" />
                <MathLabel x={x(activeI + 1) - 36} y={y(nextJ) - 48} width={72} height={30} math="\gamma_i" className="font-semibold text-violet-700" />
              </>
            )}

            {Array.from({ length: NT + 1 }, (_, row) =>
              Array.from({ length: NS + 1 }, (_, col) => (
                <g key={`${col}-${row}`}>
                  <circle
                    cx={x(col)}
                    cy={y(row)}
                    r={col === activeI && row === nextJ && step >= 2 ? 8 : 6}
                    className={`${nodeClass(col, row)} transition-all`}
                    strokeWidth={col === activeI && row === nextJ && step >= 2 ? 2.5 : 2}
                  />
                </g>
              )),
            )}

            {isGridIntro && (
              <>
                <MathLabel x={x(2) - 70} y={y(0) + 18} width={140} height={26} math="U_{i,0}=u_0(S_i)" className="font-semibold text-red-700" />
                <MathLabel x={x(0) + 8} y={y(3) - 13} width={126} height={26} math="U_{0,j}=u_a(t_j)" className="font-semibold text-red-700" />
                <MathLabel x={x(NS) - 132} y={y(3) - 13} width={126} height={26} math="U_{N_S,j}=u_b(t_j)" className="font-semibold text-red-700" />
              </>
            )}

            {isInteriorIntro && (
              <MathLabel x={x(2) - 92} y={y(2) - 18} width={184} height={34} math="U_{i,j},\quad i=1,\ldots,N_S-1" className="font-semibold text-blue-700" />
            )}

            <text x={x(0)} y={height - 20} textAnchor="middle" className="fill-slate-500 text-[10px]">0</text>
            <text x={x(NS)} y={height - 20} textAnchor="middle" className="fill-slate-500 text-[10px]">S*</text>
            <text x={width / 2} y={height - 4} textAnchor="middle" className="fill-slate-500 text-xs">S</text>
            <text x={22} y={height / 2} className="fill-slate-500 text-xs">t</text>
            <MathLabel x={x(activeI) - 30} y={y(j) + 12} width={60} height={24} math={`U_{${activeI},j}`} className="text-slate-600" />
            {step >= 2 && <MathLabel x={x(activeI) - 38} y={y(nextJ) - 38} width={76} height={26} math={`U_{${activeI},j+1}`} className="font-semibold text-slate-800" />}
          </svg>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-red-500" />known boundary / initial values</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-blue-600 bg-white" />interior unknowns</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-300" />active stencil</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Grid map</p>
            <div className="space-y-2 text-sm text-slate-700">
              <Katex math="S_i=i h_S,\qquad t_j=j h_t" display />
              <Katex math="U_{i,j}\approx U(S_i,t_j)" display />
            </div>
          </div>

          {method === 'explicit' ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Point update
              </p>
              <Katex
                math="U_{i,j+1}=a_iU_{i-1,j}+b_iU_{i,j}+c_iU_{i+1,j}"
                display
              />
              <div className="mt-3 space-y-1 text-sm text-emerald-900">
                <Katex math="a_i=\frac{h_t}{2}(\sigma^2 i^2-ri)" display />
                <Katex math="b_i=1-\sigma^2 i^2h_t-rh_t" display />
                <Katex math="c_i=\frac{h_t}{2}(\sigma^2 i^2+ri)" display />
              </div>
              <div className="mt-3 text-sm text-emerald-900">
                The next point is computed directly because every value in the stencil is already known.
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-violet-200 bg-violet-50 px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-700">
                Equation build
              </p>
              <Katex math="\alpha_i U_{i-1,j+1}+\beta_i U_{i,j+1}+\gamma_i U_{i+1,j+1}=U_{i,j}" display />
              <p className="mt-3 text-sm text-violet-900">
                Equation {equationCount} of {interiorCount}: future values depend on future values.
              </p>
            </div>
          )}

          {showMatrix && (
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tridiagonal system
              </p>
              <Katex
                math="\begin{pmatrix}\beta_1&\gamma_1&0&\cdots&0\\\alpha_2&\beta_2&\gamma_2&\ddots&\vdots\\0&\alpha_3&\beta_3&\ddots&0\\\vdots&\ddots&\ddots&\ddots&\gamma_{N_S-2}\\0&\cdots&0&\alpha_{N_S-1}&\beta_{N_S-1}\end{pmatrix}\mathbf{U}^{j+1}=\mathbf{U}^{j}+\mathbf{q}^{j+1}"
                display
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
