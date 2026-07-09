import { Katex } from '../Math/Katex'

function MathLabel({
  x,
  y,
  width,
  latex,
  className = 'text-slate-600',
}: {
  x: number
  y: number
  width: number
  latex: string
  className?: string
}) {
  return (
    <foreignObject x={x - width / 2} y={y - 14} width={width} height={28}>
      <div className={`flex h-full items-center justify-center text-xs ${className}`}>
        <Katex math={latex} />
      </div>
    </foreignObject>
  )
}

export function MethodOfLinesNameDiagram() {
  const width = 520
  const height = 330
  const left = 52
  const right = 486
  const top = 32
  const bottom = 270
  const nodeCount = 7
  const xAt = (index: number) => left + (index / (nodeCount - 1)) * (right - left)
  const selectedIndex = 3

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Method of Lines spatial discretisation with continuous vertical time lines"
      >
        {[0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = bottom - fraction * (bottom - top)
          return (
            <line
              key={fraction}
              x1={left}
              y1={y}
              x2={right}
              y2={y}
              className="stroke-slate-200"
              strokeDasharray="5 6"
            />
          )
        })}

        <line x1={left} y1={bottom} x2={right} y2={bottom} className="stroke-slate-700" strokeWidth={1.8} />
        <line x1={left} y1={bottom} x2={left} y2={top} className="stroke-slate-700" strokeWidth={1.8} />

        {Array.from({ length: nodeCount }, (_, index) => {
          const isBoundary = index === 0 || index === nodeCount - 1
          const isSelected = index === selectedIndex
          return (
            <g key={index}>
              <line
                x1={xAt(index)}
                y1={bottom}
                x2={xAt(index)}
                y2={top}
                className={
                  isSelected ? 'stroke-amber-500' : isBoundary ? 'stroke-red-400' : 'stroke-blue-500'
                }
                strokeWidth={isSelected ? 4 : 2.4}
                opacity={isSelected ? 1 : 0.72}
              />
              <circle
                cx={xAt(index)}
                cy={bottom}
                r={isSelected ? 7 : 5.5}
                className={
                  isSelected ? 'fill-amber-500' : isBoundary ? 'fill-red-500' : 'fill-blue-600'
                }
              />
            </g>
          )
        })}

        <MathLabel x={xAt(0)} y={bottom + 24} width={58} latex="S_0" />
        <MathLabel x={xAt(1)} y={bottom + 24} width={58} latex="S_1" />
        <MathLabel
          x={xAt(selectedIndex)}
          y={bottom + 24}
          width={58}
          latex="S_i"
          className="font-semibold text-amber-700"
        />
        <MathLabel x={xAt(nodeCount - 2)} y={bottom + 24} width={92} latex="S_{N_S-1}" />
        <MathLabel x={xAt(nodeCount - 1)} y={bottom + 24} width={72} latex="S_{N_S}" />
        <MathLabel
          x={xAt(selectedIndex) + 72}
          y={top + 36}
          width={140}
          latex="U_i(t)\approx U(S_i,t)"
          className="font-semibold text-amber-700"
        />
        <MathLabel
          x={xAt(selectedIndex) + 64}
          y={top + 68}
          width={120}
          latex="S=S_i"
          className="text-amber-700"
        />

        <text x={right} y={bottom + 44} textAnchor="end" className="fill-slate-500 text-xs">
          S
        </text>
        <text x={left - 18} y={top + 4} className="fill-slate-500 text-xs">
          t
        </text>
        <text x={left - 10} y={bottom + 4} textAnchor="end" className="fill-slate-500 text-[10px]">
          0
        </text>
        <text x={left - 10} y={top + 4} textAnchor="end" className="fill-slate-500 text-[10px]">
          T
        </text>
      </svg>

      <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
        <span>
          <span className="mr-1 inline-block h-0.5 w-5 bg-blue-500 align-middle" />
          interior line
        </span>
        <span>
          <span className="mr-1 inline-block h-0.5 w-5 bg-red-400 align-middle" />
          boundary line
        </span>
        <span>
          <span className="mr-1 inline-block h-0.5 w-5 bg-amber-500 align-middle" />
          selected line
        </span>
      </div>
    </figure>
  )
}
