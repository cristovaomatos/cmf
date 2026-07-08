import { PageLayout } from '../components/Layout/PageLayout'

function ProjectMap() {
  return (
    <svg viewBox="0 0 700 260" className="w-full">
      <g fontFamily="ui-sans-serif, system-ui" fontSize="14">
        <rect x="270" y="10" width="160" height="36" rx="6" className="fill-slate-800" />
        <text x="350" y="33" textAnchor="middle" className="fill-white">Black-Scholes PDE</text>

        <line x1="350" y1="46" x2="180" y2="90" stroke="#94a3b8" strokeWidth="2" />
        <line x1="350" y1="46" x2="520" y2="90" stroke="#94a3b8" strokeWidth="2" />

        <rect x="90" y="90" width="180" height="36" rx="6" className="fill-blue-600" />
        <text x="180" y="113" textAnchor="middle" className="fill-white">European Put</text>

        <rect x="430" y="90" width="180" height="36" rx="6" className="fill-emerald-600" />
        <text x="520" y="113" textAnchor="middle" className="fill-white">American Put</text>

        <line x1="180" y1="126" x2="180" y2="150" stroke="#94a3b8" strokeWidth="2" />
        <rect x="70" y="150" width="220" height="32" rx="6" className="fill-blue-50 stroke-blue-300" strokeWidth="1" />
        <text x="180" y="171" textAnchor="middle" className="fill-blue-900">Crank-Nicolson</text>

        <line x1="180" y1="182" x2="180" y2="200" stroke="#94a3b8" strokeWidth="2" />
        <rect x="60" y="200" width="240" height="32" rx="6" className="fill-blue-50 stroke-blue-300" strokeWidth="1" />
        <text x="180" y="221" textAnchor="middle" className="fill-blue-900">Method of Lines + RK4</text>

        <line x1="520" y1="126" x2="520" y2="150" stroke="#94a3b8" strokeWidth="2" />
        <rect x="410" y="150" width="220" height="32" rx="6" className="fill-emerald-50 stroke-emerald-300" strokeWidth="1" />
        <text x="520" y="171" textAnchor="middle" className="fill-emerald-900">Obstacle condition</text>

        <line x1="520" y1="182" x2="520" y2="200" stroke="#94a3b8" strokeWidth="2" />
        <rect x="400" y="200" width="240" height="32" rx="6" className="fill-emerald-50 stroke-emerald-300" strokeWidth="1" />
        <text x="520" y="221" textAnchor="middle" className="fill-emerald-900">Crank-Nicolson + PSOR</text>
      </g>
    </svg>
  )
}

export default function Project1Overview() {
  return (
    <PageLayout
      title="Project 1 Overview"
      rightPanel={{
        method: 'Finite differences and semi-discrete time integration.',
        takeaway:
          'Project 1 converts option pricing into an initial-boundary value problem and solves it numerically using finite-difference and semi-discrete methods.',
      }}
    >
      <p className="text-slate-700">
        This project prices European and American put options numerically under the
        Black-Scholes framework. Both parts start from the same PDE and diverge in how the
        early-exercise feature of the American option is handled.
      </p>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">European put option</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Transformed (time-reversed) Black-Scholes equation.</li>
          <li>Crank-Nicolson finite-difference method.</li>
          <li>Method of Lines with classical fourth-order Runge-Kutta time integration.</li>
        </ul>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">American put option</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Early exercise constraint on the option value.</li>
          <li>Free-boundary (obstacle) problem.</li>
          <li>Crank-Nicolson discretisation combined with PSOR.</li>
        </ul>
      </div>

      <ProjectMap />
    </PageLayout>
  )
}
