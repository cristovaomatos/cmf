import type { ReactNode } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'

function SvgMath({
  math,
  x,
  y,
  width = 92,
  height = 26,
  className = 'text-slate-700',
}: {
  math: string
  x: number
  y: number
  width?: number
  height?: number
  className?: string
}) {
  return (
    <foreignObject x={x - width / 2} y={y - height / 2} width={width} height={height}>
      <div className={`text-center text-xs font-semibold ${className}`}>
        <Katex math={math} />
      </div>
    </foreignObject>
  )
}

function TimeGridDiagram() {
  const width = 860
  const height = 215
  const margin = { left: 70, right: 60, top: 54, bottom: 48 }
  const steps = 6
  const plotWidth = width - margin.left - margin.right
  const x = (index: number) => margin.left + (index / steps) * plotWidth
  const y = 105

  return (
    <figure className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="SDE time grid">
        <text x={margin.left} y={22} className="fill-slate-900 text-sm font-semibold">
          Time discretisation and Brownian increments
        </text>
        <line x1={x(0)} y1={y} x2={x(steps)} y2={y} className="stroke-slate-700" strokeWidth={2} />
        {Array.from({ length: steps + 1 }, (_, index) => (
          <g key={index}>
            <circle cx={x(index)} cy={y} r={7} className={index === 0 ? 'fill-emerald-500' : 'fill-blue-500'} />
            <line x1={x(index)} y1={y + 10} x2={x(index)} y2={y + 24} className="stroke-slate-500" />
            <SvgMath math={index === 0 ? 't_0' : index === steps ? 't_N' : `t_${index}`} x={x(index)} y={y + 45} width={46} />
          </g>
        ))}
        {Array.from({ length: steps }, (_, index) => (
          <g key={index}>
            <path
              d={`M ${x(index) + 18} ${y - 20} C ${x(index) + 44} ${y - 42}, ${x(index + 1) - 44} ${y - 42}, ${
                x(index + 1) - 18
              } ${y - 20}`}
              fill="none"
              className="stroke-slate-400"
              strokeWidth={1.6}
            />
            <SvgMath math="\Delta B_i" x={(x(index) + x(index + 1)) / 2} y={y - 56} width={82} className="text-slate-600" />
          </g>
        ))}
        <SvgMath math="X_0=x_0" x={x(0)} y={y - 31} width={82} className="text-emerald-700" />
        <SvgMath math="X_N\approx X(T)" x={x(steps)} y={y - 31} width={122} className="text-blue-700" />
        <SvgMath math="h=\frac{T}{N}" x={width - margin.right - 18} y={height - 18} width={72} className="text-slate-600" />
      </svg>
      <figcaption className="mt-2 text-xs text-slate-600">
        Each time step combines a deterministic drift contribution and a random Brownian increment.
      </figcaption>
    </figure>
  )
}

function MethodPreviewCard({
  title,
  children,
  accent,
}: {
  title: string
  children: ReactNode
  accent: 'blue' | 'emerald'
}) {
  const classes =
    accent === 'blue'
      ? 'border-blue-200 bg-blue-50 text-blue-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800'

  return (
    <div className={`rounded-md border px-4 py-3 ${classes}`}>
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="space-y-2 text-sm text-slate-700">{children}</div>
    </div>
  )
}

export default function StochasticDifferentialEquationsIntro() {
  return (
    <PageLayout
      title="Numerical Methods for Stochastic Differential Equations"
      rightPanel={{
        known: 'Initial condition, drift a, diffusion b, time horizon T, and Brownian increments.',
        unknown: 'A numerical path approximating X(t_i) at the time grid points.',
        method: 'Discretise time and approximate the deterministic and stochastic integrals over each step.',
        takeaway:
          'SDE methods are pathwise time-stepping schemes: the solution depends on the Brownian realisation, not only on time.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Motivation</h2>
        <p className="text-slate-700">
          In finance, many quantities evolve under uncertainty. Asset prices, interest rates and volatility
          factors are often modelled by stochastic differential equations. A typical Ito SDE is written as
        </p>
        <EquationBlock latex="dX(t)=a(t,X(t))\,dt+b(t,X(t))\,dB(t),\qquad X(0)=x_0." />
        <p className="text-slate-700">
          The coefficient <InlineEquation latex="a(t,X(t))" /> is the drift, while{' '}
          <InlineEquation latex="b(t,X(t))" /> is the diffusion coefficient multiplying the Brownian motion increment.
          When closed-form solutions are unavailable, we approximate the process on a time grid.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">From SDE to Time Steps</h2>
        <p className="text-slate-700">
          Choose equally spaced time points
        </p>
        <EquationBlock latex="t_0=0,\quad t_1=h,\quad t_2=2h,\quad \ldots,\quad t_N=Nh=T,\qquad h=\frac{T}{N}." />
        <p className="text-slate-700">
          The objective is to approximate the random variables{' '}
          <InlineEquation latex="X(t_1),X(t_2),\ldots,X(t_N)" />. Their values depend on the particular Brownian
          path being simulated.
        </p>
        <TimeGridDiagram />
        <p className="text-slate-700">
          The SDE is interpreted through its integral form. Subtracting the integral representation at{' '}
          <InlineEquation latex="t_i" /> from the one at <InlineEquation latex="t_{i+1}" /> gives the one-step identity
        </p>
        <EquationBlock latex="X(t_{i+1})=X(t_i)+\int_{t_i}^{t_{i+1}}a(s,X(s))\,ds+\int_{t_i}^{t_{i+1}}b(s,X(s))\,dB(s)." />
        <p className="text-slate-700">
          Different numerical methods arise from different approximations of these two integrals.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Brownian Increment</h2>
        <p className="text-slate-700">
          On each time interval, Brownian motion contributes a random increment
        </p>
        <EquationBlock latex="\Delta B_i=B(t_{i+1})-B(t_i)=\sqrt{h}\,Z_i,\qquad Z_i\sim N(0,1)." />
        <p className="text-slate-700">
          This is the main difference from deterministic ODE methods: the numerical update contains a random
          term, and therefore each simulation produces one possible path. Repeating the simulation with many
          Brownian paths lets us estimate distributions, means, errors and option prices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Method Preview</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <MethodPreviewCard title="Euler-Maruyama method" accent="blue">
            <p>
              Euler-Maruyama is the direct stochastic analogue of explicit Euler. It freezes the drift and
              diffusion at the beginning of the time step:
            </p>
            <EquationBlock latex="X_{i+1}=X_i+a(t_i,X_i)h+b(t_i,X_i)\Delta B_i." />
            <p>
              If <InlineEquation latex="b\equiv0" />, this reduces to the explicit Euler method for deterministic
              ODEs. For regular coefficients, it has strong order <InlineEquation latex="1/2" /> and weak order{' '}
              <InlineEquation latex="1" />.
            </p>
          </MethodPreviewCard>
          <MethodPreviewCard title="Milstein method" accent="emerald">
            <p>
              Milstein adds an Ito correction term involving the derivative of the diffusion coefficient. This
              improves the strong convergence order:
            </p>
            <EquationBlock latex="X_{i+1}=X_i+a(t_i,X_i)h+b(t_i,X_i)\Delta B_i+\frac12 b(t_i,X_i)b'(t_i,X_i)\left((\Delta B_i)^2-h\right)." />
            <p>
              The method has strong order <InlineEquation latex="1" /> and weak order{' '}
              <InlineEquation latex="1" />, assuming sufficient regularity.
            </p>
          </MethodPreviewCard>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Strong and Weak Viewpoints</h2>
        <p className="text-slate-700">
          There are two natural ways to judge a numerical SDE method. If we use the same Brownian path for the
          exact and numerical solutions, we can compare trajectories path by path. This leads to strong
          convergence:
        </p>
        <EquationBlock latex="e(h)=\mathbb E\left(\left|X(t_N)-X_N^h\right|\right),\qquad e(h)=O(h^\gamma)." />
        <p className="text-slate-700">
          Strong convergence matters when the path itself is important. In other applications we care mainly
          about the distribution or expectations of the terminal value. Then we use weak convergence:
        </p>
        <EquationBlock latex="\left|\mathbb E[X(t_N)]-\mathbb E[X_N^h]\right|=O(h^\gamma)." />
        <p className="text-slate-700">
          The next pages will derive Euler-Maruyama and Milstein in detail, implement them on concrete SDEs,
          and compare their observed convergence behaviour.
        </p>
      </section>
    </PageLayout>
  )
}
