import type { ReactNode } from 'react'
import { MatlabCodePanel } from '../components/Code/MatlabCodePanel'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
import { CrankNicolsonCalculationExample } from '../components/Visuals/CrankNicolsonCalculationExample'
import { CrankNicolsonMolecule } from '../components/Visuals/CrankNicolsonMolecule'
import { bsCnSnippets } from '../data/matlabSnippets'

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

export default function CrankNicolson() {
  return (
    <PageLayout
      title="Crank-Nicolson Method"
      rightPanel={{
        known: 'Initial values, boundary values, and the previous time row U^j.',
        unknown: 'The whole interior vector U^{j+1}, solved from a tridiagonal system.',
        method: 'Average the Black-Scholes spatial operator between time levels j and j+1.',
        takeaway:
          'Crank-Nicolson is second order in time and space, unconditionally stable, and solves one tridiagonal system per time step.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Derivation</h2>
        <p className="text-slate-700">
          Starting from the forward-time Black-Scholes equation for{' '}
          <InlineEquation latex="U(S,t)=V(S,T-t)" />,
        </p>
        <EquationBlock latex="\frac{\partial U}{\partial t}=\frac{\sigma^2}{2}S^2\frac{\partial^2 U}{\partial S^2}+rS\frac{\partial U}{\partial S}-rU" />
        <p className="text-slate-700">
          Crank-Nicolson averages the full right-hand side between the known level{' '}
          <InlineEquation latex="j" /> and the unknown level <InlineEquation latex="j+1" />:
        </p>
        <EquationBlock latex="\begin{aligned}\frac{U_{i,j+1}-U_{i,j}}{h_t}=\frac12\Bigg[&\frac{\sigma^2}{2}S_i^2\left(\frac{U_{i+1,j}-2U_{i,j}+U_{i-1,j}}{h_S^2}\right)+rS_i\left(\frac{U_{i+1,j}-U_{i-1,j}}{2h_S}\right)-rU_{i,j}\Bigg]\\+\frac12\Bigg[&\frac{\sigma^2}{2}S_i^2\left(\frac{U_{i+1,j+1}-2U_{i,j+1}+U_{i-1,j+1}}{h_S^2}\right)+rS_i\left(\frac{U_{i+1,j+1}-U_{i-1,j+1}}{2h_S}\right)-rU_{i,j+1}\Bigg].\end{aligned}" />
        <p className="text-slate-700">
          Multiplying by <InlineEquation latex="h_t" />, collecting the{' '}
          <InlineEquation latex="j+1" /> terms on the left, and using{' '}
          <InlineEquation latex="S_i/h_S=i" /> gives one equation per interior node:
        </p>
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
          <CrankNicolsonMolecule />
          <div className="space-y-3">
            <EquationBlock latex="a_iU_{i-1,j+1}+b_iU_{i,j+1}+c_iU_{i+1,j+1}=-a_iU_{i-1,j}+d_iU_{i,j}-c_iU_{i+1,j}" />
            <EquationBlock latex="a_i=-\frac{\sigma^2h_t}{4}i^2+\frac{rh_t}{4}i,\qquad b_i=1+\frac{\sigma^2h_t}{2}i^2+\frac{rh_t}{2}" />
            <EquationBlock latex="c_i=-\frac{\sigma^2h_t}{4}i^2-\frac{rh_t}{4}i,\qquad d_i=1-\frac{\sigma^2h_t}{2}i^2-\frac{rh_t}{2}" />
            <p className="text-sm text-slate-600">
              This holds for <InlineEquation latex="i=1,\ldots,N_S-1" /> and{' '}
              <InlineEquation latex="j=0,\ldots,N_t-1" />.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Approximation Order</h2>
        <div className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-slate-700">
          The Crank-Nicolson time step is the trapezoidal average of the spatial operator, while the
          spatial derivatives use centered differences. Therefore it is second order in time and second
          order in space:
          <div className="mt-2">
            <InlineEquation latex="\text{local accuracy}=O(h_t^2+h_S^2)" />
          </div>
        </div>
        <details className="rounded-md border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">
            Full derivation
          </summary>
          <div className="space-y-1.5 border-t border-slate-200 px-4 py-3">
            <DerivationText>
              We justify why the Crank-Nicolson method is second order in space and second order in time.
              The scheme uses the centered finite-difference approximation for the first spatial derivative:
            </DerivationText>
            <SmallEquation latex="\frac{\partial U}{\partial S}(S_i,t_j)=\frac{U_{i+1,j}-U_{i-1,j}}{2h_S}+O(h_S^2)." />
            <DerivationText>
              It also uses the centered finite-difference approximation for the second spatial derivative:
            </DerivationText>
            <SmallEquation latex="\frac{\partial^2 U}{\partial S^2}(S_i,t_j)=\frac{U_{i+1,j}-2U_{i,j}+U_{i-1,j}}{h_S^2}+O(h_S^2)." />
            <DerivationText>The same centered approximations are used at time level <InlineEquation latex="j+1" />:</DerivationText>
            <SmallEquation latex="\frac{\partial U}{\partial S}(S_i,t_{j+1})=\frac{U_{i+1,j+1}-U_{i-1,j+1}}{2h_S}+O(h_S^2)," />
            <SmallEquation latex="\frac{\partial^2 U}{\partial S^2}(S_i,t_{j+1})=\frac{U_{i+1,j+1}-2U_{i,j+1}+U_{i-1,j+1}}{h_S^2}+O(h_S^2)." />
            <DerivationText>
              Therefore, at each of the two time levels <InlineEquation latex="j" /> and{' '}
              <InlineEquation latex="j+1" />, the spatial part of the Black-Scholes equation is approximated
              with error <InlineEquation latex="O(h_S^2)" />. Since Crank-Nicolson averages these two spatial
              approximations, the spatial error remains
            </DerivationText>
            <SmallEquation latex="O(h_S^2)." />
            <DerivationText>
              We now analyse the time discretisation. Expanding <InlineEquation latex="U(S_i,t_{j+1})" /> around{' '}
              <InlineEquation latex="t_j" />, with <InlineEquation latex="S_i" /> fixed, gives
            </DerivationText>
            <SmallEquation latex="U(S_i,t_{j+1})=U(S_i,t_j)+h_t\frac{\partial U}{\partial t}(S_i,t_j)+\frac{h_t^2}{2}\frac{\partial^2U}{\partial t^2}(S_i,t_j)+\frac{h_t^3}{6}\frac{\partial^3U}{\partial t^3}(S_i,t_j)+O(h_t^4)." />
            <DerivationText>Dividing by <InlineEquation latex="h_t" />, we obtain</DerivationText>
            <SmallEquation latex="\frac{U(S_i,t_{j+1})-U(S_i,t_j)}{h_t}=\frac{\partial U}{\partial t}(S_i,t_j)+\frac{h_t}{2}\frac{\partial^2U}{\partial t^2}(S_i,t_j)+\frac{h_t^2}{6}\frac{\partial^3U}{\partial t^3}(S_i,t_j)+O(h_t^3)." />
            <DerivationText>
              Crank-Nicolson does not use only the derivative at <InlineEquation latex="t_j" />. It averages
              the Black-Scholes right-hand side between <InlineEquation latex="t_j" /> and{' '}
              <InlineEquation latex="t_{j+1}" />. For the exact solution,
            </DerivationText>
            <SmallEquation latex="\frac{\partial U}{\partial t}(S_i,t_j)=\frac{\sigma^2}{2}S_i^2\frac{\partial^2U}{\partial S^2}(S_i,t_j)+rS_i\frac{\partial U}{\partial S}(S_i,t_j)-rU(S_i,t_j)," />
            <SmallEquation latex="\frac{\partial U}{\partial t}(S_i,t_{j+1})=\frac{\sigma^2}{2}S_i^2\frac{\partial^2U}{\partial S^2}(S_i,t_{j+1})+rS_i\frac{\partial U}{\partial S}(S_i,t_{j+1})-rU(S_i,t_{j+1})." />
            <DerivationText>
              Therefore, before replacing the spatial derivatives by finite differences, the Crank-Nicolson
              time average corresponds to
            </DerivationText>
            <SmallEquation latex="\frac12\left[\frac{\partial U}{\partial t}(S_i,t_j)+\frac{\partial U}{\partial t}(S_i,t_{j+1})\right]." />
            <DerivationText>
              Expanding <InlineEquation latex="\partial U/\partial t(S_i,t_{j+1})" /> around{' '}
              <InlineEquation latex="t_j" />, we get
            </DerivationText>
            <SmallEquation latex="\frac{\partial U}{\partial t}(S_i,t_{j+1})=\frac{\partial U}{\partial t}(S_i,t_j)+h_t\frac{\partial^2U}{\partial t^2}(S_i,t_j)+\frac{h_t^2}{2}\frac{\partial^3U}{\partial t^3}(S_i,t_j)+O(h_t^3)." />
            <DerivationText>Hence,</DerivationText>
            <SmallEquation latex="\frac12\left[\frac{\partial U}{\partial t}(S_i,t_j)+\frac{\partial U}{\partial t}(S_i,t_{j+1})\right]=\frac{\partial U}{\partial t}(S_i,t_j)+\frac{h_t}{2}\frac{\partial^2U}{\partial t^2}(S_i,t_j)+\frac{h_t^2}{4}\frac{\partial^3U}{\partial t^3}(S_i,t_j)+O(h_t^3)." />
            <DerivationText>
              Comparing the time-difference expansion with the averaged time derivative, the first two
              terms agree. The first difference appears only in the <InlineEquation latex="h_t^2" /> terms:
            </DerivationText>
            <SmallEquation latex="\frac{h_t^2}{6}\frac{\partial^3U}{\partial t^3}(S_i,t_j)-\frac{h_t^2}{4}\frac{\partial^3U}{\partial t^3}(S_i,t_j)=-\frac{h_t^2}{12}\frac{\partial^3U}{\partial t^3}(S_i,t_j)." />
            <DerivationText>Thus the time discretisation error is</DerivationText>
            <SmallEquation latex="O(h_t^2)." />
            <DerivationText>
              Combining the spatial and temporal contributions, the Crank-Nicolson local truncation error is
            </DerivationText>
            <SmallEquation latex="O(h_t^2)+O(h_S^2)." />
            <DerivationText>
              Therefore, Crank-Nicolson is second order in time and second order in space. The explicit and
              implicit methods use one-sided time approximations and are only first order in time;
              Crank-Nicolson averages between <InlineEquation latex="t_j" /> and{' '}
              <InlineEquation latex="t_{j+1}" />, so the first-order time error cancels.
            </DerivationText>
          </div>
        </details>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Matrix Form</h2>
        <p className="text-slate-700">
          Let the interior unknown vector at time level <InlineEquation latex="j" /> be
        </p>
        <EquationBlock latex="\mathbf U^j=\begin{pmatrix}U_{1,j}\\U_{2,j}\\\vdots\\U_{N_S-1,j}\end{pmatrix}" />
        <p className="text-slate-700">Define the two tridiagonal matrices</p>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">
              Unknown future-level matrix <InlineEquation latex="A_{CN}" />
            </p>
            <div className="overflow-x-auto [&_.katex-display]:my-1">
              <Katex
                math="A_{CN}=\begin{pmatrix}b_1&c_1&0&\cdots&0\\ a_2&b_2&c_2&\ddots&\vdots\\0&a_3&b_3&\ddots&0\\ \vdots&\ddots&\ddots&\ddots&c_{N_S-2}\\0&\cdots&0&a_{N_S-1}&b_{N_S-1}\end{pmatrix}"
                display
              />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Constant during the whole time sweep when <InlineEquation latex="r,\sigma,h_t,N_S" /> and the
              grid are fixed. It only depends on the interior index <InlineEquation latex="i" />, not on{' '}
              <InlineEquation latex="j" />. This is why it can be factorized once and reused.
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">
              Known current-level matrix <InlineEquation latex="B_{CN}" />
            </p>
            <div className="overflow-x-auto [&_.katex-display]:my-1">
              <Katex
                math="B_{CN}=\begin{pmatrix}d_1&-c_1&0&\cdots&0\\ -a_2&d_2&-c_2&\ddots&\vdots\\0&-a_3&d_3&\ddots&0\\ \vdots&\ddots&\ddots&\ddots&-c_{N_S-2}\\0&\cdots&0&-a_{N_S-1}&d_{N_S-1}\end{pmatrix}"
                display
              />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Also constant for the same fixed grid and parameters. The vector it multiplies,{' '}
              <InlineEquation latex="\mathbf U^j" />, changes at each time level, but the matrix entries do not.
            </p>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-slate-900">Full Crank-Nicolson system</p>
          <EquationBlock latex="A_{CN}\mathbf U^{j+1}=B_{CN}\mathbf U^j+\mathbf q_{CN}^{j,j+1}" />
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-slate-900">
            Boundary contribution <InlineEquation latex="\mathbf q_{CN}^{j,j+1}" />
          </p>
          <EquationBlock latex="\mathbf q_{CN}^{j,j+1}=\begin{pmatrix}-a_1U_{0,j+1}-a_1U_{0,j}\\0\\\vdots\\0\\-c_{N_S-1}U_{N_S,j+1}-c_{N_S-1}U_{N_S,j}\end{pmatrix}" />
          <p className="text-sm text-slate-700">
            This vector generally changes with <InlineEquation latex="j" /> because it contains boundary
            values at the two time levels <InlineEquation latex="j" /> and <InlineEquation latex="j+1" />.
            For a put, <InlineEquation latex="U_{0,j}=Ke^{-r\tau_j}" /> changes with time, while{' '}
            <InlineEquation latex="U_{N_S,j}=0" /> is constant. For a call, the right boundary is the one
            that typically changes.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <p className="text-slate-700">
          The method works by assembling two tridiagonal matrices once, then solving one tridiagonal
          system per time step. The payoff and boundary functions depend on the option being priced.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Known data</p>
            <div className="text-slate-800">
              <InlineEquation latex="U_{i,0}=u_0(S_i)" />
            </div>
            <div className="mt-2 text-slate-800">
              <InlineEquation latex="U_{0,j}=u_a(\tau_j)" />
            </div>
            <div className="mt-2 text-slate-800">
              <InlineEquation latex="U_{N_S,j}=u_b(\tau_j)" />
            </div>
          </div>
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Sweep</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Create the uniform grids <InlineEquation latex="S_i=ih_S" /> and <InlineEquation latex="\tau_j=jh_t" />.</li>
              <li>Fill the initial row from the payoff and set both boundary columns for all time levels.</li>
              <li>Build <InlineEquation latex="A_{CN}" /> and <InlineEquation latex="B_{CN}" /> from the coefficient vectors <InlineEquation latex="a,b,c,d" />.</li>
              <li>Pre-factorize <InlineEquation latex="A_{CN}" /> once, because it is the same at every time step.</li>
              <li>For each time step, form the right-hand side, add boundary terms, and solve for the whole interior row.</li>
            </ol>
          </div>
        </div>
        <EquationBlock latex="A_{CN}\mathbf U^{j+1}=B_{CN}\mathbf U^j+\mathbf q_{CN}^{j,j+1}" />
        <EquationBlock latex="\begin{aligned}\mathrm{rhs}&=B_{CN}\mathbf U^j,\\ \mathrm{rhs}_1&\leftarrow \mathrm{rhs}_1-a_1(U_{0,j+1}+U_{0,j}),\\ \mathrm{rhs}_{N_S-1}&\leftarrow \mathrm{rhs}_{N_S-1}-c_{N_S-1}(U_{N_S,j+1}+U_{N_S,j}),\\ \mathbf U^{j+1}&=A_{CN}^{-1}\mathrm{rhs}.\end{aligned}" />
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Practical efficiency tips</p>
          <p className="mt-1">
            Store <InlineEquation latex="A_{CN}" /> and <InlineEquation latex="B_{CN}" /> as tridiagonal or
            sparse matrices. Since <InlineEquation latex="A_{CN}" /> does not change with time, factorize it
            once and reuse the factors. A tridiagonal solver, such as the Thomas algorithm, gives linear
            cost per time step.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Stability Analysis</h2>
        <p className="text-slate-700">
          The local Von Neumann analysis freezes the coefficients at a fixed spatial node and studies a
          Fourier mode. For Crank-Nicolson, the amplification factor is a ratio of the averaged present and
          future operators.
        </p>
        <div className="space-y-2 border-l-2 border-slate-300 pl-4">
          <p className="mb-2 text-sm font-semibold text-slate-900">Result</p>
          <SmallEquation latex="G_i(\theta)=\frac{1-P_i(\theta)+\mathrm{i}Q_i(\theta)}{1+P_i(\theta)-\mathrm{i}Q_i(\theta)}" />
          <SmallEquation latex="P_i(\theta)=\frac{rh_t}{2}+\sigma^2h_ti^2\sin^2\left(\frac{\theta}{2}\right),\qquad Q_i(\theta)=\frac{rh_t}{2}i\sin\theta" />
          <p className="text-sm text-slate-600">
            Since <InlineEquation latex="P_i(\theta)\ge 0" /> for{' '}
            <InlineEquation latex="r\ge 0" />, <InlineEquation latex="\sigma>0" />, and{' '}
            <InlineEquation latex="h_t>0" />, the denominator is at least as large as the numerator in
            modulus. Hence <InlineEquation latex="|G_i(\theta)|\le 1" /> for every wave number and every
            interior node. The method is unconditionally stable.
          </p>
        </div>
        <details className="rounded-md border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">
            Full Stability Analysis derivation
          </summary>
          <div className="space-y-1.5 border-t border-slate-200 px-4 py-3">
            <DerivationText>
              We analyse the stability of the Crank-Nicolson scheme using a local Von Neumann argument.
              At a fixed spatial node <InlineEquation latex="i" />, freeze the coefficients and start from
            </DerivationText>
            <SmallEquation latex="a_iU_{i-1,j+1}+b_iU_{i,j+1}+c_iU_{i+1,j+1}=-a_iU_{i-1,j}+d_iU_{i,j}-c_iU_{i+1,j}." />
            <DerivationText>Take the Fourier mode</DerivationText>
            <SmallEquation latex="U_{i,j}=R_je^{\mathrm{i}\theta i}," />
            <DerivationText>
              where <InlineEquation latex="\mathrm{i}=\sqrt{-1}" /> and <InlineEquation latex="\theta" /> is
              the dimensionless wave number. Substituting gives
            </DerivationText>
            <SmallEquation latex="a_iR_{j+1}e^{\mathrm{i}\theta(i-1)}+b_iR_{j+1}e^{\mathrm{i}\theta i}+c_iR_{j+1}e^{\mathrm{i}\theta(i+1)}=-a_iR_je^{\mathrm{i}\theta(i-1)}+d_iR_je^{\mathrm{i}\theta i}-c_iR_je^{\mathrm{i}\theta(i+1)}." />
            <DerivationText>Dividing by <InlineEquation latex="e^{\mathrm{i}\theta i}" />,</DerivationText>
            <SmallEquation latex="R_{j+1}\left(a_ie^{-\mathrm{i}\theta}+b_i+c_ie^{\mathrm{i}\theta}\right)=R_j\left(-a_ie^{-\mathrm{i}\theta}+d_i-c_ie^{\mathrm{i}\theta}\right)." />
            <DerivationText>Hence the amplification factor is</DerivationText>
            <SmallEquation latex="G_i(\theta):=\frac{R_{j+1}}{R_j}=\frac{-a_ie^{-\mathrm{i}\theta}+d_i-c_ie^{\mathrm{i}\theta}}{a_ie^{-\mathrm{i}\theta}+b_i+c_ie^{\mathrm{i}\theta}}." />
            <DerivationText>Using the trigonometric exponential identities, the denominator is</DerivationText>
            <SmallEquation latex="a_ie^{-\mathrm{i}\theta}+b_i+c_ie^{\mathrm{i}\theta}=b_i+(a_i+c_i)\cos\theta+\mathrm{i}(c_i-a_i)\sin\theta." />
            <DerivationText>From the coefficient definitions,</DerivationText>
            <SmallEquation latex="a_i+c_i=-\frac{\sigma^2h_t}{2}i^2,\qquad c_i-a_i=-\frac{rh_t}{2}i." />
            <DerivationText>Therefore,</DerivationText>
            <SmallEquation latex="a_ie^{-\mathrm{i}\theta}+b_i+c_ie^{\mathrm{i}\theta}=1+\frac{rh_t}{2}+\frac{\sigma^2h_t}{2}i^2(1-\cos\theta)-\mathrm{i}\frac{rh_t}{2}i\sin\theta." />
            <SmallEquation latex="=1+\frac{rh_t}{2}+\sigma^2h_ti^2\sin^2\left(\frac{\theta}{2}\right)-\mathrm{i}\frac{rh_t}{2}i\sin\theta." />
            <DerivationText>Similarly, the numerator is</DerivationText>
            <SmallEquation latex="-a_ie^{-\mathrm{i}\theta}+d_i-c_ie^{\mathrm{i}\theta}=1-\frac{rh_t}{2}-\sigma^2h_ti^2\sin^2\left(\frac{\theta}{2}\right)+\mathrm{i}\frac{rh_t}{2}i\sin\theta." />
            <DerivationText>Define</DerivationText>
            <SmallEquation latex="P_i(\theta)=\frac{rh_t}{2}+\sigma^2h_ti^2\sin^2\left(\frac{\theta}{2}\right),\qquad Q_i(\theta)=\frac{rh_t}{2}i\sin\theta." />
            <DerivationText>Then</DerivationText>
            <SmallEquation latex="a_ie^{-\mathrm{i}\theta}+b_i+c_ie^{\mathrm{i}\theta}=1+P_i(\theta)-\mathrm{i}Q_i(\theta)," />
            <SmallEquation latex="-a_ie^{-\mathrm{i}\theta}+d_i-c_ie^{\mathrm{i}\theta}=1-P_i(\theta)+\mathrm{i}Q_i(\theta)." />
            <DerivationText>Therefore,</DerivationText>
            <SmallEquation latex="G_i(\theta)=\frac{1-P_i(\theta)+\mathrm{i}Q_i(\theta)}{1+P_i(\theta)-\mathrm{i}Q_i(\theta)}." />
            <DerivationText>The Von Neumann condition requires <InlineEquation latex="|G_i(\theta)|\le 1" />. From the previous expression,</DerivationText>
            <SmallEquation latex="|G_i(\theta)|^2=\frac{\left[1-P_i(\theta)\right]^2+\left[Q_i(\theta)\right]^2}{\left[1+P_i(\theta)\right]^2+\left[Q_i(\theta)\right]^2}." />
            <DerivationText>
              Assuming <InlineEquation latex="r\ge 0" />, <InlineEquation latex="\sigma>0" />, and{' '}
              <InlineEquation latex="h_t>0" />, we have <InlineEquation latex="P_i(\theta)\ge 0" />.
              Therefore,
            </DerivationText>
            <SmallEquation latex="\left[1+P_i(\theta)\right]^2-\left[1-P_i(\theta)\right]^2=4P_i(\theta)\ge 0." />
            <DerivationText>Thus,</DerivationText>
            <SmallEquation latex="\left[1-P_i(\theta)\right]^2+\left[Q_i(\theta)\right]^2\le \left[1+P_i(\theta)\right]^2+\left[Q_i(\theta)\right]^2," />
            <SmallEquation latex="|G_i(\theta)|^2\le 1,\qquad |G_i(\theta)|\le 1." />
            <DerivationText>
              This holds for every wave number, every interior node, and every choice of{' '}
              <InlineEquation latex="h_t>0" />. Therefore, Crank-Nicolson is unconditionally stable in
              the Von Neumann sense. Stability does not mean arbitrary large time steps are accurate:
              accuracy still requires sufficiently fine time and space discretisations.
            </DerivationText>
          </div>
        </details>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Simulation</h2>
        <p className="text-slate-700">
          The example below uses the course defaults <InlineEquation latex="r=0.06" />,{' '}
          <InlineEquation latex="\sigma=0.30" />, <InlineEquation latex="K=10" />,{' '}
          <InlineEquation latex="T=1" /> and <InlineEquation latex="S^*=15" />. Each new row is obtained by
          solving the Crank-Nicolson system with both the previous row and the future boundary values.
        </p>
        <CrankNicolsonCalculationExample />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">MATLAB Implementation Example</h2>
        <p className="text-slate-700">
          One efficient implementation is to assemble the sparse tridiagonal matrices and reuse an LU
          factorization of <InlineEquation latex="A_{CN}" /> throughout the time loop.
        </p>
        <MatlabCodePanel file="bs_cn.m" snippets={bsCnSnippets} />
      </section>
    </PageLayout>
  )
}
