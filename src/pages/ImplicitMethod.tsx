import type { ReactNode } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
import { MethodStencil } from '../components/Visuals/MethodStencil'
import { ImplicitMethodCalculationExample } from '../components/Visuals/ImplicitMethodCalculationExample'

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

export default function ImplicitMethod() {
  return (
    <PageLayout
      title="Implicit Method"
      rightPanel={{
        known: 'Initial values and boundary values, plus the previous time row U^j.',
        unknown: 'The whole interior vector U^{j+1}, solved together from a tridiagonal system.',
        method: 'Evaluate the spatial finite differences at the unknown time level j+1.',
        takeaway:
          'The implicit method is first order in time, second order in space, and unconditionally stable.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Derivation</h2>
        <p className="text-slate-700">
          Starting again from the forward-time Black-Scholes equation for{' '}
          <InlineEquation latex="U(S,t)=V(S,T-t)" />,
        </p>
        <EquationBlock latex="\frac{\partial U}{\partial t}=\frac{\sigma^2}{2}S^2\frac{\partial^2 U}{\partial S^2}+rS\frac{\partial U}{\partial S}-rU" />
        <p className="text-slate-700">
          the implicit method evaluates the spatial finite differences at the unknown level{' '}
          <InlineEquation latex="j+1" />:
        </p>
        <EquationBlock latex="\frac{U_{i,j+1}-U_{i,j}}{h_t}=\frac{\sigma^2}{2}S_i^2\left(\frac{U_{i+1,j+1}-2U_{i,j+1}+U_{i-1,j+1}}{h_S^2}\right)+rS_i\left(\frac{U_{i+1,j+1}-U_{i-1,j+1}}{2h_S}\right)-rU_{i,j+1}" />
        <p className="text-slate-700">
          Multiplying by <InlineEquation latex="h_t" />, collecting unknowns on the left, and using{' '}
          <InlineEquation latex="S_i/h_S=i" /> gives
        </p>
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
          <MethodStencil method="implicit" />
          <div className="space-y-3">
            <EquationBlock latex="\alpha_i^I U_{i-1,j+1}+\beta_i^I U_{i,j+1}+\gamma_i^I U_{i+1,j+1}=U_{i,j}" />
            <EquationBlock latex="\alpha_i^I=-\frac{h_t}{2}(\sigma^2i^2-ri),\qquad \beta_i^I=1+\sigma^2i^2h_t+rh_t,\qquad \gamma_i^I=-\frac{h_t}{2}(\sigma^2i^2+ri)" />
            <p className="text-sm text-slate-600">
              This holds for <InlineEquation latex="i=1,\ldots,N_S-1" /> and{' '}
              <InlineEquation latex="j=0,\ldots,N_t-1" />.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Approximation Order</h2>
        <div className="rounded-md border border-violet-200 bg-violet-50 px-4 py-3 text-slate-700">
          The implicit scheme uses a backward difference in time and centered differences in space. Therefore
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
              <li>Build the tridiagonal matrix <InlineEquation latex="A_I" /> from the implicit coefficients.</li>
              <li>At time step <InlineEquation latex="j" />, set the future boundary values at <InlineEquation latex="j+1" />.</li>
              <li>Assemble <InlineEquation latex="\mathbf U^j+\mathbf q_I^{j+1}" />.</li>
              <li>Solve <InlineEquation latex="A_I\mathbf U^{j+1}=\mathbf U^j+\mathbf q_I^{j+1}" />.</li>
            </ol>
          </div>
        </div>
        <EquationBlock latex="A_I\mathbf U^{j+1}=\mathbf U^j+\mathbf q_I^{j+1}" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Matrix Form</h2>
        <p className="text-slate-700">
          Let <InlineEquation latex="\mathbf U^{j+1}=(U_{1,j+1},U_{2,j+1},\ldots,U_{N_S-1,j+1})^T" />. Then
        </p>
        <EquationBlock latex="A_I=\begin{pmatrix}\beta_1^I&\gamma_1^I&0&\cdots&0\\ \alpha_2^I&\beta_2^I&\gamma_2^I&\ddots&\vdots\\0&\alpha_3^I&\beta_3^I&\ddots&0\\ \vdots&\ddots&\ddots&\ddots&\gamma_{N_S-2}^I\\0&\cdots&0&\alpha_{N_S-1}^I&\beta_{N_S-1}^I\end{pmatrix}" />
        <EquationBlock latex="\mathbf q_I^{j+1}=\begin{pmatrix}-\alpha_1^I U_{0,j+1}\\0\\\vdots\\0\\-\gamma_{N_S-1}^I U_{N_S,j+1}\end{pmatrix}" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Stability Analysis</h2>
        <p className="text-slate-700">
          The local Von Neumann analysis freezes the coefficients at a fixed spatial node and studies a
          Fourier mode. The implicit amplification factor appears in the denominator.
        </p>
        <div className="space-y-2 border-l-2 border-slate-300 pl-4">
          <p className="mb-2 text-sm font-semibold text-slate-900">Result</p>
          <SmallEquation latex="G_i(\theta)=\frac{1}{1+rh_t+2\sigma^2i^2h_t\sin^2(\theta/2)-\mathrm{i}rih_t\sin\theta}" />
          <p className="text-sm text-slate-600">
            For <InlineEquation latex="r\ge 0" />, <InlineEquation latex="\sigma>0" />, and{' '}
            <InlineEquation latex="h_t>0" />, the denominator has modulus at least one. Hence{' '}
            <InlineEquation latex="|G_i(\theta)|\le 1" /> for every <InlineEquation latex="\theta" /> and every
            interior node. The implicit method is unconditionally stable.
          </p>
        </div>
        <details className="rounded-md border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">
            Full Stability Analysis derivation
          </summary>
          <div className="space-y-1.5 border-t border-slate-200 px-4 py-3">
            <DerivationText>
              We analyse the stability of the implicit scheme using a local Von Neumann argument. At a fixed
              node <InlineEquation latex="i" />, freeze the coefficients and start from
            </DerivationText>
            <SmallEquation latex="\alpha_i^I U_{i-1,j+1}+\beta_i^I U_{i,j+1}+\gamma_i^I U_{i+1,j+1}=U_{i,j}." />
            <DerivationText>Take the Fourier mode</DerivationText>
            <SmallEquation latex="U_{i,j}=R_j e^{\mathrm{i}\theta i}," />
            <DerivationText>
              where <InlineEquation latex="\mathrm{i}=\sqrt{-1}" /> and <InlineEquation latex="\theta" /> is
              the dimensionless wave number. Substituting into the implicit scheme gives
            </DerivationText>
            <SmallEquation latex="\alpha_i^I R_{j+1}e^{\mathrm{i}\theta(i-1)}+\beta_i^I R_{j+1}e^{\mathrm{i}\theta i}+\gamma_i^I R_{j+1}e^{\mathrm{i}\theta(i+1)}=R_j e^{\mathrm{i}\theta i}." />
            <DerivationText>Dividing by <InlineEquation latex="e^{\mathrm{i}\theta i}" />,</DerivationText>
            <SmallEquation latex="R_{j+1}\left(\alpha_i^I e^{-\mathrm{i}\theta}+\beta_i^I+\gamma_i^I e^{\mathrm{i}\theta}\right)=R_j." />
            <DerivationText>Therefore</DerivationText>
            <SmallEquation latex="G_i(\theta):=\frac{R_{j+1}}{R_j}=\frac{1}{\alpha_i^Ie^{-\mathrm{i}\theta}+\beta_i^I+\gamma_i^Ie^{\mathrm{i}\theta}}." />
            <DerivationText>Using the trigonometric exponential identities,</DerivationText>
            <SmallEquation latex="\alpha_i^Ie^{-\mathrm{i}\theta}+\beta_i^I+\gamma_i^Ie^{\mathrm{i}\theta}=\beta_i^I+(\alpha_i^I+\gamma_i^I)\cos\theta+\mathrm{i}(\gamma_i^I-\alpha_i^I)\sin\theta." />
            <DerivationText>From the implicit coefficients,</DerivationText>
            <SmallEquation latex="\alpha_i^I+\gamma_i^I=-\sigma^2i^2h_t,\qquad \gamma_i^I-\alpha_i^I=-rih_t." />
            <DerivationText>Hence</DerivationText>
            <SmallEquation latex="\alpha_i^Ie^{-\mathrm{i}\theta}+\beta_i^I+\gamma_i^Ie^{\mathrm{i}\theta}=1+rh_t+\sigma^2i^2h_t(1-\cos\theta)-\mathrm{i}rih_t\sin\theta." />
            <SmallEquation latex="=1+rh_t+2\sigma^2i^2h_t\sin^2\left(\frac{\theta}{2}\right)-\mathrm{i}rih_t\sin\theta." />
            <DerivationText>Therefore,</DerivationText>
            <SmallEquation latex="G_i(\theta)=\frac{1}{1+rh_t+2\sigma^2i^2h_t\sin^2(\theta/2)-\mathrm{i}rih_t\sin\theta}." />
            <DerivationText>The Von Neumann condition requires <InlineEquation latex="|G_i(\theta)|\le 1" />. From the previous expression,</DerivationText>
            <SmallEquation latex="|G_i(\theta)|^2=\frac{1}{\left[1+rh_t+2\sigma^2i^2h_t\sin^2(\theta/2)\right]^2+\left[rih_t\sin\theta\right]^2}." />
            <DerivationText>
              If <InlineEquation latex="r\ge 0" />, <InlineEquation latex="\sigma>0" />, and{' '}
              <InlineEquation latex="h_t>0" />, then the denominator is always at least one. Thus{' '}
              <InlineEquation latex="|G_i(\theta)|\le 1" /> for every wave number and every interior node.
              The implicit method is unconditionally stable in the Von Neumann sense.
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
          <InlineEquation latex="S^*=15" />. The highlighted future row is solved as one tridiagonal system.
        </p>
        <ImplicitMethodCalculationExample />
      </section>
    </PageLayout>
  )
}
