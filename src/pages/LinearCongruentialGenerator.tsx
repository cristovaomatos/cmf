import { useMemo, useState } from 'react'
import { MatlabCodePanel } from '../components/Code/MatlabCodePanel'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
import { lcgSnippets, randu01Snippets } from '../data/matlabSnippets'
import { lcg, matlabModulo, PARK_MILLER_A, PARK_MILLER_B, PARK_MILLER_M } from '../utils/lcg'

const DEFAULT_SAMPLE_SIZES = [1000, 10000, 100000]
const STEP_COUNT = 8
const MAX_SAMPLE_SIZE = 1000000

function fmt(value: number, digits = 6) {
  return value.toFixed(digits)
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function lcgSteps(count: number, seed: number, A = PARK_MILLER_A, B = PARK_MILLER_B, M = PARK_MILLER_M) {
  const rows: Array<{ i: number; previous: number; raw: number; residue: number; x: number }> = []
  let previous = seed

  for (let i = 1; i <= count; i += 1) {
    const raw = A * previous + B
    const residue = matlabModulo(raw, M)
    rows.push({ i, previous, raw, residue, x: residue / M })
    previous = residue
  }

  return rows
}

function sampleMean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function sampleVariance(values: number[], mean = sampleMean(values)) {
  if (values.length < 2) return 0
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
}

function histogram(values: number[], binCount = 10) {
  const counts = Array.from({ length: binCount }, () => 0)
  values.forEach((value) => {
    const index = Math.min(binCount - 1, Math.floor(value * binCount))
    counts[index] += 1
  })
  const binWidth = 1 / binCount
  return counts.map((count, index) => ({
    left: index * binWidth,
    right: (index + 1) * binWidth,
    density: count / (values.length * binWidth),
  }))
}

function UniformHistogram({ values, title }: { values: number[]; title: string }) {
  const bins = histogram(values)
  const width = 430
  const height = 260
  const margin = { top: 30, right: 18, bottom: 42, left: 48 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const yMax = Math.max(1.25, ...bins.map((bin) => bin.density)) * 1.08
  const x = (value: number) => margin.left + value * plotWidth
  const y = (value: number) => margin.top + (1 - value / yMax) * plotHeight

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        <text x={margin.left} y={18} className="fill-slate-900 text-sm font-semibold">
          {title}
        </text>
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-700" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-700" />
        {bins.map((bin) => {
          const barX = x(bin.left) + 2
          const barY = y(bin.density)
          const barWidth = x(bin.right) - x(bin.left) - 4
          return (
            <rect
              key={bin.left}
              x={barX}
              y={barY}
              width={barWidth}
              height={height - margin.bottom - barY}
              className="fill-blue-100 stroke-blue-300"
            />
          )
        })}
        <line
          x1={margin.left}
          y1={y(1)}
          x2={width - margin.right}
          y2={y(1)}
          className="stroke-emerald-600"
          strokeWidth={2}
        />
        <text x={width - margin.right} y={y(1) - 6} textAnchor="end" className="fill-emerald-700 text-xs">
          theoretical density = 1
        </text>
        {[0, 0.5, 1].map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} y1={height - margin.bottom} x2={x(tick)} y2={height - margin.bottom + 5} className="stroke-slate-500" />
            <text x={x(tick)} y={height - 18} textAnchor="middle" className="fill-slate-600 text-xs">
              {tick}
            </text>
          </g>
        ))}
        {[0, 1].map((tick) => (
          <g key={tick}>
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
          density
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-slate-600">
        The interval <InlineEquation latex="[0,1]" /> is divided into 10 equal bins and the bars are normalised as a density.
      </figcaption>
    </figure>
  )
}

function SequencePreview({ values }: { values: number[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-right text-xs text-slate-700">
        <thead>
          <tr>
            {values.map((_, index) => (
              <th key={index} className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
                <Katex math={`x_{${index + 1}}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {values.map((value, index) => (
              <td key={index} className="border border-slate-200 bg-white px-2 py-1 font-mono">
                {fmt(value, 4)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function CalculationStepsTable({ rows }: { rows: Array<{ i: number; previous: number; raw: number; residue: number; x: number }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-right text-xs text-slate-700">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold text-slate-500">i</th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="m_{i-1}" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="a m_{i-1}+b" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="m_i" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="x_i=m_i/M" />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.i}>
              <td className="border border-slate-200 px-2 py-1 text-left font-mono">{row.i}</td>
              <td className="border border-slate-200 px-2 py-1 font-mono">{formatInteger(row.previous)}</td>
              <td className="border border-slate-200 px-2 py-1 font-mono">{formatInteger(row.raw)}</td>
              <td className="border border-slate-200 bg-blue-50 px-2 py-1 font-mono">{formatInteger(row.residue)}</td>
              <td className="border border-slate-200 bg-emerald-50 px-2 py-1 font-mono">{fmt(row.x, 6)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SampleSizeInput({
  index,
  value,
  onChange,
}: {
  index: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        <Katex math={`N_${index + 1}`} /> sample size
      </span>
      <input
        type="number"
        min={10}
        max={MAX_SAMPLE_SIZE}
        step={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
      />
    </label>
  )
}

export default function LinearCongruentialGenerator() {
  const [seed, setSeed] = useState(123)
  const [sampleSizes, setSampleSizes] = useState(DEFAULT_SAMPLE_SIZES)

  const safeSampleSizes = sampleSizes.map((N) => Math.min(MAX_SAMPLE_SIZE, Math.max(10, Math.trunc(N || 10))))
  const maxN = Math.max(...safeSampleSizes)
  const samples = useMemo(() => lcg(maxN, seed), [maxN, seed])
  const stepRows = useMemo(() => lcgSteps(STEP_COUNT, seed), [seed])
  const tableRows = useMemo(
    () =>
      safeSampleSizes.map((N) => {
        const values = samples.slice(0, N)
        const mean = sampleMean(values)
        const variance = sampleVariance(values, mean)
        return {
          N,
          mean,
          variance,
          meanError: Math.abs(mean - 0.5),
          varianceError: Math.abs(variance - 1 / 12),
        }
      }),
    [safeSampleSizes, samples],
  )
  const stepValues = stepRows.map((row) => row.x)

  return (
    <PageLayout
      title="Linear Congruential Generator"
      rightPanel={{
        known: 'Seed and integer parameters M, a, b.',
        unknown: 'A reproducible sequence x_i in [0,1] that mimics U([0,1]).',
        method: 'Iterate a modular recurrence and normalise the residues by M.',
        takeaway:
          'The LCG is deterministic and periodic, but with good parameters its output behaves like uniform pseudo-random samples for practical simulations.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Context</h2>
        <p className="text-slate-700">
          Probabilistic methods in finance rely on simulated random variables. Since computers generate
          deterministic sequences, we use pseudo-random numbers: deterministic outputs that are designed to
          mimic the statistical behaviour of independent samples.
        </p>
        <p className="text-slate-700">
          The first target distribution is the uniform distribution on <InlineEquation latex="[0,1]" />.
          If <InlineEquation latex="X\sim U([0,1])" />, then its density is
          <InlineEquation latex="f(x)=1" /> for <InlineEquation latex="0\leq x\leq1" />, with
        </p>
        <EquationBlock latex="\mathbb E[X]=\frac12,\qquad \operatorname{Var}(X)=\frac{1}{12}\approx0.083333." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Theory</h2>
        <p className="text-slate-700">
          The linear congruential generator starts from a seed and produces integer residues modulo
          <InlineEquation latex="M" />. Given integers <InlineEquation latex="M" />,
          <InlineEquation latex="a" /> and <InlineEquation latex="b" />, choose an initial integer called the
          seed. In the step-by-step simulation below we write the seed as <InlineEquation latex="m_0" /> and define
        </p>
        <EquationBlock latex="m_i=(a m_{i-1}+b)\operatorname{mod} M,\qquad i=1,2,\ldots" />
        <p className="text-slate-700">
          The simulated uniform values are obtained by normalising the residues:
        </p>
        <EquationBlock latex="x_i=\frac{m_i}{M},\qquad i=1,2,\ldots" />
        <p className="text-slate-700">
          Since each <InlineEquation latex="m_i" /> belongs to the finite set
          <InlineEquation latex="\{0,1,\ldots,M-1\}" />, the sequence is periodic. A useful generator should
          have a long period and empirical moments close to those of <InlineEquation latex="U([0,1])" />.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Park-Miller parameters</p>
            <EquationBlock latex="M=2^{31}-1,\qquad a=16807,\qquad b=0." />
            <p className="text-sm text-slate-700">
              With a non-zero seed, this multiplicative generator has a long period and is a standard
              reproducible baseline for simple simulations.
            </p>
          </div>
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Pseudo-code</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              <li>Choose the seed <InlineEquation latex="m_0" />.</li>
              <li>For each step, compute <InlineEquation latex="m_i=(a m_{i-1}+b)\bmod M" />.</li>
              <li>Return <InlineEquation latex="x_i=m_i/M" />.</li>
              <li>Use the values <InlineEquation latex="x_i" /> as samples from <InlineEquation latex="U([0,1])" />.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation 1: Step-by-Step Calculation</h2>
        <p className="text-slate-700">
          This small simulation shows how the deterministic recurrence creates the first residues and
          normalised values. The seed is entered freely; internally it is converted to an admissible
          residue modulo <InlineEquation latex="M" />.
        </p>
        <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <label>
            <span className="mb-1 block font-medium">
              seed
            </span>
            <input
              type="number"
              step={1}
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
            />
          </label>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Normalised seed used in the recurrence</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{formatInteger(seed)}</p>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-slate-900">First calculation steps</p>
          <CalculationStepsTable rows={stepRows} />
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-slate-900">Generated values from these steps</p>
          <SequencePreview values={stepValues} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation 2: Moment and Histogram Comparison</h2>
        <p className="text-slate-700">
          Choose three sample sizes and compare the empirical distribution with
          <InlineEquation latex="U([0,1])" />. The sample mean <InlineEquation latex="\hat\mu" /> and sample variance
          <InlineEquation latex="\hat s^2" /> should approach the theoretical values
          <InlineEquation latex="1/2" /> and <InlineEquation latex="1/12" /> as
          <InlineEquation latex="N" /> increases.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {safeSampleSizes.map((N, index) => (
            <SampleSizeInput
              key={index}
              index={index}
              value={N}
              onChange={(value) =>
                setSampleSizes((current) => current.map((currentValue, i) => (i === index ? value : currentValue)))
              }
            />
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="text-right text-sm text-slate-700">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">N</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">mean</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">|mean - 0.5|</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">variance</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">|variance - 1/12|</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.N}>
                  <td className="border border-slate-200 px-3 py-2 text-left font-mono">{formatInteger(row.N)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.mean)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.meanError)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.variance)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.varianceError)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 text-left">Theory</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">0.500000</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">0</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">0.083333</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Histograms</h2>
        <p className="text-slate-700">
          The histograms are normalised as densities. For <InlineEquation latex="U([0,1])" />, the target
          density is the horizontal line <InlineEquation latex="f(x)=1" />.
        </p>
        <div className="grid gap-4 xl:grid-cols-3">
          {safeSampleSizes.map((N, index) => (
            <UniformHistogram key={`${index}-${N}`} values={samples.slice(0, N)} title={`N = ${formatInteger(N)}`} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">MATLAB Implementation Example</h2>
        <p className="text-slate-700">
          The generator first creates values in <InlineEquation latex="U([0,1])" /> and then rescales them
          to <InlineEquation latex="U([a,b])" /> when a different interval is requested.
        </p>
        <MatlabCodePanel file="lcg.m" snippets={lcgSnippets} />
        <MatlabCodePanel file="randu01.m" snippets={randu01Snippets} />
      </section>
    </PageLayout>
  )
}
