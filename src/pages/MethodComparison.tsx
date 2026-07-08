import { useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { PageTabs } from '../components/Navigation/PageTabs'
import { InlineEquation } from '../components/Math/EquationBlock'

type Perspective = 'mathematical' | 'computational' | 'financial'

const methods = [
  {
    name: 'Crank-Nicolson',
    problem: 'European put',
    spaceOrder: 'O(h_S^2)',
    timeOrder: 'O(h_t^2)',
    stability: 'Unconditional',
    linearSystem: 'Yes',
    constraint: 'No',
    perspectives: {
      mathematical: 'Averages the spatial operator between two time levels, giving second-order accuracy in both space and time.',
      computational: 'Requires solving one tridiagonal linear system per time step via LU decomposition.',
      financial: 'Produces the full European put value surface V(S,t) with no early-exercise consideration.',
    },
  },
  {
    name: 'Method of Lines + RK4',
    problem: 'European put',
    spaceOrder: 'O(h_S^2)',
    timeOrder: 'O(h_t^4)',
    stability: 'Conditional',
    linearSystem: 'No direct implicit solve',
    constraint: 'No',
    perspectives: {
      mathematical: 'Discretises space first, reducing the PDE to a system of ODEs integrated explicitly with classical RK4.',
      computational: 'No linear system to invert, but the explicit time stepping requires a smaller time step for stability.',
      financial: 'Cross-validates the Crank-Nicolson European put surface using an independent time-integration scheme.',
    },
  },
  {
    name: 'Crank-Nicolson + PSOR',
    problem: 'American put',
    spaceOrder: 'O(h_S^2)',
    timeOrder: 'CN-based',
    stability: 'Iterative',
    linearSystem: 'Yes',
    constraint: 'Yes, obstacle',
    perspectives: {
      mathematical: 'Combines Crank-Nicolson discretisation with a projected relaxation to solve the linear complementarity problem.',
      computational: 'Each time step requires an iterative PSOR solve until the projected residual falls below tolerance.',
      financial: 'Recovers both the American put value and the optimal early-exercise policy via the free boundary S_f(t).',
    },
  },
]

function PipelineDiagram() {
  const steps = ['PDE model', 'Finite-difference grid', 'Numerical method', 'Option value surface', 'Financial interpretation']
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700">{s}</span>
          {i < steps.length - 1 && <span className="text-slate-400">→</span>}
        </div>
      ))}
    </div>
  )
}

export default function MethodComparison() {
  const [perspective, setPerspective] = useState<Perspective>('mathematical')

  return (
    <PageLayout
      title="Method Comparison"
      rightPanel={{
        takeaway:
          'Project 1 demonstrates how a financial pricing problem becomes a PDE problem, how the PDE is discretised, and how the numerical method changes when early exercise introduces an inequality constraint.',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
              <th className="py-2 pr-4">Method</th>
              <th className="py-2 pr-4">Problem</th>
              <th className="py-2 pr-4">Space order</th>
              <th className="py-2 pr-4">Time order</th>
              <th className="py-2 pr-4">Stability</th>
              <th className="py-2 pr-4">Linear system?</th>
              <th className="py-2 pr-4">Constraint?</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => (
              <tr key={m.name} className="border-b border-slate-100">
                <td className="py-2 pr-4 font-medium text-slate-800">{m.name}</td>
                <td className="py-2 pr-4">{m.problem}</td>
                <td className="py-2 pr-4"><InlineEquation latex={m.spaceOrder} /></td>
                <td className="py-2 pr-4">
                  {m.timeOrder.startsWith('O(') ? <InlineEquation latex={m.timeOrder} /> : m.timeOrder}
                </td>
                <td className="py-2 pr-4">{m.stability}</td>
                <td className="py-2 pr-4">{m.linearSystem}</td>
                <td className="py-2 pr-4">{m.constraint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PageTabs
        tabs={[
          { id: 'mathematical', label: 'Mathematical' },
          { id: 'computational', label: 'Computational' },
          { id: 'financial', label: 'Financial' },
        ]}
        active={perspective}
        onChange={(id) => setPerspective(id as Perspective)}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {methods.map((m) => (
          <div key={m.name} className="rounded-lg border border-slate-200 p-4">
            <h3 className="mb-1 font-semibold text-slate-900">{m.name}</h3>
            <p className="mb-2 text-xs text-slate-400">{m.problem}</p>
            <p className="text-sm text-slate-700">{m.perspectives[perspective]}</p>
          </div>
        ))}
      </div>

      <PipelineDiagram />
    </PageLayout>
  )
}
