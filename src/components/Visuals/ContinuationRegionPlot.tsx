import Plot from 'react-plotly.js'

export function ContinuationRegionPlot({
  S,
  t,
  V,
  Sf,
}: {
  S: number[]
  t: number[]
  V: number[][]
  Sf: number[]
}) {
  const zMasked = t.map((_, n) =>
    S.map((s, i) => (s <= Sf[n] ? null : V[i][n])),
  )

  return (
    <Plot
      data={[
        {
          type: 'heatmap',
          x: S,
          y: t,
          z: zMasked as unknown as number[][],
          colorscale: 'Viridis',
          hovertemplate: 'S=%{x:.2f}<br>t=%{y:.2f}<br>V=%{z:.4f}<extra></extra>',
        },
        {
          type: 'scatter',
          mode: 'lines',
          x: Sf,
          y: t,
          line: { color: '#dc2626', width: 3 },
          name: 'S_f(t)',
        },
      ]}
      layout={{
        autosize: true,
        height: 420,
        margin: { l: 50, r: 10, t: 10, b: 40 },
        xaxis: { title: { text: 'S' } },
        yaxis: { title: { text: 't' } },
      }}
      useResizeHandler
      style={{ width: '100%' }}
      config={{ displayModeBar: false }}
    />
  )
}
