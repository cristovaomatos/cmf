import { useState, type ReactNode } from 'react'
import { MatlabCodePanel } from '../components/Code/MatlabCodePanel'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
import { AmericanPSORCalculationExample } from '../components/Visuals/AmericanPSORCalculationExample'
import { ObstacleDiagram } from '../components/Visuals/ObstacleDiagram'
import { PSORIterationView, PSORConvergenceChart } from '../components/Visuals/PSORIterationView'
import { bsAmericanPutPsorSnippets } from '../data/matlabSnippets'

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

export default function AmericanPSORMethod() {
  const [showProjection, setShowProjection] = useState(false)
  const [omega, setOmega] = useState(1.2)

  return (
    <PageLayout
      title="American Option and PSOR Method"
      rightPanel={{
        known: 'The Crank-Nicolson matrices A_CN, B_CN and the payoff obstacle g(S).',
        unknown: 'The constrained interior vector U^{j+1}, satisfying U^{j+1} >= g at every node.',
        method: 'Project each Crank-Nicolson time step onto the admissible region U >= g using PSOR.',
        matlabFile: 'bs_american_put_psor.m',
        takeaway:
          'PSOR solves the linear complementarity problem at each time step by combining an SOR sweep with a projection onto the non-negative region, so the American put value never falls below the payoff.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Obstacle Formulation</h2>
        <p className="text-slate-700">
          For an American put, the holder may exercise before maturity. In the reversed-time variable{' '}
          <InlineEquation latex={String.raw`\tau=T-t`} />,{' '}
          <InlineEquation latex={String.raw`U(S,\tau)=V(S,T-\tau)`} />, the payoff
          becomes both the initial condition and the obstacle:
        </p>
        <EquationBlock latex={String.raw`g(S)=\max(K-S,0)`} />
        <p className="text-slate-700">
          On the grid <InlineEquation latex="S_i=ih_S" />, define{' '}
          <InlineEquation latex={String.raw`g_i=\max(K-S_i,0)`} /> and collect the interior obstacle values
          into <InlineEquation latex={String.raw`\mathbf g=(g_1,\ldots,g_{N_S-1})^T`} />.
          The American constraint is
        </p>
        <EquationBlock latex={String.raw`U_{i,j}\geq g_i,\qquad i=1,\ldots,N_S-1`} />
        <Interpretation>
          For an American put, the numerical value cannot fall below the immediate exercise payoff. If{' '}
          <InlineEquation latex="U_{i,j}=g_i" />, exercise is optimal at that node. If{' '}
          <InlineEquation latex="U_{i,j}>g_i" />, continuation is optimal.
        </Interpretation>

        <p className="text-slate-700">
          For the European problem, one Crank-Nicolson time step has the matrix form{' '}
          <InlineEquation latex={String.raw`A_{CN}\mathbf U^{j+1}=B_{CN}\mathbf U^j+\mathbf q_{CN}^{j,j+1}`} />. For the
          American problem, the same matrices are used, but the new vector must also satisfy the obstacle
          constraint. Define the right-hand side
        </p>
        <EquationBlock latex={String.raw`\mathbf r^{j,j+1}=B_{CN}\mathbf U^j+\mathbf q_{CN}^{j,j+1}`} />
        <p className="text-slate-700">
          Without the early-exercise constraint we would solve{' '}
          <InlineEquation latex={String.raw`A_{CN}\mathbf U^{j+1}=\mathbf r^{j,j+1}`} />. For the American option, set{' '}
          <InlineEquation latex={String.raw`\mathbf w=\mathbf U^{j+1}`} />; the new vector must satisfy{' '}
          <InlineEquation latex={String.raw`\mathbf w\geq \mathbf g`} />. Thus the time step becomes a linear
          complementarity problem:
        </p>
        <EquationBlock latex={String.raw`\begin{aligned}\mathbf w-\mathbf g&\geq 0,\\ A_{CN}\mathbf w-\mathbf r^{j,j+1}&\geq 0,\\ (\mathbf w-\mathbf g)^T\left(A_{CN}\mathbf w-\mathbf r^{j,j+1}\right)&=0.\end{aligned}`} />
        <Interpretation>
          At a continuation node, <InlineEquation latex="w_i>g_i" />: the obstacle is inactive and the
          Crank-Nicolson equation holds as an equality. At an exercise node,{' '}
          <InlineEquation latex="w_i=g_i" />: the obstacle is active and the option value is pinned to the
          payoff.
        </Interpretation>

        <div>
          <button
            type="button"
            onClick={() => setShowProjection((v) => !v)}
            className="mb-3 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showProjection ? 'Show unconstrained solution' : 'Project onto admissible region'}
          </button>
          <ObstacleDiagram showProjection={showProjection} />
        </div>

        <details className="rounded-md border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">
            Shift above the obstacle
          </summary>
          <div className="space-y-1.5 border-t border-slate-200 px-4 py-3">
            <DerivationText>Introduce the shifted variable</DerivationText>
            <SmallEquation latex={String.raw`\mathbf x=\mathbf w-\mathbf g.`} />
            <DerivationText>
              Then <InlineEquation latex={String.raw`\mathbf x\geq 0`} /> is exactly the American exercise constraint.
              Since <InlineEquation latex={String.raw`\mathbf w=\mathbf x+\mathbf g`} />, we have
            </DerivationText>
            <SmallEquation latex={String.raw`A_{CN}\mathbf w-\mathbf r^{j,j+1}=A_{CN}\mathbf x-\left(\mathbf r^{j,j+1}-A_{CN}\mathbf g\right).`} />
            <DerivationText>Define</DerivationText>
            <SmallEquation latex={String.raw`\tilde{\mathbf b}^{j,j+1}=\mathbf r^{j,j+1}-A_{CN}\mathbf g.`} />
            <DerivationText>Then the complementarity problem becomes</DerivationText>
            <SmallEquation latex={String.raw`\begin{aligned}\mathbf x&\geq 0,\\ A_{CN}\mathbf x-\tilde{\mathbf b}^{j,j+1}&\geq 0,\\ \mathbf x^T\left(A_{CN}\mathbf x-\tilde{\mathbf b}^{j,j+1}\right)&=0.\end{aligned}`} />
            <DerivationText>Once <InlineEquation latex={String.raw`\mathbf x`} /> is found, the option value is recovered by</DerivationText>
            <SmallEquation latex={String.raw`\mathbf U^{j+1}=\mathbf x+\mathbf g.`} />
          </div>
        </details>
        <Interpretation>
          The transformation <InlineEquation latex={String.raw`\mathbf x=\mathbf w-\mathbf g`} /> changes the lower
          bound from <InlineEquation latex={String.raw`\mathbf w\geq \mathbf g`} /> to the simpler condition{' '}
          <InlineEquation latex={String.raw`\mathbf x\geq 0`} />. The PSOR method can then use a SOR step followed by a
          projection onto the non-negative region.
        </Interpretation>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">PSOR Iteration</h2>
        <p className="text-slate-700">Split the tridiagonal matrix into its diagonal, strictly lower, and strictly upper parts:</p>
        <EquationBlock latex="A_{CN}=D+L+R" />
        <p className="text-slate-700">
          For a relaxation parameter <InlineEquation latex={String.raw`0<\omega<2`} />, define
        </p>
        <EquationBlock latex={String.raw`M_1=D+\omega L,\qquad M_2=(1-\omega)D-\omega R.`} />
        <p className="text-slate-700">
          Each iteration first performs the lower-triangular SOR solve and then projects the resulting vector:
        </p>
        <EquationBlock latex={String.raw`\mathbf z^{(m+1)}=M_1^{-1}\left(M_2\mathbf x^{(m)}+\omega\tilde{\mathbf b}^{j,j+1}\right)`} />
        <EquationBlock latex={String.raw`\mathbf x^{(m+1)}=\max\left(\mathbf 0,\mathbf z^{(m+1)}\right)`} />
        <Interpretation>
          The triangular solve performs the SOR step efficiently using the tridiagonal matrix. The subsequent
          projection enforces the American constraint. A projected component{' '}
          <InlineEquation latex="x_i=0" /> means <InlineEquation latex="U_{i,j+1}=g_i" />.
        </Interpretation>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Relaxation parameter <InlineEquation latex={String.raw`\omega`} /> = {omega.toFixed(2)}
          </label>
          <input
            type="range"
            min={0.5}
            max={1.9}
            step={0.05}
            value={omega}
            onChange={(e) => setOmega(Number(e.target.value))}
            className="w-full max-w-md"
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <PSORIterationView omega={omega} />
          <PSORConvergenceChart omega={omega} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Algorithm</h2>
        <p className="text-slate-700">At a fixed time step <InlineEquation latex={String.raw`j\to j+1`} />, the PSOR algorithm is:</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Compute the Crank-Nicolson right-hand side: <InlineEquation latex={String.raw`\mathbf r^{j,j+1}=B_{CN}\mathbf U^j+\mathbf q_{CN}^{j,j+1}`} />.</li>
          <li>Shift the right-hand side by the obstacle: <InlineEquation latex={String.raw`\tilde{\mathbf b}^{j,j+1}=\mathbf r^{j,j+1}-A_{CN}\mathbf g`} />.</li>
          <li>Choose an initial guess, for example the previous continuation value: <InlineEquation latex={String.raw`\mathbf x^{(0)}=\max(\mathbf U^j-\mathbf g,0)`} />.</li>
          <li>Solve <InlineEquation latex={String.raw`M_1\mathbf z=M_2\mathbf x^{(m)}+\omega\tilde{\mathbf b}`} /> by forward substitution, then set <InlineEquation latex={String.raw`\mathbf x^{(m+1)}=\max(\mathbf 0,\mathbf z)`} />.</li>
          <li>Repeat the sweeps until <InlineEquation latex={String.raw`\|\mathbf x^{(m+1)}-\mathbf x^{(m)}\|_\infty<\text{tol}`} />, or until a maximum number of iterations is reached.</li>
          <li>Recover the American option value: <InlineEquation latex={String.raw`\mathbf U^{j+1}=\mathbf x^{(m+1)}+\mathbf g`} />.</li>
        </ol>

        <details className="rounded-md border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-900">
            Algorithmic optimisations
          </summary>
          <div className="space-y-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">Use the tridiagonal structure.</span> The PSOR sweep should use only the three diagonals a_i, b_i, c_i. There is no need to store or multiply a full matrix.</p>
            <p><span className="font-semibold text-slate-900">Precompute constant quantities.</span> For fixed r, sigma, h_t, h_S, N_S, the coefficients a_i,b_i,c_i,d_i, the matrices A_CN, B_CN, and the obstacle g do not change with time. The product A_CN*g is also constant and can be precomputed once.</p>
            <p><span className="font-semibold text-slate-900">Use a warm start.</span> A good initial guess is <InlineEquation latex={String.raw`\mathbf x^{(0)}=\max(\mathbf U^j-\mathbf g,0)`} />, because neighbouring time levels are close when h_t is small. This usually reduces the number of PSOR iterations.</p>
            <p><span className="font-semibold text-slate-900">Choose the relaxation parameter carefully.</span> The value omega=1 gives the projected Gauss-Seidel method. Values <InlineEquation latex={String.raw`1<\omega<2`} /> can accelerate convergence, but too large a value may slow convergence or cause oscillatory iterations.</p>
            <p><span className="font-semibold text-slate-900">Use an infinity-norm stopping rule.</span> A practical stopping criterion is <InlineEquation latex={String.raw`\|\mathbf x^{(m+1)}-\mathbf x^{(m)}\|_\infty<\text{tol}`} />. The tolerance should be chosen consistently with the discretisation error.</p>
            <p><span className="font-semibold text-slate-900">Extract the free boundary with a tolerance.</span> Compare <InlineEquation latex="U_{i,j+1}" /> with g_i using a tolerance: exercise if the difference is small, continuation otherwise. The free boundary is estimated by interpolation between the last exercise node and the first continuation node.</p>
          </div>
        </details>
        <Interpretation>
          The main computational savings come from exploiting the tridiagonal structure, precomputing
          constant quantities, using the previous time level as a warm start, and projecting only the
          shifted variable <InlineEquation latex={String.raw`\mathbf x=\mathbf U^{j+1}-\mathbf g`} />.
        </Interpretation>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Free Boundary and Exercise Region</h2>
        <p className="text-slate-700">After computing <InlineEquation latex={String.raw`\mathbf U^{j+1}`} />, compare the option value with the obstacle. The exercise region is</p>
        <EquationBlock latex={String.raw`\mathcal{E}^{j+1}=\{S_i:\ U_{i,j+1}=g_i\}`} />
        <p className="text-slate-700">and the continuation region is</p>
        <EquationBlock latex={String.raw`\mathcal{C}^{j+1}=\{S_i:\ U_{i,j+1}>g_i\}`} />
        <p className="text-slate-700">
          The free boundary is the curve separating the exercise region from the continuation region. For
          an American put, early exercise is expected for sufficiently small values of{' '}
          <InlineEquation latex="S" />, while continuation is optimal for larger values of{' '}
          <InlineEquation latex="S" />.
        </p>
        <Interpretation>
          For an American put, the option is exercised when the asset price is low enough that the
          immediate payoff <InlineEquation latex="K-S" /> is more valuable than waiting. The free boundary
          marks the critical asset price separating immediate exercise from continuation.
        </Interpretation>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Simulation</h2>
        <p className="text-slate-700">
          The example below uses the course defaults <InlineEquation latex="r=0.06" />,{' '}
          <InlineEquation latex={String.raw`\sigma=0.30`} />, <InlineEquation latex="K=10" />,{' '}
          <InlineEquation latex="T=1" /> and <InlineEquation latex="S^*=15" />. Each new row is obtained by
          running PSOR on the Crank-Nicolson system for that time step, then classifying every node as
          exercise or continuation.
        </p>
        <AmericanPSORCalculationExample />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Recovering the Original Option Value</h2>
        <p className="text-slate-700">The computation is performed in the reversed time variable. The original option value is recovered by</p>
        <EquationBlock latex="V(S,t)=U(S,T-t)." />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">MATLAB Implementation Example</h2>
        <p className="text-slate-700">
          One efficient implementation precomputes the matrix splitting and the obstacle product{' '}
          <InlineEquation latex={String.raw`A_{CN}\mathbf g`} /> once, then runs the projected SOR sweep at every time
          step.
        </p>
        <MatlabCodePanel file="bs_american_put_psor.m" snippets={bsAmericanPutPsorSnippets} />
      </section>
    </PageLayout>
  )
}
