import { useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock } from '../components/Math/EquationBlock'
import { PageTabs } from '../components/Navigation/PageTabs'
import { BoundaryConditionDiagram } from '../components/Visuals/BoundaryConditionDiagram'

export default function DomainBoundaryConditions() {
  const [mode, setMode] = useState<'european' | 'american'>('european')

  return (
    <PageLayout
      title="Computational Domain and Boundary Conditions"
      rightPanel={{
        known: 'Initial condition (payoff) and boundary behaviour of the put option at S=0 and S=S*.',
        unknown: 'U(S,t) in the interior of the truncated domain.',
        method: 'Truncate the spatial domain and impose financially-motivated boundary values.',
        takeaway:
          'The PDE is solved only in the interior of the grid; the initial and boundary values are imposed from the financial payoff and limiting behaviour of the put option.',
      }}
    >
      <p className="text-slate-700">
        The PDE is solved on a truncated computational region. The initial condition and the two
        spatial boundary conditions are imposed from the financial structure of the put option.
      </p>

      <EquationBlock latex="R_T^V = \{(S,t): 0<S<S^*,\ 0\leq t\leq T\}" />

      <PageTabs
        tabs={[
          { id: 'european', label: 'European' },
          { id: 'american', label: 'American' },
        ]}
        active={mode}
        onChange={(id) => setMode(id as 'european' | 'american')}
      />

      <BoundaryConditionDiagram mode={mode} />

      {mode === 'european' ? (
        <div className="space-y-2">
          <EquationBlock latex="U(S,0)=u_0(S)=\max(K-S,0)" />
          <EquationBlock latex="U(0,t)=u_a(t)=Ke^{-rt}" />
          <EquationBlock latex="U(S^*,t)=u_b(t)=0" />
        </div>
      ) : (
        <div className="space-y-2">
          <EquationBlock latex="U(S,0)=\max(K-S,0)" />
          <EquationBlock latex="U(0,t)=K, \qquad U(S^*,t)=0" />
          <EquationBlock latex="U(S,t)\geq \max(K-S,0)" caption="Early-exercise constraint" />
        </div>
      )}
    </PageLayout>
  )
}
