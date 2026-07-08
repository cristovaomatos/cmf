import { useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { PageTabs } from '../components/Navigation/PageTabs'
import { ProfilePlot } from '../components/Visuals/ProfilePlot'
import { ContinuationRegionPlot } from '../components/Visuals/ContinuationRegionPlot'
import { MatlabCodePanel } from '../components/Code/MatlabCodePanel'
import { useJsonData } from '../hooks/useJsonData'
import { dataPaths } from '../data/loadSurface'
import type { SurfaceData, FreeBoundaryData } from '../data/schemas'
import { americanParams } from '../data/parameters'
import { q2Snippets } from '../data/matlabSnippets'
import { nearestIndex } from '../utils/nearestIndex'

type View = 'profiles' | 'continuation'

export default function AmericanPutResults() {
  const american = useJsonData<SurfaceData>(dataPaths.americanSurface)
  const european = useJsonData<SurfaceData>(dataPaths.europeanCnSurface)
  const fb = useJsonData<FreeBoundaryData>(dataPaths.americanFreeBoundary)
  const [view, setView] = useState<View>('profiles')
  const [compare, setCompare] = useState(false)

  const { K } = americanParams
  const times = [0, 0.5, 1]

  return (
    <PageLayout
      title="American Put Numerical Results"
      rightPanel={{
        method: 'Crank-Nicolson + PSOR, with the continuation region and free boundary extracted per time step.',
        matlabFile: 'q2.m',
        takeaway:
          'The American put solution captures both the option value and the optimal exercise policy through the continuation region and the free boundary.',
      }}
    >
      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-5">
        {Object.entries(americanParams).map(([k, v]) => (
          <div key={k} className="rounded-md bg-slate-50 px-3 py-2">
            <div className="text-xs text-slate-400">{k}</div>
            <div className="font-medium text-slate-800">{v}</div>
          </div>
        ))}
      </div>

      <p className="text-slate-700">
        Early exercise is concentrated where the put is sufficiently in-the-money. For larger time
        to maturity, continuation becomes more valuable because the option still has time value.
      </p>

      {american.data && (
        <>
          <PageTabs
            tabs={[
              { id: 'profiles', label: 'Profiles' },
              { id: 'continuation', label: 'Continuation region' },
            ]}
            active={view}
            onChange={(id) => setView(id as View)}
          />

          {view === 'profiles' && (
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
                Compare with European put
              </label>
              <ProfilePlot
                S={american.data.S}
                zMax={K}
                payoff={american.data.S.map((s) => Math.max(K - s, 0))}
                curves={[
                  ...times.map((tt, idx) => ({
                    label: `American, t=${tt}`,
                    V: american.data!.V.map((row) => row[nearestIndex(american.data!.t, tt)]),
                    color: ['#dc2626', '#16a34a', '#2563eb'][idx],
                  })),
                  ...(compare && european.data
                    ? times.map((tt, idx) => ({
                        label: `European, t=${tt}`,
                        V: european.data!.V.map((row) => row[nearestIndex(european.data!.t, tt)]),
                        color: ['#fca5a5', '#86efac', '#93c5fd'][idx],
                      }))
                    : []),
                ]}
              />
            </div>
          )}

          {view === 'continuation' && fb.data && (
            <ContinuationRegionPlot
              S={american.data.S}
              t={american.data.t}
              V={american.data.V}
              Sf={fb.data.Sf}
            />
          )}
        </>
      )}

      <MatlabCodePanel file="q2.m" snippets={q2Snippets} />
    </PageLayout>
  )
}
