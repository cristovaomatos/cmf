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

function fmt(value: number, digits = 4) {
  return value.toFixed(digits)
}

function coefficientClass(value: number) {
  if (value < -0.0000001) return 'bg-red-50 text-red-700'
  if (value < 0.0000001) return 'bg-slate-50 text-slate-500'
  return 'bg-emerald-50 text-emerald-800'
}

export function ExplicitMethodCalculationExample() {
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
    const S = Array.from({ length: NS + 1 }, (_, i) => i * hS)
    const tau = Array.from({ length: Nt + 1 }, (_, j) => j * ht)
    const indices = Array.from({ length: NS - 1 }, (_, k) => k + 1)

    const a = indices.map((i) => (ht / 2) * (sigma ** 2 * i ** 2 - r * i))
    const b = indices.map((i) => 1 - sigma ** 2 * i ** 2 * ht - r * ht)
    const c = indices.map((i) => (ht / 2) * (sigma ** 2 * i ** 2 + r * i))
    const U: number[][] = [S.map((value) => payoff(value, K, optionType))]
    const calculationRows: Array<{ i: number; j: number; left: number; center: number; right: number; value: number }> = []

    for (let j = 0; j < Nt; j += 1) {
      const previousRow = U[j]
      const nextRow = Array(NS + 1).fill(0) as number[]
      nextRow[0] = leftBoundary(tau[j + 1], K, r, optionType)
      nextRow[NS] = rightBoundary(Smax, tau[j + 1], K, r, optionType)

      indices.forEach((i, index) => {
        const value = a[index] * previousRow[i - 1] + b[index] * previousRow[i] + c[index] * previousRow[i + 1]
        nextRow[i] = value
        calculationRows.push({
          i,
          j,
          left: previousRow[i - 1],
          center: previousRow[i],
          right: previousRow[i + 1],
          value,
        })
      })

      U.push(nextRow)
    }

    const surfaceValues = S.map((_, i) => U.map((row) => row[i]))
    const maxStableHt = 1 / (sigma ** 2 * (NS - 1) ** 2 + r)
    const driftConditionOk = sigma ** 2 >= r
    const timeConditionOk = ht <= maxStableHt

    return {
      K,
      S,
      U,
      a,
      b,
      c,
      calculationRows,
      driftConditionOk,
      hS,
      ht,
      maxStableHt,
      surfaceValues,
      tau,
      timeConditionOk,
    }
  }, [NS, Nt, optionType, r, sigma])

  const totalSteps = model.calculationRows.length
  const isComplete = animationStep >= totalSteps
  const currentCalculation = isComplete ? undefined : model.calculationRows[animationStep]
  const focusCalculation = currentCalculation ?? model.calculationRows[totalSteps - 1]
  const activeI = focusCalculation?.i ?? 1
  const activeJ = focusCalculation?.j ?? 0
  const activeRow = activeI - 1
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
    }, 650)

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
          <input
            type="range"
            min={6}
            max={16}
            value={NS}
            onChange={(event) => setNS(Number(event.target.value))}
            className="w-full"
          />
        </label>
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`N_t=${Nt}`} />
          </span>
          <input
            type="range"
            min={6}
            max={40}
            value={Nt}
            onChange={(event) => setNt(Number(event.target.value))}
            className="w-full"
          />
        </label>
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`r=${fmt(r, 3)}`} />
          </span>
          <input
            type="range"
            min={0}
            max={0.12}
            step={0.005}
            value={r}
            onChange={(event) => setR(Number(event.target.value))}
            className="w-full"
          />
        </label>
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`\\sigma=${fmt(sigma, 2)}`} />
          </span>
          <input
            type="range"
            min={0.1}
            max={0.6}
            step={0.01}
            value={sigma}
            onChange={(event) => setSigma(Number(event.target.value))}
            className="w-full"
          />
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
          <Katex math="S_i=i h_S" />
        </span>
        <span>
          <Katex math="t_j=j h_t" />
        </span>
      </div>

      <div
        className={`rounded-md px-4 py-3 text-sm ${
          model.driftConditionOk && model.timeConditionOk
            ? 'bg-emerald-50 text-emerald-800'
            : 'bg-amber-50 text-amber-900'
        }`}
      >
        <p className="mb-2 font-semibold">Practical sufficient stability conditions</p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Katex
              math={`\\sigma^2=${fmt(sigma ** 2, 4)}\\ge r=${fmt(r, 4)}`}
              display
            />
            <p className="mt-1 text-xs">
              {model.driftConditionOk ? 'Satisfied: left weight can remain non-negative.' : 'Not satisfied: left weights may become negative.'}
            </p>
          </div>
          <div>
            <Katex
              math={`h_t=${fmt(model.ht, 4)}\\le h_t^{\\max}=\\frac{1}{\\sigma^2(N_S-1)^2+r}=${fmt(model.maxStableHt, 4)}`}
              display
            />
            <p className="mt-1 text-xs">
              {model.timeConditionOk ? 'Satisfied: central weights remain non-negative.' : 'Not satisfied: the time step is too large.'}
            </p>
          </div>
        </div>
        <p className="mt-3">
          {model.driftConditionOk && model.timeConditionOk
            ? 'The current grid satisfies the practical sufficient explicit stability check.'
            : 'The current grid violates at least one practical sufficient stability check, so oscillations may appear.'}
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Grid calculation animation
            </p>
            <p className="text-sm text-slate-600">
              Computed interior cells: {animationStep} / {totalSteps}
              {!isComplete && (
                <>
                  {' '}
                  - next cell <Katex math={`U_{${activeI},${activeJ + 1}}`} />
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
        <label className="block text-sm text-slate-700">
          <span className="mb-1 block font-medium">
            Step {animationStep}: {isComplete ? 'all interior cells computed' : `computing j = ${activeJ} to ${activeJ + 1}`}
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
                    const computationIndex = displayJ > 0 && i > 0 && i < NS ? (displayJ - 1) * (NS - 1) + (i - 1) : -1
                    const isComputed = computationIndex >= 0 && computationIndex < animationStep
                    const isActiveTarget =
                      !!currentCalculation && displayJ === currentCalculation.j + 1 && i === currentCalculation.i
                    const isActiveSource =
                      !!currentCalculation &&
                      displayJ === currentCalculation.j &&
                      (i === currentCalculation.i - 1 || i === currentCalculation.i || i === currentCalculation.i + 1)
                    const showValue = isBoundary || isInitial || isComputed
                    return (
                      <td
                        key={`${displayJ}-${i}`}
                        className={`border border-slate-200 px-2 py-1 ${
                          isActiveTarget
                            ? 'bg-emerald-100 font-semibold text-emerald-950 ring-2 ring-inset ring-emerald-400'
                            : isActiveSource
                              ? 'bg-amber-100 font-semibold text-amber-900'
                            : isBoundary
                                ? 'bg-red-50 text-red-700'
                                : isInitial
                                  ? 'bg-blue-50 text-blue-700'
                                  : isComputed
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
          <div className="rounded-md bg-blue-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              Initial condition
            </p>
            <Katex
              math={`S_${activeI}=${activeI}h_S=${activeI}\\cdot ${fmt(model.hS, 3)}
                =${fmt(model.S[activeI], 3)}`}
              display
            />
            <Katex
              math={
                optionType === 'put'
                  ? `U_{${activeI},0}=u_0(S_${activeI})=\\max(K-S_${activeI},0)
                    =\\max(${fmt(model.K, 2)}-${fmt(model.S[activeI], 3)},0)
                    =${fmt(model.U[0][activeI])}`
                  : `U_{${activeI},0}=u_0(S_${activeI})=\\max(S_${activeI}-K,0)
                    =\\max(${fmt(model.S[activeI], 3)}-${fmt(model.K, 2)},0)
                    =${fmt(model.U[0][activeI])}`
              }
              display
            />
          </div>

          <div className="rounded-md bg-red-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-700">
              Left boundary condition
            </p>
            <Katex
              math={`t_${activeJ}=${activeJ}h_t=${activeJ}\\cdot ${fmt(model.ht, 4)}=${fmt(model.tau[activeJ], 4)}`}
              display
            />
            <Katex
              math={
                optionType === 'put'
                  ? `U_{0,${activeJ}}=u_a(t_${activeJ})=Ke^{-rt_${activeJ}}
                    =${fmt(model.K, 2)}e^{-${fmt(r, 3)}\\cdot ${fmt(model.tau[activeJ], 4)}}
                    =${fmt(model.U[activeJ][0])}`
                  : `U_{0,${activeJ}}=u_a(t_${activeJ})=0`
              }
              display
            />
            <Katex
              math={
                optionType === 'put'
                  ? `U_{0,${activeJ + 1}}=u_a(t_${activeJ + 1})=Ke^{-rt_${activeJ + 1}}
                    =${fmt(model.K, 2)}e^{-${fmt(r, 3)}\\cdot ${fmt(model.tau[activeJ + 1], 4)}}
                    =${fmt(model.U[activeJ + 1][0])}`
                  : `U_{0,${activeJ + 1}}=u_a(t_${activeJ + 1})=0`
              }
              display
            />
          </div>

          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Selected weights</p>
            <Katex
              math={`a_${activeI}=${fmt(model.a[activeRow])},\\quad b_${activeI}=${fmt(model.b[activeRow])},\\quad c_${activeI}=${fmt(model.c[activeRow])}`}
              display
            />
          </div>

          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Selected calculation</p>
            <Katex
              math={`U_{${activeI},${activeJ + 1}}=a_${activeI}U_{${activeI - 1},${activeJ}}+b_${activeI}U_{${activeI},${activeJ}}+c_${activeI}U_{${activeI + 1},${activeJ}}`}
              display
            />
            {focusCalculation && (
              <Katex
                math={`U_{${activeI},${activeJ + 1}}=${fmt(model.a[activeRow])}(${fmt(focusCalculation.left, 3)})+${fmt(model.b[activeRow])}(${fmt(focusCalculation.center, 3)})+${fmt(model.c[activeRow])}(${fmt(focusCalculation.right, 3)})=${fmt(focusCalculation.value)}`}
                display
              />
            )}
          </div>

          <div className="rounded-md bg-emerald-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">Computed cell</p>
            <Katex math={`U_{${activeI},${activeJ + 1}}=${fmt(model.U[activeJ + 1][activeI])}`} display />
            {!isComplete && (
              <p className="mt-1 text-sm text-emerald-800">
                Press Step or Play to reveal this value in the grid.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">All explicit weights</p>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-2 py-1 text-left">i</th>
                  <th className="px-2 py-1">
                    <Katex math="a_i" />
                  </th>
                  <th className="px-2 py-1">
                    <Katex math="b_i" />
                  </th>
                  <th className="px-2 py-1">
                    <Katex math="c_i" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {model.a.map((aValue, index) => (
                  <tr key={index + 1} className={index === activeRow ? 'font-semibold' : ''}>
                    <td className="border border-slate-200 px-2 py-1 text-left">{index + 1}</td>
                    <td className={`border border-slate-200 px-2 py-1 ${coefficientClass(aValue)}`}>
                      {fmt(aValue, 4)}
                    </td>
                    <td className={`border border-slate-200 px-2 py-1 ${coefficientClass(model.b[index])}`}>
                      {fmt(model.b[index], 4)}
                    </td>
                    <td className={`border border-slate-200 px-2 py-1 ${coefficientClass(model.c[index])}`}>
                      {fmt(model.c[index], 4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">3D surface for this grid</h3>
            <p className="text-sm text-slate-600">The dark markers are the grid values shown in the table.</p>
          </div>
          <div className="flex rounded-md border border-slate-300 p-1 text-sm">
            <button
              type="button"
              onClick={() => setSurfaceMode('U')}
              className={`rounded px-3 py-1 font-medium ${
                surfaceMode === 'U' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              U forward time
            </button>
            <button
              type="button"
              onClick={() => setSurfaceMode('V')}
              className={`rounded px-3 py-1 font-medium ${
                surfaceMode === 'V' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              V = U(T-t)
            </button>
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
          title={surfaceMode === 'U' ? 'Explicit U(S,tau) surface' : 'Recovered V(S,t) surface'}
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
