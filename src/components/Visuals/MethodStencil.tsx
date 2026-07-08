import { Katex } from '../Math/Katex'

function StencilLabel({
  x,
  y,
  latex,
  bold,
  width = 100,
  height = 26,
  tone = 'slate',
}: {
  x: number
  y: number
  latex: string
  bold?: boolean
  width?: number
  height?: number
  tone?: 'slate' | 'emerald' | 'amber' | 'blue'
}) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-700'
      : tone === 'amber'
        ? 'text-amber-700'
        : tone === 'blue'
          ? 'text-blue-700'
          : 'text-slate-600'

  return (
    <foreignObject x={x - width / 2} y={y - height / 2} width={width} height={height}>
      <div
        className={`flex h-full w-full items-center justify-center ${toneClass} ${bold ? 'font-medium' : ''}`}
        style={{ fontSize: '12px' }}
      >
        <Katex math={latex} />
      </div>
    </foreignObject>
  )
}

export function MethodStencil({ method }: { method: 'explicit' | 'implicit' | 'mol' | 'rk4' }) {
  if (method === 'mol') {
    const leftX = 60
    const midX = 150
    const rightX = 240
    const rowY = 130
    const derivativeY = 50

    return (
      <svg viewBox="0 0 300 190" className="w-full max-w-sm">
        <line x1={leftX} y1={rowY} x2={rightX} y2={rowY} className="stroke-slate-700" strokeWidth={2} />
        <line x1={midX} y1={derivativeY} x2={midX} y2={rowY} className="stroke-slate-700" strokeWidth={2} />
        <circle cx={leftX} cy={rowY} r={7} className="fill-blue-600" />
        <circle cx={midX} cy={rowY} r={7} className="fill-blue-600" />
        <circle cx={rightX} cy={rowY} r={7} className="fill-blue-600" />
        <circle cx={midX} cy={derivativeY} r={7} className="fill-emerald-500" />
        <StencilLabel x={leftX} y={rowY + 30} latex="U_{i-1}(t)" />
        <StencilLabel x={midX} y={rowY + 30} latex="U_i(t)" bold />
        <StencilLabel x={rightX} y={rowY + 30} latex="U_{i+1}(t)" />
        <StencilLabel x={midX} y={derivativeY - 30} latex="\frac{dU_i}{dt}(t)" bold tone="emerald" width={130} />
      </svg>
    )
  }

  if (method === 'rk4') {
    const centerX = 220
    const bottomY = 205
    const topY = 55

    return (
      <svg viewBox="0 0 460 250" className="w-full max-w-xl">
        <line x1={55} y1={topY} x2={420} y2={topY} className="stroke-slate-300" strokeDasharray="8 8" />
        <line x1={55} y1={bottomY} x2={420} y2={bottomY} className="stroke-slate-300" strokeDasharray="8 8" />

        <circle cx={centerX} cy={bottomY} r={7} className="fill-blue-600" />
        <circle cx={centerX} cy={topY} r={7} className="fill-emerald-500" />

        <StencilLabel x={centerX} y={18} latex="t" bold width={40} />
        <StencilLabel x={104} y={bottomY + 18} latex="t_j" width={70} />
        <StencilLabel x={112} y={topY - 20} latex="t_{j+1}=t_j+h_t" width={150} />
        <StencilLabel x={centerX + 52} y={bottomY + 28} latex="\mathbf U^j" bold tone="blue" />
        <StencilLabel x={centerX + 68} y={topY + 24} latex="\mathbf U^{j+1}" bold tone="emerald" width={120} />

        <foreignObject x={112} y={98} width={285} height={78}>
          <div className="flex h-full flex-col items-center justify-center rounded border border-amber-200 bg-amber-50/70 px-2 text-xs text-slate-700">
            <span className="font-medium text-amber-700">RK4 internal stages</span>
            <Katex math="\mathbf k_1,\mathbf k_2,\mathbf k_3,\mathbf k_4" />
            <span className="mt-1">estimate the average slope</span>
            <Katex math="\frac{1}{6}(\mathbf k_1+2\mathbf k_2+2\mathbf k_3+\mathbf k_4)" />
          </div>
        </foreignObject>
      </svg>
    )
  }

  const width = 300
  const height = 190
  const leftX = 60
  const midX = 150
  const rightX = 240
  const topY = 50
  const bottomY = 140

  const isExplicit = method === 'explicit'
  const rowY = isExplicit ? bottomY : topY
  const singleY = isExplicit ? topY : bottomY
  const rowColor = isExplicit ? 'fill-red-500' : 'fill-blue-600'
  const singleColor = isExplicit ? 'fill-blue-600' : 'fill-red-500'
  const rowLevel = isExplicit ? 'j' : 'j+1'
  const singleLevel = isExplicit ? 'j+1' : 'j'
  const rowLabelDy = isExplicit ? 30 : -30
  const singleLabelDy = isExplicit ? -30 : 30

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm">
      <line x1={leftX} y1={rowY} x2={rightX} y2={rowY} className="stroke-slate-700" strokeWidth={2} />
      <line x1={midX} y1={rowY} x2={midX} y2={singleY} className="stroke-slate-700" strokeWidth={2} />
      <circle cx={leftX} cy={rowY} r={7} className={rowColor} />
      <circle cx={midX} cy={rowY} r={7} className={rowColor} />
      <circle cx={rightX} cy={rowY} r={7} className={rowColor} />
      <circle cx={midX} cy={singleY} r={7} className={singleColor} />
      <StencilLabel x={leftX} y={rowY + rowLabelDy} latex={`U_{i-1,${rowLevel}}`} />
      <StencilLabel x={midX} y={rowY + rowLabelDy} latex={`U_{i,${rowLevel}}`} />
      <StencilLabel x={rightX} y={rowY + rowLabelDy} latex={`U_{i+1,${rowLevel}}`} />
      <StencilLabel x={midX} y={singleY + singleLabelDy} latex={`U_{i,${singleLevel}}`} bold />
    </svg>
  )
}
