import { useEffect, useMemo, useState } from 'react'
import { europeanParams } from '../../data/parameters'
import { Katex } from '../Math/Katex'
import { SurfacePlot } from './SurfacePlot'

type OptionType = 'put' | 'call'

function payoff(S: number, K: number, optionType: OptionType) {
  return optionType === 'put' ? Math.max(K - S, 0) : Math.max(S - K, 0)
}

function leftBoundary(tau: number, K: number, r: number, optionType: OptionType) {
  return optionType === 'put' ? K * Math.exp(-r * tau) : 0
}

function rightBoundary(Smax: number, tau: number, K: number, r: number, optionType: OptionType) {
  return optionType === 'put' ? 0 : Math.max(Smax - K * Math.exp(-r * tau), 0)
}

function solveLinearSystem(matrix: number[][], rhs: number[]) {
  const n = rhs.length
  const A = matrix.map((row, i) => [...row, rhs[i]])

  for (let pivot = 0; pivot < n; pivot += 1) {
    let pivotRow = pivot
    for (let row = pivot + 1; row < n; row += 1) {
      if (Math.abs(A[row][pivot]) > Math.abs(A[pivotRow][pivot])) pivotRow = row
    }
    ;[A[pivot], A[pivotRow]] = [A[pivotRow], A[pivot]]

    const pivotValue = A[pivot][pivot]
    for (let col = pivot; col <= n; col += 1) A[pivot][col] /= pivotValue

    for (let row = 0; row < n; row += 1) {
      if (row === pivot) continue
      const factor = A[row][pivot]
      for (let col = pivot; col <= n; col += 1) A[row][col] -= factor * A[pivot][col]
    }
  }

  return A.map((row) => row[n])
}

function fmt(value: number, digits = 4) {
  return value.toFixed(digits)
}

function MatrixTable({ title, values }: { title: string; values: number[][] }) {
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

export function ImplicitMethodCalculationExample() {
  const [optionType, setOptionType] = useState<OptionType>('put')
  const [NS, setNS] = useState(10)
  const [Nt, setNt] = useState(10)
  const [r, setR] = useState(europeanParams.r)
  const [sigma, setSigma] = useState(europeanParams.sigma)
  const [animationStep, setAnimationStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [surfaceMode, setSurfaceMode] = useState<'U' | 'V'>('U')

  const model = useMemo(() => {
    const { T, K, Smax } = europeanParams
    const hS = Smax / NS
    const ht = T / Nt
    const n = NS - 1
    const S = Array.from({ length: NS + 1 }, (_, i) => i * hS)
    const tau = Array.from({ length: Nt + 1 }, (_, j) => j * ht)
    const indices = Array.from({ length: n }, (_, k) => k + 1)

    const alpha = indices.map((i) => -(ht / 2) * (sigma ** 2 * i ** 2 - r * i))
    const beta = indices.map((i) => 1 + sigma ** 2 * i ** 2 * ht + r * ht)
    const gamma = indices.map((i) => -(ht / 2) * (sigma ** 2 * i ** 2 + r * i))
    const A = indices.map((_, row) =>
      indices.map((__, col) => {
        if (row === col) return beta[row]
        if (col === row - 1) return alpha[row]
        if (col === row + 1) return gamma[row]
        return 0
      }),
    )

    const U: number[][] = [S.map((value) => payoff(value, K, optionType))]
    const rhsByStep: number[][] = []
    const boundaryByStep: Array<{ left: number; right: number }> = []

    for (let j = 0; j < Nt; j += 1) {
      const previousRow = U[j]
      const rhs = previousRow.slice(1, NS)
      const left = leftBoundary(tau[j + 1], K, r, optionType)
      const right = rightBoundary(Smax, tau[j + 1], K, r, optionType)

      rhs[0] -= alpha[0] * left
      rhs[n - 1] -= gamma[n - 1] * right

      const nextInterior = solveLinearSystem(A, rhs)
      U.push([left, ...nextInterior, right])
      rhsByStep.push([...rhs])
      boundaryByStep.push({ left, right })
    }

    const surfaceValues = S.map((_, i) => U.map((row) => row[i]))

    return { A, K, S, U, alpha, beta, boundaryByStep, gamma, hS, ht, rhsByStep, surfaceValues, tau }
  }, [NS, Nt, optionType, r, sigma])

  const totalSteps = Nt
  const isComplete = animationStep >= totalSteps
  const activeJ = Math.min(animationStep, Nt - 1)
  const displayedSurface =
    surfaceMode === 'U'
      ? model.surfaceValues
      : model.S.map((_, i) => model.tau.map((__, n) => model.surfaceValues[i][model.tau.length - 1 - n]))

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
          <input type="range" min={6} max={40} value={Nt} onChange={(event) => setNt(Number(event.target.value))} className="w-full" />
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
        <span><Katex math={`h_S=${fmt(model.hS, 3)}`} /></span>
        <span><Katex math={`h_t=${fmt(model.ht, 4)}`} /></span>
        <span><Katex math="S_i=i h_S" /></span>
        <span><Katex math="t_j=j h_t" /></span>
      </div>

      <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <p className="font-semibold">Implicit stability</p>
        <p className="mt-1">
          The implicit method is unconditionally stable in the local Von Neumann sense for{' '}
          <Katex math="r\ge 0,\ \sigma>0,\ h_t>0" />. No explicit time-step restriction is required.
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Row solve animation</p>
            <p className="text-sm text-slate-600">
              Solved future rows: {animationStep} / {totalSteps}
              {!isComplete && (
                <>
                  {' '}
                  - next system computes <Katex math={`\\mathbf U^{${activeJ + 1}}`} />
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <button type="button" onClick={() => { setAnimationStep(0); setIsPlaying(false) }} className="rounded border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-50">Reset</button>
            <button type="button" onClick={() => setAnimationStep((step) => Math.min(step + 1, totalSteps))} disabled={isComplete} className="rounded border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Step</button>
            <button type="button" onClick={() => setIsPlaying((playing) => !playing)} disabled={isComplete} className="rounded bg-slate-800 px-3 py-1 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">{isPlaying ? 'Pause' : 'Play'}</button>
            <button type="button" onClick={() => { setAnimationStep(totalSteps); setIsPlaying(false) }} className="rounded border border-slate-300 px-3 py-1 font-medium text-slate-700 hover:bg-slate-50">Complete</button>
          </div>
        </div>
        <label className="block text-sm text-slate-700">
          <span className="mb-1 block font-medium">
            Step {animationStep}: {isComplete ? 'all time rows solved' : `solving system j = ${activeJ} to ${activeJ + 1}`}
          </span>
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
        </label>
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
                    <div className="font-mono text-[10px]">{fmt(model.tau[displayJ], 2)}</div>
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
                            ? 'bg-violet-100 font-semibold text-violet-900 ring-2 ring-inset ring-violet-300'
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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-3">
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Current system</p>
            <Katex math={`A_I\\mathbf U^{${activeJ + 1}}=\\mathbf U^{${activeJ}}+\\mathbf q_I^{${activeJ + 1}}`} display />
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Future boundary terms</p>
            <Katex
              math={`U_{0,${activeJ + 1}}=${fmt(model.boundaryByStep[activeJ]?.left ?? 0)},\\quad U_{N_S,${activeJ + 1}}=${fmt(model.boundaryByStep[activeJ]?.right ?? 0)}`}
              display
            />
          </div>
          <div className="rounded-md bg-emerald-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">Solved row</p>
            <Katex math={`\\mathbf U^{${activeJ + 1}}=A_I^{-1}(\\mathbf U^{${activeJ}}+\\mathbf q_I^{${activeJ + 1}})`} display />
          </div>
        </div>

        <MatrixTable title="Full A_I matrix" values={model.A} />
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
          t={model.tau}
          V={displayedSurface}
          title={surfaceMode === 'U' ? 'Implicit U(S,tau) surface' : 'Recovered V(S,t) surface'}
          zMax={model.K}
          showGridPoints
          yLabel={surfaceMode === 'U' ? 'tau' : 't'}
          zLabel={surfaceMode === 'U' ? 'U(S,tau)' : 'V(S,t)'}
          valueLabel={surfaceMode}
        />
      </div>
    </div>
  )
}
