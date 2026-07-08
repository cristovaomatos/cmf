import { useState } from 'react'
import { scaleLinear } from 'd3'
import { Katex } from '../Math/Katex'

type NodeStatus = 'known' | 'unknown'

export function SpaceTimeGrid({ NS, NT }: { NS: number; NT: number }) {
  const [selected, setSelected] = useState<{ i: number; j: number } | null>(null)
  const width = 520
  const height = 420
  const margin = 36
  const bottomMargin = 76
  const exampleNode = {
    i: Math.max(1, Math.floor(NS / 2)),
    j: Math.max(1, Math.floor(NT / 2)),
  }

  const x = scaleLinear().domain([0, NS]).range([margin, width - margin])
  const y = scaleLinear().domain([0, NT]).range([height - bottomMargin, margin])

  function statusOf(i: number, j: number): NodeStatus {
    return i === 0 || i === NS || j === 0 ? 'known' : 'unknown'
  }

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg">
        {Array.from({ length: NT + 1 }, (_, j) => (
          <line
            key={`h-${j}`}
            x1={x(0)}
            y1={y(j)}
            x2={x(NS)}
            y2={y(j)}
            strokeDasharray="3 3"
            className="stroke-slate-300"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: NS + 1 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={x(i)}
            y1={y(0)}
            x2={x(i)}
            y2={y(NT)}
            strokeDasharray="3 3"
            className="stroke-slate-300"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: NT + 1 }, (_, j) =>
          Array.from({ length: NS + 1 }, (_, i) => {
            const status = statusOf(i, j)
            return (
              <g key={`${i}-${j}`} onClick={() => setSelected({ i, j })} className="cursor-pointer">
                {status === 'known' ? (
                  <circle cx={x(i)} cy={y(j)} r={5.5} className="fill-red-500" />
                ) : (
                  <circle cx={x(i)} cy={y(j)} r={5} className="fill-white stroke-blue-600" strokeWidth={1.5} />
                )}
              </g>
            )
          }),
        )}
        <line
          x1={x(exampleNode.i)}
          y1={y(exampleNode.j)}
          x2={x(exampleNode.i)}
          y2={y(0)}
          strokeDasharray="4 4"
          className="stroke-amber-500"
          strokeWidth={1.5}
        />
        <line
          x1={x(0)}
          y1={y(exampleNode.j)}
          x2={x(exampleNode.i)}
          y2={y(exampleNode.j)}
          strokeDasharray="4 4"
          className="stroke-amber-500"
          strokeWidth={1.5}
        />
        <circle cx={x(exampleNode.i)} cy={y(exampleNode.j)} r={9} className="fill-amber-400/30 stroke-amber-600" strokeWidth={2} />
        <line
          x1={x(exampleNode.i)}
          y1={y(exampleNode.j) + 18}
          x2={x(exampleNode.i + 1)}
          y2={y(exampleNode.j) + 18}
          className="stroke-emerald-600"
          strokeWidth={2}
        />
        <line
          x1={x(exampleNode.i)}
          y1={y(exampleNode.j) + 13}
          x2={x(exampleNode.i)}
          y2={y(exampleNode.j) + 23}
          className="stroke-emerald-600"
          strokeWidth={2}
        />
        <line
          x1={x(exampleNode.i + 1)}
          y1={y(exampleNode.j) + 13}
          x2={x(exampleNode.i + 1)}
          y2={y(exampleNode.j) + 23}
          className="stroke-emerald-600"
          strokeWidth={2}
        />
        <foreignObject x={(x(exampleNode.i) + x(exampleNode.i + 1)) / 2 - 20} y={y(exampleNode.j) + 20} width={40} height={24}>
          <div className="flex h-full items-center justify-center text-xs font-semibold text-emerald-700">
            <Katex math="h_S" />
          </div>
        </foreignObject>
        <line
          x1={x(exampleNode.i) - 20}
          y1={y(exampleNode.j)}
          x2={x(exampleNode.i) - 20}
          y2={y(exampleNode.j + 1)}
          className="stroke-violet-600"
          strokeWidth={2}
        />
        <line
          x1={x(exampleNode.i) - 25}
          y1={y(exampleNode.j)}
          x2={x(exampleNode.i) - 15}
          y2={y(exampleNode.j)}
          className="stroke-violet-600"
          strokeWidth={2}
        />
        <line
          x1={x(exampleNode.i) - 25}
          y1={y(exampleNode.j + 1)}
          x2={x(exampleNode.i) - 15}
          y2={y(exampleNode.j + 1)}
          className="stroke-violet-600"
          strokeWidth={2}
        />
        <foreignObject x={x(exampleNode.i) - 68} y={(y(exampleNode.j) + y(exampleNode.j + 1)) / 2 - 12} width={42} height={24}>
          <div className="flex h-full items-center justify-end text-xs font-semibold text-violet-700">
            <Katex math="h_t" />
          </div>
        </foreignObject>
        <foreignObject x={x(exampleNode.i) + 10} y={y(exampleNode.j) - 26} width={92} height={28}>
          <div className="flex h-full items-center text-xs font-semibold text-amber-700">
            <Katex math="U_{i,j}" />
          </div>
        </foreignObject>
        <foreignObject x={x(exampleNode.i) - 24} y={height - bottomMargin + 20} width={48} height={24}>
          <div className="flex h-full items-center justify-center text-xs text-amber-700">
            <Katex math="S_i" />
          </div>
        </foreignObject>
        <foreignObject x={2} y={y(exampleNode.j) - 12} width={34} height={24}>
          <div className="flex h-full items-center justify-end text-xs text-amber-700">
            <Katex math="t_j" />
          </div>
        </foreignObject>
        <text x={margin - 10} y={y(NT) + 4} textAnchor="end" className="fill-slate-500 text-[10px]">T</text>
        <text x={margin - 10} y={y(0) + 4} textAnchor="end" className="fill-slate-500 text-[10px]">0</text>
        <text x={x(0)} y={height - bottomMargin + 18} textAnchor="middle" className="fill-slate-500 text-[10px]">0</text>
        <text x={x(NS)} y={height - bottomMargin + 18} textAnchor="middle" className="fill-slate-500 text-[10px]">S*</text>
        <text x={14} y={height / 2} className="fill-slate-400 text-xs">t</text>
        <text x={width / 2} y={height - 8} textAnchor="middle" className="fill-slate-400 text-xs">S</text>
      </svg>
      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          known (initial / boundary condition)
        </span>
        <span>
          <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-blue-600 bg-white" />
          unknown (solved by the PDE)
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        Highlighted node: <Katex math="U_{i,j} \approx U(S_i,t_j)" />.
      </p>
      {selected && (
        <p className="mt-2 text-sm text-slate-700">
          Node (S<sub>{selected.i}</sub>, t<sub>{selected.j}</sub>):{' '}
          <span className="font-medium">{statusOf(selected.i, selected.j)}</span>
          {statusOf(selected.i, selected.j) === 'known'
            ? ' — fixed by the initial or boundary condition.'
            : ' — solved for by the finite-difference scheme.'}
        </p>
      )}
    </div>
  )
}
