import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { europeanParams } from '../../data/parameters'
import { Katex } from '../Math/Katex'
import { SurfacePlot } from './SurfacePlot'

type OptionType = 'put' | 'call'

function payoff(S: number, K: number, optionType: OptionType) {
  return optionType === 'put' ? Math.max(K - S, 0) : Math.max(S - K, 0)
}

function leftBoundary(t: number, K: number, r: number, optionType: OptionType) {
  return optionType === 'put' ? K * Math.exp(-r * t) : 0
}

function rightBoundary(Smax: number, t: number, K: number, r: number, optionType: OptionType) {
  return optionType === 'put' ? 0 : Math.max(Smax - K * Math.exp(-r * t), 0)
}

function multiplyMatrixVector(matrix: number[][], vector: number[]) {
  return matrix.map((row) => row.reduce((sum, value, col) => sum + value * vector[col], 0))
}

function addVectors(...vectors: number[][]) {
  return vectors[0].map((_, i) => vectors.reduce((sum, vector) => sum + vector[i], 0))
}

function scaleVector(vector: number[], scale: number) {
  return vector.map((value) => value * scale)
}

function fmt(value: number, digits = 4) {
  return value.toFixed(digits)
}

function VectorMath({ values }: { values: number[] }) {
  return (
    <div className="inline-block">
      <table className="text-right text-xs text-slate-700">
        <tbody>
          {values.map((value, rowIndex) => (
            <tr key={rowIndex}>
              <td className="min-w-16 border border-slate-200 bg-white px-2 py-1">
                {Math.abs(value) < 0.00005 ? '0' : fmt(value, 3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MatrixTable({ title, values }: { title: ReactNode; values: number[][] }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="overflow-x-auto">
        <table className="text-right text-xs text-slate-700">
          <tbody>
            {values.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((value, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={`min-w-14 border border-slate-200 px-2 py-1 ${
                      rowIndex === colIndex
                        ? 'bg-blue-100'
                        : Math.abs(rowIndex - colIndex) === 1
                          ? 'bg-amber-50'
                          : 'bg-white'
                    }`}
                  >
                    {Math.abs(value) < 0.00005 ? '0' : fmt(value, 3)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function MethodOfLinesRK4CalculationExample() {
  const [optionType, setOptionType] = useState<OptionType>('put')
  const [NS, setNS] = useState(10)
  const [Nt, setNt] = useState(10)
  const [r, setR] = useState(europeanParams.r)
  const [sigma, setSigma] = useState(europeanParams.sigma)
  const [animationStep, setAnimationStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [surfaceMode, setSurfaceMode] = useState<'U' | 'V'>('U')
  const [activeK, setActiveK] = useState(0)

  const model = useMemo(() => {
    const { T, K, Smax } = europeanParams
    const ht = T / Nt
    const hS = Smax / NS
    const n = NS - 1
    const S = Array.from({ length: NS + 1 }, (_, i) => i * hS)
    const t = Array.from({ length: Nt + 1 }, (_, j) => j * ht)
    const indices = Array.from({ length: n }, (_, k) => k + 1)

    const alpha = indices.map((i) => 0.5 * sigma ** 2 * i ** 2 - 0.5 * r * i)
    const beta = indices.map((i) => -(sigma ** 2) * i ** 2 - r)
    const gamma = indices.map((i) => 0.5 * sigma ** 2 * i ** 2 + 0.5 * r * i)

    const AML = indices.map((_, row) =>
      indices.map((__, col) => {
        if (row === col) return beta[row]
        if (col === row - 1) return alpha[row]
        if (col === row + 1) return gamma[row]
        return 0
      }),
    )

    const boundaryVector = (time: number) => {
      const bML = Array.from({ length: n }, () => 0)
      bML[0] = alpha[0] * leftBoundary(time, K, r, optionType)
      bML[n - 1] = gamma[n - 1] * rightBoundary(Smax, time, K, r, optionType)
      return bML
    }

    const F = (time: number, W: number[]) => addVectors(multiplyMatrixVector(AML, W), boundaryVector(time))

    const U: number[][] = [S.map((value) => payoff(value, K, optionType))]
    const stageByStep: Array<{ W: number[]; f1: number[]; f2: number[]; f3: number[]; f4: number[]; Wnext: number[] }> = []
    let W = U[0].slice(1, NS)

    for (let j = 0; j < Nt; j += 1) {
      const tj = t[j]
      const f1 = scaleVector(F(tj, W), ht)
      const f2 = scaleVector(F(tj + ht / 2, addVectors(W, scaleVector(f1, 0.5))), ht)
      const f3 = scaleVector(F(tj + ht / 2, addVectors(W, scaleVector(f2, 0.5))), ht)
      const f4 = scaleVector(F(tj + ht, addVectors(W, f3)), ht)
      const Wnext = addVectors(W, scaleVector(addVectors(f1, scaleVector(f2, 2), scaleVector(f3, 2), f4), 1 / 6))

      stageByStep.push({ W: [...W], f1, f2, f3, f4, Wnext })
      W = Wnext
      U.push([
        leftBoundary(t[j + 1], K, r, optionType),
        ...W,
        rightBoundary(Smax, t[j + 1], K, r, optionType),
      ])
    }

    const surfaceValues = S.map((_, i) => U.map((row) => row[i]))
    const maxRowMagnitude = Math.max(
      ...AML.map((row) => row.reduce((sum, value) => sum + Math.abs(value), 0)),
    )

    return { AML, K, S, U, boundaryVector, hS, ht, maxRowMagnitude, stageByStep, surfaceValues, t }
  }, [NS, Nt, optionType, r, sigma])

  const totalSteps = Nt
  const isComplete = animationStep >= totalSteps
  const activeJ = Math.min(animationStep, Nt - 1)
  const activeStage = model.stageByStep[activeJ]
  const stabilityProxy = model.ht * model.maxRowMagnitude
  const displayedSurface =
    surfaceMode === 'U'
      ? model.surfaceValues
      : model.S.map((_, i) => model.t.map((__, n) => model.surfaceValues[i][model.t.length - 1 - n]))
  const stageStateVectors = [
    activeStage.W,
    addVectors(activeStage.W, scaleVector(activeStage.f1, 0.5)),
    addVectors(activeStage.W, scaleVector(activeStage.f2, 0.5)),
    addVectors(activeStage.W, activeStage.f3),
  ]
  const stageTimes = [
    model.t[activeJ],
    model.t[activeJ] + model.ht / 2,
    model.t[activeJ] + model.ht / 2,
    model.t[activeJ] + model.ht,
  ]
  const stageLabels = ['\\mathbf f_1', '\\mathbf f_2', '\\mathbf f_3', '\\mathbf f_4']
  const stageValues = [activeStage.f1, activeStage.f2, activeStage.f3, activeStage.f4]
  const stageBoundaryVectors = stageTimes.map((time) => model.boundaryVector(time))
  const stageStateLabels = [
    `W^{[${activeJ}]}`,
    `W^{[${activeJ}]}+\\mathbf f_1/2`,
    `W^{[${activeJ}]}+\\mathbf f_2/2`,
    `W^{[${activeJ}]}+\\mathbf f_3`,
  ]
  const stageBoundaryLabels = [
    `b_{ML}(t_${activeJ})`,
    `b_{ML}(t_${activeJ}+h_t/2)`,
    `b_{ML}(t_${activeJ}+h_t/2)`,
    `b_{ML}(t_${activeJ}+h_t)`,
  ]
  const stageFormulas = [
    `\\mathbf f_1=h_t\\left(A_{ML}W^{[${activeJ}]}+b_{ML}(t_${activeJ})\\right)`,
    `\\mathbf f_2=h_t\\left(A_{ML}\\left(W^{[${activeJ}]}+\\frac{\\mathbf f_1}{2}\\right)+b_{ML}\\left(t_${activeJ}+\\frac{h_t}{2}\\right)\\right)`,
    `\\mathbf f_3=h_t\\left(A_{ML}\\left(W^{[${activeJ}]}+\\frac{\\mathbf f_2}{2}\\right)+b_{ML}\\left(t_${activeJ}+\\frac{h_t}{2}\\right)\\right)`,
    `\\mathbf f_4=h_t\\left(A_{ML}\\left(W^{[${activeJ}]}+\\mathbf f_3\\right)+b_{ML}(t_${activeJ}+h_t)\\right)`,
  ]
  const activeMatrixProduct = multiplyMatrixVector(model.AML, stageStateVectors[activeK])
  const activeDerivativeVector = addVectors(activeMatrixProduct, stageBoundaryVectors[activeK])

  useEffect(() => {
    setAnimationStep(0)
    setIsPlaying(false)
  }, [NS, Nt, optionType, r, sigma])

  useEffect(() => {
    if (!isPlaying) return undefined

    const interval = window.setInterval(() => {
      setAnimationStep((step) => {
        if (step >= totalSteps) {
          setIsPlaying(false)
          return step
        }
        return step + 1
      })
    }, 900)

    return () => window.clearInterval(interval)
  }, [isPlaying, totalSteps])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-start gap-3">
        <p className="text-sm font-medium text-slate-700">Option type</p>
        <div className="flex rounded-md border border-slate-300 p-1 text-sm">
          {(['put', 'call'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOptionType(type)}
              className={`rounded px-3 py-1 font-medium capitalize ${
                optionType === type ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-4">
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`N_S=${NS}`} />
          </span>
          <input type="range" min={6} max={16} value={NS} onChange={(event) => setNS(Number(event.target.value))} className="w-full" />
        </label>
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`N_t=${Nt}`} />
          </span>
          <input type="range" min={10} max={80} value={Nt} onChange={(event) => setNt(Number(event.target.value))} className="w-full" />
        </label>
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`r=${fmt(r, 3)}`} />
          </span>
          <input type="range" min={0} max={0.12} step={0.005} value={r} onChange={(event) => setR(Number(event.target.value))} className="w-full" />
        </label>
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`\\sigma=${fmt(sigma, 2)}`} />
          </span>
          <input type="range" min={0.1} max={0.6} step={0.01} value={sigma} onChange={(event) => setSigma(Number(event.target.value))} className="w-full" />
        </label>
      </div>

      <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-3">
        <div className="rounded-md bg-blue-50 px-3 py-2">
          <Katex
            math={
              optionType === 'put'
                ? 'U_{i,0}=u_0(S_i)=\\max(K-S_i,0)'
                : 'U_{i,0}=u_0(S_i)=\\max(S_i-K,0)'
            }
          />
        </div>
        <div className="rounded-md bg-red-50 px-3 py-2">
          <Katex math={optionType === 'put' ? 'U_{0,j}=u_a(t_j)=Ke^{-rt_j}' : 'U_{0,j}=u_a(t_j)=0'} />
        </div>
        <div className="rounded-md bg-red-50 px-3 py-2">
          <Katex
            math={
              optionType === 'put'
                ? 'U_{N_S,j}=u_b(t_j)=0'
                : 'U_{N_S,j}=u_b(t_j)=S^*-Ke^{-rt_j}'
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        <span>
          <Katex math={`h_S=${fmt(model.hS, 3)}`} />
        </span>
        <span>
          <Katex math={`h_t=${fmt(model.ht, 4)}`} />
        </span>
        <span>
          <Katex math={`h_t\\|A_{ML}\\|_\\infty\\approx ${fmt(stabilityProxy, 3)}`} />
        </span>
      </div>

      <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">Conditional stability</p>
        <p className="mt-1">
          RK4 is explicit, so refining <Katex math="h_S" /> usually requires reducing <Katex math="h_t" />.
          The value above is a practical size indicator, not a sharp stability bound.
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">RK4 row animation</p>
            <p className="text-sm text-slate-600">
              Completed RK4 steps: {animationStep} / {totalSteps}
              {!isComplete && (
                <>
                  {' '}
                  - next update computes <Katex math={`W^{[${activeJ + 1}]}`} />
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setAnimationStep(0)
                setIsPlaying(false)
              }}
              className="rounded border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setAnimationStep((step) => Math.min(step + 1, totalSteps))}
              disabled={isComplete}
              className="rounded border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Step
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((playing) => !playing)}
              disabled={isComplete}
              className="rounded bg-slate-800 px-3 py-1 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAnimationStep(totalSteps)
                setIsPlaying(false)
              }}
              className="rounded border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-50"
            >
              Complete
            </button>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={totalSteps}
          value={animationStep}
          onChange={(event) => {
            setAnimationStep(Number(event.target.value))
            setIsPlaying(false)
          }}
          className="w-full"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="text-center text-[11px] text-slate-700">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white px-2 py-1 text-left font-medium text-slate-500">time</th>
              {model.S.map((S, i) => (
                <th key={i} className="min-w-20 px-2 py-1 font-medium text-slate-500">
                  <Katex math={`S_${i}`} />
                  <div className="font-mono text-[10px]">{fmt(S, 2)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.U.map((_, j) => {
              const displayJ = model.U.length - 1 - j
              const values = model.U[displayJ]
              return (
                <tr key={displayJ}>
                  <td className="sticky left-0 z-10 border border-slate-200 bg-white px-2 py-1 text-left font-medium text-slate-500">
                    <Katex math={`j=${displayJ}`} />
                    <div className="font-mono text-[10px]">{fmt(model.t[displayJ], 2)}</div>
                  </td>
                  {values.map((value, i) => {
                    const isBoundary = i === 0 || i === NS
                    const isInitial = displayJ === 0
                    const isSolvedInterior = displayJ > 0 && displayJ <= animationStep && i > 0 && i < NS
                    const isFutureRow = !isComplete && displayJ === activeJ + 1 && i > 0 && i < NS
                    const showValue = isBoundary || isInitial || isSolvedInterior

                    return (
                      <td
                        key={`${displayJ}-${i}`}
                        className={`border border-slate-200 px-2 py-1 ${
                          isFutureRow
                            ? 'bg-cyan-100 font-semibold text-cyan-900 ring-2 ring-inset ring-cyan-300'
                            : isBoundary
                              ? 'bg-red-50 text-red-700'
                              : isInitial
                                ? 'bg-blue-50 text-blue-700'
                                : isSolvedInterior
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-white text-slate-300'
                        }`}
                      >
                        <Katex math={`U_{${i},${displayJ}}`} />
                        <div className="mt-1 font-mono">{showValue ? fmt(value, 3) : '...'}</div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">3D surface for this grid</h3>
            <p className="text-sm text-slate-600">The dark markers are the grid values shown in the table.</p>
          </div>
          <div className="flex rounded-md border border-slate-300 p-1 text-sm">
            <button type="button" onClick={() => setSurfaceMode('U')} className={`rounded px-3 py-1 font-medium ${surfaceMode === 'U' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>U forward time</button>
            <button type="button" onClick={() => setSurfaceMode('V')} className={`rounded px-3 py-1 font-medium ${surfaceMode === 'V' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>V = U(T-t)</button>
          </div>
        </div>
        {surfaceMode === 'V' && (
          <p className="mb-2 text-sm text-slate-600">
            Calendar-time option values are recovered by reversing the time direction:{' '}
            <Katex math="V(S_i,t_j)=U(S_i,T-t_j)" />.
          </p>
        )}
        <SurfacePlot
          S={model.S}
          t={model.t}
          V={displayedSurface}
          title={surfaceMode === 'U' ? 'MOL + RK4 U(S,tau) surface' : 'Recovered V(S,t) surface'}
          zMax={model.K}
          showGridPoints
          yLabel={surfaceMode === 'U' ? 'tau' : 't'}
          zLabel={surfaceMode === 'U' ? 'U(S,tau)' : 'V(S,t)'}
          valueLabel={surfaceMode}
        />
      </div>

      <label className="block text-sm text-slate-700">
        <span className="mb-1 block font-medium">
          Selected time step: <Katex math={`j=${activeJ}`} /> to <Katex math={`j+1=${activeJ + 1}`} />
        </span>
        <input
          type="range"
          min={0}
          max={Nt - 1}
          value={activeJ}
          onChange={(event) => {
            setAnimationStep(Number(event.target.value))
            setIsPlaying(false)
          }}
          className="w-full"
        />
      </label>

      <div className="space-y-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            ODE system at the selected time step
          </p>
          <Katex math="W'(t)=A_{ML}W(t)+b_{ML}(t)=F(t,W(t))" display />
          <Katex
            math={`W^{[${activeJ + 1}]}=W^{[${activeJ}]}+\\frac{\\mathbf f_1+2\\mathbf f_2+2\\mathbf f_3+\\mathbf f_4}{6}`}
            display
          />
          <p className="text-center text-sm text-slate-600">
            <Katex math="A_{ML}" /> is constant. The state vectors and
            <Katex math="b_{ML}(t)" /> vary during the RK4 stages.
          </p>
        </div>

        <div className="rounded-md bg-slate-50 px-4 py-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">RK4 stage calculation</p>
            <div className="flex rounded-md border border-slate-300 bg-white p-1 text-sm">
              {stageLabels.map((label, stageIndex) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveK(stageIndex)}
                  className={`rounded px-3 py-1 font-medium ${
                    activeK === stageIndex ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Katex math={label} />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 rounded-md border border-slate-200 bg-white px-3 py-2 [&_.katex-display]:my-0">
            <Katex math={stageFormulas[activeK]} display />
          </div>

          <div className="overflow-x-auto">
            <div className="flex min-w-max items-center gap-4 pb-2">
              <div className="text-xl font-semibold text-slate-900">
                <Katex math={stageLabels[activeK]} />
              </div>
              <div className="text-xl font-semibold text-slate-500">=</div>
              <div className="text-xl font-semibold text-slate-900">
                <Katex math="h_t" />
              </div>
              <div className="text-4xl font-light text-slate-500">(</div>
              <MatrixTable
                title={
                  <>
                    Matrix <Katex math="A_{ML}" />
                  </>
                }
                values={model.AML}
              />
              <div className="text-xl font-semibold text-slate-500">
                <Katex math="\times" />
              </div>
              <div>
                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Katex math={stageStateLabels[activeK]} />
                </p>
                <VectorMath values={stageStateVectors[activeK]} />
              </div>
              <div className="text-xl font-semibold text-slate-500">+</div>
              <div>
                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Katex math={stageBoundaryLabels[activeK]} />
                </p>
                <VectorMath values={stageBoundaryVectors[activeK]} />
              </div>
              <div className="text-4xl font-light text-slate-500">)</div>
              <div className="text-xl font-semibold text-slate-500">=</div>
              <div>
                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Katex math={`A_{ML}${stageStateLabels[activeK]}+${stageBoundaryLabels[activeK]}`} />
                </p>
                <VectorMath values={activeDerivativeVector} />
              </div>
              <div className="text-xl font-semibold text-slate-500">
                <Katex math={`\\times ${fmt(model.ht, 3)}`} />
              </div>
              <div className="text-xl font-semibold text-slate-500">=</div>
              <div>
                <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Katex math={stageLabels[activeK]} />
                </p>
                <VectorMath values={stageValues[activeK]} />
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3">
            <div className="mb-2 [&_.katex-display]:my-0">
              <Katex
                math={`W^{[${activeJ + 1}]}=W^{[${activeJ}]}+\\frac{\\mathbf f_1+2\\mathbf f_2+2\\mathbf f_3+\\mathbf f_4}{6}`}
                display
              />
            </div>
            <div className="flex items-start gap-3 overflow-x-auto pb-2">
              <div>
                <div className="mb-1 text-center text-xs font-semibold text-slate-500">
                  <Katex math={`W^{[${activeJ}]}`} />
                </div>
                <VectorMath values={activeStage.W} />
              </div>
              {[activeStage.f1, activeStage.f2, activeStage.f3, activeStage.f4].map((values, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="pt-8 text-lg font-semibold text-slate-500">+</div>
                  <div>
                    <div className="mb-1 text-center text-xs font-semibold text-slate-500">
                      <Katex
                        math={
                          index === 0 || index === 3
                            ? `\\mathbf f_${index + 1}/6`
                            : `2\\mathbf f_${index + 1}/6`
                        }
                      />
                    </div>
                    <VectorMath values={scaleVector(values, index === 0 || index === 3 ? 1 / 6 : 1 / 3)} />
                  </div>
                </div>
              ))}
              <div className="pt-8 text-lg font-semibold text-slate-500">=</div>
              <div>
                <div className="mb-1 text-center text-xs font-semibold text-slate-500">
                  <Katex math={`W^{[${activeJ + 1}]}`} />
                </div>
                <VectorMath values={activeStage.Wnext} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
