import { europeanParams } from '../../data/parameters'

const VISIBLE_SIZE = 7

function buildCoefficients() {
  const { r, sigma, T, Nt_cn } = europeanParams
  const ht = T / Nt_cn
  const n = europeanParams.NS - 1
  const i = Array.from({ length: n }, (_, k) => k + 1)

  const a = i.map((ii) => -((sigma ** 2 * ht) / 4) * ii ** 2 + ((r * ht) / 4) * ii)
  const b = i.map((ii) => 1 + ((sigma ** 2 * ht) / 2) * ii ** 2 + (r * ht) / 2)
  const c = i.map((ii) => -((sigma ** 2 * ht) / 4) * ii ** 2 - ((r * ht) / 4) * ii)
  const d = i.map((ii) => 1 - ((sigma ** 2 * ht) / 2) * ii ** 2 - (r * ht) / 2)

  return { a, b, c, d, ht, n }
}

function formatValue(value: number) {
  return value.toFixed(3)
}

export function TridiagonalMatrixView({ matrix }: { matrix: 'A' | 'B' }) {
  const { a, b, c, d, ht, n } = buildCoefficients()
  const center = Math.floor((n + 1) / 2)
  const start = Math.max(1, Math.min(n - VISIBLE_SIZE + 1, center - Math.floor(VISIBLE_SIZE / 2)))
  const indices = Array.from({ length: VISIBLE_SIZE }, (_, k) => start + k)
  const cell = 46
  const label = 28

  function valueAt(rowIndex: number, colIndex: number) {
    if (rowIndex === colIndex) return matrix === 'A' ? b[rowIndex - 1] : d[rowIndex - 1]
    if (colIndex === rowIndex - 1) return matrix === 'A' ? a[rowIndex - 1] : -a[rowIndex - 1]
    if (colIndex === rowIndex + 1) return matrix === 'A' ? c[rowIndex - 1] : -c[rowIndex - 1]
    return null
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${VISIBLE_SIZE * cell + label + 18} ${VISIBLE_SIZE * cell + label + 18}`}
        className="w-full max-w-lg"
      >
        {indices.map((colIndex, col) => (
          <text
            key={`col-${colIndex}`}
            x={label + 10 + col * cell + (cell - 2) / 2}
            y={18}
            textAnchor="middle"
            className="fill-slate-500 text-[9px]"
          >
            {colIndex}
          </text>
        ))}
        {indices.map((rowIndex, row) => (
          <text
            key={`row-${rowIndex}`}
            x={label - 2}
            y={label + 10 + row * cell + (cell - 2) / 2 + 3}
            textAnchor="end"
            className="fill-slate-500 text-[9px]"
          >
            {rowIndex}
          </text>
        ))}
        {indices.map((rowIndex, row) =>
          indices.map((colIndex, col) => {
            const value = valueAt(rowIndex, colIndex)
            let fill = 'fill-slate-50'
            if (rowIndex === colIndex) {
              fill = 'fill-blue-200'
            } else if (colIndex === rowIndex - 1) {
              fill = 'fill-emerald-100'
            } else if (colIndex === rowIndex + 1) {
              fill = 'fill-amber-100'
            }
            return (
              <g key={`${rowIndex}-${colIndex}`}>
                <rect
                  x={label + 10 + col * cell}
                  y={label + 10 + row * cell}
                  width={cell - 2}
                  height={cell - 2}
                  className={`${fill} stroke-slate-200`}
                  strokeWidth={1}
                />
                {value !== null && (
                  <text
                    x={label + 10 + col * cell + (cell - 2) / 2}
                    y={label + 10 + row * cell + (cell - 2) / 2 + 3}
                    textAnchor="middle"
                    className="fill-slate-700 text-[9px]"
                  >
                    {formatValue(value)}
                  </text>
                )}
              </g>
            )
          }),
        )}
      </svg>
      <p className="mt-1 text-xs text-slate-500">
        Real MATLAB parameters: matrix size {n}×{n}, h_t={ht.toFixed(3)}. Showing rows and columns {start}-
        {start + VISIBLE_SIZE - 1} of {matrix === 'A' ? 'A_CN' : 'B_CN'}.
      </p>
    </div>
  )
}
