import { useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { PageTabs } from '../components/Navigation/PageTabs'
import { SpaceTimeGrid } from '../components/Visuals/SpaceTimeGrid'
import { GridSchemeDiagram, type Scheme } from '../components/Visuals/GridSchemeDiagram'

const schemeInfo: Record<Scheme, { label: string }> = {
  'forward-S': { label: 'Forward (S)' },
  'backward-S': { label: 'Backward (S)' },
  'centered-S': { label: 'Centered (S)' },
  'centered-SS': { label: 'Centered (S²)' },
  'forward-t': { label: 'Forward (t)' },
}

interface DerivationStepInfo {
  note: string
  noteLatex?: string
  latex: string
}

const derivationSteps: Record<Scheme, DerivationStepInfo[]> = {
  'forward-S': [
    {
      note: 'Expanding',
      noteLatex: 'U(S+h_S,t)\\text{ around }(S,t),',
      latex:
        '\\begin{aligned}U(S+h_S,t) ={}& U(S,t) + h_S\\frac{\\partial U}{\\partial S}(S,t) + \\frac{h_S^2}{2}\\frac{\\partial^2 U}{\\partial S^2}(S,t)\\\\&+ \\frac{h_S^3}{6}\\frac{\\partial^3 U}{\\partial S^3}(S,t) + O(h_S^4).\\end{aligned}',
    },
    {
      note: 'Therefore,',
      latex:
        '\\frac{U(S+h_S,t) - U(S,t)}{h_S} = \\frac{\\partial U}{\\partial S}(S,t) + \\frac{h_S}{2}\\frac{\\partial^2 U}{\\partial S^2}(S,t) + O(h_S^2).',
    },
    {
      note: 'and hence, on the grid,',
      latex: '\\frac{\\partial U}{\\partial S}(S_i,t_j) = \\frac{U_{i+1,j} - U_{i,j}}{h_S} + O(h_S)',
    },
  ],
  'backward-S': [
    {
      note: 'Similarly, expanding',
      noteLatex: 'U(S-h_S,t)\\text{ around }(S,t),',
      latex:
        '\\begin{aligned}U(S-h_S,t) ={}& U(S,t) - h_S\\frac{\\partial U}{\\partial S}(S,t) + \\frac{h_S^2}{2}\\frac{\\partial^2 U}{\\partial S^2}(S,t)\\\\&- \\frac{h_S^3}{6}\\frac{\\partial^3 U}{\\partial S^3}(S,t) + O(h_S^4).\\end{aligned}',
    },
    {
      note: 'Thus,',
      latex: '\\frac{\\partial U}{\\partial S}(S_i,t_j) = \\frac{U_{i,j} - U_{i-1,j}}{h_S} + O(h_S)',
    },
  ],
  'centered-S': [
    {
      note: 'Subtracting the two Taylor expansions,',
      latex:
        'U(S+h_S,t) - U(S-h_S,t) = 2h_S\\frac{\\partial U}{\\partial S}(S,t) + \\frac{h_S^3}{3}\\frac{\\partial^3 U}{\\partial S^3}(S,t) + O(h_S^5).',
    },
    {
      note: 'Therefore,',
      latex: '\\frac{\\partial U}{\\partial S}(S_i,t_j) = \\frac{U_{i+1,j} - U_{i-1,j}}{2h_S} + O(h_S^2)',
    },
  ],
  'centered-SS': [
    {
      note: 'Adding the two Taylor expansions,',
      latex:
        'U(S+h_S,t) + U(S-h_S,t) = 2U(S,t) + h_S^2\\frac{\\partial^2 U}{\\partial S^2}(S,t) + \\frac{h_S^4}{12}\\frac{\\partial^4 U}{\\partial S^4}(S,t) + O(h_S^6).',
    },
    {
      note: 'Therefore,',
      latex:
        '\\frac{\\partial^2 U}{\\partial S^2}(S_i,t_j) = \\frac{U_{i+1,j} - 2U_{i,j} + U_{i-1,j}}{h_S^2} + O(h_S^2)',
    },
  ],
  'forward-t': [
    {
      note: 'Expanding in time, with S fixed,',
      latex:
        'U(S,t+h_t) = U(S,t) + h_t\\frac{\\partial U}{\\partial t}(S,t) + \\frac{h_t^2}{2}\\frac{\\partial^2 U}{\\partial t^2}(S,t) + O(h_t^3).',
    },
    {
      note: 'Hence,',
      latex: '\\frac{\\partial U}{\\partial t}(S_i,t_j) = \\frac{U_{i,j+1} - U_{i,j}}{h_t} + O(h_t)',
    },
  ],
}

const orderInfo: Record<Scheme, { label: string; latex: string; detail: string }> = {
  'forward-S': {
    label: 'Forward difference in S',
    latex: '\\frac{\\partial U}{\\partial S}(S_i,t_j)=\\frac{U_{i+1,j}-U_{i,j}}{h_S}+O(h_S)',
    detail: 'first order in the spatial step',
  },
  'backward-S': {
    label: 'Backward difference in S',
    latex: '\\frac{\\partial U}{\\partial S}(S_i,t_j)=\\frac{U_{i,j}-U_{i-1,j}}{h_S}+O(h_S)',
    detail: 'first order in the spatial step',
  },
  'centered-S': {
    label: 'Centered difference in S',
    latex: '\\frac{\\partial U}{\\partial S}(S_i,t_j)=\\frac{U_{i+1,j}-U_{i-1,j}}{2h_S}+O(h_S^2)',
    detail: 'second order in the spatial step',
  },
  'centered-SS': {
    label: 'Centered second derivative in S',
    latex:
      '\\frac{\\partial^2 U}{\\partial S^2}(S_i,t_j)=\\frac{U_{i+1,j}-2U_{i,j}+U_{i-1,j}}{h_S^2}+O(h_S^2)',
    detail: 'second order in the spatial step',
  },
  'forward-t': {
    label: 'Forward difference in t',
    latex: '\\frac{\\partial U}{\\partial t}(S_i,t_j)=\\frac{U_{i,j+1}-U_{i,j}}{h_t}+O(h_t)',
    detail: 'first order in the time step',
  },
}

function StepNote({ step }: { step: DerivationStepInfo }) {
  return (
    <p className="mb-1 text-sm text-slate-600">
      {step.note}
      {step.noteLatex ? (
        <>
          {' '}
          <InlineEquation latex={step.noteLatex} />
        </>
      ) : null}
    </p>
  )
}

export default function FiniteDifferenceGrid() {
  const [NS, setNS] = useState(8)
  const [NT, setNT] = useState(6)
  const [scheme, setScheme] = useState<Scheme>('forward-S')

  return (
    <PageLayout
      title="Finite-Difference Grid and Spatial Derivatives"
      rightPanel={{
        known: 'The values on the initial-condition row (t=0) and on the two boundary columns, S=0 and S=S*.',
        unknown: 'The values at every interior node, for every subsequent time level.',
        method: 'Forward, backward, and centered differences in space, derived from Taylor expansions.',
        takeaway:
          'Centered differences are preferred in space for their second-order accuracy; they form the building blocks for the explicit, implicit, and Crank-Nicolson time-stepping schemes.',
      }}
    >
      <div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] xl:items-start">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">The computational grid</h2>
            <p className="mb-3 text-sm text-slate-700">
              The highlighted interior point shows how each grid node maps to the notation{' '}
              <InlineEquation latex="U_{i,j} \approx U(S_i,t_j)" />. Red points are fixed by the initial and
              boundary conditions; blue points are solved by the numerical method.
            </p>
            <div className="mb-4 grid max-w-lg grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">N_S = {NS}</label>
                <input
                  type="range"
                  min={3}
                  max={14}
                  value={NS}
                  onChange={(e) => setNS(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">N_t = {NT}</label>
                <input
                  type="range"
                  min={3}
                  max={14}
                  value={NT}
                  onChange={(e) => setNT(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <SpaceTimeGrid NS={NS} NT={NT} />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Grid definitions</h2>
            <div className="space-y-2">
              <EquationBlock latex="S_i = i\,h_S, \qquad i=0,\ldots,N_S" />
              <EquationBlock latex="t_j = j\,h_t, \qquad j=0,\ldots,N_t" />
              <EquationBlock latex="h_S=\frac{S^*}{N_S}, \qquad h_t=\frac{T}{N_t}" />
              <EquationBlock latex="U_{i,j} \approx U(S_i,t_j)" />
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                <InlineEquation latex="i" /> indexes the asset-price direction; <InlineEquation latex="j" /> indexes
                time.
              </p>
              <p>
                A point on the grid is therefore identified by <InlineEquation latex="(i,j)" /> and stores the
                approximation <InlineEquation latex="U_{i,j}" />.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Derivation from Taylor expansions</h2>
        <p className="mb-3 text-sm text-slate-700">
          Each finite-difference formula follows from a Taylor expansion of <InlineEquation latex="U" /> around
          the grid point <InlineEquation latex="(S_i,t_j)" />, truncated at the order that gives the desired
          accuracy.
        </p>
        <div className="mb-4 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Order of convergence for finite differences</p>
          <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <p>
                Forward and backward first derivatives are <InlineEquation latex="O(h_S)" /> in space;
                centered first and second spatial derivatives are <InlineEquation latex="O(h_S^2)" />.
              </p>
              <p className="mt-1">
                Forward time differencing is <InlineEquation latex="O(h_t)" />.
              </p>
            </div>
            <div className="rounded-md border border-indigo-100 bg-white/70 px-3 py-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Selected formula: {orderInfo[scheme].label}
              </p>
              <div className="overflow-x-auto">
                <InlineEquation latex={orderInfo[scheme].latex} />
              </div>
              <p className="mt-1 text-xs text-slate-600">{orderInfo[scheme].detail}</p>
            </div>
          </div>
        </div>
        <PageTabs
          tabs={Object.entries(schemeInfo).map(([id, info]) => ({ id, label: info.label }))}
          active={scheme}
          onChange={(id) => setScheme(id as Scheme)}
        />
        <div className="mt-3 space-y-3">
          {derivationSteps[scheme].slice(0, -1).map((step, i) => (
            <div key={i}>
              <StepNote step={step} />
              <EquationBlock latex={step.latex} />
            </div>
          ))}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <GridSchemeDiagram scheme={scheme} />
            </div>
            <div className="flex-1">
              <StepNote step={derivationSteps[scheme][derivationSteps[scheme].length - 1]} />
              <EquationBlock latex={derivationSteps[scheme][derivationSteps[scheme].length - 1].latex} />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
