import type { ReactNode } from 'react'
import { MatlabCodePanel } from '../components/Code/MatlabCodePanel'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
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
        unknown: 'The interior vector U(t), advanced in time with RK4.',
        method: 'Discretise space first, then integrate the resulting ODE system with classical RK4.',
        takeaway:
          'MOL with RK4 is second order in space, fourth order in time, and conditionally stable because RK4 is explicit.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Derivation</h2>
        <p className="text-slate-700">
          The Method of Lines discretises only the spatial variable first. Starting from the forward-time
          Black-Scholes equation,
        </p>
        <EquationBlock latex="\frac{\partial U}{\partial t}=\frac{\sigma^2}{2}S^2\frac{\partial^2U}{\partial S^2}+rS\frac{\partial U}{\partial S}-rU" />
        <p className="text-slate-700">
          define the spatial grid and the time-dependent grid values
        </p>
        <EquationBlock latex="S_i=ih_S,\qquad i=0,\ldots,N_S,\qquad U_i(t)\approx U(S_i,t)." />
        <p className="text-slate-700">
          The boundary values are known functions, <InlineEquation latex="U_0(t)=u_a(t)" /> and{' '}
          <InlineEquation latex="U_{N_S}(t)=u_b(t)" />. For the interior nodes, centered differences give
        </p>
        <EquationBlock latex="\frac{\partial U}{\partial S}(S_i,t)=\frac{U_{i+1}(t)-U_{i-1}(t)}{2h_S}+O(h_S^2)" />
        <EquationBlock latex="\frac{\partial^2U}{\partial S^2}(S_i,t)=\frac{U_{i+1}(t)-2U_i(t)+U_{i-1}(t)}{h_S^2}+O(h_S^2)" />
        <p className="text-slate-700">
          Neglecting the truncation errors and using <InlineEquation latex="S_i/h_S=i" /> gives the
          semi-discrete ODE for <InlineEquation latex="i=1,\ldots,N_S-1" />:
        </p>
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center">
          <MethodStencil method="mol" />
          <div className="space-y-3">
            <EquationBlock latex="\frac{dU_i}{dt}(t)=\alpha_i^{ML}U_{i-1}(t)+\beta_i^{ML}U_i(t)+\gamma_i^{ML}U_{i+1}(t)" />
            <EquationBlock latex="\alpha_i^{ML}=\frac{\sigma^2}{2}i^2-\frac{r}{2}i,\qquad \beta_i^{ML}=-\sigma^2i^2-r,\qquad \gamma_i^{ML}=\frac{\sigma^2}{2}i^2+\frac{r}{2}i" />
            <p className="text-sm text-slate-600">
              The three spatial values at the same continuous time <InlineEquation latex="t" /> define
              the time derivative <InlineEquation latex="dU_i/dt" />. No time step has yet been taken;
              time will be advanced later using RK4.
            </p>
          </div>
        </div>
        <p className="text-slate-700">
          After the spatial discretisation, RK4 advances the whole interior vector from{' '}
          <InlineEquation latex="\mathbf U^j" /> to <InlineEquation latex="\mathbf U^{j+1}" /> by computing four
          internal vector increments:
        </p>
        <div className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center">
          <MethodStencil method="rk4" />
          <div className="space-y-3">
            <EquationBlock latex="\begin{aligned}\mathbf f_1&=h_t\left(A_{ML}\mathbf U^j+\mathbf b_{ML}(t_j)\right),\\ \mathbf f_2&=h_t\left(A_{ML}\left(\mathbf U^j+\frac{\mathbf f_1}{2}\right)+\mathbf b_{ML}\left(t_j+\frac{h_t}{2}\right)\right),\\ \mathbf f_3&=h_t\left(A_{ML}\left(\mathbf U^j+\frac{\mathbf f_2}{2}\right)+\mathbf b_{ML}\left(t_j+\frac{h_t}{2}\right)\right),\\ \mathbf f_4&=h_t\left(A_{ML}\left(\mathbf U^j+\mathbf f_3\right)+\mathbf b_{ML}(t_j+h_t)\right),\\ \mathbf U^{j+1}&=\mathbf U^j+\frac{1}{6}(\mathbf f_1+2\mathbf f_2+2\mathbf f_3+\mathbf f_4).\end{aligned}" />
            <p className="text-sm text-slate-600">
              Only <InlineEquation latex="\mathbf U^j" /> and <InlineEquation latex="\mathbf U^{j+1}" /> are
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
              Start from
            </DerivationText>
            <SmallEquation latex="\frac{\partial U}{\partial t}=\frac{\sigma^2}{2}S^2\frac{\partial^2U}{\partial S^2}+rS\frac{\partial U}{\partial S}-rU." />
            <DerivationText>Define the spatial grid and time-dependent nodal values:</DerivationText>
            <SmallEquation latex="S_i=ih_S,\qquad i=0,\ldots,N_S,\qquad h_S=\frac{S_{\max}}{N_S}," />
            <SmallEquation latex="U_i(t)\approx U(S_i,t),\qquad i=0,\ldots,N_S." />
            <DerivationText>The boundary values are known:</DerivationText>
            <SmallEquation latex="U_0(t)=U(S_0,t)=u_a(t),\qquad U_{N_S}(t)=U(S_{N_S},t)=u_b(t)." />
            <DerivationText>For the interior nodes, use centered finite differences:</DerivationText>
            <SmallEquation latex="\frac{\partial U}{\partial S}(S_i,t)=\frac{U_{i+1}(t)-U_{i-1}(t)}{2h_S}+O(h_S^2)," />
            <SmallEquation latex="\frac{\partial^2U}{\partial S^2}(S_i,t)=\frac{U_{i+1}(t)-2U_i(t)+U_{i-1}(t)}{h_S^2}+O(h_S^2)." />
            <DerivationText>Neglecting the truncation errors, the semi-discrete equation is</DerivationText>
            <SmallEquation latex="\frac{dU_i}{dt}(t)=\frac{\sigma^2}{2}S_i^2\left(\frac{U_{i+1}(t)-2U_i(t)+U_{i-1}(t)}{h_S^2}\right)+rS_i\left(\frac{U_{i+1}(t)-U_{i-1}(t)}{2h_S}\right)-rU_i(t)." />
            <DerivationText>
              Using <InlineEquation latex="S_i^2/h_S^2=i^2" /> and <InlineEquation latex="S_i/h_S=i" />,
              this becomes
            </DerivationText>
            <SmallEquation latex="\frac{dU_i}{dt}(t)=\left(\frac{\sigma^2}{2}i^2-\frac{r}{2}i\right)U_{i-1}(t)+\left(-\sigma^2i^2-r\right)U_i(t)+\left(\frac{\sigma^2}{2}i^2+\frac{r}{2}i\right)U_{i+1}(t)." />
            <DerivationText>Define</DerivationText>
            <SmallEquation latex="\alpha_i^{ML}=\frac{\sigma^2}{2}i^2-\frac{r}{2}i,\qquad \beta_i^{ML}=-\sigma^2i^2-r,\qquad \gamma_i^{ML}=\frac{\sigma^2}{2}i^2+\frac{r}{2}i." />
            <DerivationText>Then, for <InlineEquation latex="i=1,\ldots,N_S-1" />,</DerivationText>
            <SmallEquation latex="\frac{dU_i}{dt}(t)=\alpha_i^{ML}U_{i-1}(t)+\beta_i^{ML}U_i(t)+\gamma_i^{ML}U_{i+1}(t)." />
            <DerivationText>
              Collect the interior values into the vector
            </DerivationText>
            <SmallEquation latex="\mathbf U(t)=\begin{pmatrix}U_1(t)\\U_2(t)\\\vdots\\U_{N_S-1}(t)\end{pmatrix}." />
            <DerivationText>The first interior equation contains the left boundary value:</DerivationText>
            <SmallEquation latex="\frac{dU_1}{dt}(t)=\alpha_1^{ML}u_a(t)+\beta_1^{ML}U_1(t)+\gamma_1^{ML}U_2(t)." />
            <DerivationText>The last interior equation contains the right boundary value:</DerivationText>
            <SmallEquation latex="\frac{dU_{N_S-1}}{dt}(t)=\alpha_{N_S-1}^{ML}U_{N_S-2}(t)+\beta_{N_S-1}^{ML}U_{N_S-1}(t)+\gamma_{N_S-1}^{ML}u_b(t)." />
            <DerivationText>Therefore, the semi-discrete system is</DerivationText>
            <SmallEquation latex="\frac{d\mathbf U}{dt}(t)=A_{ML}\mathbf U(t)+\mathbf b_{ML}(t)," />
            <SmallEquation latex="A_{ML}=\begin{pmatrix}\beta_1^{ML}&\gamma_1^{ML}&0&\cdots&0\\ \alpha_2^{ML}&\beta_2^{ML}&\gamma_2^{ML}&\ddots&\vdots\\0&\alpha_3^{ML}&\beta_3^{ML}&\ddots&0\\ \vdots&\ddots&\ddots&\ddots&\gamma_{N_S-2}^{ML}\\0&\cdots&0&\alpha_{N_S-1}^{ML}&\beta_{N_S-1}^{ML}\end{pmatrix}," />
            <SmallEquation latex="\mathbf b_{ML}(t)=\begin{pmatrix}\alpha_1^{ML}u_a(t)\\0\\\vdots\\0\\\gamma_{N_S-1}^{ML}u_b(t)\end{pmatrix}." />
            <DerivationText>The initial condition is obtained from the payoff:</DerivationText>
            <SmallEquation latex="\mathbf U(0)=\begin{pmatrix}u_0(S_1)\\u_0(S_2)\\\vdots\\u_0(S_{N_S-1})\end{pmatrix}." />
            <DerivationText>
              The boundary vector appears because the boundary values are known and are not included in
              the unknown interior vector <InlineEquation latex="\mathbf U(t)" />.
            </DerivationText>
            <DerivationText>We now discretise time:</DerivationText>
            <SmallEquation latex="t_j=jh_t,\qquad j=0,\ldots,N_t,\qquad h_t=\frac{T}{N_t}." />
            <DerivationText>At each time level, approximate</DerivationText>
            <SmallEquation latex="\mathbf U^j\approx \mathbf U(t_j),\qquad \mathbf U^j=\begin{pmatrix}U_{1,j}\\U_{2,j}\\\vdots\\U_{N_S-1,j}\end{pmatrix}." />
            <DerivationText>
              The classical fourth-order Runge-Kutta method advances the whole vector{' '}
              <InlineEquation latex="\mathbf U^j" /> to <InlineEquation latex="\mathbf U^{j+1}" /> by computing
              four internal vector increments:
            </DerivationText>
            <SmallEquation latex="\begin{aligned}\mathbf f_1&=h_t\left(A_{ML}\mathbf U^j+\mathbf b_{ML}(t_j)\right),\\ \mathbf f_2&=h_t\left(A_{ML}\left(\mathbf U^j+\frac{\mathbf f_1}{2}\right)+\mathbf b_{ML}\left(t_j+\frac{h_t}{2}\right)\right),\\ \mathbf f_3&=h_t\left(A_{ML}\left(\mathbf U^j+\frac{\mathbf f_2}{2}\right)+\mathbf b_{ML}\left(t_j+\frac{h_t}{2}\right)\right),\\ \mathbf f_4&=h_t\left(A_{ML}\left(\mathbf U^j+\mathbf f_3\right)+\mathbf b_{ML}(t_j+h_t)\right),\\ \mathbf U^{j+1}&=\mathbf U^j+\frac{1}{6}(\mathbf f_1+2\mathbf f_2+2\mathbf f_3+\mathbf f_4).\end{aligned}" />
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
            <SmallEquation latex="\frac{\partial^2U}{\partial S^2}(S_i,t)=\frac{U_{i+1}(t)-2U_i(t)+U_{i-1}(t)}{h_S^2}+O(h_S^2)." />
            <DerivationText>Therefore, the spatial discretisation error is</DerivationText>
            <SmallEquation latex="O(h_S^2)." />
            <DerivationText>
              The time integration is performed with classical fourth-order Runge-Kutta. Applied to the
              semi-discrete system <InlineEquation latex="d\mathbf U/dt=A_{ML}\mathbf U+\mathbf b_{ML}(t)" />,
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
        <EquationBlock latex="\mathbf U(t)=\begin{pmatrix}U_1(t)\\U_2(t)\\\vdots\\U_{N_S-1}(t)\end{pmatrix}." />
        <p className="text-slate-700">
          The first and last interior equations contain the boundary values, which are kept out of the
          unknown vector:
        </p>
        <EquationBlock latex="\frac{dU_1}{dt}(t)=\alpha_1^{ML}u_a(t)+\beta_1^{ML}U_1(t)+\gamma_1^{ML}U_2(t)" />
        <EquationBlock latex="\frac{dU_{N_S-1}}{dt}(t)=\alpha_{N_S-1}^{ML}U_{N_S-2}(t)+\beta_{N_S-1}^{ML}U_{N_S-1}(t)+\gamma_{N_S-1}^{ML}u_b(t)" />
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">
              Semi-discrete matrix <InlineEquation latex="A_{ML}" />
            </p>
            <div className="overflow-x-auto [&_.katex-display]:my-1">
              <Katex
                math="A_{ML}=\begin{pmatrix}\beta_1^{ML}&\gamma_1^{ML}&0&\cdots&0\\ \alpha_2^{ML}&\beta_2^{ML}&\gamma_2^{ML}&\ddots&\vdots\\0&\alpha_3^{ML}&\beta_3^{ML}&\ddots&0\\ \vdots&\ddots&\ddots&\ddots&\gamma_{N_S-2}^{ML}\\0&\cdots&0&\alpha_{N_S-1}^{ML}&\beta_{N_S-1}^{ML}\end{pmatrix}"
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
              Boundary contribution <InlineEquation latex="\mathbf b_{ML}(t)" />
            </p>
            <EquationBlock latex="\mathbf b_{ML}(t)=\begin{pmatrix}\alpha_1^{ML}u_a(t)\\0\\\vdots\\0\\\gamma_{N_S-1}^{ML}u_b(t)\end{pmatrix}" />
            <p className="text-sm text-slate-700">
              This vector may change with time because the boundary functions{' '}
              <InlineEquation latex="u_a(t)" /> and <InlineEquation latex="u_b(t)" /> may change.
            </p>
          </div>
        </div>
        <EquationBlock latex="\frac{d\mathbf U}{dt}(t)=A_{ML}\mathbf U(t)+\mathbf b_{ML}(t)" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <p className="text-slate-700">
          After the spatial discretisation, time integration advances the semi-discrete system
        </p>
        <EquationBlock latex="\frac{d\mathbf U}{dt}(t)=A_{ML}\mathbf U(t)+\mathbf b_{ML}(t)." />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Setup</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Create the grids <InlineEquation latex="S_i=ih_S" /> and <InlineEquation latex="t_j=jh_t" />.</li>
              <li>Fill the initial row from the payoff and the boundary columns from <InlineEquation latex="u_a,u_b" />.</li>
              <li>Build <InlineEquation latex="A_{ML}" /> from <InlineEquation latex="\alpha^{ML},\beta^{ML},\gamma^{ML}" />.</li>
              <li>Set <InlineEquation latex="\mathbf U^0" /> equal to the initial interior values.</li>
            </ol>
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">RK4 sweep</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Compute the four RK4 stage increments <InlineEquation latex="\mathbf f_1,\mathbf f_2,\mathbf f_3,\mathbf f_4" />.</li>
              <li>Update <InlineEquation latex="\mathbf U^{j+1}" /> using the weighted average.</li>
              <li>Write the updated interior values into the next grid row.</li>
            </ol>
          </div>
        </div>
        <EquationBlock latex="\begin{aligned}\mathbf f_1&=h_t\left(A_{ML}\mathbf U^j+\mathbf b_{ML}(t_j)\right),\\ \mathbf f_2&=h_t\left(A_{ML}\left(\mathbf U^j+\frac{\mathbf f_1}{2}\right)+\mathbf b_{ML}\left(t_j+\frac{h_t}{2}\right)\right),\\ \mathbf f_3&=h_t\left(A_{ML}\left(\mathbf U^j+\frac{\mathbf f_2}{2}\right)+\mathbf b_{ML}\left(t_j+\frac{h_t}{2}\right)\right),\\ \mathbf f_4&=h_t\left(A_{ML}\left(\mathbf U^j+\mathbf f_3\right)+\mathbf b_{ML}(t_j+h_t)\right),\\ \mathbf U^{j+1}&=\mathbf U^j+\frac{\mathbf f_1+2\mathbf f_2+2\mathbf f_3+\mathbf f_4}{6}.\end{aligned}" />
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
