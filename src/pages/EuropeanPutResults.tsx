import { useMemo, useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { PageTabs } from '../components/Navigation/PageTabs'
import { SurfacePlot } from '../components/Visuals/SurfacePlot'
import { ProfilePlot } from '../components/Visuals/ProfilePlot'
import { MatlabCodePanel } from '../components/Code/MatlabCodePanel'
import { useJsonData } from '../hooks/useJsonData'
import { dataPaths } from '../data/loadSurface'
import type { SurfaceData } from '../data/schemas'
import { europeanParams } from '../data/parameters'
import { q1Snippets } from '../data/matlabSnippets'
import { nearestIndex } from '../utils/nearestIndex'

type Method = 'cn' | 'mol' | 'diff'

export default function EuropeanPutResults() {
  const cn = useJsonData<SurfaceData>(dataPaths.europeanCnSurface)
  const mol = useJsonData<SurfaceData>(dataPaths.europeanMolSurface)
  const [method, setMethod] = useState<Method>('cn')
  const [t, setT] = useState(0.5)

  const diffSurface = useMemo(() => {
    if (!cn.data || !mol.data) return null
    return {
      S: cn.data.S,
      t: cn.data.t,
      V: cn.data.V.map((row, i) => row.map((v, n) => v - mol.data!.V[i][n])),
    }
  }, [cn.data, mol.data])

  const loading = cn.loading || mol.loading
  const error = cn.error || mol.error

  return (
    <PageLayout
      title="European Put Numerical Results"
      rightPanel={{
        method: 'Crank-Nicolson and Method of Lines + RK4, compared on the same grid.',
        matlabFile: 'q1.m',
        takeaway:
          'Both numerical methods produce consistent European put values and recover the expected qualitative behaviour of the Black-Scholes model.',
      }}
    >
      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-4">
        {Object.entries(europeanParams).map(([k, v]) => (
          <div key={k} className="rounded-md bg-slate-50 px-3 py-2">
            <div className="text-xs text-slate-400">{k}</div>
            <div className="font-medium text-slate-800">{v}</div>
          </div>
        ))}
      </div>

      <p className="text-slate-700">
        Both methods produce smooth surfaces and similar time profiles, confirming consistency
        between the two approaches. The option value decreases as <code>S</code> increases,
        reflecting the payoff structure of a put option.
      </p>

      {loading && <p className="text-sm text-slate-500">Loading MATLAB-exported data…</p>}
      {error && <p className="text-sm text-red-600">Failed to load data: {error}</p>}

      {cn.data && mol.data && (
        <>
          <PageTabs
            tabs={[
              { id: 'cn', label: 'Crank-Nicolson' },
              { id: 'mol', label: 'Method of Lines + RK4' },
              { id: 'diff', label: 'Difference (CN − MOL)' },
            ]}
            active={method}
            onChange={(id) => setMethod(id as Method)}
          />

          {method === 'cn' && (
            <SurfacePlot S={cn.data.S} t={cn.data.t} V={cn.data.V} title="V(S,t) — Crank-Nicolson" zMax={europeanParams.K} />
          )}
          {method === 'mol' && (
            <SurfacePlot S={mol.data.S} t={mol.data.t} V={mol.data.V} title="V(S,t) — Method of Lines" zMax={europeanParams.K} />
          )}
          {method === 'diff' && diffSurface && (
            <SurfacePlot S={diffSurface.S} t={diffSurface.t} V={diffSurface.V} title="V_CN − V_MOL" colorscale="RdBu" />
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Profile at t = {t.toFixed(2)}
            </label>
            <input
              type="range"
              min={0}
              max={europeanParams.T}
              step={0.01}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              className="w-full max-w-md"
            />
            <ProfilePlot
              S={cn.data.S}
              zMax={europeanParams.K}
              payoff={cn.data.S.map((s) => Math.max(europeanParams.K - s, 0))}
              curves={[
                {
                  label: 'Crank-Nicolson',
                  V: cn.data.V.map((row) => row[nearestIndex(cn.data!.t, t)]),
                  color: '#2563eb',
                },
                {
                  label: 'Method of Lines',
                  V: mol.data.V.map((row) => row[nearestIndex(mol.data!.t, t)]),
                  color: '#16a34a',
                },
              ]}
            />
          </div>
        </>
      )}

      <MatlabCodePanel file="q1.m" snippets={q1Snippets} />
    </PageLayout>
  )
}
