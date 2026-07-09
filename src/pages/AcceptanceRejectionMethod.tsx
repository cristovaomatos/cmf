import { useMemo, useState } from 'react'
import { MatlabCodePanel } from '../components/Code/MatlabCodePanel'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
import { randnArSnippets } from '../data/matlabSnippets'
import { lcg } from '../utils/lcg'

const ENVELOPE_M = Math.sqrt((2 * Math.PI) / Math.E)
const THEORETICAL_ACCEPTANCE = 1 / ENVELOPE_M
const DEFAULT_SAMPLE_SIZES = [500, 5000, 50000]
const MAX_SAMPLE_SIZE = 500000
const STEP_COUNT = 12
const HISTOGRAM_MIN = -5
const HISTOGRAM_MAX = 5

type ProposalStep = {
  attempt: number
  u0: number
  u1: number
  y: number
  targetDensity: number
  envelopeDensity: number
  acceptanceRatio: number
  accepted: boolean
  acceptedIndex: number | null
}

function fmt(value: number, digits = 6) {
  if (!Number.isFinite(value)) return '-'
  return value.toFixed(digits)
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function normalDensity(x: number) {
  return Math.exp(-(x ** 2) / 2) / Math.sqrt(2 * Math.PI)
}

function cauchyDensity(x: number) {
  return 1 / (Math.PI * (1 + x ** 2))
}

function envelopeDensity(x: number) {
  return ENVELOPE_M * cauchyDensity(x)
}

function acceptanceRatio(x: number) {
  return normalDensity(x) / envelopeDensity(x)
}

function cauchyCandidate(u0: number) {
  return Math.tan(Math.PI * u0 - Math.PI / 2)
}

function proposalSteps(count: number, seed: number): ProposalStep[] {
  const u0Values = lcg(count, seed)
  const u1Values = lcg(count, seed + 1)
  const rows: ProposalStep[] = []
  let acceptedCount = 0

  for (let attempt = 1; attempt <= count; attempt += 1) {
    const u0 = u0Values[attempt - 1]
    const u1 = u1Values[attempt - 1]
    const y = cauchyCandidate(u0)
    const targetDensity = normalDensity(y)
    const proposalEnvelope = envelopeDensity(y)
    const ratio = targetDensity / proposalEnvelope
    const accepted = u1 <= ratio
    if (accepted) acceptedCount += 1
    rows.push({
      attempt,
      u0,
      u1,
      y,
      targetDensity,
      envelopeDensity: proposalEnvelope,
      acceptanceRatio: ratio,
      accepted,
      acceptedIndex: accepted ? acceptedCount : null,
    })
  }

  return rows
}

function normalSamplesByAcceptanceRejection(targetCount: number, seed: number) {
  const samples: number[] = []
  let proposals = 0
  let acceptedProposals = 0
  let batch = 0

  while (samples.length < targetCount) {
    const batchSize = Math.ceil(1.8 * (targetCount - samples.length))
    const u0Values = lcg(batchSize, seed + 2 * batch)
    const u1Values = lcg(batchSize, seed + 2 * batch + 1)
    const acceptedBatch: number[] = []
    proposals += batchSize

    for (let index = 0; index < batchSize; index += 1) {
      const y = cauchyCandidate(u0Values[index])
      if (u1Values[index] <= acceptanceRatio(y)) {
        acceptedBatch.push(y)
      }
    }

    acceptedProposals += acceptedBatch.length
    const remaining = targetCount - samples.length
    const valuesToKeep = Math.min(acceptedBatch.length, remaining)
    for (let index = 0; index < valuesToKeep; index += 1) {
      samples.push(acceptedBatch[index])
    }
    batch += 1
  }

  return { samples, proposals, acceptedProposals }
}

function sampleMean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function sampleVariance(values: number[], mean = sampleMean(values)) {
  if (values.length < 2) return 0
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
}

function normalHistogram(values: number[], binCount = 80) {
  const counts = Array.from({ length: binCount }, () => 0)
  const width = HISTOGRAM_MAX - HISTOGRAM_MIN
  const binWidth = width / binCount

  values.forEach((value) => {
    if (value < HISTOGRAM_MIN || value > HISTOGRAM_MAX) return
    const index = Math.min(binCount - 1, Math.floor((value - HISTOGRAM_MIN) / binWidth))
    counts[index] += 1
  })

  return counts.map((count, index) => ({
    left: HISTOGRAM_MIN + index * binWidth,
    right: HISTOGRAM_MIN + (index + 1) * binWidth,
    density: count / (values.length * binWidth),
  }))
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
        <Katex math={`N_${index + 1}`} /> accepted values
      </span>
      <input
        type="number"
        min={50}
        max={MAX_SAMPLE_SIZE}
        step={50}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
      />
    </label>
  )
}

function ProposalStepsTable({ rows }: { rows: ProposalStep[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-right text-xs text-slate-700">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold text-slate-500">attempt</th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="u_0" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="u_1" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="y=\tan(\pi u_0-\pi/2)" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="f(y)" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="M g(y)" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
              <Katex math="f(y)/(M g(y))" />
            </th>
            <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold text-slate-500">decision</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.attempt}>
              <td className="border border-slate-200 px-2 py-1 text-left font-mono">{row.attempt}</td>
              <td className="border border-slate-200 px-2 py-1 font-mono">{fmt(row.u0, 6)}</td>
              <td className="border border-slate-200 px-2 py-1 font-mono">{fmt(row.u1, 6)}</td>
              <td className="border border-slate-200 px-2 py-1 font-mono">{fmt(row.y, 4)}</td>
              <td className="border border-slate-200 px-2 py-1 font-mono">{fmt(row.targetDensity, 5)}</td>
              <td className="border border-slate-200 px-2 py-1 font-mono">{fmt(row.envelopeDensity, 5)}</td>
              <td className="border border-slate-200 px-2 py-1 font-mono">{fmt(row.acceptanceRatio, 5)}</td>
              <td
                className={`border border-slate-200 px-2 py-1 text-left font-semibold ${
                  row.accepted ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {row.accepted ? `accept z_${row.acceptedIndex}` : 'reject'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AcceptedValuesPreview({ rows }: { rows: ProposalStep[] }) {
  const accepted = rows.filter((row) => row.accepted)

  return (
    <div className="overflow-x-auto">
      <table className="text-right text-xs text-slate-700">
        <thead>
          <tr>
            {accepted.map((row) => (
              <th key={row.attempt} className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-500">
                <Katex math={`z_{${row.acceptedIndex}}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {accepted.map((row) => (
              <td key={row.attempt} className="border border-slate-200 bg-emerald-50 px-2 py-1 font-mono">
                {fmt(row.y, 4)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {accepted.length === 0 && <p className="text-sm text-slate-600">No accepted values in these first proposals.</p>}
    </div>
  )
}

function EnvelopePlot({ rows }: { rows: ProposalStep[] }) {
  const [activeAttempt, setActiveAttempt] = useState<number | null>(null)
  const width = 680
  const height = 320
  const margin = { top: 24, right: 24, bottom: 42, left: 48 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const xMin = -5
  const xMax = 5
  const visibleRows = rows.filter((row) => row.y >= xMin && row.y <= xMax)
  const omittedCount = rows.length - visibleRows.length
  const yMax = 0.55
  const x = (value: number) => margin.left + ((value - xMin) / (xMax - xMin)) * plotWidth
  const y = (value: number) => margin.top + (1 - value / yMax) * plotHeight
  const curvePoints = Array.from({ length: 201 }, (_, index) => xMin + (index / 200) * (xMax - xMin))
  const path = (fn: (value: number) => number) =>
    curvePoints.map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(value)} ${y(fn(value))}`).join(' ')
  const xTicks = [-4, -2, 0, 2, 4]
  const activeRow = visibleRows.find((row) => row.attempt === activeAttempt) ?? null
  const activePointHeight = activeRow ? activeRow.u1 * activeRow.envelopeDensity : 0
  const tooltipWidth = 212
  const tooltipHeight = 116
  const tooltipX = activeRow
    ? Math.min(width - margin.right - tooltipWidth, Math.max(margin.left, x(activeRow.y) - tooltipWidth / 2))
    : 0
  const tooltipY = activeRow
    ? y(activePointHeight) - tooltipHeight - 10 >= margin.top
      ? y(activePointHeight) - tooltipHeight - 10
      : y(activePointHeight) + 10
    : 0

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Acceptance-rejection envelope">
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-700" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-700" />
        {xTicks.map((tick, index) => (
          <g key={index}>
            <line x1={x(tick)} y1={height - margin.bottom} x2={x(tick)} y2={height - margin.bottom + 5} className="stroke-slate-500" />
            <text x={x(tick)} y={height - 18} textAnchor="middle" className="fill-slate-600 text-xs">
              {Math.abs(tick) >= 10 ? tick.toFixed(0) : tick.toFixed(1)}
            </text>
          </g>
        ))}
        {[0, 0.2, 0.4].map((tick) => (
          <g key={tick}>
            <line x1={margin.left - 5} y1={y(tick)} x2={margin.left} y2={y(tick)} className="stroke-slate-500" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-slate-600 text-xs">
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        <path d={path(envelopeDensity)} fill="none" className="stroke-blue-600" strokeWidth={2.5} />
        <path d={path(normalDensity)} fill="none" className="stroke-rose-600" strokeWidth={2.5} />
        {visibleRows.map((row) => {
          const pointHeight = row.u1 * row.envelopeDensity
          const isActive = activeAttempt === row.attempt
          const pointLabel = [
            `Attempt ${row.attempt}`,
            `y = ${fmt(row.y, 6)}`,
            `u1 = ${fmt(row.u1, 6)}`,
            `u1 M g(y) = ${fmt(pointHeight, 6)}`,
            `f(y) = ${fmt(row.targetDensity, 6)}`,
            row.accepted ? `accepted as z_${row.acceptedIndex}` : 'rejected',
          ].join(', ')

          return (
            <g key={row.attempt}>
              <circle
                cx={x(row.y)}
                cy={y(pointHeight)}
                r={isActive ? 7 : 5}
                className={row.accepted ? 'fill-emerald-500 stroke-emerald-700' : 'fill-slate-300 stroke-slate-500'}
                strokeWidth={isActive ? 2.5 : 1.5}
                tabIndex={0}
                role="img"
                aria-label={pointLabel}
                onMouseEnter={() => setActiveAttempt(row.attempt)}
                onMouseLeave={() => setActiveAttempt(null)}
                onFocus={() => setActiveAttempt(row.attempt)}
                onBlur={() => setActiveAttempt(null)}
              />
              <title>{pointLabel}</title>
            </g>
          )
        })}
        {activeRow && (
          <g className="pointer-events-none">
            <rect
              x={tooltipX}
              y={tooltipY}
              width={tooltipWidth}
              height={tooltipHeight}
              rx={4}
              className="fill-slate-900/95 stroke-white"
            />
            <text x={tooltipX + 10} y={tooltipY + 18} className="fill-white text-xs font-semibold">
              Attempt {activeRow.attempt}: {activeRow.accepted ? `accept z_${activeRow.acceptedIndex}` : 'reject'}
            </text>
            <text x={tooltipX + 10} y={tooltipY + 38} className="fill-slate-100 text-xs">
              y = {fmt(activeRow.y, 6)}
            </text>
            <text x={tooltipX + 10} y={tooltipY + 56} className="fill-slate-100 text-xs">
              u₁ = {fmt(activeRow.u1, 6)}
            </text>
            <text x={tooltipX + 10} y={tooltipY + 74} className="fill-slate-100 text-xs">
              u₁ M g(y) = {fmt(activePointHeight, 6)}
            </text>
            <text x={tooltipX + 10} y={tooltipY + 92} className="fill-slate-100 text-xs">
              f(y) = {fmt(activeRow.targetDensity, 6)}
            </text>
            <text x={tooltipX + 10} y={tooltipY + 108} className="fill-slate-300 text-[10px]">
              p(y) = {fmt(activeRow.acceptanceRatio, 6)}
            </text>
          </g>
        )}
        <text x={width - margin.right} y={margin.top + 16} textAnchor="end" className="fill-blue-700 text-xs font-semibold">
          M g(y)
        </text>
        <text x={width - margin.right} y={margin.top + 40} textAnchor="end" className="fill-rose-700 text-xs font-semibold">
          f(y)
        </text>
        <text x={width - margin.right} y={height - 8} textAnchor="end" className="fill-slate-600 text-xs">
          y
        </text>
        <text x={12} y={margin.top + 8} className="fill-slate-600 text-xs">
          density
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-slate-600">
        The plot shows the proposals from the table that lie in the central window
        <InlineEquation latex="-5\leq y\leq5" />. Green points are accepted because they fall below the target
        density; grey points are rejected. Hover over or focus a point to inspect its result.
        {omittedCount > 0 &&
          ` ${omittedCount} extreme ${omittedCount === 1 ? 'proposal is' : 'proposals are'} omitted from the plot but retained in the table.`}
      </figcaption>
    </figure>
  )
}

function NormalHistogram({ values, title }: { values: number[]; title: string }) {
  const bins = normalHistogram(values)
  const width = 430
  const height = 280
  const margin = { top: 30, right: 18, bottom: 42, left: 48 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const yMax = Math.max(0.45, ...bins.map((bin) => bin.density)) * 1.08
  const x = (value: number) => margin.left + ((value - HISTOGRAM_MIN) / (HISTOGRAM_MAX - HISTOGRAM_MIN)) * plotWidth
  const y = (value: number) => margin.top + (1 - value / yMax) * plotHeight
  const curvePoints = Array.from({ length: 181 }, (_, index) => HISTOGRAM_MIN + (index / 180) * (HISTOGRAM_MAX - HISTOGRAM_MIN))
  const normalPath = curvePoints
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(value)} ${y(normalDensity(value))}`)
    .join(' ')

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-3 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        <text x={margin.left} y={18} className="fill-slate-900 text-sm font-semibold">
          {title}
        </text>
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-700" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-700" />
        {bins.map((bin) => {
          const barX = x(bin.left) + 1
          const barY = y(bin.density)
          const barWidth = x(bin.right) - x(bin.left) - 2
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
        <path d={normalPath} fill="none" className="stroke-rose-600" strokeWidth={2.4} />
        {[-4, -2, 0, 2, 4].map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} y1={height - margin.bottom} x2={x(tick)} y2={height - margin.bottom + 5} className="stroke-slate-500" />
            <text x={x(tick)} y={height - 18} textAnchor="middle" className="fill-slate-600 text-xs">
              {tick}
            </text>
          </g>
        ))}
        {[0, 0.2, 0.4].map((tick) => (
          <g key={tick}>
            <line x1={margin.left - 5} y1={y(tick)} x2={margin.left} y2={y(tick)} className="stroke-slate-500" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-slate-600 text-xs">
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        <text x={width - margin.right} y={height - 8} textAnchor="end" className="fill-slate-600 text-xs">
          z
        </text>
        <text x={12} y={margin.top + 8} className="fill-slate-600 text-xs">
          density
        </text>
      </svg>
      <figcaption className="mt-2 text-xs text-slate-600">
        Histogram density compared with the standard normal density.
      </figcaption>
    </figure>
  )
}

export default function AcceptanceRejectionMethod() {
  const [seed, setSeed] = useState(123)
  const [sampleSizes, setSampleSizes] = useState(DEFAULT_SAMPLE_SIZES)

  const safeSampleSizes = sampleSizes.map((N) => Math.min(MAX_SAMPLE_SIZE, Math.max(50, Math.trunc(N || 50))))
  const sampleSizeKey = safeSampleSizes.join(',')
  const stepRows = useMemo(() => proposalSteps(STEP_COUNT, seed), [seed])
  const simulations = useMemo(
    () => safeSampleSizes.map((N) => normalSamplesByAcceptanceRejection(N, seed)),
    [sampleSizeKey, seed],
  )
  const tableRows = useMemo(
    () =>
      safeSampleSizes.map((N, index) => {
        const generated = simulations[index]
        const values = generated.samples
        const mean = sampleMean(values)
        const variance = sampleVariance(values, mean)
        return {
          N,
          mean,
          variance,
          meanError: Math.abs(mean),
          varianceError: Math.abs(variance - 1),
          proposals: generated.proposals,
          acceptedProposals: generated.acceptedProposals,
          acceptanceRate: generated.acceptedProposals / generated.proposals,
        }
      }),
    [sampleSizeKey, simulations],
  )

  return (
    <PageLayout
      title="Acceptance-Rejection Method"
      rightPanel={{
        known: 'Uniform pseudo-random numbers and an easy proposal density g.',
        unknown: 'Accepted values distributed as the target density f.',
        method: 'Simulate a proposal value and keep it only when an auxiliary uniform point falls below the target density.',
        takeaway:
          'For N(0,1), a Cauchy proposal gives a simple acceptance test and a theoretical acceptance probability close to 0.6577.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Context</h2>
        <p className="text-slate-700">
          The acceptance-rejection method is used when direct inversion of the distribution function is
          inconvenient. Instead of transforming one uniform variable directly into the target distribution, we
          sample candidates from a proposal distribution and accept only the candidates that pass a density test.
        </p>
        <p className="text-slate-700">
          Here the target distribution is the standard normal distribution:
        </p>
        <EquationBlock latex="Z\sim N(0,1),\qquad f(z)=\frac{1}{\sqrt{2\pi}}\exp\left(-\frac{z^2}{2}\right)." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Theory</h2>
        <p className="text-slate-700">
          Choose a proposal density <InlineEquation latex="g" /> that is easy to simulate and a constant
          <InlineEquation latex="M" /> such that <InlineEquation latex="f(y)\leq M g(y)" /> for every
          <InlineEquation latex="y" />. The accepted candidates then have density <InlineEquation latex="f" />.
        </p>
        <p className="text-slate-700">
          For the normal target we use the Cauchy proposal
        </p>
        <EquationBlock latex="g(y)=\frac{1}{\pi(1+y^2)},\qquad Y=\tan\left(\pi u_0-\frac{\pi}{2}\right),\quad u_0\sim U([0,1])." />
        <p className="text-slate-700">
          The ratio <InlineEquation latex="f(y)/g(y)" /> is maximised at <InlineEquation latex="y=\pm1" />, hence
        </p>
        <EquationBlock latex="M=\sqrt{\frac{2\pi}{e}},\qquad \mathbb P(\mathrm{accept})=\frac{1}{M}=\sqrt{\frac{e}{2\pi}}\approx0.657745." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Acceptance test</p>
            <EquationBlock latex="u_1 M g(y)\leq f(y)" />
            <p className="text-sm text-slate-700">
              Equivalently, accept if <InlineEquation latex="u_1\leq f(y)/(M g(y))" />. The auxiliary
              variable <InlineEquation latex="u_1" /> is independent of the uniform variable used to generate
              the Cauchy candidate.
            </p>
          </div>
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Pseudo-code</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              <li>Generate independent <InlineEquation latex="u_0,u_1\sim U([0,1])" />.</li>
              <li>Set <InlineEquation latex="y=\tan(\pi u_0-\pi/2)" />.</li>
              <li>Compute <InlineEquation latex="p(y)=f(y)/(M g(y))" />.</li>
              <li>If <InlineEquation latex="u_1\leq p(y)" />, keep <InlineEquation latex="z=y" />; otherwise reject it.</li>
              <li>Repeat until the required number of accepted normal samples is obtained.</li>
            </ol>
          </div>
        </div>
        <aside className="border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Why generate 1.8 times the missing values?</p>
          <p className="mt-1">
            Since the theoretical acceptance probability is
            <InlineEquation latex="1/M=\sqrt{e/(2\pi)}\approx0.6577" />, obtaining
            <InlineEquation latex="R=N-n" /> accepted values requires about
            <InlineEquation latex="MR\approx1.52R" /> proposals on average. The choice
            <InlineEquation latex="m=\lceil1.8R\rceil" /> adds a practical safety margin: it produces about
            <InlineEquation latex="1.8R/M\approx1.18R" /> accepted values on average, after which only the required
            values are retained.
          </p>
        </aside>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation 1: Step-by-Step Calculation</h2>
        <p className="text-slate-700">
          This small simulation shows the first proposal values, the envelope test, and which candidates are
          accepted as standard normal samples. The seed controls the underlying uniform sequence.
        </p>
        <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <label>
            <span className="mb-1 block font-medium">seed</span>
            <input
              type="number"
              step={1}
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
            />
          </label>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Initial LCG states</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900">
              u₀: {formatInteger(seed)} · u₁: {formatInteger(seed + 1)}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              As in the implementation, the two vectors use separate streams with seeds {Math.trunc(seed)} and{' '}
              {Math.trunc(seed) + 1}.
            </p>
          </div>
        </div>

        <EnvelopePlot rows={stepRows} />

        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-slate-900">First proposal steps</p>
          <ProposalStepsTable rows={stepRows} />
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-slate-900">Accepted values from these steps</p>
          <AcceptedValuesPreview rows={stepRows} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Simulation 2: Moment and Histogram Comparison</h2>
        <p className="text-slate-700">
          Choose three numbers of accepted values and compare the empirical moments with the theoretical
          values <InlineEquation latex="\mathbb E[Z]=0" /> and <InlineEquation latex="\operatorname{Var}(Z)=1" />.
          The table also reports the empirical acceptance rate. Each sample is generated independently in batches
          of size <InlineEquation latex="m=\lceil1.8(N-n)\rceil" />, using
          <InlineEquation latex="u_0=\operatorname{lcg}(m,\mathrm{seed}+2k)" /> and
          <InlineEquation latex="u_1=\operatorname{lcg}(m,\mathrm{seed}+2k+1)" />.
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
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-500">N accepted</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">generated proposals</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">accepted proposals</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">acceptance rate</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">mean</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">|mean|</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">variance</th>
                <th className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-500">|variance - 1|</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => (
                <tr key={`${index}-${row.N}`}>
                  <td className="border border-slate-200 px-3 py-2 text-left font-mono">{formatInteger(row.N)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{formatInteger(row.proposals)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{formatInteger(row.acceptedProposals)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.acceptanceRate)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.mean)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.meanError)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.variance)}</td>
                  <td className="border border-slate-200 px-3 py-2 font-mono">{fmt(row.varianceError)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 text-left">Theory</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2">-</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2">-</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">{fmt(THEORETICAL_ACCEPTANCE)}</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">0.000000</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">0</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">1.000000</td>
                <td className="border border-slate-200 bg-emerald-50 px-3 py-2 font-mono">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Histograms</h2>
        <p className="text-slate-700">
          The histograms are normalised as densities and compared with the standard normal density.
        </p>
        <div className="grid gap-4 xl:grid-cols-3">
          {safeSampleSizes.map((N, index) => (
            <NormalHistogram
              key={`${index}-${N}`}
              values={simulations[index].samples}
              title={`N = ${formatInteger(N)}`}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">MATLAB Implementation Example</h2>
        <p className="text-slate-700">
          This implementation generates batches of Cauchy proposals, accepts the values that pass the
          density ratio test, and repeats until the requested number of standard normal samples is obtained.
        </p>
        <MatlabCodePanel file="randn_ar.m" snippets={randnArSnippets} />
      </section>
    </PageLayout>
  )
}
