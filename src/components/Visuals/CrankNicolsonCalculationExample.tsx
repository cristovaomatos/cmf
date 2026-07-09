import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { crankNicolsonSimulationDefaults } from '../../data/parameters'
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

function luDecompose(matrix: number[][]) {
  const n = matrix.length
  const lu = matrix.map((row) => [...row])
  const pivots = Array.from({ length: n }, (_, i) => i)

  for (let k = 0; k < n; k += 1) {
    let pivotRow = k
    for (let row = k + 1; row < n; row += 1) {
      if (Math.abs(lu[row][k]) > Math.abs(lu[pivotRow][k])) pivotRow = row
    }

    if (pivotRow !== k) {
      ;[lu[k], lu[pivotRow]] = [lu[pivotRow], lu[k]]
      ;[pivots[k], pivots[pivotRow]] = [pivots[pivotRow], pivots[k]]
    }

    for (let row = k + 1; row < n; row += 1) {
      lu[row][k] /= lu[k][k]
      for (let col = k + 1; col < n; col += 1) {
        lu[row][col] -= lu[row][k] * lu[k][col]
      }
    }
  }

  return { lu, pivots }
}

function luSolve(decomposition: { lu: number[][]; pivots: number[] }, rhs: number[]) {
  const { lu, pivots } = decomposition
  const n = rhs.length
  const x = pivots.map((pivot) => rhs[pivot])

  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < row; col += 1) x[row] -= lu[row][col] * x[col]
  }

  for (let row = n - 1; row >= 0; row -= 1) {
    for (let col = row + 1; col < n; col += 1) x[row] -= lu[row][col] * x[col]
    x[row] /= lu[row][row]
  }

  return x
}

function multiplyMatrixVector(matrix: number[][], vector: number[]) {
  return matrix.map((row) => row.reduce((sum, value, col) => sum + value * vector[col], 0))
}

function fmt(value: number, digits = 4) {
  return value.toFixed(digits)
}

function latexNum(value: number, digits = 4) {
  if (Math.abs(value) < 0.5 * 10 ** -digits) return '0'
  return value.toFixed(digits)
}

function latexSum(terms: Array<{ coefficient: number; factor: string }>) {
  return terms
    .map(({ coefficient, factor }, index) => {
      const sign = coefficient < 0 ? '-' : index === 0 ? '' : '+'
      const spacer = index === 0 ? '' : ' '
      return `${spacer}${sign}${sign ? ' ' : ''}${latexNum(Math.abs(coefficient))}\\cdot ${factor}`
    })
    .join('')
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

function VectorTable({
  title,
  values,
  tone = 'slate',
}: {
  title: ReactNode
  values: number[]
  tone?: 'slate' | 'blue' | 'amber' | 'emerald'
}) {
  const toneClass = {
    slate: 'bg-white',
    blue: 'bg-blue-50',
    amber: 'bg-amber-50',
    emerald: 'bg-emerald-50',
  }[tone]

  return (
    <div className="min-w-28">
      <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <table className="mx-auto text-right text-xs text-slate-700">
        <tbody>
          {values.map((value, index) => (
            <tr key={index}>
              <td className={`min-w-24 border border-slate-200 px-3 py-1 font-mono ${toneClass}`}>
                {Math.abs(value) < 0.00005 ? '0' : fmt(value, 4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CalculationBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="space-y-2 text-sm text-slate-700 [&_.katex-display]:my-1">{children}</div>
    </div>
  )
}

export function CrankNicolsonCalculationExample() {
  const [optionType, setOptionType] = useState<OptionType>('put')
  const [NS, setNS] = useState(crankNicolsonSimulationDefaults.NS)
  const [Nt, setNt] = useState(crankNicolsonSimulationDefaults.Nt)
  const [r, setR] = useState(crankNicolsonSimulationDefaults.r)
  const [sigma, setSigma] = useState(crankNicolsonSimulationDefaults.sigma)
  const [selectedI, setSelectedI] = useState(4)
  const [animationStep, setAnimationStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [surfaceMode, setSurfaceMode] = useState<'U' | 'V'>('U')

  const model = useMemo(() => {
    const { T, K, Smax } = crankNicolsonSimulationDefaults
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
    const Adec = luDecompose(A)

    const U: number[][] = [S.map((value) => payoff(value, K, optionType))]
    const rhsByStep: number[][] = []
    const qByStep: number[][] = []
    const boundaryByStep: Array<{ previousLeft: number; previousRight: number; nextLeft: number; nextRight: number }> = []

    for (let j = 0; j < Nt; j += 1) {
      const previousRow = U[j]
      const previousInterior = previousRow.slice(1, NS)
      const rhs = multiplyMatrixVector(B, previousInterior)
      const q = Array.from({ length: n }, () => 0)
      const nextLeft = leftBoundary(tau[j + 1], K, r, optionType)
      const nextRight = rightBoundary(Smax, tau[j + 1], K, r, optionType)

      q[0] = -a[0] * (nextLeft + previousRow[0])
      q[n - 1] = -c[n - 1] * (nextRight + previousRow[NS])
      for (let row = 0; row < n; row += 1) rhs[row] += q[row]
      rhsByStep.push([...rhs])
      qByStep.push(q)
      boundaryByStep.push({
        previousLeft: previousRow[0],
        previousRight: previousRow[NS],
        nextLeft,
        nextRight,
      })

      const nextInterior = luSolve(Adec, rhs)
      U.push([nextLeft, ...nextInterior, nextRight])
    }

    const surfaceValues = S.map((_, i) => U.map((row) => row[i]))

    return { A, B, K, S, U, a, b, boundaryByStep, c, d, hS, ht, qByStep, rhsByStep, surfaceValues, tau }
  }, [NS, Nt, optionType, r, sigma])

  const totalSteps = Nt
  const isComplete = animationStep >= totalSteps
  const activeJ = Math.min(animationStep, Nt - 1)
  const activeI = Math.min(selectedI, NS - 1)
  const activeRow = activeI - 1
  const activeBoundary = model.boundaryByStep[activeJ]
  const previousRow = model.U[activeJ]
  const nextRow = model.U[activeJ + 1]
  const previousInterior = previousRow.slice(1, NS)
  const nextInterior = nextRow.slice(1, NS)
  const matrixProduct = multiplyMatrixVector(model.B, previousInterior)
  const activeCoeff = {
    a: model.a[activeRow],
    b: model.b[activeRow],
    c: model.c[activeRow],
    d: model.d[activeRow],
  }
  const initialValue = model.U[0][activeI]
  const selectedS = model.S[activeI]
  const rhsTermsSymbolic = [
    ...(activeI > 1 ? [{ coefficient: -activeCoeff.a, factor: `U_{${activeI - 1},${activeJ}}` }] : []),
    { coefficient: activeCoeff.d, factor: `U_{${activeI},${activeJ}}` },
    ...(activeI < NS - 1 ? [{ coefficient: -activeCoeff.c, factor: `U_{${activeI + 1},${activeJ}}` }] : []),
    ...(activeI === 1
      ? [{ coefficient: -activeCoeff.a, factor: `(U_{0,${activeJ + 1}}+U_{0,${activeJ}})` }]
      : []),
    ...(activeI === NS - 1
      ? [{ coefficient: -activeCoeff.c, factor: `(U_{${NS},${activeJ + 1}}+U_{${NS},${activeJ}})` }]
      : []),
  ]
  const rhsTermsNumeric = [
    ...(activeI > 1
      ? [{ coefficient: -activeCoeff.a, factor: latexNum(previousRow[activeI - 1]) }]
      : []),
    { coefficient: activeCoeff.d, factor: latexNum(previousRow[activeI]) },
    ...(activeI < NS - 1
      ? [{ coefficient: -activeCoeff.c, factor: latexNum(previousRow[activeI + 1]) }]
      : []),
    ...(activeI === 1 && activeBoundary
      ? [
          {
            coefficient: -activeCoeff.a,
            factor: `(${latexNum(activeBoundary.nextLeft)}+${latexNum(activeBoundary.previousLeft)})`,
          },
        ]
      : []),
    ...(activeI === NS - 1 && activeBoundary
      ? [
          {
            coefficient: -activeCoeff.c,
            factor: `(${latexNum(activeBoundary.nextRight)}+${latexNum(activeBoundary.previousRight)})`,
          },
        ]
      : []),
  ]
  const systemTermsSymbolic = [
    ...(activeI > 1 ? [{ coefficient: activeCoeff.a, factor: `U_{${activeI - 1},${activeJ + 1}}` }] : []),
    { coefficient: activeCoeff.b, factor: `U_{${activeI},${activeJ + 1}}` },
    ...(activeI < NS - 1 ? [{ coefficient: activeCoeff.c, factor: `U_{${activeI + 1},${activeJ + 1}}` }] : []),
  ]
  const systemTermsNumeric = [
    ...(activeI > 1 ? [{ coefficient: activeCoeff.a, factor: latexNum(nextRow[activeI - 1]) }] : []),
    { coefficient: activeCoeff.b, factor: latexNum(nextRow[activeI]) },
    ...(activeI < NS - 1 ? [{ coefficient: activeCoeff.c, factor: latexNum(nextRow[activeI + 1]) }] : []),
  ]
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
          <Katex math={optionType === 'put' ? 'U_{0,j}=u_a(\\tau_j)=Ke^{-r\\tau_j}' : 'U_{0,j}=u_a(\\tau_j)=0'} />
        </div>
        <div className="rounded-md bg-red-50 px-3 py-2">
          <Katex
            math={
              optionType === 'put'
                ? 'U_{N_S,j}=u_b(\\tau_j)=0'
                : 'U_{N_S,j}=u_b(\\tau_j)=S^*-Ke^{-r\\tau_j}'
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

      <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Step-by-step calculation by index</h3>
            <p className="text-sm text-slate-600">
              The table lists the quantities for every interior index. The detailed formulas below use the selected index{' '}
              <Katex math={`i=${activeI}`} /> and active step <Katex math={`${activeJ}\\to ${activeJ + 1}`} />.
            </p>
          </div>
        </div>

        <div className="mb-4 overflow-x-auto">
          <table className="text-right text-xs text-slate-700">
            <thead>
              <tr className="text-slate-500">
                <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-center">
                  <Katex math="i" />
                </th>
                <th className="border border-slate-200 bg-slate-50 px-2 py-1">
                  <Katex math="S_i" />
                </th>
                <th className="border border-slate-200 bg-blue-50 px-2 py-1">
                  <Katex math="U_{i,0}" />
                </th>
                <th className="border border-slate-200 bg-amber-50 px-2 py-1">
                  <Katex math="a_i" />
                </th>
                <th className="border border-slate-200 bg-blue-50 px-2 py-1">
                  <Katex math="b_i" />
                </th>
                <th className="border border-slate-200 bg-amber-50 px-2 py-1">
                  <Katex math="c_i" />
                </th>
                <th className="border border-slate-200 bg-blue-50 px-2 py-1">
                  <Katex math="d_i" />
                </th>
              </tr>
            </thead>
            <tbody>
              {model.a.map((aValue, index) => {
                const i = index + 1
                return (
                  <tr key={i} className={i === activeI ? 'font-semibold text-indigo-900' : undefined}>
                    <td className={`border border-slate-200 px-2 py-1 text-center ${i === activeI ? 'bg-indigo-50' : 'bg-white'}`}>
                      {i}
                    </td>
                    <td className="border border-slate-200 bg-white px-2 py-1">{fmt(model.S[i], 3)}</td>
                    <td className="border border-slate-200 bg-blue-50 px-2 py-1">{fmt(model.U[0][i], 3)}</td>
                    <td className="border border-slate-200 bg-amber-50 px-2 py-1">{fmt(aValue, 5)}</td>
                    <td className="border border-slate-200 bg-blue-50 px-2 py-1">{fmt(model.b[index], 5)}</td>
                    <td className="border border-slate-200 bg-amber-50 px-2 py-1">{fmt(model.c[index], 5)}</td>
                    <td className="border border-slate-200 bg-blue-50 px-2 py-1">{fmt(model.d[index], 5)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <label className="mb-4 block text-sm text-slate-700">
          <span className="mb-1 block font-medium">
            Detailed index: <Katex math={`i=${activeI}`} />
          </span>
          <input
            type="range"
            min={1}
            max={NS - 1}
            value={activeI}
            onChange={(event) => setSelectedI(Number(event.target.value))}
            className="w-full"
          />
        </label>

        <div className="grid gap-3 xl:grid-cols-2">
          <CalculationBox title="Grid and initial value">
            <Katex math={`S_${activeI}=${activeI}h_S=${activeI}\\cdot ${latexNum(model.hS, 3)}=${latexNum(selectedS, 3)}`} display />
            <Katex
              math={
                optionType === 'put'
                  ? `U_{${activeI},0}=\\max(K-S_${activeI},0)=\\max(${latexNum(model.K, 2)}-${latexNum(selectedS, 3)},0)=${latexNum(initialValue)}`
                  : `U_{${activeI},0}=\\max(S_${activeI}-K,0)=\\max(${latexNum(selectedS, 3)}-${latexNum(model.K, 2)},0)=${latexNum(initialValue)}`
              }
              display
            />
            <Katex
              math={
                optionType === 'put'
                  ? `U_{0,0}=\\max(K-S_0,0)=\\max(${latexNum(model.K, 2)}-0,0)=${latexNum(model.U[0][0])}`
                  : `U_{0,0}=\\max(S_0-K,0)=\\max(0-${latexNum(model.K, 2)},0)=${latexNum(model.U[0][0])}`
              }
              display
            />
          </CalculationBox>

          <CalculationBox title="Boundary values for the active step">
            <Katex math={`\\tau_{${activeJ}}=${activeJ}h_t=${latexNum(model.tau[activeJ], 4)},\\qquad \\tau_{${activeJ + 1}}=${latexNum(model.tau[activeJ + 1], 4)}`} display />
            <Katex
              math={
                optionType === 'put'
                  ? `U_{0,${activeJ}}=Ke^{-r\\tau_{${activeJ}}}=${latexNum(model.K, 2)}e^{-${latexNum(r, 3)}\\cdot ${latexNum(model.tau[activeJ], 4)}}=${latexNum(activeBoundary?.previousLeft ?? 0)}`
                  : `U_{0,${activeJ}}=0,\\qquad U_{0,${activeJ + 1}}=0`
              }
              display
            />
            <Katex
              math={
                optionType === 'put'
                  ? `U_{0,${activeJ + 1}}=Ke^{-r\\tau_{${activeJ + 1}}}=${latexNum(model.K, 2)}e^{-${latexNum(r, 3)}\\cdot ${latexNum(model.tau[activeJ + 1], 4)}}=${latexNum(activeBoundary?.nextLeft ?? 0)}`
                  : `U_{N_S,${activeJ}}=S^*-Ke^{-r\\tau_{${activeJ}}}=${latexNum(activeBoundary?.previousRight ?? 0)}`
              }
              display
            />
            <Katex
              math={
                optionType === 'put'
                  ? `U_{N_S,${activeJ}}=0,\\qquad U_{N_S,${activeJ + 1}}=0`
                  : `U_{N_S,${activeJ + 1}}=S^*-Ke^{-r\\tau_{${activeJ + 1}}}=${latexNum(activeBoundary?.nextRight ?? 0)}`
              }
              display
            />
          </CalculationBox>

          <CalculationBox title="Coefficient calculation">
            <Katex
              math={`a_${activeI}=-\\frac{${latexNum(sigma, 2)}^2\\cdot ${latexNum(model.ht, 4)}}{4}\\cdot ${activeI}^2+\\frac{${latexNum(r, 3)}\\cdot ${latexNum(model.ht, 4)}}{4}\\cdot ${activeI}=${latexNum(activeCoeff.a)}`}
              display
            />
            <Katex
              math={`b_${activeI}=1+\\frac{${latexNum(sigma, 2)}^2\\cdot ${latexNum(model.ht, 4)}}{2}\\cdot ${activeI}^2+\\frac{${latexNum(r, 3)}\\cdot ${latexNum(model.ht, 4)}}{2}=${latexNum(activeCoeff.b)}`}
              display
            />
            <Katex
              math={`c_${activeI}=-\\frac{${latexNum(sigma, 2)}^2\\cdot ${latexNum(model.ht, 4)}}{4}\\cdot ${activeI}^2-\\frac{${latexNum(r, 3)}\\cdot ${latexNum(model.ht, 4)}}{4}\\cdot ${activeI}=${latexNum(activeCoeff.c)}`}
              display
            />
            <Katex
              math={`d_${activeI}=1-\\frac{${latexNum(sigma, 2)}^2\\cdot ${latexNum(model.ht, 4)}}{2}\\cdot ${activeI}^2-\\frac{${latexNum(r, 3)}\\cdot ${latexNum(model.ht, 4)}}{2}=${latexNum(activeCoeff.d)}`}
              display
            />
          </CalculationBox>

          <CalculationBox title="Right-hand side and solved equation">
            <Katex math={`\\mathrm{rhs}_{${activeI}}^{(${activeJ})}=${latexSum(rhsTermsSymbolic)}`} display />
            <Katex
              math={`\\mathrm{rhs}_{${activeI}}^{(${activeJ})}=${latexSum(rhsTermsNumeric)}=${latexNum(model.rhsByStep[activeJ][activeRow])}`}
              display
            />
            <Katex
              math={`${latexSum(systemTermsSymbolic)}=\\mathrm{rhs}_{${activeI}}^{(${activeJ})}`}
              display
            />
            <Katex
              math={`${latexSum(systemTermsNumeric)}=${latexNum(model.rhsByStep[activeJ][activeRow])}\\quad\\Rightarrow\\quad U_{${activeI},${activeJ + 1}}=${latexNum(model.U[activeJ + 1][activeI])}`}
              display
            />
          </CalculationBox>
        </div>
      </div>

      <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <p className="font-semibold">Crank-Nicolson stability</p>
        <p className="mt-1">
          The Crank-Nicolson method is unconditionally stable in the local Von Neumann sense for{' '}
          <Katex math="r\ge 0,\ \sigma>0,\ h_t>0" />. Accuracy still requires a sufficiently fine grid.
        </p>
      </div>

      <div className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Efficient solve detail</p>
        <p className="mt-1">
          The matrix <Katex math="A_{CN}" /> is factorized once with LU decomposition, then each row solve
          reuses those factors for <Katex math="A_{CN}\mathbf U^{j+1}=\mathrm{rhs}" />.
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
                            ? 'bg-indigo-100 font-semibold text-indigo-900 ring-2 ring-inset ring-indigo-300'
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
          title={surfaceMode === 'U' ? 'Crank-Nicolson U(S,tau) surface' : 'Recovered V(S,t) surface'}
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

      <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">System at the selected time step</p>
        <Katex
          math={`A_{CN}\\mathbf U^{${activeJ + 1}}=B_{CN}\\mathbf U^{${activeJ}}+\\mathbf q_{CN}^{${activeJ},${activeJ + 1}}`}
          display
        />
        <p className="text-center text-sm text-slate-600">
          <Katex math="A_{CN}" /> and <Katex math="B_{CN}" /> are constant; only the state and boundary vector
          change with <Katex math="j" />.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <MatrixTable title="Full A_CN matrix" values={model.A} />
        <MatrixTable title="Full B_CN matrix" values={model.B} />
      </div>

      <div className="rounded-md border border-slate-200 bg-white px-4 py-4">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900">Full vector calculation</p>
          <p className="text-sm text-slate-600">
            The first and last entries of <Katex math={`\\mathbf q_{CN}^{${activeJ},${activeJ + 1}}`} /> contain
            the possible boundary contributions for this step; all interior entries are zero.
          </p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <VectorTable title={<Katex math={`\\mathbf U^{${activeJ}}`} />} values={previousInterior} tone="blue" />
          <span className="shrink-0 text-xl text-slate-400">→</span>
          <VectorTable
            title={<Katex math={`B_{CN}\\mathbf U^{${activeJ}}`} />}
            values={matrixProduct}
            tone="slate"
          />
          <span className="shrink-0 text-xl font-semibold text-slate-500">+</span>
          <VectorTable
            title={<Katex math={`\\mathbf q_{CN}^{${activeJ},${activeJ + 1}}`} />}
            values={model.qByStep[activeJ]}
            tone="amber"
          />
          <span className="shrink-0 text-xl font-semibold text-slate-500">=</span>
          <VectorTable
            title={<Katex math={`\\mathrm{rhs}^{(${activeJ})}`} />}
            values={model.rhsByStep[activeJ]}
            tone="slate"
          />
          <span className="shrink-0 text-xl text-slate-400">→</span>
          <VectorTable
            title={<Katex math={`\\mathbf U^{${activeJ + 1}}`} />}
            values={nextInterior}
            tone="emerald"
          />
        </div>

        <div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
          <Katex
            math={`\\mathbf q_{CN}^{${activeJ},${activeJ + 1}}=\\left(-a_1(U_{0,${activeJ + 1}}+U_{0,${activeJ}}),\\ 0,\\ldots,0,\\ -c_{N_S-1}(U_{N_S,${activeJ + 1}}+U_{N_S,${activeJ}})\\right)^T`}
            display
          />
        </div>
      </div>
    </div>
  )
}
