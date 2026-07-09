import type { ReactNode } from 'react'
import { MatlabCodePanel } from '../components/Code/MatlabCodePanel'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
import { MethodOfLinesNameDiagram } from '../components/Visuals/MethodOfLinesNameDiagram'
import { MethodStencil } from '../components/Visuals/MethodStencil'
import { MethodOfLinesRK4CalculationExample } from '../components/Visuals/MethodOfLinesRK4CalculationExample'
import { bsMolRk4Snippets } from '../data/matlabSnippets'

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

export default function MethodOfLinesRK4() {
  return (
    <PageLayout
      title="Method of Lines with RK4"
      rightPanel={{
        known: 'Initial values, boundary functions, and the semi-discrete spatial operator.',
        unknown: 'The interior vector W(t), advanced in time with RK4.',
        method: 'Discretise space first, then integrate the resulting ODE system with classical RK4.',
        takeaway:
          'MOL with RK4 is second order in space, fourth order in time, and conditionally stable because RK4 is explicit.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Derivation</h2>
        <p className="text-slate-700">
          The Method of Lines discretises only the spatial variable first. Starting from the forward-time
          Black-Scholes equation, define
        </p>
        <EquationBlock latex="\frac{\partial U}{\partial t}(S,t)=G(S,t),\qquad G(S,t):=\frac{\sigma^2}{2}S^2\frac{\partial^2U}{\partial S^2}(S,t)+rS\frac{\partial U}{\partial S}(S,t)-rU(S,t)" />
        <p className="text-slate-700">
          Define the spatial grid while keeping time continuous:
        </p>
        <EquationBlock latex="S_i=h_Si,\qquad i=0,\ldots,N_S,\qquad h_S=\frac{S^*}{N_S}." />
        <p className="text-slate-700">
          The boundary values <InlineEquation latex="U(S_0,t)" /> and <InlineEquation latex="U(S_{N_S},t)" /> are
          known. At each fixed time, centered differences approximate the spatial derivatives:
        </p>
        <EquationBlock latex="\frac{\partial U}{\partial S}(S_i,t)=\frac{U(S_{i+1},t)-U(S_{i-1},t)}{2h_S}+O(h_S^2)" />
        <EquationBlock latex="\frac{\partial^2U}{\partial S^2}(S_i,t)=\frac{U(S_{i+1},t)-2U(S_i,t)+U(S_{i-1},t)}{h_S^2}+O(h_S^2)" />
        <p className="text-slate-700">
          Neglecting the <InlineEquation latex="O(h_S^2)" /> terms and using
          <InlineEquation latex="S_i/h_S=i" />, equation <InlineEquation latex="G(S_i,t)" /> becomes
        </p>
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
          <MethodStencil method="mol" />
          <div className="space-y-3">
            <EquationBlock latex="G(S_i,t)\approx\alpha_iU(S_{i-1},t)+\beta_iU(S_i,t)+\gamma_iU(S_{i+1},t)" />
            <EquationBlock latex="\alpha_i=\frac{\sigma^2}{2}i^2-\frac{r}{2}i,\qquad \beta_i=-\sigma^2i^2-r,\qquad \gamma_i=\frac{\sigma^2}{2}i^2+\frac{r}{2}i" />
            <p className="text-sm text-slate-600">
              The three spatial values at the same continuous time <InlineEquation latex="t" /> define
              <InlineEquation latex="G(S_i,t)=\partial U/\partial t(S_i,t)" />. No time step has yet been taken;
              time will be advanced later using RK4.
            </p>
          </div>
        </div>
        <div className="grid gap-6 border-y border-slate-200 py-5 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-center">
          <MethodOfLinesNameDiagram />
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Why is it called the Method of Lines?</h3>
            <p className="text-slate-700">
              The original solution <InlineEquation latex="U=U(S,t)" /> is a surface over the
              <InlineEquation latex="(S,t)" /> plane. The spatial stencil fixes the nodes
            </p>
            <EquationBlock latex="S_0,S_1,\ldots,S_{N_S}," />
            <p className="text-slate-700">
              while time remains continuous. Each fixed <InlineEquation latex="S_i" /> therefore defines a
              time-dependent function
            </p>
            <EquationBlock latex="U_i(t)\approx U(S_i,t),\qquad S=S_i." />
            <p className="text-slate-700">
              Geometrically, the PDE is followed along the vertical lines <InlineEquation latex="S=S_i" />.
              The coupled evolution of these lines becomes the ODE system for <InlineEquation latex="W(t)" />;
              this is the origin of the method's name.
            </p>
          </div>
        </div>
        <p className="text-slate-700">Collect the interior nodal values in the vector</p>
        <EquationBlock latex="W(t)=\left[U(S_1,t),U(S_2,t),\ldots,U(S_{N_S-1},t)\right]^T." />
        <EquationBlock latex="W'(t)=A_{ML}W(t)+b_{ML}(t)=:F(t,W(t))." />
        <p className="text-slate-700">
          After the spatial discretisation, RK4 advances the whole interior vector from{' '}
          <InlineEquation latex="W^{[j]}" /> to <InlineEquation latex="W^{[j+1]}" /> by computing four
          internal vector increments:
        </p>
        <div className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center">
          <MethodStencil method="rk4" />
          <div className="space-y-3">
            <EquationBlock latex="\begin{aligned}\mathbf f_1&=h_tF(t_j,W^{[j]}),\\ \mathbf f_2&=h_tF\left(t_j+\frac{h_t}{2},W^{[j]}+\frac{\mathbf f_1}{2}\right),\\ \mathbf f_3&=h_tF\left(t_j+\frac{h_t}{2},W^{[j]}+\frac{\mathbf f_2}{2}\right),\\ \mathbf f_4&=h_tF\left(t_j+h_t,W^{[j]}+\mathbf f_3\right),\\ W^{[j+1]}&=W^{[j]}+\frac{1}{6}(\mathbf f_1+2\mathbf f_2+2\mathbf f_3+\mathbf f_4).\end{aligned}" />
            <p className="text-sm text-slate-600">
              Only <InlineEquation latex="W^{[j]}" /> and <InlineEquation latex="W^{[j+1]}" /> are
              solution vectors at time levels. The quantities{' '}
              <InlineEquation latex="\mathbf f_1,\ldots,\mathbf f_4" /> are internal vector increments used
              to estimate the average slope during the time step.
            </p>
          </div>
        </div>
        <details className="rounded-md border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">
            Full derivation
          </summary>
          <div className="space-y-1.5 border-t border-slate-200 px-4 py-3">
            <DerivationText>
              The Method of Lines discretises the spatial variable first while keeping time continuous.
              Write the Black-Scholes equation as
            </DerivationText>
            <SmallEquation latex="\frac{\partial U}{\partial t}(S,t)=G(S,t),\qquad G(S,t):=\frac{\sigma^2}{2}S^2\frac{\partial^2U}{\partial S^2}(S,t)+rS\frac{\partial U}{\partial S}(S,t)-rU(S,t)." />
            <DerivationText>Define the spatial grid:</DerivationText>
            <SmallEquation latex="S_i=h_Si,\qquad i=0,\ldots,N_S,\qquad h_S=\frac{S^*}{N_S}." />
            <DerivationText>The boundary values are known:</DerivationText>
            <SmallEquation latex="U(S_0,t)=u_a(t),\qquad U(S_{N_S},t)=u_b(t)." />
            <DerivationText>For the interior nodes, use centered finite differences:</DerivationText>
            <SmallEquation latex="\frac{\partial U}{\partial S}(S_i,t)=\frac{U(S_{i+1},t)-U(S_{i-1},t)}{2h_S}+O(h_S^2)," />
            <SmallEquation latex="\frac{\partial^2U}{\partial S^2}(S_i,t)=\frac{U(S_{i+1},t)-2U(S_i,t)+U(S_{i-1},t)}{h_S^2}+O(h_S^2)." />
            <DerivationText>Neglecting the truncation errors gives</DerivationText>
            <SmallEquation latex="G(S_i,t)\approx\frac{\sigma^2}{2}S_i^2\left(\frac{U(S_{i+1},t)-2U(S_i,t)+U(S_{i-1},t)}{h_S^2}\right)+rS_i\left(\frac{U(S_{i+1},t)-U(S_{i-1},t)}{2h_S}\right)-rU(S_i,t)." />
            <DerivationText>
              Using <InlineEquation latex="S_i^2/h_S^2=i^2" /> and <InlineEquation latex="S_i/h_S=i" />,
              this becomes
            </DerivationText>
            <SmallEquation latex="G(S_i,t)\approx\left(\frac{\sigma^2}{2}i^2-\frac{r}{2}i\right)U(S_{i-1},t)+\left(-\sigma^2i^2-r\right)U(S_i,t)+\left(\frac{\sigma^2}{2}i^2+\frac{r}{2}i\right)U(S_{i+1},t)." />
            <DerivationText>Define</DerivationText>
            <SmallEquation latex="\alpha_i=\frac{\sigma^2}{2}i^2-\frac{r}{2}i,\qquad \beta_i=-\sigma^2i^2-r,\qquad \gamma_i=\frac{\sigma^2}{2}i^2+\frac{r}{2}i." />
            <DerivationText>Then, for <InlineEquation latex="i=1,\ldots,N_S-1" />,</DerivationText>
            <SmallEquation latex="\frac{\partial U}{\partial t}(S_i,t)=G(S_i,t)\approx\alpha_iU(S_{i-1},t)+\beta_iU(S_i,t)+\gamma_iU(S_{i+1},t)." />
            <DerivationText>
              Collect the interior values into the vector
            </DerivationText>
            <SmallEquation latex="W(t)=\begin{pmatrix}U(S_1,t)\\U(S_2,t)\\\vdots\\U(S_{N_S-1},t)\end{pmatrix}." />
            <DerivationText>The first interior equation contains the left boundary value:</DerivationText>
            <SmallEquation latex="G(S_1,t)\approx\alpha_1U(S_0,t)+\beta_1U(S_1,t)+\gamma_1U(S_2,t)." />
            <DerivationText>The last interior equation contains the right boundary value:</DerivationText>
            <SmallEquation latex="G(S_{N_S-1},t)\approx\alpha_{N_S-1}U(S_{N_S-2},t)+\beta_{N_S-1}U(S_{N_S-1},t)+\gamma_{N_S-1}U(S_{N_S},t)." />
            <DerivationText>Therefore, the semi-discrete system is</DerivationText>
            <SmallEquation latex="W'(t)=A_{ML}W(t)+b_{ML}(t)," />
            <SmallEquation latex="A_{ML}=\begin{pmatrix}\beta_1&\gamma_1&0&\cdots&0\\ \alpha_2&\beta_2&\gamma_2&\ddots&\vdots\\0&\alpha_3&\beta_3&\ddots&0\\ \vdots&\ddots&\ddots&\ddots&\gamma_{N_S-2}\\0&\cdots&0&\alpha_{N_S-1}&\beta_{N_S-1}\end{pmatrix}," />
            <SmallEquation latex="b_{ML}(t)=\begin{pmatrix}\alpha_1U(S_0,t)\\0\\\vdots\\0\\\gamma_{N_S-1}U(S_{N_S},t)\end{pmatrix}." />
            <DerivationText>The initial condition is obtained from the payoff:</DerivationText>
            <SmallEquation latex="W(0)=\begin{pmatrix}u_0(S_1)\\u_0(S_2)\\\vdots\\u_0(S_{N_S-1})\end{pmatrix}." />
            <DerivationText>
              The boundary vector appears because the boundary values are known and are not included in
              the unknown interior vector <InlineEquation latex="W(t)" />.
            </DerivationText>
            <DerivationText>We now discretise time:</DerivationText>
            <SmallEquation latex="t_j=jh_t,\qquad j=0,\ldots,N_t,\qquad h_t=\frac{T}{N_t}." />
            <DerivationText>At each time level, approximate</DerivationText>
            <SmallEquation latex="W^{[j]}\approx W(t_j),\qquad W^{[j]}=\begin{pmatrix}U(S_1,t_j)\\U(S_2,t_j)\\\vdots\\U(S_{N_S-1},t_j)\end{pmatrix}." />
            <DerivationText>
              The classical fourth-order Runge-Kutta method advances the whole vector{' '}
              <InlineEquation latex="W^{[j]}" /> to <InlineEquation latex="W^{[j+1]}" /> by computing
              four internal vector increments:
            </DerivationText>
            <SmallEquation latex="\begin{aligned}\mathbf f_1&=h_tF(t_j,W^{[j]}),\\ \mathbf f_2&=h_tF\left(t_j+\frac{h_t}{2},W^{[j]}+\frac{\mathbf f_1}{2}\right),\\ \mathbf f_3&=h_tF\left(t_j+\frac{h_t}{2},W^{[j]}+\frac{\mathbf f_2}{2}\right),\\ \mathbf f_4&=h_tF\left(t_j+h_t,W^{[j]}+\mathbf f_3\right),\\ W^{[j+1]}&=W^{[j]}+\frac{1}{6}(\mathbf f_1+2\mathbf f_2+2\mathbf f_3+\mathbf f_4).\end{aligned}" />
            <DerivationText>
              The RK4 method does not create four new grid points. It advances the whole interior vector
              from time level <InlineEquation latex="j" /> to time level <InlineEquation latex="j+1" />.
              The quantities <InlineEquation latex="\mathbf f_1,\ldots,\mathbf f_4" /> are internal vector
              increments used to estimate the average slope during the time step.
            </DerivationText>
          </div>
        </details>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Approximation Order</h2>
        <div className="rounded-md border border-cyan-200 bg-cyan-50 px-4 py-3 text-slate-700">
          The spatial derivatives are approximated with centered second-order finite differences, and
          the semi-discrete ODE is advanced with classical fourth-order Runge-Kutta:
          <div className="mt-2">
            <InlineEquation latex="\text{local accuracy}=O(h_S^2+h_t^4)" />
          </div>
        </div>
        <details className="rounded-md border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">
            Full derivation
          </summary>
          <div className="space-y-1.5 border-t border-slate-200 px-4 py-3">
            <DerivationText>The spatial part uses centered finite differences:</DerivationText>
            <SmallEquation latex="\frac{\partial U}{\partial S}(S_i,t)=\frac{U_{i+1}(t)-U_{i-1}(t)}{2h_S}+O(h_S^2)," />
            <SmallEquation latex="\frac{\partial^2U}{\partial S^2}(S_i,t)=\frac{U(S_{i+1},t)-2U(S_i,t)+U(S_{i-1},t)}{h_S^2}+O(h_S^2)." />
            <DerivationText>Therefore, the spatial discretisation error is</DerivationText>
            <SmallEquation latex="O(h_S^2)." />
            <DerivationText>
              The time integration is performed with classical fourth-order Runge-Kutta. Applied to the
              semi-discrete system <InlineEquation latex="W'(t)=A_{ML}W(t)+b_{ML}(t)" />,
              RK4 has temporal error
            </DerivationText>
            <SmallEquation latex="O(h_t^4)." />
            <DerivationText>Combining the two contributions gives</DerivationText>
            <SmallEquation latex="\text{MOL + RK4 accuracy:}\qquad O(h_S^2)+O(h_t^4)." />
            <DerivationText>
              The method is fourth order in time because RK4 is fourth order, and second order in space
              because the first and second spatial derivatives are still approximated with centered
              second-order finite differences.
            </DerivationText>
          </div>
        </details>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Matrix Form</h2>
        <p className="text-slate-700">Collect the interior unknowns into</p>
        <EquationBlock latex="W(t)=\begin{pmatrix}U(S_1,t)\\U(S_2,t)\\\vdots\\U(S_{N_S-1},t)\end{pmatrix}." />
        <p className="text-slate-700">
          The first and last interior equations contain the boundary values, which are kept out of the
          unknown vector:
        </p>
        <EquationBlock latex="G(S_1,t)\approx\alpha_1U(S_0,t)+\beta_1U(S_1,t)+\gamma_1U(S_2,t)" />
        <EquationBlock latex="G(S_{N_S-1},t)\approx\alpha_{N_S-1}U(S_{N_S-2},t)+\beta_{N_S-1}U(S_{N_S-1},t)+\gamma_{N_S-1}U(S_{N_S},t)" />
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">
              Semi-discrete matrix <InlineEquation latex="A_{ML}" />
            </p>
            <div className="overflow-x-auto [&_.katex-display]:my-1">
              <Katex
                math="A_{ML}=\begin{pmatrix}\beta_1&\gamma_1&0&\cdots&0\\ \alpha_2&\beta_2&\gamma_2&\ddots&\vdots\\0&\alpha_3&\beta_3&\ddots&0\\ \vdots&\ddots&\ddots&\ddots&\gamma_{N_S-2}\\0&\cdots&0&\alpha_{N_S-1}&\beta_{N_S-1}\end{pmatrix}"
                display
              />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Constant for fixed grid and parameters. It depends on the spatial index{' '}
              <InlineEquation latex="i" />, but not on time.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">
              Boundary contribution <InlineEquation latex="b_{ML}(t)" />
            </p>
            <EquationBlock latex="b_{ML}(t)=\begin{pmatrix}\alpha_1U(S_0,t)\\0\\\vdots\\0\\\gamma_{N_S-1}U(S_{N_S},t)\end{pmatrix}" />
            <p className="text-sm text-slate-700">
              This vector may change with time because the boundary functions{' '}
              <InlineEquation latex="u_a(t)" /> and <InlineEquation latex="u_b(t)" /> may change.
            </p>
          </div>
        </div>
        <EquationBlock latex="W'(t)=A_{ML}W(t)+b_{ML}(t)" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <p className="text-slate-700">
          After the spatial discretisation, time integration advances the semi-discrete system
        </p>
        <EquationBlock latex="W'(t)=A_{ML}W(t)+b_{ML}(t)=F(t,W(t))." />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Setup</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Create the grids <InlineEquation latex="S_i=ih_S" /> and <InlineEquation latex="t_j=jh_t" />.</li>
              <li>Fill the initial row from the payoff and the boundary columns from <InlineEquation latex="u_a,u_b" />.</li>
              <li>Build <InlineEquation latex="A_{ML}" /> from <InlineEquation latex="\alpha_i,\beta_i,\gamma_i" />.</li>
              <li>Set <InlineEquation latex="W^{[0]}" /> equal to the initial interior values.</li>
            </ol>
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">RK4 sweep</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Compute the four RK4 stage increments <InlineEquation latex="\mathbf f_1,\mathbf f_2,\mathbf f_3,\mathbf f_4" />.</li>
              <li>Update <InlineEquation latex="W^{[j+1]}" /> using the weighted average.</li>
              <li>Write the updated interior values into the next grid row.</li>
            </ol>
          </div>
        </div>
        <EquationBlock latex="\begin{aligned}\mathbf f_1&=h_tF(t_j,W^{[j]}),\\ \mathbf f_2&=h_tF\left(t_j+\frac{h_t}{2},W^{[j]}+\frac{\mathbf f_1}{2}\right),\\ \mathbf f_3&=h_tF\left(t_j+\frac{h_t}{2},W^{[j]}+\frac{\mathbf f_2}{2}\right),\\ \mathbf f_4&=h_tF\left(t_j+h_t,W^{[j]}+\mathbf f_3\right),\\ W^{[j+1]}&=W^{[j]}+\frac{\mathbf f_1+2\mathbf f_2+2\mathbf f_3+\mathbf f_4}{6}.\end{aligned}" />
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Practical efficiency tips</p>
          <p className="mt-1">
            Store <InlineEquation latex="A_{ML}" /> as a tridiagonal or sparse matrix. No linear system is
            solved at each step, but each step evaluates the right-hand side four times. Because RK4 is
            explicit, monitor the time step when the spatial grid is refined.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Stability</h2>
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-slate-700">
          <p className="font-semibold text-slate-900">Conditional stability</p>
          <p className="mt-1">
            The Method of Lines with RK4 uses an explicit time integrator. Its stability depends on the size
            of <InlineEquation latex="h_t" /> relative to the eigenvalues of{' '}
            <InlineEquation latex="A_{ML}" />. When the spatial grid is refined, those eigenvalues usually
            grow in magnitude, so the time step may need to be reduced.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Simulation</h2>
        <p className="text-slate-700">
          The example below uses the course defaults <InlineEquation latex="r=0.06" />,{' '}
          <InlineEquation latex="\sigma=0.30" />, <InlineEquation latex="K=10" />,{' '}
          <InlineEquation latex="T=1" /> and <InlineEquation latex="S^*=15" />. The animation advances the
          interior vector by RK4 steps and then places the updated values back on the grid.
        </p>
        <MethodOfLinesRK4CalculationExample />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Recovering the Option Value</h2>
        <p className="text-slate-700">
          The computation is performed in reversed time. The original option value is recovered by
        </p>
        <EquationBlock latex="V(S,t)=U(S,T-t)." />
        <p className="text-slate-700">
          In the discrete solution matrix, this corresponds to reversing the time direction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">MATLAB Implementation Example</h2>
        <p className="text-slate-700">
          One efficient implementation builds the tridiagonal spatial operator once, then evaluates the
          right-hand side four times per RK4 step.
        </p>
        <MatlabCodePanel file="bs_mol_rk4.m" snippets={bsMolRk4Snippets} />
      </section>
    </PageLayout>
  )
}
