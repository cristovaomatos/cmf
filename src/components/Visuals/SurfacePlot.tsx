import Plot from 'react-plotly.js'

export function SurfacePlot({
  S,
  t,
  V,
  title,
  zMax,
  colorscale = 'Viridis',
  showGridPoints = false,
  showGridPointLabels = false,
  yLabel = 't',
  zLabel = 'V(S,t)',
  valueLabel = 'V',
}: {
  S: number[]
  t: number[]
  V: number[][]
  title: string
  zMax?: number
  colorscale?: string
  showGridPoints?: boolean
  showGridPointLabels?: boolean
  yLabel?: string
  zLabel?: string
  valueLabel?: string
}) {
  const z = t.map((_, n) => S.map((_, i) => V[i][n]))
  const pointX = t.flatMap(() => S.map((s) => s))
  const pointY = t.flatMap((time) => S.map(() => time))
  const pointZ = t.flatMap((_, n) => S.map((__, i) => V[i][n]))
  const surfaceText = t.map((_, n) =>
    S.map((__, i) => `${valueLabel}<sub>${i},${n}</sub> = ${V[i][n].toFixed(4)}`),
  )
  const pointText = surfaceText.flat()

  return (
    <Plot
      data={[
        {
          type: 'surface',
          x: S,
          y: t,
          z,
          text: surfaceText,
          colorscale,
          showscale: false,
          hovertemplate: `%{text}<extra></extra>`,
        },
        ...(showGridPoints
          ? [
              {
                type: 'scatter3d' as const,
                mode: showGridPointLabels ? ('markers+text' as const) : ('markers' as const),
                x: pointX,
                y: pointY,
                z: pointZ,
                text: pointText,
                textposition: 'top center' as const,
                textfont: {
                  size: 9,
                  color: '#0f172a',
                },
                marker: {
                  size: 3,
                  color: '#0f172a',
                  opacity: 0.85,
                },
                hovertemplate: `%{text}<extra></extra>`,
                showlegend: false,
              },
            ]
          : []),
      ]}
      layout={{
        title: { text: title },
        autosize: true,
        height: 420,
        margin: { l: 0, r: 0, t: 40, b: 0 },
        scene: {
          xaxis: { title: { text: 'S' } },
          yaxis: { title: { text: yLabel } },
          zaxis: { title: { text: zLabel }, range: zMax ? [0, zMax] : undefined },
          camera: { eye: { x: 1.6, y: -1.6, z: 0.9 } },
        },
      }}
      useResizeHandler
      style={{ width: '100%' }}
      config={{ displayModeBar: false }}
    />
  )
}
