import { useEffect, useMemo, useState } from 'react'
import { americanParams } from '../../data/parameters'
import { Katex } from '../Math/Katex'
import { SurfacePlot } from './SurfacePlot'
import { ContinuationRegionPlot } from './ContinuationRegionPlot'

function fmt(value: number, digits = 4) {
  return value.toFixed(digits)
}

function multiplyMatrixVector(matrix: number[][], vector: number[]) {
  return matrix.map((row) => row.reduce((sum, value, col) => sum + value * vector[col], 0))
}

const TOL = 1e-6
const MAX_ITER = 200

// Tridiagonal-only PSOR solve (no dense NS x NS matrices), so this stays fast even
// at the high resolutions used for the continuation-region plot (NS, Nt up to 150).
function solvePSORTridiagonal(NS: number, Nt: number, r: number, sigma: number, omega: number) {
  const { T, K, Smax } = americanParams
  const hS = Smax / NS
  const ht = T / Nt
  const n = NS - 1
  const S = Array.from({ length: NS + 1 }, (_, i) => i * hS)
  const tau = Array.from({ length: Nt + 1 }, (_, j) => j * ht)
  const indices = Array.from({ length: n }, (_, k) => k + 1)

  const a = indices.map((i) => -((sigma ** 2 * ht) / 4) * i ** 2 + ((r * ht) / 4) * i)
  const b = indices.map((i) => 1 + ((sigma ** 2 * ht) / 2) * i ** 2 + (r * ht) / 2)
  const c = indices.map((i) => -((sigma ** 2 * ht) / 4) * i ** 2 - ((r * ht) / 4) * i)
  const d = indices.map((i) => 1 - ((sigma ** 2 * ht) / 2) * i ** 2 - (r * ht) / 2)

  const g = S.slice(1, NS).map((Si) => Math.max(K - Si, 0))
  const Ag = g.map((_, i) => {
    const left = i > 0 ? a[i] * g[i - 1] : 0
    const right = i < n - 1 ? c[i] * g[i + 1] : 0
    return left + b[i] * g[i] + right
  })

  const rows: number[][] = [S.map((value) => Math.max(K - value, 0))]
  const SfByStep: number[] = [K]
  const payoffNow = S.map((Si) => Math.max(K - Si, 0))

  for (let j = 0; j < Nt; j += 1) {
    const previousRow = rows[j]
    const previousInterior = previousRow.slice(1, NS)

    const rhs = previousInterior.map((value, i) => {
      const left = i > 0 ? -a[i] * previousInterior[i - 1] : 0
      const right = i < n - 1 ? -c[i] * previousInterior[i + 1] : 0
      return left + d[i] * value + right
    })
    rhs[0] -= a[0] * (K + previousRow[0])
    rhs[n - 1] -= c[n - 1] * (0 + previousRow[NS])

    const btilde = rhs.map((value, idx) => value - Ag[idx])

    let x = previousInterior.map((value, idx) => Math.max(value - g[idx], 0))
    let err = Infinity
    let iter = 0
    while (err > TOL && iter < MAX_ITER) {
      const xNew = [...x]
      for (let i = 0; i < n; i += 1) {
        const left = i > 0 ? xNew[i - 1] : 0
        const right = i < n - 1 ? x[i + 1] : 0
        const tentative = (1 - omega) * x[i] + (omega / b[i]) * (btilde[i] - a[i] * left - c[i] * right)
        xNew[i] = Math.max(0, tentative)
      }
      err = Math.max(...xNew.map((value, idx) => Math.abs(value - x[idx])))
      x = xNew
      iter += 1
    }

    const nextRow = [K, ...x.map((value, idx) => value + g[idx]), 0]
    rows.push(nextRow)

    const diffNow = nextRow.map((value, idx) => value - payoffNow[idx])
    const idx = diffNow.findIndex((value) => value > 1e-8)
    if (idx === -1) SfByStep.push(Smax)
    else if (idx === 0) SfByStep.push(0)
    else {
      const sL = S[idx - 1]
      const sR = S[idx]
      const dL = diffNow[idx - 1]
      const dR = diffNow[idx]
      SfByStep.push(Math.abs(dR - dL) < 1e-14 ? sL : sL - (dL * (sR - sL)) / (dR - dL))
    }
  }

  const surfaceValues = S.map((_, i) => rows.map((row) => row[i]))
  return { S, t: tau, surfaceValues, Sf: SfByStep }
}

export function AmericanPSORCalculationExample() {
  const [NS, setNS] = useState(10)
  const [Nt, setNt] = useState(8)
  const [r, setR] = useState(americanParams.r)
  const [sigma, setSigma] = useState(americanParams.sigma)
  const [omega, setOmega] = useState(americanParams.omega)
  const [contNS, setContNS] = useState(60)
  const [contNt, setContNt] = useState(60)
  const [selectedI, setSelectedI] = useState(4)
  const [animationStep, setAnimationStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [surfaceMode, setSurfaceMode] = useState<'U' | 'V'>('U')

  const model = useMemo(() => {
    const { T, K, Smax } = americanParams
    const hS = Smax / NS
    const ht = T / Nt
    const n = NS - 1
    const S = Array.from({ length: NS + 1 }, (_, i) => i * hS)
    const tau = Array.from({ length: Nt + 1 }, (_, j) => j * ht)
    const indices = Array.from({ length: n }, (_, k) => k + 1)

    const a = indices.map((i) => -((sigma ** 2 * ht) / 4) * i ** 2 + ((r * ht) / 4) * i)
    const b = indices.map((i) => 1 + ((sigma ** 2 * ht) / 2) * i ** 2 + (r * ht) / 2)
    const c = indices.map((i) => -((sigma ** 2 * ht) / 4) * i ** 2 - ((r * ht) / 4) * i)
    const d = indices.map((i) => 1 - ((sigma ** 2 * ht) / 2) * i ** 2 - (r * ht) / 2)

    const A = indices.map((_, row) =>
      indices.map((__, col) => {
        if (row === col) return b[row]
        if (col === row - 1) return a[row]
        if (col === row + 1) return c[row]
        return 0
      }),
    )
    const B = indices.map((_, row) =>
      indices.map((__, col) => {
        if (row === col) return d[row]
        if (col === row - 1) return -a[row]
        if (col === row + 1) return -c[row]
        return 0
      }),
    )

    const g = S.slice(1, NS).map((Si) => Math.max(K - Si, 0))
    const Ag = multiplyMatrixVector(A, g)

    const U: number[][] = [S.map((value) => Math.max(K - value, 0))]
    const iterationsByStep: number[] = []
    const btildeByStep: number[][] = []
    const SfByStep: number[] = [K]

    for (let j = 0; j < Nt; j += 1) {
      const previousRow = U[j]
      const previousInterior = previousRow.slice(1, NS)
      const rhs = multiplyMatrixVector(B, previousInterior)
      rhs[0] -= a[0] * (K + previousRow[0])
      rhs[n - 1] -= c[n - 1] * (0 + previousRow[NS])

      const btilde = rhs.map((value, idx) => value - Ag[idx])
      btildeByStep.push(btilde)

      let x = previousInterior.map((value, idx) => Math.max(value - g[idx], 0))
      let err = Infinity
      let iter = 0

      while (err > TOL && iter < MAX_ITER) {
        const xNew = [...x]
        for (let i = 0; i < n; i += 1) {
          const left = i > 0 ? xNew[i - 1] : 0
          const right = i < n - 1 ? x[i + 1] : 0
          const tentative = (1 - omega) * x[i] + (omega / b[i]) * (btilde[i] - a[i] * left - c[i] * right)
          xNew[i] = Math.max(0, tentative)
        }
        err = Math.max(...xNew.map((value, idx) => Math.abs(value - x[idx])))
        x = xNew
        iter += 1
      }

      iterationsByStep.push(iter)
      const w = x.map((value, idx) => value + g[idx])
      U.push([K, ...w, 0])

      const payoffNow = S.map((Si) => Math.max(K - Si, 0))
      const diffNow = U[j + 1].map((value, idx) => value - payoffNow[idx])
      const idx = diffNow.findIndex((value) => value > 1e-8)
      if (idx === -1) SfByStep.push(Smax)
      else if (idx === 0) SfByStep.push(0)
      else {
        const sL = S[idx - 1]
        const sR = S[idx]
        const dL = diffNow[idx - 1]
        const dR = diffNow[idx]
        SfByStep.push(Math.abs(dR - dL) < 1e-14 ? sL : sL - (dL * (sR - sL)) / (dR - dL))
      }
    }

    const surfaceValues = S.map((_, i) => U.map((row) => row[i]))
    const g0 = S.map((Si) => Math.max(K - Si, 0))

    return { A, B, K, S, U, a, b, c, g, g0, hS, ht, iterationsByStep, btildeByStep, Sf: SfByStep, surfaceValues, tau }
  }, [NS, Nt, r, sigma, omega])

  // Independent, higher-resolution grid just for the continuation-region plot, so it can be
  // made much richer (up to 150 points) without inflating the per-step animated table above.
  const contModel = useMemo(
    () => solvePSORTridiagonal(contNS, contNt, r, sigma, omega),
    [contNS, contNt, r, sigma, omega],
  )

  const totalSteps = Nt
  const isComplete = animationStep >= totalSteps
  const activeJ = Math.min(animationStep, Nt - 1)
  const activeI = Math.min(selectedI, NS - 1)
  const activeRow = activeI - 1
  const displayedSurface =
    surfaceMode === 'U'
      ? model.surfaceValues
      : model.S.map((_, i) => model.tau.map((__, n) => model.surfaceValues[i][model.tau.length - 1 - n]))

  useEffect(() => {
    setAnimationStep(0)
    setIsPlaying(false)
  }, [NS, Nt, r, sigma, omega])

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

  const solvedValue = model.U[activeJ + 1][activeI]
  const obstacleValue = model.g0[activeI]
  const isExercised = solvedValue - obstacleValue <= 1e-6

  return (
    <div className="space-y-5">
      <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-5">
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`N_S=${NS}`} />
          </span>
          <input type="range" min={6} max={16} value={NS} onChange={(e) => setNS(Number(e.target.value))} className="w-full" />
        </label>
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`N_t=${Nt}`} />
          </span>
          <input type="range" min={6} max={20} value={Nt} onChange={(e) => setNt(Number(e.target.value))} className="w-full" />
        </label>
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`r=${fmt(r, 3)}`} />
          </span>
          <input type="range" min={0} max={0.12} step={0.005} value={r} onChange={(e) => setR(Number(e.target.value))} className="w-full" />
        </label>
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`\\sigma=${fmt(sigma, 2)}`} />
          </span>
          <input type="range" min={0.1} max={0.6} step={0.01} value={sigma} onChange={(e) => setSigma(Number(e.target.value))} className="w-full" />
        </label>
        <label>
          <span className="mb-1 block font-medium">
            <Katex math={`\\omega=${fmt(omega, 2)}`} />
          </span>
          <input type="range" min={0.5} max={1.9} step={0.05} value={omega} onChange={(e) => setOmega(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-3">
        <div className="rounded-md bg-blue-50 px-3 py-2">
          <Katex math="U_{i,0}=g_i=\max(K-S_i,0)" />
        </div>
        <div className="rounded-md bg-red-50 px-3 py-2">
          <Katex math="U_{0,j}=K" />
        </div>
        <div className="rounded-md bg-red-50 px-3 py-2">
          <Katex math="U_{N_S,j}=0" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        <span><Katex math={`h_S=${fmt(model.hS, 3)}`} /></span>
        <span><Katex math={`h_t=${fmt(model.ht, 4)}`} /></span>
        <span><Katex math="S_i=i h_S" /></span>
        <span><Katex math="t_j=j h_t" /></span>
      </div>

      <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Row solve animation</p>
            <p className="text-sm text-slate-600">
              Solved future rows: {animationStep} / {totalSteps}
              {!isComplete && (
                <>
                  {' '}- PSOR solves <Katex math={`\\mathbf U^{${activeJ + 1}}`} /> in{' '}
                  {model.iterationsByStep[activeJ]} sweeps
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
            Step {animationStep}: {isComplete ? 'all time rows solved' : `PSOR sweep for j = ${activeJ} to ${activeJ + 1}`}
          </span>
          <input type="range" min={0} max={totalSteps} value={animationStep} onChange={(e) => { setAnimationStep(Number(e.target.value)); setIsPlaying(false) }} className="w-full" />
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
                    const isSolved = displayJ > 0 && displayJ <= animationStep && i > 0 && i < NS
                    const isFutureRow = !isComplete && displayJ === activeJ + 1 && i > 0 && i < NS
                    const showValue = isBoundary || isInitial || isSolved
                    const exercised = showValue && !isBoundary && value - model.g0[i] <= 1e-6

                    return (
                      <td
                        key={`${displayJ}-${i}`}
                        className={`border border-slate-200 px-2 py-1 ${
                          isFutureRow
                            ? 'bg-indigo-100 font-semibold text-indigo-900 ring-2 ring-inset ring-indigo-300'
                            : isBoundary
                              ? 'bg-red-50 text-red-700'
                              : isInitial
                                ? 'bg-blue-50 text-blue-700'
                                : isSolved
                                  ? exercised
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-emerald-50 text-emerald-800'
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
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
          <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-amber-50 ring-1 ring-amber-300" />exercise region, U=g</span>
          <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-50 ring-1 ring-emerald-300" />continuation region, U&gt;g</span>
        </div>
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
        <SurfacePlot
          S={model.S}
          t={model.tau}
          V={displayedSurface}
          title={surfaceMode === 'U' ? 'American put U(S,tau) surface' : 'Recovered V(S,t) surface'}
          zMax={model.K}
          showGridPoints
          yLabel={surfaceMode === 'U' ? 'tau' : 't'}
          zLabel={surfaceMode === 'U' ? 'U(S,tau)' : 'V(S,t)'}
          valueLabel={surfaceMode}
        />
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-900">Continuation region and free boundary</h3>
        <p className="mb-3 text-sm text-slate-600">
          This plot uses its own, finer grid so the continuation region and free boundary stay smooth,
          independent of the coarser grid used for the row-by-row animation above.
        </p>
        <div className="mb-3 grid max-w-md gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <label>
            <span className="mb-1 block font-medium">
              <Katex math={`N_S=${contNS}`} />
            </span>
            <input
              type="range"
              min={20}
              max={150}
              value={contNS}
              onChange={(e) => setContNS(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label>
            <span className="mb-1 block font-medium">
              <Katex math={`N_t=${contNt}`} />
            </span>
            <input
              type="range"
              min={20}
              max={150}
              value={contNt}
              onChange={(e) => setContNt(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <div className="w-full overflow-hidden rounded-md">
          <ContinuationRegionPlot S={contModel.S} t={contModel.t} V={contModel.surfaceValues} Sf={contModel.Sf} />
        </div>
      </div>

      <label className="block text-sm text-slate-700">
        <span className="mb-1 block font-medium">Selected interior index: i = {activeI}</span>
        <input type="range" min={1} max={NS - 1} value={activeI} onChange={(e) => setSelectedI(Number(e.target.value))} className="w-full" />
      </label>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Obstacle at this node</p>
            <Katex math={`g_{${activeI}}=${fmt(model.g0[activeI])}`} display />
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Coefficients</p>
            <Katex math={`a_${activeI}=${fmt(model.a[activeRow])},\\quad b_${activeI}=${fmt(model.b[activeRow])},\\quad c_${activeI}=${fmt(model.c[activeRow])}`} display />
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Shifted right-hand side</p>
            <Katex math={`\\tilde b_{${activeI}}^{${activeJ},${activeJ + 1}}=${fmt(model.btildeByStep[activeJ][activeRow])}`} display />
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">PSOR sweeps for this row</p>
            <Katex math={`\\text{iterations to converge}=${model.iterationsByStep[activeJ]}`} display />
          </div>
          <div className={`rounded-md px-4 py-3 ${isExercised ? 'bg-amber-50' : 'bg-emerald-50'}`}>
            <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${isExercised ? 'text-amber-700' : 'text-emerald-700'}`}>
              {isExercised ? 'Exercise node' : 'Continuation node'}
            </p>
            <Katex math={`U_{${activeI},${activeJ + 1}}=${fmt(solvedValue)}` + (isExercised ? '=g_{' + activeI + '}' : '>g_{' + activeI + '}=' + fmt(obstacleValue))} display />
          </div>
        </div>
      </div>
    </div>
  )
}
