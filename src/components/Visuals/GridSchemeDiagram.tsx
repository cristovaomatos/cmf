import { Katex } from '../Math/Katex'

export type Scheme = 'forward-S' | 'backward-S' | 'centered-S' | 'centered-SS' | 'forward-t'

function StencilLabel({ x, y, latex }: { x: number; y: number; latex: string }) {
  const w = 90
  const h = 22
  return (
    <foreignObject x={x - w / 2} y={y - h / 2} width={w} height={h}>
      <div className="flex h-full w-full items-center justify-center text-slate-700" style={{ fontSize: '11px' }}>
        <Katex math={latex} />
      </div>
    </foreignObject>
  )
}

const colOffsets = [-1, 0, 1]
const rowOffsets = [-1, 0, 1]

const activePoints: Record<Scheme, [number, number][]> = {
  'forward-S': [
    [0, 0],
    [1, 0],
  ],
  'backward-S': [
    [-1, 0],
    [0, 0],
  ],
  'centered-S': [
    [-1, 0],
    [1, 0],
  ],
  'centered-SS': [
    [-1, 0],
    [0, 0],
    [1, 0],
  ],
  'forward-t': [
    [0, 0],
    [0, 1],
  ],
}

const spacingLabel: Record<Scheme, string> = {
  'forward-S': 'h_S',
  'backward-S': 'h_S',
  'centered-S': '2h_S',
  'centered-SS': 'h_S',
  'forward-t': 'h_t',
}

function pointLabel(colOffset: number, rowOffset: number): string {
  const iPart = colOffset === -1 ? 'i-1' : colOffset === 1 ? 'i+1' : 'i'
  const jPart = rowOffset === -1 ? 'j-1' : rowOffset === 1 ? 'j+1' : 'j'
  return `U_{${iPart},${jPart}}`
}

export function GridSchemeDiagram({ scheme }: { scheme: Scheme }) {
  const width = 340
  const height = 260
  const colX: Record<number, number> = { [-1]: 70, [0]: 170, [1]: 270 }
  const rowY: Record<number, number> = { [-1]: 214, [0]: 132, [1]: 50 }

  const active = activePoints[scheme]
  const isActive = (c: number, r: number) => active.some(([ac, ar]) => ac === c && ar === r)

  const activeCols = active.map(([c]) => c)
  const activeRows = active.map(([, r]) => r)
  const lineX1 = colX[Math.min(...activeCols)]
  const lineX2 = colX[Math.max(...activeCols)]
  const lineY1 = rowY[Math.min(...activeRows)]
  const lineY2 = rowY[Math.max(...activeRows)]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm">
      {rowOffsets.map((r) => (
        <line
          key={`h-${r}`}
          x1={colX[-1]}
          y1={rowY[r]}
          x2={colX[1]}
          y2={rowY[r]}
          strokeDasharray="3 3"
          className="stroke-slate-200"
          strokeWidth={1}
        />
      ))}
      {colOffsets.map((c) => (
        <line
          key={`v-${c}`}
          x1={colX[c]}
          y1={rowY[-1]}
          x2={colX[c]}
          y2={rowY[1]}
          strokeDasharray="3 3"
          className="stroke-slate-200"
          strokeWidth={1}
        />
      ))}

      <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} className="stroke-blue-500" strokeWidth={2} />

      {rowOffsets.map((r) =>
        colOffsets.map((c) => (isActive(c, r) ? null : <circle key={`${c}-${r}`} cx={colX[c]} cy={rowY[r]} r={4} className="fill-slate-300" />)),
      )}

      {active.map(([c, r]) => (
        <circle key={`active-${c}-${r}`} cx={colX[c]} cy={rowY[r]} r={7} className="fill-blue-600" />
      ))}
      {active.map(([c, r]) => (
        <StencilLabel key={`label-${c}-${r}`} x={colX[c]} y={rowY[r] + (r === 1 ? -26 : 26)} latex={pointLabel(c, r)} />
      ))}

      {scheme === 'forward-t' ? (
        <StencilLabel x={colX[0] + 46} y={(rowY[0] + rowY[1]) / 2} latex={spacingLabel[scheme]} />
      ) : (
        <StencilLabel x={(lineX1 + lineX2) / 2} y={rowY[0] - 22} latex={spacingLabel[scheme]} />
      )}

      <text x={width - 8} y={rowY[-1] + 4} textAnchor="end" className="fill-slate-400 text-[10px]">S →</text>
      <text x={colX[-1] - 10} y={rowY[1]} textAnchor="end" className="fill-slate-400 text-[10px]">t ↑</text>
    </svg>
  )
}
