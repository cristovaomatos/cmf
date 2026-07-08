import { useState, type ReactNode } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { PageTabs } from '../components/Navigation/PageTabs'
import { ExplicitImplicitAnimator } from '../components/Visuals/ExplicitImplicitAnimator'
import { MethodStencil } from '../components/Visuals/MethodStencil'

function Interpretation({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-300">
      <div className="bg-slate-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
        Interpretation
      </div>
      <div className="bg-slate-50 px-3 py-2 text-sm text-slate-700">{children}</div>
    </div>
  )
}

type Method = 'explicit' | 'implicit'

export default function ExplicitImplicitMethods() {
  const [method, setMethod] = useState<Method>('explicit')

  return (
    <PageLayout
      title="Explicit and Implicit Methods"
      rightPanel={{
        known: 'The values at time level j (used directly by the explicit method).',
        unknown: 'The values at time level j+1: computed directly (explicit) or via a linear system (implicit).',
        method: 'Evaluate the spatial finite differences at level j (explicit) or at the unknown level j+1 (implicit).',
        takeaway:
          'The explicit method avoids a linear system but is only conditionally stable; the implicit method is unconditionally stable but requires solving a tridiagonal system at every time step.',
      }}
    >
      <p className="text-slate-700">
        Starting from the Black-Scholes PDE in forward time,
      </p>
      <EquationBlock latex="\frac{\partial U}{\partial t} = \frac{\sigma^2}{2}S^2\frac{\partial^2 U}{\partial S^2} + rS\frac{\partial U}{\partial S} - rU" />
      <p className="text-slate-700">
        the spatial derivatives are replaced by centered differences, but the time level at which they
        are evaluated is a choice: the known level <InlineEquation latex="j" /> gives the explicit method,
        the unknown level <InlineEquation latex="j+1" /> gives the implicit method.
      </p>

      <PageTabs
        tabs={[
          { id: 'explicit', label: 'Explicit method' },
          { id: 'implicit', label: 'Implicit method' },
        ]}
        active={method}
        onChange={(id) => setMethod(id as Method)}
      />

      <ExplicitImplicitAnimator key={method} method={method} />

      {method === 'explicit' ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            We evaluate all spatial finite differences at time level <InlineEquation latex="j" />:
          </p>
          <EquationBlock latex="\frac{U_{i,j+1}-U_{i,j}}{h_t} = \frac{\sigma^2}{2}S_i^2\left(\frac{U_{i+1,j}-2U_{i,j}+U_{i-1,j}}{h_S^2}\right) + rS_i\left(\frac{U_{i+1,j}-U_{i-1,j}}{2h_S}\right) - rU_{i,j}" />
          <p className="text-sm text-slate-600">
            Multiplying by <InlineEquation latex="h_t" /> and isolating <InlineEquation latex="U_{i,j+1}" />,
          </p>
          <EquationBlock latex="U_{i,j+1} = U_{i,j} + \frac{\sigma^2}{2}S_i^2 h_t\left(\frac{U_{i+1,j}-2U_{i,j}+U_{i-1,j}}{h_S^2}\right) + rS_i h_t\left(\frac{U_{i+1,j}-U_{i-1,j}}{2h_S}\right) - rh_t U_{i,j}" />
          <p className="text-sm text-slate-600">
            Collecting terms and using <InlineEquation latex="S_i/h_S = i" />, the final explicit update is
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <MethodStencil method="explicit" />
            </div>
            <div className="flex-1">
              <EquationBlock latex="U_{i,j+1} = a_i\,U_{i-1,j} + b_i\,U_{i,j} + c_i\,U_{i+1,j}" />
              <p className="mb-1 mt-3 text-sm text-slate-600">with</p>
              <EquationBlock latex="a_i = \frac{h_t}{2}(\sigma^2 i^2-ri), \qquad b_i = 1-\sigma^2 i^2h_t-rh_t, \qquad c_i = \frac{h_t}{2}(\sigma^2 i^2+ri)" />
              <p className="mt-1 text-xs text-slate-500">
                for <InlineEquation latex="i=1,\ldots,N_S-1" /> and <InlineEquation latex="j=0,\ldots,N_t-1" />.
              </p>
            </div>
          </div>
          <Interpretation>
            The explicit method computes <InlineEquation latex="U_{i,j+1}" /> directly from known values at
            time level <InlineEquation latex="j" />.
          </Interpretation>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            The implicit method evaluates the spatial finite differences at the unknown time level{' '}
            <InlineEquation latex="j+1" />:
          </p>
          <EquationBlock latex="\frac{U_{i,j+1}-U_{i,j}}{h_t} = \frac{\sigma^2}{2}S_i^2\left(\frac{U_{i+1,j+1}-2U_{i,j+1}+U_{i-1,j+1}}{h_S^2}\right) + rS_i\left(\frac{U_{i+1,j+1}-U_{i-1,j+1}}{2h_S}\right) - rU_{i,j+1}" />
          <p className="text-sm text-slate-600">
            Multiplying by <InlineEquation latex="h_t" /> and collecting unknowns on the left-hand side gives
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <MethodStencil method="implicit" />
            </div>
            <div className="flex-1">
              <EquationBlock latex="-\frac{h_t}{2}(\sigma^2 i^2-ri)\,U_{i-1,j+1} + (1+\sigma^2 i^2 h_t+rh_t)\,U_{i,j+1} - \frac{h_t}{2}(\sigma^2 i^2+ri)\,U_{i+1,j+1} = U_{i,j}" />
            </div>
          </div>
          <p className="text-sm text-slate-600">Equivalently, define</p>
          <EquationBlock latex="\alpha_i^I = -\frac{h_t}{2}(\sigma^2 i^2-ri), \qquad \beta_i^I = 1+\sigma^2 i^2 h_t+rh_t, \qquad \gamma_i^I = -\frac{h_t}{2}(\sigma^2 i^2+ri)" />
          <p className="text-sm text-slate-600">Then</p>
          <EquationBlock latex="\alpha_i^I\,U_{i-1,j+1} + \beta_i^I\,U_{i,j+1} + \gamma_i^I\,U_{i+1,j+1} = U_{i,j}" />
          <Interpretation>
            The implicit method requires solving a tridiagonal linear system at each time step.
          </Interpretation>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">Implicit method in matrix form</h2>
            <p className="mb-2 text-sm text-slate-600">Let</p>
            <EquationBlock latex="\mathbf{U}^{j+1} = \begin{pmatrix} U_{1,j+1} \\ U_{2,j+1} \\ \vdots \\ U_{N_S-1,j+1} \end{pmatrix}" />
            <p className="mb-2 mt-3 text-sm text-slate-600">Then</p>
            <EquationBlock latex="A_I\,\mathbf{U}^{j+1} = \mathbf{U}^j + \mathbf{q}_I^{j+1}" />
            <p className="mb-2 mt-3 text-sm text-slate-600">where</p>
            <EquationBlock latex="A_I = \begin{pmatrix} \beta_1^I & \gamma_1^I & 0 & \cdots & 0 \\ \alpha_2^I & \beta_2^I & \gamma_2^I & \ddots & \vdots \\ 0 & \alpha_3^I & \beta_3^I & \ddots & 0 \\ \vdots & \ddots & \ddots & \ddots & \gamma_{N_S-2}^I \\ 0 & \cdots & 0 & \alpha_{N_S-1}^I & \beta_{N_S-1}^I \end{pmatrix}" />
            <EquationBlock latex="\mathbf{q}_I^{j+1} = \begin{pmatrix} -\alpha_1^I U_{0,j+1} \\ 0 \\ \vdots \\ 0 \\ -\gamma_{N_S-1}^I U_{N_S,j+1} \end{pmatrix}" />
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Summary of schemes</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
              <th className="py-2 pr-4">Method</th>
              <th className="py-2 pr-4">Time level used</th>
              <th className="py-2 pr-4">Linear system?</th>
              <th className="py-2 pr-4">Time accuracy</th>
              <th className="py-2 pr-4">Space accuracy</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium text-slate-800">Explicit</td>
              <td className="py-2 pr-4">only j</td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2 pr-4"><InlineEquation latex="O(h_t)" /></td>
              <td className="py-2 pr-4"><InlineEquation latex="O(h_S^2)" /></td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-slate-800">Implicit</td>
              <td className="py-2 pr-4">only j+1</td>
              <td className="py-2 pr-4">Yes, tridiagonal</td>
              <td className="py-2 pr-4"><InlineEquation latex="O(h_t)" /></td>
              <td className="py-2 pr-4"><InlineEquation latex="O(h_S^2)" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageLayout>
  )
}
