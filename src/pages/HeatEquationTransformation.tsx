import { PageLayout } from '../components/Layout/PageLayout'
import { DerivationStep } from '../components/Math/DerivationStep'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'

function TransformationPipeline() {
  const items = ['Heat equation', 'Exponential rescaling', 'Change of variables', 'Black-Scholes equation']
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700">{s}</span>
          {i < items.length - 1 && <span className="text-slate-400">→</span>}
        </div>
      ))}
    </div>
  )
}

function ReversalDiagram() {
  return (
    <div className="flex items-center justify-center gap-6 rounded-lg border border-slate-200 bg-slate-50 p-6">
      <div className="text-center">
        <div className="text-sm font-medium text-slate-500">Known at maturity</div>
        <div className="mt-1 text-lg font-semibold text-slate-900">V(S,T)</div>
      </div>
      <span className="text-2xl text-blue-600">⇒</span>
      <div className="text-center">
        <div className="text-sm font-medium text-slate-500">Known at computational time zero</div>
        <div className="mt-1 text-lg font-semibold text-slate-900">U(S,0)</div>
      </div>
    </div>
  )
}

const steps = [
  {
    title: 'Target heat equation',
    body: (
      <>
        <p className="text-sm text-slate-600">The transformation starts from the standard heat equation.</p>
        <EquationBlock latex="\frac{\partial y}{\partial z} = \frac{\partial^2 y}{\partial x^2}" />
      </>
    ),
  },
  {
    title: 'Exponential rescaling substitution',
    body: (
      <>
        <p className="text-sm text-slate-600">Introduce an exponentially rescaled unknown.</p>
        <EquationBlock latex="w(x,z) = e^{\alpha x + \beta z}\,y(x,z)" />
      </>
    ),
  },
  {
    title: 'Transform the time derivative',
    body: (
      <>
        <EquationBlock latex="\frac{\partial w}{\partial z} = e^{\alpha x+\beta z}\left(\frac{\partial y}{\partial z} + \beta y\right)" />
        <p className="text-sm text-slate-600">so that</p>
        <EquationBlock latex="\frac{\partial y}{\partial z} = e^{-(\alpha x+\beta z)}\frac{\partial w}{\partial z} - \beta y" />
      </>
    ),
  },
  {
    title: 'Transform the spatial derivative',
    body: (
      <>
        <EquationBlock latex="\frac{\partial w}{\partial x} = e^{\alpha x+\beta z}\left(\frac{\partial y}{\partial x} + \alpha y\right)" />
        <p className="text-sm text-slate-600">so that</p>
        <EquationBlock latex="\frac{\partial y}{\partial x} = e^{-(\alpha x+\beta z)}\frac{\partial w}{\partial x} - \alpha y" />
      </>
    ),
  },
  {
    title: 'Transform the second spatial derivative',
    body: (
      <>
        <p className="text-sm text-slate-600">
          Differentiating once more and using the heat equation <InlineEquation latex="y_z = y_{xx}" /> gives
        </p>
        <EquationBlock latex="\frac{\partial w}{\partial z} = \frac{\partial^2 w}{\partial x^2} - 2\alpha\frac{\partial w}{\partial x} + (\alpha^2+\beta)w" />
      </>
    ),
  },
  {
    title: 'Change of variables toward S and t',
    body: (
      <>
        <p className="text-sm text-slate-600">
          Writing the strike as <InlineEquation latex="K" /> and defining <InlineEquation latex="\kappa = \dfrac{2r}{\sigma^2}" />,
          introduce
        </p>
        <EquationBlock latex="x = \log\!\left(\frac{S}{K}\right), \qquad z = \frac{\sigma^2}{2}t, \qquad U(S,t) = K\,w(x(S),z(t))" />
        <p className="text-sm text-slate-600">equivalently,</p>
        <EquationBlock latex="w = \frac{U}{K}" />
      </>
    ),
  },
  {
    title: 'Chain rule for the derivatives',
    body: (
      <>
        <EquationBlock latex="\frac{\partial w}{\partial z} = \frac{2}{K\sigma^2}\frac{\partial U}{\partial t}" />
        <EquationBlock latex="\frac{\partial w}{\partial x} = \frac{S}{K}\frac{\partial U}{\partial S}" />
      </>
    ),
  },
  {
    title: 'Second derivative in S',
    body: (
      <>
        <EquationBlock latex="\frac{\partial^2 U}{\partial S^2} = \frac{K}{S^2}\left(\frac{\partial^2 w}{\partial x^2} - \frac{\partial w}{\partial x}\right)" />
        <p className="text-sm text-slate-600">Substituting the transformed heat equation and simplifying gives</p>
        <EquationBlock latex="\frac{\partial U}{\partial t} = \frac{S^2\sigma^2}{2}\frac{\partial^2 U}{\partial S^2} + \frac{\sigma^2}{2}(1-2\alpha)S\frac{\partial U}{\partial S} + \frac{\sigma^2}{2}(\alpha^2+\beta)U" />
      </>
    ),
  },
  {
    title: 'Forward-time form of the Black-Scholes PDE',
    body: (
      <>
        <p className="text-sm text-slate-600">Starting from the Black-Scholes PDE,</p>
        <EquationBlock latex="\frac{\partial V}{\partial t} + \frac{1}{2}\sigma^2S^2\frac{\partial^2 V}{\partial S^2} + rS\frac{\partial V}{\partial S} - rV = 0," />
        <p className="text-sm text-slate-600">
          define <InlineEquation latex="U(S,t) = V(S,T-t)" />, so that <InlineEquation latex="\dfrac{\partial U}{\partial t} = -\dfrac{\partial V}{\partial t}" />.
          The forward-time form is
        </p>
        <EquationBlock latex="\frac{\partial U}{\partial t} = \frac{1}{2}\sigma^2S^2\frac{\partial^2 U}{\partial S^2} + rS\frac{\partial U}{\partial S} - rU" />
        <div className="mt-2">
          <ReversalDiagram />
        </div>
      </>
    ),
  },
  {
    title: 'Match coefficients to fix alpha and beta',
    body: (
      <>
        <p className="text-sm text-slate-600">Matching this equation with the heat-equation-derived form requires</p>
        <EquationBlock latex="\frac{\sigma^2}{2}(1-2\alpha) = r, \qquad \frac{\sigma^2}{2}(\alpha^2+\beta) = -r" />
        <p className="text-sm text-slate-600">equivalently,</p>
        <EquationBlock latex="1-2\alpha = \frac{2r}{\sigma^2} = \kappa, \qquad \alpha^2+\beta = -\frac{2r}{\sigma^2} = -\kappa" />
        <p className="text-sm text-slate-600">Solving for the two constants,</p>
        <EquationBlock latex="\alpha = \frac{1-\kappa}{2}" />
        <EquationBlock latex="\beta = -\kappa - \alpha^2 = -\frac{(\kappa+1)^2}{4}" />
      </>
    ),
  },
  {
    title: 'Initial and boundary conditions',
    body: (
      <>
        <p className="text-sm text-slate-600">The terminal condition for V becomes the initial condition for U:</p>
        <EquationBlock latex="U(S,0) = V(S,T) = u_0(S)" />
        <p className="text-sm text-slate-600">and the boundary conditions carry over directly:</p>
        <EquationBlock latex="U(0,t) = u_a(t), \qquad U(S^*,t) = u_b(t)" />
      </>
    ),
  },
]

export default function HeatEquationTransformation() {
  return (
    <PageLayout
      title="From Heat Equation to Black-Scholes"
      rightPanel={{
        known: 'The heat equation and the exponential/logarithmic substitutions that relate it to the Black-Scholes PDE.',
        unknown: 'The constants alpha, beta, and the time-reversed option value U(S,t).',
        method: 'Change of variables, matched against a reverse-time rewriting of the Black-Scholes PDE.',
        takeaway:
          'The numerical methods are applied to the time-reversed formulation for U(S,t), and the original option price is recovered by V(S,t)=U(S,T-t).',
      }}
    >
      <p className="text-slate-700">
        The Black-Scholes equation can be transformed into the standard heat equation through a
        change of variables. The derivation instead runs in reverse: starting from the heat equation
        and rescaling it back into the Black-Scholes PDE, then matching the result against a
        time-reversed rewriting of the original equation.
      </p>

      <TransformationPipeline />

      <div className="space-y-4">
        {steps.map((s, i) => (
          <DerivationStep key={s.title} index={i} total={steps.length} title={s.title}>
            {s.body}
          </DerivationStep>
        ))}
      </div>
    </PageLayout>
  )
}
