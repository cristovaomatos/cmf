import { Katex } from '../Math/Katex'

function StencilLabel({ x, y, latex }: { x: number; y: number; latex: string }) {
  const w = 90
  const h = 24
  return (
    <foreignObject x={x - w / 2} y={y - h / 2} width={w} height={h}>
      <div className="flex h-full w-full items-center justify-center text-slate-600" style={{ fontSize: '11px' }}>
        <Katex math={latex} />
      </div>
    </foreignObject>
  )
}

export function CrankNicolsonMolecule() {
  const leftX = 70
  const midX = 200
  const rightX = 330
  const topY = 44
  const bottomY = 150

  return (
    <svg viewBox="0 0 400 210" className="w-full max-w-md">
      <line x1={leftX} y1={topY} x2={rightX} y2={topY} className="stroke-slate-700" strokeWidth={2} />
      <line x1={leftX} y1={bottomY} x2={rightX} y2={bottomY} className="stroke-slate-700" strokeWidth={2} />
      <line x1={midX} y1={topY} x2={midX} y2={bottomY} className="stroke-slate-700" strokeWidth={2} />

      <circle cx={leftX} cy={topY} r={7} className="fill-blue-600" />
      <circle cx={midX} cy={topY} r={7} className="fill-blue-600" />
      <circle cx={rightX} cy={topY} r={7} className="fill-blue-600" />
      <circle cx={leftX} cy={bottomY} r={7} className="fill-red-500" />
      <circle cx={midX} cy={bottomY} r={7} className="fill-red-500" />
      <circle cx={rightX} cy={bottomY} r={7} className="fill-red-500" />

      <StencilLabel x={leftX} y={topY - 24} latex="U_{i-1,j+1}" />
      <StencilLabel x={midX} y={topY - 24} latex="U_{i,j+1}" />
      <StencilLabel x={rightX} y={topY - 24} latex="U_{i+1,j+1}" />
      <StencilLabel x={leftX} y={bottomY + 24} latex="U_{i-1,j}" />
      <StencilLabel x={midX} y={bottomY + 24} latex="U_{i,j}" />
      <StencilLabel x={rightX} y={bottomY + 24} latex="U_{i+1,j}" />
    </svg>
  )
}
