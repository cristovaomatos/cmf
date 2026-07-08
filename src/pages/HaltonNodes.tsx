import { useMemo, useState } from 'react'
import { MatlabCodePanel } from '../components/Code/MatlabCodePanel'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
import { haltonNodesSnippets } from '../data/matlabSnippets'

const PARK_MILLER_M = 2 ** 31 - 1
const PARK_MILLER_A = 16807
const PARK_MILLER_B = 0
const DEFAULT_NODE_COUNT = 1000
const MAX_NODE_COUNT = 5000
const STEP_COUNT = 12

type HaltonStep = {
  n: number
  base2Digits: number[]
  base3Digits: number[]
  phi2: number
  phi3: number
}

type Point2D = {
  x: number
  y: number
}

function fmt(value: number, digits = 6) {
  return value.toFixed(digits)
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function normaliseSeed(seed: number, M = PARK_MILLER_M) {
  let value = Math.trunc(seed) % M
  if (value <= 0) value += M - 1
  return value
}

function createLcg(seed: number) {
  let state = normaliseSeed(seed)
  return () => {
    state = (PARK_MILLER_A * state + PARK_MILLER_B) % PARK_MILLER_M
    return state / PARK_MILLER_M
  }
}

function digitsInBase(n: number, base: number) {
  const digits: number[] = []
  let value = n

  while (value > 0) {
    digits.unshift(value % base)
    value = Math.floor(value / base)
  }

  return digits.length > 0 ? digits : [0]
}

function radicalInverse(n: number, base: number) {
  let value = n
  let factor = 1 / base
  let result = 0

  while (value > 0) {
    const digit = value % base
    result += digit * factor
    value = Math.floor(value / base)
    factor /= base
  }

  return result
}

function haltonPoint(n: number): Point2D {
  return {
    x: radicalInverse(n, 2),
    y: radicalInverse(n, 3),
  }
}

function haltonSteps(count: number): HaltonStep[] {
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1
    return {
      n,
      base2Digits: digitsInBase(n, 2),
      base3Digits: digitsInBase(n, 3),
      phi2: radicalInverse(n, 2),
      phi3: radicalInverse(n, 3),
    }
  })
}

function haltonNodes(count: number) {
  return Array.from({ length: count }, (_, index) => haltonPoint(index + 1))
}

function uniformNodes(count: number, seed: number) {
  const nextUniform = createLcg(seed)
  return Array.from({ length: count }, () => ({
    x: nextUniform(),
    y: nextUniform(),
  }))
}

function fractionalDigits(digits: number[]) {
  return digits.slice().reverse().join('')
}

function digitReflectionLatex(digits: number[], base: number) {
  return `\\left(${digits.join('')}\\right)_{${base}}\\mapsto\\left(0.${fractionalDigits(digits)}\\right)_{${base}}`
}

function expansionTermsLatex(digits: number[], base: number) {
  const leastSignificantFirst = digits.slice().reverse()
  return leastSignificantFirst
    .map((digit, index) => `\\frac{${digit}}{${base}^{${index + 1}}}`)
    .join(' + ')
}

function HaltonStepsTable({ rows }: { rows: HaltonStep[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-right text-xs text-slate-700">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold text-slate-500">n</th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="n=(d_k\ldots d_0)_2" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="\phi_2(n)" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="n=(d_k\ldots d_0)_3" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="\phi_3(n)" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="H_n" />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.n}>
              <td className="border border-slate-200 px-2 py-1 text-left font-mono">{row.n}</td>
              <td className="border border-slate-200 px-2 py-1">
                <Katex math={`\\left(${row.base2Digits.join('')}\\right)_2`} />
              </td>
              <td className="border border-slate-200 bg-blue-50 px-2 py-1">
                <Katex math={`\\left(0.${fractionalDigits(row.base2Digits)}\\right)_2=${fmt(row.phi2, 4)}`} />
              </td>
              <td className="border border-slate-200 px-2 py-1">
                <Katex math={`\\left(${row.base3Digits.join('')}\\right)_3`} />
              </td>
              <td className="border border-slate-200 bg-blue-50 px-2 py-1">
                <Katex math={`\\left(0.${fractionalDigits(row.base3Digits)}\\right)_3=${fmt(row.phi3, 4)}`} />
              </td>
              <td className="border border-slate-200 bg-emerald-50 px-2 py-1">
                <Katex math={`\\left(${fmt(row.phi2, 4)}, ${fmt(row.phi3, 4)}\\right)`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SingleStepExplanation({ row }: { row: HaltonStep }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <p className="mb-2 text-sm font-semibold text-slate-900">
        Example for <InlineEquation latex={`n=${row.n}`} />
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Base 2 coordinate</p>
          <p className="mt-1 text-sm text-slate-800">
            <Katex math={digitReflectionLatex(row.base2Digits, 2)} />
          </p>
          <p className="mt-1 text-sm text-slate-800">
            <Katex math={`${expansionTermsLatex(row.base2Digits, 2)}=${fmt(row.phi2)}`} />
          </p>
        </div>
        <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Base 3 coordinate</p>
          <p className="mt-1 text-sm text-slate-800">
            <Katex math={digitReflectionLatex(row.base3Digits, 3)} />
          </p>
          <p className="mt-1 text-sm text-slate-800">
            <Katex math={`${expansionTermsLatex(row.base3Digits, 3)}=${fmt(row.phi3)}`} />
          </p>
        </div>
      </div>
    </div>
  )
}

function ScatterPlot({
  points,
  title,
  colorClass,
}: {
  points: Point2D[]
  title: string
  colorClass: string
}) {
  const width = 430
  const height = 430
  const margin = { top: 34, right: 20, bottom: 42, left: 48 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const x = (value: number) => margin.left + value * plotWidth
  const y = (value: number) => margin.top + (1 - value) * plotHeight
  const radius = points.length <= 250 ? 2.6 : points.length <= 1000 ? 1.8 : 1.25
  const gridSize = 4
  const cellCounts = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => 0))
  points.forEach((point) => {
    const column = Math.min(gridSize - 1, Math.floor(point.x * gridSize))
    const rowFromBottom = Math.min(gridSize - 1, Math.floor(point.y * gridSize))
    cellCounts[rowFromBottom][column] += 1
  })
  const cells = cellCounts.flatMap((row, rowFromBottom) =>
    row.map((count, column) => ({
      count,
      column,
      rowFromBottom,
      left: column / gridSize,
      right: (column + 1) / gridSize,
      bottom: rowFromBottom / gridSize,
      top: (rowFromBottom + 1) / gridSize,
    })),
  )

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        <text x={margin.left} y={20} className="fill-slate-900 text-sm font-semibold">
          {title}
        </text>
        <rect
          x={margin.left}
          y={margin.top}
          width={plotWidth}
          height={plotHeight}
          fill="white"
          className="stroke-slate-300"
        />
        {Array.from({ length: gridSize - 1 }, (_, index) => (index + 1) / gridSize).map((tick) => (
          <g key={tick}>
            <line
              x1={x(tick)}
              y1={margin.top}
              x2={x(tick)}
              y2={height - margin.bottom}
              className="stroke-slate-300"
              strokeWidth={1.25}
            />
            <line
              x1={margin.left}
              y1={y(tick)}
              x2={width - margin.right}
              y2={y(tick)}
              className="stroke-slate-300"
              strokeWidth={1.25}
            />
          </g>
        ))}
        {points.map((point, index) => (
          <circle key={index} cx={x(point.x)} cy={y(point.y)} r={radius} className={colorClass} opacity={0.78} />
        ))}
        {cells.map((cell) => {
          const centerX = x((cell.left + cell.right) / 2)
          const centerY = y((cell.bottom + cell.top) / 2)
          return (
            <g key={`label-${cell.column}-${cell.rowFromBottom}`}>
              <rect
                x={centerX - 17}
                y={centerY - 10}
                width={34}
                height={20}
                rx={4}
                className="fill-white stroke-slate-300"
                opacity={0.82}
              />
              <text
                x={centerX}
                y={centerY + 4}
                textAnchor="middle"
                className="fill-slate-900 text-xs font-semibold"
                opacity={0.82}
              >
                {cell.count}
              </text>
            </g>
          )
        })}
        {[0, 0.5, 1].map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={x(tick)} y1={height - margin.bottom} x2={x(tick)} y2={height - margin.bottom + 5} className="stroke-slate-500" />
            <text x={x(tick)} y={height - 18} textAnchor="middle" className="fill-slate-600 text-xs">
              {tick}
            </text>
          </g>
        ))}
        {[0, 0.5, 1].map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={margin.left - 5} y1={y(tick)} x2={margin.left} y2={y(tick)} className="stroke-slate-500" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-slate-600 text-xs">
              {tick}
            </text>
          </g>
        ))}
        <text x={width - margin.right} y={height - 8} textAnchor="end" className="fill-slate-600 text-xs">
          x
        </text>
        <text x={12} y={margin.top + 8} className="fill-slate-600 text-xs">
          y
        </text>
      </svg>
    </figure>
  )
}

function QuadrantCounts({ uniformPoints, haltonPoints }: { uniformPoints: Point2D[]; haltonPoints: Point2D[] }) {
  const counts = (points: Point2D[]) => {
    const result = [0, 0, 0, 0]
    points.forEach((point) => {
      const right = point.x >= 0.5 ? 1 : 0
      const top = point.y >= 0.5 ? 2 : 0
      result[right + top] += 1
    })
    return result
  }
  const uniform = counts(uniformPoints)
  const halton = counts(haltonPoints)
  const labels = ['x<0.5, y<0.5', 'x>=0.5, y<0.5', 'x<0.5, y>=0.5', 'x>=0.5, y>=0.5']
  const expected = uniformPoints.length / 4

  return (
    <div className="overflow-x-auto">
      <table className="text-right text-sm text-slate-700">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">region</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">expected</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">uniform</th>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">Halton</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((label, index) => (
            <tr key={label}>
              <td className="border border-slate-200 px-3 py-2 text-left">{label}</td>
              <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(expected, 1)}</td>
              <td className="border border-slate-200 px-3 py-2 font-mono">{formatInteger(uniform[index])}</td>
              <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">{formatInteger(halton[index])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function HaltonNodes() {
  const [nodeCount, setNodeCount] = useState(DEFAULT_NODE_COUNT)
  const [seed, setSeed] = useState(123)

  const safeNodeCount = Math.min(MAX_NODE_COUNT, Math.max(10, Math.trunc(nodeCount || 10)))
  const steps = useMemo(() => haltonSteps(STEP_COUNT), [])
  const uniform = useMemo(() => uniformNodes(safeNodeCount, seed), [safeNodeCount, seed])
  const halton = useMemo(() => haltonNodes(safeNodeCount), [safeNodeCount])

  return (
    <PageLayout
      title="Halton Nodes"
      rightPanel={{
        known: 'Integer index n and prime bases p_1, ..., p_m.',
        unknown: 'A deterministic low-discrepancy point H_n in the unit cube.',
        method: 'Write n in each prime base and reflect the digits around the decimal point.',
        takeaway:
          'Halton nodes are deterministic quasi-random points designed to cover low-dimensional regions more evenly than pseudo-random sampling.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Context</h2>
        <p className="text-slate-700">
          Monte Carlo methods use pseudo-random samples. Quasi-Monte Carlo methods replace them by
          deterministic low-discrepancy points, whose purpose is to cover the integration region more evenly.
          Halton nodes are one of the standard constructions for this idea.
        </p>
        <p className="text-slate-700">
          In two dimensions, we work on the unit square <InlineEquation latex="[0,1]\times[0,1]" /> and use the
          first two prime bases, <InlineEquation latex="2" /> and <InlineEquation latex="3" />.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Theory</h2>
        <p className="text-slate-700">
          Let <InlineEquation latex="n" /> be written in base <InlineEquation latex="b" /> as
        </p>
        <EquationBlock latex="n=(d_kd_{k-1}\cdots d_1d_0)_b=d_kb^k+d_{k-1}b^{k-1}+\cdots+d_1b+d_0." />
        <p className="text-slate-700">
          The radical inverse function reflects these digits after the decimal point:
        </p>
        <EquationBlock latex="\phi_b(n)=\sum_{j=0}^{k} d_j b^{-j-1}=\frac{d_0}{b}+\frac{d_1}{b^2}+\cdots+\frac{d_k}{b^{k+1}}." />
        <p className="text-slate-700">
          With prime bases <InlineEquation latex="p_1,\ldots,p_m" />, the Halton point in dimension
          <InlineEquation latex="m" /> is
        </p>
        <EquationBlock latex="H_n=(\phi_{p_1}(n),\phi_{p_2}(n),\ldots,\phi_{p_m}(n)),\qquad n=1,2,\ldots." />
        <p className="text-slate-700">
          In dimension two we therefore use
          <InlineEquation latex="H_n=(\phi_2(n),\phi_3(n))" />. For low-discrepancy sequences, the discrepancy
          has the characteristic order
        </p>
        <EquationBlock latex="D_N=O\left(\frac{(\log N)^m}{N}\right)." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Digit reflection</p>
            <EquationBlock latex="(d_k\cdots d_1d_0)_b\quad\longmapsto\quad 0.d_0d_1\cdots d_k\; \text{in base } b." />
            <p className="text-sm text-slate-700">
              The least significant digit becomes the first digit after the decimal point. This is what pushes
              consecutive integers into different parts of the interval.
            </p>
          </div>
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Pseudo-code</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              <li>Choose the dimension <InlineEquation latex="m" /> and the first <InlineEquation latex="m" /> prime bases.</li>
              <li>For each index <InlineEquation latex="n=1,\ldots,N" />, write <InlineEquation latex="n" /> in each base.</li>
              <li>Compute each coordinate with the radical inverse function <InlineEquation latex="\phi_b(n)" />.</li>
              <li>Return <InlineEquation latex="H_n=(\phi_{p_1}(n),\ldots,\phi_{p_m}(n))" />.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation 1: Step-by-Step Calculation</h2>
        <p className="text-slate-700">
          The table shows the first Halton nodes in dimension two. Each coordinate is obtained by writing the
          same index <InlineEquation latex="n" /> in a different prime base and reflecting the digits.
        </p>
        <SingleStepExplanation row={steps[4]} />
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-slate-900">First Halton nodes</p>
          <HaltonStepsTable rows={steps} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation 2: Uniform vs Halton Nodes</h2>
        <p className="text-slate-700">
          The pseudo-random plot uses the same LCG source as the previous pages, consuming consecutive
          uniform values in pairs to form the two coordinates. The Halton plot is deterministic and uses
          <InlineEquation latex="H_n=(\phi_2(n),\phi_3(n))" />.
        </p>
        <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
          <label>
            <span className="mb-1 flex items-center justify-between gap-3 font-medium">
              <span>number of nodes</span>
              <span className="font-mono text-slate-900">{formatInteger(safeNodeCount)}</span>
            </span>
            <input
              type="range"
              min={10}
              max={MAX_NODE_COUNT}
              step={10}
              value={safeNodeCount}
              onChange={(event) => setNodeCount(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
            />
          </label>
          <label>
            <span className="mb-1 block font-medium">uniform seed</span>
            <input
              type="number"
              step={1}
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
            />
          </label>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <ScatterPlot points={uniform} title={`Uniform random nodes, N = ${formatInteger(safeNodeCount)}`} colorClass="fill-blue-500" />
          <ScatterPlot points={halton} title={`Halton nodes, N = ${formatInteger(safeNodeCount)}`} colorClass="fill-emerald-600" />
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-slate-900">Quadrant coverage check</p>
          <QuadrantCounts uniformPoints={uniform} haltonPoints={halton} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">MATLAB Implementation Example</h2>
        <p className="text-slate-700">
          The implementation builds the two-dimensional Halton sequence by applying radical inverse
          functions in bases <InlineEquation latex="2" /> and <InlineEquation latex="3" />.
        </p>
        <MatlabCodePanel file="halton_nodes.m" snippets={haltonNodesSnippets} />
      </section>
    </PageLayout>
  )
}
