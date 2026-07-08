import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { PayoffChart } from '../components/Visuals/PayoffChart'

export default function EuropeanAmericanOptions() {
  return (
    <PageLayout
      title="European and American Options"
      rightPanel={{
        known: 'The payoff, maturity, strike, and exercise rights.',
        unknown: 'Whether exercise is allowed only at maturity or also before maturity.',
        method: 'Translate the financial contract into terminal, boundary, and constraint conditions.',
        takeaway:
          'European options solve a PDE with equality; American options add an inequality constraint and a free boundary.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Exercise Style</h2>
        <p className="text-slate-700">
          The difference between European and American options is not the payoff shape. It is the set of
          dates on which the holder is allowed to exercise.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">European option</p>
            <p className="mt-1 text-sm text-slate-700">
              Exercise is allowed only at maturity <InlineEquation latex="t=T" />.
            </p>
            <EquationBlock latex="V(S,T)=u_0(S)" />
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">American option</p>
            <p className="mt-1 text-sm text-slate-700">
              Exercise is allowed at any time <InlineEquation latex="0\leq t\leq T" />.
            </p>
            <EquationBlock latex="V(S,t)\geq u_0(S)" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Same Payoff, Different Problem</h2>
        <p className="text-slate-700">
          A European put and an American put have the same immediate exercise payoff:
        </p>
        <EquationBlock latex="u_0(S)=\max(K-S,0)." />
        <PayoffChart kind="put" />
        <p className="text-slate-700">
          The difference appears before maturity. The European holder cannot exercise early, so the value
          is determined by the Black-Scholes PDE until the terminal payoff is reached. The American holder
          compares the continuation value with the immediate exercise payoff at every time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">European PDE Problem</h2>
        <p className="text-slate-700">
          For a European option, the value <InlineEquation latex="V(S,t)" /> satisfies the Black-Scholes
          equation in the continuation domain, together with the terminal condition
          <InlineEquation latex="V(S,T)=u_0(S)" />:
        </p>
        <EquationBlock latex="\frac{\partial V}{\partial t}+\frac{\sigma^2}{2}S^2\frac{\partial^2V}{\partial S^2}+rS\frac{\partial V}{\partial S}-rV=0,\qquad V(S,T)=u_0(S)." />
        <p className="text-slate-700">
          After reversing time with <InlineEquation latex="\tau=T-t" />, the same problem is solved
          forward in <InlineEquation latex="\tau" /> as
        </p>
        <EquationBlock latex="\frac{\partial U}{\partial \tau}=\frac{\sigma^2}{2}S^2\frac{\partial^2U}{\partial S^2}+rS\frac{\partial U}{\partial S}-rU,\qquad U(S,0)=u_0(S)." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">American Exercise Decision</h2>
        <p className="text-slate-700">
          At a given node, the American holder compares two quantities: the immediate exercise payoff and
          the value of continuing to hold the option.
        </p>
        <EquationBlock latex="V_{\mathrm{American}}(S,t)=\max\{\text{exercise value},\ \text{continuation value}\}." />
        <p className="text-slate-700">
          In reversed time, for an American put, this becomes the obstacle condition
          <InlineEquation latex="U(S,\tau)\geq g(S)" />, where
        </p>
        <EquationBlock latex="g(S)=\max(K-S,0)." />
        <p className="text-slate-700">
          The complementary formulation separates the continuation region from the exercise region:
        </p>
        <EquationBlock latex="\begin{aligned}U-g&\geq0,\\ \frac{\partial U}{\partial \tau}-L_{BS}(U)&\geq0,\\ (U-g)\left(\frac{\partial U}{\partial \tau}-L_{BS}(U)\right)&=0.\end{aligned}" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Continuation region</p>
            <p className="mt-1 text-sm text-slate-700">
              <InlineEquation latex="U(S,\tau)>g(S)" />. Waiting is optimal and the Black-Scholes PDE holds
              as an equality.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Exercise region</p>
            <p className="mt-1 text-sm text-slate-700">
              <InlineEquation latex="U(S,\tau)=g(S)" />. Immediate exercise is optimal and the value is
              pinned to the payoff.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Computational Consequence</h2>
        <p className="text-slate-700">
          European options lead to equality problems: explicit, implicit, Crank-Nicolson, and Method of
          Lines schemes compute the next time level from the PDE. American options add an inequality,
          which turns each time step into a constrained problem.
        </p>
        <EquationBlock latex="\mathbf U^{j+1}\geq \mathbf g,\qquad \mathbf g=(g_1,\ldots,g_{N_S-1})^T." />
        <p className="text-slate-700">
          This is why the American option pages introduce the obstacle problem and the PSOR method.
        </p>
      </section>
    </PageLayout>
  )
}
