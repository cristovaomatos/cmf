import { useState } from 'react'
import Plot from 'react-plotly.js'

const TOY_TARGET = [1.2, -0.6, 0.8, -0.3, 1.5, -0.9, 0.4]

function toyStep(x: number[], target: number[], rate: number) {
  return x.map((v, i) => v + rate * (target[i] - v))
}

export function PSORIterationView({ omega }: { omega: number }) {
  const [x, setX] = useState<number[]>(() => TOY_TARGET.map(() => 0))
  const [iter, setIter] = useState(0)

  function step() {
    // Illustrative only: a toy relaxation + projection, not the real (D+omega L) solve.
    const rate = Math.min(0.9, 0.35 * omega)
    const updated = toyStep(x, TOY_TARGET, rate).map((v) => Math.max(0, v))
    setX(updated)
    setIter((i) => i + 1)
  }

  function reset() {
    setX(TOY_TARGET.map(() => 0))
    setIter(0)
  }

  const width = 420
  const barWidth = width / x.length

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">SOR update</span>
        <span className="text-slate-400">→</span>
        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">projection max(0,·)</span>
        <span className="text-slate-400">→</span>
        <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">feasible iterate</span>
      </div>
      <svg viewBox={`0 0 ${width} 120`} className="w-full max-w-md">
        <line x1={0} y1={60} x2={width} y2={60} className="stroke-slate-300" strokeWidth={1} />
        {x.map((v, i) => {
          const h = Math.abs(v) * 30
          const y = v >= 0 ? 60 - h : 60
          return (
            <rect
              key={i}
              x={i * barWidth + 6}
              y={y}
              width={barWidth - 12}
              height={h}
              className={v < 0 ? 'fill-red-400' : 'fill-blue-500'}
            />
          )
        })}
      </svg>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" onClick={step} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          Iterate
        </button>
        <button type="button" onClick={reset} className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50">
          Reset
        </button>
        <span className="text-xs text-slate-500">iteration {iter}</span>
      </div>
    </div>
  )
}

export function PSORConvergenceChart({ omega }: { omega: number }) {
  // Illustrative closed-form decay: fastest near omega=1.2 (the value used in q2.m),
  // not a real measured PSOR convergence curve.
  const rho = Math.min(0.92, 0.3 + 0.6 * (Math.abs(omega - 1.2) / 0.9))
  const iterations = Array.from({ length: 30 }, (_, k) => k)
  const err = iterations.map((k) => 1 * rho ** k)

  return (
    <Plot
      data={[
        {
          type: 'scatter',
          mode: 'lines+markers',
          x: iterations,
          y: err,
          line: { color: '#2563eb' },
        },
      ]}
      layout={{
        autosize: true,
        height: 280,
        margin: { l: 50, r: 10, t: 10, b: 40 },
        xaxis: { title: { text: 'iteration' } },
        yaxis: { title: { text: 'error (log scale)' }, type: 'log' },
      }}
      useResizeHandler
      style={{ width: '100%' }}
      config={{ displayModeBar: false }}
    />
  )
}
