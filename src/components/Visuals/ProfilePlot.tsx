import Plot from 'react-plotly.js'

export interface ProfileCurve {
  label: string
  V: number[]
  color?: string
}

export function ProfilePlot({
  S,
  curves,
  payoff,
  zMax,
}: {
  S: number[]
  curves: ProfileCurve[]
  payoff?: number[]
  zMax?: number
}) {
  return (
    <Plot
      data={[
        ...curves.map((c) => ({
          type: 'scatter' as const,
          mode: 'lines' as const,
          name: c.label,
          x: S,
          y: c.V,
          line: c.color ? { color: c.color } : undefined,
        })),
        ...(payoff
          ? [
              {
                type: 'scatter' as const,
                mode: 'lines' as const,
                name: 'payoff g(S)',
                x: S,
                y: payoff,
                line: { color: '#94a3b8', dash: 'dash' as const },
              },
            ]
          : []),
      ]}
      layout={{
        autosize: true,
        height: 360,
        margin: { l: 40, r: 10, t: 10, b: 40 },
        xaxis: { title: { text: 'S' } },
        yaxis: { title: { text: 'V(S,t)' }, range: zMax ? [0, zMax] : undefined },
        legend: { orientation: 'h', y: -0.2 },
      }}
      useResizeHandler
      style={{ width: '100%' }}
      config={{ displayModeBar: false }}
    />
  )
}
