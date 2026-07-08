import type { ReactNode } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
import { MethodStencil } from '../components/Visuals/MethodStencil'
import { ExplicitMethodCalculationExample } from '../components/Visuals/ExplicitMethodCalculationExample'

function SmallEquation({ latex }: { latex: string }) {
  return (
    <div className="overflow-x-auto py-0 text-base leading-tight text-slate-900 [&_.katex-display]:my-0.5">
      <Katex math={latex} display />
    </div>
  )
}

function DerivationText({ children }: { children: ReactNode }) {
  return <p className="text-base leading-6 text-slate-700">{children}</p>
}

export default function ExplicitMethod() {
  return (
    <PageLayout
      title="Explicit Method"
      rightPanel={{
        known: 'Initial values U_{i,0} and boundary values U_{0,j}, U_{N_S,j}.',
        unknown: 'Interior values U_{i,j+1}, computed one point at a time from the previous time level.',
        method: 'Use centered finite differences in S and a forward difference in time.',
        takeaway:
          'The explicit method is simple and local, but the time step must satisfy a stability restriction.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Derivation</h2>
        <p className="text-slate-700">
          After reversing time with <InlineEquation latex="U(S,t)=V(S,T-t)" />, the Black-Scholes PDE becomes
          an initial-boundary value problem:
        </p>
        <EquationBlock latex="\frac{\partial U}{\partial t}=\frac{\sigma^2}{2}S^2\frac{\partial^2 U}{\partial S^2}+rS\frac{\partial U}{\partial S}-rU" />
        <p className="text-slate-700">
          On the grid <InlineEquation latex="S_i=i h_S" />, <InlineEquation latex="t_j=j h_t" />, with{' '}
          <InlineEquation latex="U_{i,j}\approx U(S_i,t_j)" />, the explicit method evaluates all spatial
          differences at the known level <InlineEquation latex="j" />:
        </p>
        <EquationBlock latex="\frac{U_{i,j+1}-U_{i,j}}{h_t}=\frac{\sigma^2}{2}S_i^2\left(\frac{U_{i+1,j}-2U_{i,j}+U_{i-1,j}}{h_S^2}\right)+rS_i\left(\frac{U_{i+1,j}-U_{i-1,j}}{2h_S}\right)-rU_{i,j}" />
        <p className="text-slate-700">
          Multiplying by <InlineEquation latex="h_t" />, isolating <InlineEquation latex="U_{i,j+1}" />, and
          using <InlineEquation latex="S_i/h_S=i" /> gives the pointwise update
        </p>
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
          <MethodStencil method="explicit" />
          <div className="space-y-3">
            <EquationBlock latex="U_{i,j+1}=a_iU_{i-1,j}+b_iU_{i,j}+c_iU_{i+1,j}" />
            <EquationBlock latex="a_i=\frac{h_t}{2}(\sigma^2 i^2-ri),\qquad b_i=1-\sigma^2 i^2h_t-rh_t,\qquad c_i=\frac{h_t}{2}(\sigma^2 i^2+ri)" />
            <p className="text-sm text-slate-600">
              This holds for <InlineEquation latex="i=1,\ldots,N_S-1" /> and{' '}
              <InlineEquation latex="j=0,\ldots,N_t-1" />.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Approximation Order</h2>
        <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-slate-700">
          The explicit scheme uses a forward difference in time and centered differences in space. Therefore
          it is first order in time and second order in space:
          <div className="mt-2">
            <InlineEquation latex="\text{local accuracy}=O(h_t+h_S^2)" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Known data</p>
            <div className="text-slate-800">
              <InlineEquation latex="U_{i,0}=u_0(S_i)" />
            </div>
            <div className="mt-2 text-slate-800">
              <InlineEquation latex="U_{0,j}=u_a(t_j)" />
            </div>
            <div className="mt-2 text-slate-800">
              <InlineEquation latex="U_{N_S,j}=u_b(t_j)" />
            </div>
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Sweep</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Set the initial row from the payoff.</li>
              <li>For each time level j, set the two boundary values at j+1.</li>
              <li>For i from 1 to N_S-1, compute U_i,j+1 directly from U_i-1,j, U_i,j, U_i+1,j.</li>
              <li>Move to the next row until j=N_t.</li>
            </ol>
          </div>
        </div>
        <EquationBlock latex="\text{for }j=0,\ldots,N_t-1,\quad \text{for }i=1,\ldots,N_S-1:\quad U_{i,j+1}=a_iU_{i-1,j}+b_iU_{i,j}+c_iU_{i+1,j}" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Stability Analysis</h2>
        <p className="text-slate-700">
          The local Von Neumann analysis freezes the coefficients at each spatial node and checks the
          corresponding amplification factor. This is necessary because the coefficients depend on{' '}
          <InlineEquation latex="i" />.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 border-l-2 border-slate-300 pl-4">
            <p className="mb-2 text-sm font-semibold text-slate-900">Local Von Neumann condition</p>
            <SmallEquation latex="\left[1-rh_t-2\sigma^2i^2h_t\sin^2\left(\frac{\theta}{2}\right)\right]^2+\left[rih_t\sin\theta\right]^2\le 1" />
            <p className="mt-2 text-sm text-slate-600">
              This must hold for every wave number <InlineEquation latex="\theta" /> and every interior node{' '}
              <InlineEquation latex="i=1,\ldots,N_S-1" />.
            </p>
          </div>
          <div className="space-y-2 border-l-2 border-slate-300 pl-4">
            <p className="mb-2 text-sm font-semibold text-slate-900">Practical sufficient condition</p>
            <SmallEquation latex="\sigma^2\ge r,\qquad h_t\le \frac{1}{\sigma^2(N_S-1)^2+r}" />
            <p className="mt-2 text-sm text-slate-600">
              This stronger condition makes the explicit update monotone by forcing{' '}
              <InlineEquation latex="a_i,b_i,c_i\ge 0" />.
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          With <InlineEquation latex="r=0.06" />, <InlineEquation latex="\sigma=0.30" />,{' '}
          <InlineEquation latex="N_S=10" />, and <InlineEquation latex="N_t=10" />, the default grid has{' '}
          <InlineEquation latex="h_t=0.1" /> and satisfies the sufficient time-step restriction.
        </p>
        <details className="rounded-md border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">
            Full Stability Analysis derivation
          </summary>
          <div className="space-y-1.5 border-t border-slate-200 px-4 py-3">
            <DerivationText>We now analyse the stability of the explicit scheme</DerivationText>
            <SmallEquation latex="U_{i,j+1}=a_iU_{i-1,j}+b_iU_{i,j}+c_iU_{i+1,j}" />
            <DerivationText>where</DerivationText>
            <SmallEquation latex="a_i=\frac{h_t}{2}\bigl(\sigma^2i^2-ri\bigr),\qquad b_i=1-\sigma^2i^2h_t-rh_t,\qquad c_i=\frac{h_t}{2}\bigl(\sigma^2i^2+ri\bigr)." />
            <DerivationText>
              For the heat equation, the Von Neumann analysis can be applied directly because the coefficients
              of the finite-difference scheme are constant. In the Black-Scholes equation, however, the
              coefficient multiplying the second derivative is <InlineEquation latex="\frac{\sigma^2}{2}S^2" />,
              and the coefficient multiplying the first derivative is <InlineEquation latex="rS" />. Therefore,
              after discretisation on the uniform grid <InlineEquation latex="S_i=ih_S" />, the coefficients
              depend on the spatial index <InlineEquation latex="i" />.
            </DerivationText>
            <DerivationText>
              For this reason, we perform a local Von Neumann analysis: at a fixed spatial node{' '}
              <InlineEquation latex="i" />, we freeze the coefficients <InlineEquation latex="a_i,b_i,c_i" /> and
              study the behaviour of a Fourier mode
            </DerivationText>
            <SmallEquation latex="U_{i,j}=R_j e^{\mathrm{i}\theta i}," />
            <DerivationText>
              where <InlineEquation latex="\mathrm{i}=\sqrt{-1}" /> and <InlineEquation latex="\theta" /> is the
              dimensionless wave number.
            </DerivationText>
            <DerivationText>Substituting this expression into the explicit scheme gives</DerivationText>
            <SmallEquation latex="R_{j+1}e^{\mathrm{i}\theta i}=a_iR_je^{\mathrm{i}\theta(i-1)}+b_iR_je^{\mathrm{i}\theta i}+c_iR_je^{\mathrm{i}\theta(i+1)}." />
            <DerivationText>
              Dividing by <InlineEquation latex="R_je^{\mathrm{i}\theta i}" />, we obtain the amplification
              factor
            </DerivationText>
            <SmallEquation latex="G_i(\theta):=\frac{R_{j+1}}{R_j}=a_ie^{-\mathrm{i}\theta}+b_i+c_ie^{\mathrm{i}\theta}." />
            <DerivationText>Using</DerivationText>
            <SmallEquation latex="e^{\mathrm{i}\theta}+e^{-\mathrm{i}\theta}=2\cos\theta,\qquad e^{\mathrm{i}\theta}-e^{-\mathrm{i}\theta}=2\mathrm{i}\sin\theta," />
            <DerivationText>we can write</DerivationText>
            <SmallEquation latex="G_i(\theta)=b_i+(a_i+c_i)\cos\theta+\mathrm{i}(c_i-a_i)\sin\theta." />
            <DerivationText>Since</DerivationText>
            <SmallEquation latex="a_i+c_i=\sigma^2i^2h_t,\qquad c_i-a_i=rih_t," />
            <DerivationText>we get</DerivationText>
            <SmallEquation latex="G_i(\theta)=1-\sigma^2i^2h_t-rh_t+\sigma^2i^2h_t\cos\theta+\mathrm{i}rih_t\sin\theta." />
            <DerivationText>
              Equivalently, using <InlineEquation latex="1-\cos\theta=2\sin^2(\theta/2)" />,
            </DerivationText>
            <SmallEquation latex="G_i(\theta)=1-rh_t-2\sigma^2i^2h_t\sin^2\left(\frac{\theta}{2}\right)+\mathrm{i}rih_t\sin\theta." />
            <DerivationText>The Von Neumann stability condition requires</DerivationText>
            <SmallEquation latex="|G_i(\theta)|\leq 1" />
            <DerivationText>
              for every wave number <InlineEquation latex="\theta" /> and for every interior node{' '}
              <InlineEquation latex="i=1,\ldots,N_S-1" />. Therefore,
            </DerivationText>
            <SmallEquation latex="\left[1-rh_t-2\sigma^2i^2h_t\sin^2\left(\frac{\theta}{2}\right)\right]^2+\left[rih_t\sin\theta\right]^2\leq 1." />
            <DerivationText>
              This is the local Von Neumann stability condition for the centered explicit Black-Scholes scheme.
              Unlike the heat equation condition, it is not a simple single restriction on{' '}
              <InlineEquation latex="h_t/h_S^2" />, because the amplification factor contains both the diffusion
              contribution and the drift contribution.
            </DerivationText>
            <DerivationText>
              A simple sufficient condition is obtained by requiring the explicit update to be monotone, that is,
              by requiring all weights to be non-negative:
            </DerivationText>
            <SmallEquation latex="a_i\geq 0,\qquad b_i\geq 0,\qquad c_i\geq 0,\qquad i=1,\ldots,N_S-1." />
            <DerivationText>
              This condition is stronger than the exact Von Neumann condition, but it is easier to interpret. If
              the weights are non-negative, then
            </DerivationText>
            <SmallEquation latex="\begin{aligned}|G_i(\theta)|&=\left|a_ie^{-\mathrm{i}\theta}+b_i+c_ie^{\mathrm{i}\theta}\right|\\&\leq a_i+b_i+c_i.\end{aligned}" />
            <DerivationText>But</DerivationText>
            <SmallEquation latex="a_i+b_i+c_i=1-rh_t." />
            <DerivationText>Therefore, if <InlineEquation latex="a_i,b_i,c_i\geq 0" />, then</DerivationText>
            <SmallEquation latex="|G_i(\theta)|\leq 1-rh_t\leq 1," />
            <DerivationText>
              provided <InlineEquation latex="h_t>0" /> and <InlineEquation latex="rh_t\leq 1" />. Hence, the
              non-negativity of the explicit weights gives a practical sufficient stability condition.
            </DerivationText>
            <DerivationText>We now derive these conditions. First,</DerivationText>
            <SmallEquation latex="a_i=\frac{h_t}{2}\bigl(\sigma^2i^2-ri\bigr)\geq 0." />
            <DerivationText>
              Since <InlineEquation latex="h_t>0" />, this is equivalent to
            </DerivationText>
            <SmallEquation latex="\sigma^2i^2-ri\geq 0." />
            <DerivationText>
              Factoring <InlineEquation latex="i" />, and using <InlineEquation latex="i\geq 1" />, gives
            </DerivationText>
            <SmallEquation latex="\sigma^2i-r\geq 0." />
            <DerivationText>The most restrictive case is <InlineEquation latex="i=1" />. Therefore,</DerivationText>
            <SmallEquation latex="\boxed{\sigma^2\geq r.}" />
            <DerivationText>Second,</DerivationText>
            <SmallEquation latex="b_i=1-\sigma^2i^2h_t-rh_t\geq 0." />
            <DerivationText>Thus,</DerivationText>
            <SmallEquation latex="1-h_t(\sigma^2i^2+r)\geq 0," />
            <DerivationText>or</DerivationText>
            <SmallEquation latex="h_t\leq \frac{1}{\sigma^2i^2+r}." />
            <DerivationText>
              This must hold for every interior node <InlineEquation latex="i=1,\ldots,N_S-1" />. Since the
              denominator is increasing in <InlineEquation latex="i" />, the most restrictive condition occurs
              at <InlineEquation latex="i=N_S-1" />. Hence,
            </DerivationText>
            <SmallEquation latex="\boxed{h_t\leq\frac{1}{\sigma^2(N_S-1)^2+r}.}" />
            <DerivationText>Finally,</DerivationText>
            <SmallEquation latex="c_i=\frac{h_t}{2}\bigl(\sigma^2i^2+ri\bigr)\geq 0" />
            <DerivationText>
              is automatically satisfied for <InlineEquation latex="h_t>0" />, <InlineEquation latex="\sigma>0" />,{' '}
              <InlineEquation latex="r>0" />, and <InlineEquation latex="i\geq 1" />.
            </DerivationText>
            <DerivationText>
              Therefore, a sufficient stability and monotonicity condition for the centered explicit scheme is
            </DerivationText>
            <SmallEquation latex="\boxed{\sigma^2\geq r,\qquad h_t\leq\frac{1}{\sigma^2(N_S-1)^2+r}.}" />
            <DerivationText>
              The explicit Black-Scholes scheme is conditionally stable. The restriction on{' '}
              <InlineEquation latex="h_t" /> becomes more severe as <InlineEquation latex="N_S" /> increases,
              because the coefficient <InlineEquation latex="\sigma^2i^2" /> is largest near the upper boundary{' '}
              <InlineEquation latex="S=S_{\max}" />. This is the Black-Scholes analogue of the heat equation
              restriction <InlineEquation latex="\lambda=h_t/h_S^2\leq 1/2" />, but with spatially dependent
              coefficients.
            </DerivationText>
          </div>
        </details>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Simulation</h2>
        <p className="text-slate-700">
          The example below uses a European option with the course defaults{' '}
          <InlineEquation latex="r=0.06" />, <InlineEquation latex="\sigma=0.30" />,{' '}
          <InlineEquation latex="K=10" />, <InlineEquation latex="T=1" /> and{' '}
          <InlineEquation latex="S^*=15" />. The highlighted amber cells are the known stencil values,
          and the green cell is the value computed from them.
        </p>
        <ExplicitMethodCalculationExample />
      </section>
    </PageLayout>
  )
}
