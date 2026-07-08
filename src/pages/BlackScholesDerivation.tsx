import { useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { DerivationStep } from '../components/Math/DerivationStep'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { GreekCard } from '../components/Math/GreekCard'

const DT_COLOR = '#2563eb'
const DW_COLOR = '#dc2626'

function CancellationStep() {
  const [cancelled, setCancelled] = useState(false)

  return (
    <div className="space-y-3">
      <EquationBlock latex="d\Pi = dV - \Delta\, dS" />
      <p className="text-sm text-slate-600">
        Substituting <InlineEquation latex="dV" /> and <InlineEquation latex="dS" />, and setting{' '}
        <InlineEquation latex="\Delta = \partial V/\partial S" />, the random terms cancel exactly.
      </p>
      <button
        type="button"
        onClick={() => setCancelled((c) => !c)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        {cancelled ? 'Hide' : 'Show'} stochastic-term cancellation
      </button>
      <EquationBlock
        latex={
          cancelled
            ? `d\\Pi = \\left(\\frac{\\partial V}{\\partial t} + \\tfrac{1}{2}\\sigma^2S^2\\frac{\\partial^2 V}{\\partial S^2}\\right)dt + \\cancel{\\textcolor{${DW_COLOR}}{\\sigma S \\frac{\\partial V}{\\partial S}\\,dw_t}} - \\cancel{\\textcolor{${DW_COLOR}}{\\sigma S \\frac{\\partial V}{\\partial S}\\,dw_t}}`
            : `d\\Pi = \\left(\\frac{\\partial V}{\\partial t} + \\tfrac{1}{2}\\sigma^2S^2\\frac{\\partial^2 V}{\\partial S^2}\\right)dt + \\textcolor{${DW_COLOR}}{\\sigma S \\frac{\\partial V}{\\partial S}\\,dw_t} - \\textcolor{${DW_COLOR}}{\\Delta\\,\\sigma S\\,dw_t}`
        }
      />
      {cancelled && (
        <p className="text-sm font-medium text-emerald-700">
          The stochastic (<code>dw_t</code>) terms cancel because the portfolio is delta-hedged.
        </p>
      )}
    </div>
  )
}

const steps = [
  {
    title: 'Asset price dynamics',
    body: (
      <>
        <p className="text-sm text-slate-600">The underlying asset follows geometric Brownian motion.</p>
        <EquationBlock latex="dS_t = \mu S_t\,dt + \sigma S_t\,dw_t" />
      </>
    ),
  },
  {
    title: 'Define the option value',
    body: (
      <>
        <p className="text-sm text-slate-600">The option value is a function of the asset price and time.</p>
        <EquationBlock latex="V = V(S,t)" />
      </>
    ),
  },
  {
    title: "Apply Ito's formula",
    body: (
      <>
        <EquationBlock latex="dV = \frac{\partial V}{\partial t}\,dt + \frac{\partial V}{\partial S}\,dS + \frac{1}{2}\frac{\partial^2 V}{\partial S^2}(dS)^2" />
        <EquationBlock latex="(dS)^2 = \sigma^2 S^2\,dt" caption="Quadratic variation of the asset price" />
      </>
    ),
  },
  {
    title: 'Substitute the asset dynamics',
    body: (
      <EquationBlock
        latex={`dV = \\underbrace{\\textcolor{${DT_COLOR}}{\\left(\\frac{\\partial V}{\\partial t} + \\mu S \\frac{\\partial V}{\\partial S} + \\tfrac{1}{2}\\sigma^2S^2\\frac{\\partial^2 V}{\\partial S^2}\\right)dt}}_{\\text{deterministic}} + \\underbrace{\\textcolor{${DW_COLOR}}{\\sigma S \\frac{\\partial V}{\\partial S}\\,dw_t}}_{\\text{stochastic}}`}
      />
    ),
  },
  {
    title: 'Identify deterministic and stochastic components',
    body: (
      <p className="text-sm text-slate-600">
        The <InlineEquation latex={`\\textcolor{${DT_COLOR}}{dt}`} />-term is deterministic (drift); the{' '}
        <InlineEquation latex={`\\textcolor{${DW_COLOR}}{dw_t}`} />-term is stochastic (risk). Eliminating the
        stochastic term is the goal of delta hedging.
      </p>
    ),
  },
  {
    title: 'Construct the hedged portfolio',
    body: (
      <>
        <EquationBlock latex="\Pi = V - \Delta S" />
        <EquationBlock latex="\Delta = \frac{\partial V}{\partial S}" />
      </>
    ),
  },
  {
    title: 'Compute the portfolio change',
    body: <EquationBlock latex="d\Pi = dV - \Delta\, dS" />,
  },
  {
    title: 'Cancellation of the stochastic term',
    body: <CancellationStep />,
  },
  {
    title: 'Risk-free portfolio argument',
    body: (
      <p className="text-sm text-slate-600">
        A perfectly hedged, riskless portfolio must earn the risk-free rate, otherwise arbitrage is possible.
      </p>
    ),
  },
  {
    title: 'Obtain the Black-Scholes PDE',
    body: (
      <>
        <EquationBlock latex="d\Pi = r\Pi\, dt" caption="The delta-hedged portfolio is riskless, so it must earn the risk-free rate." />
        <p className="text-sm text-slate-600">Since</p>
        <EquationBlock latex="\Pi = V - S\frac{\partial V}{\partial S}," />
        <p className="text-sm text-slate-600">we have</p>
        <EquationBlock latex="d\Pi = r\left(V - S\frac{\partial V}{\partial S}\right)dt." />
        <p className="text-sm text-slate-600">Equating both expressions for <InlineEquation latex="d\Pi" />:</p>
        <EquationBlock latex="r\left(V - S\frac{\partial V}{\partial S}\right)dt = \left(\frac{\partial V}{\partial t} + \frac{1}{2}\sigma^2S^2\frac{\partial^2 V}{\partial S^2}\right)dt." />
        <p className="text-sm text-slate-600">Hence the Black-Scholes PDE is</p>
        <EquationBlock latex="\frac{\partial V}{\partial t} + \frac{1}{2}\sigma^2S^2\frac{\partial^2 V}{\partial S^2} + rS\frac{\partial V}{\partial S} - rV = 0" />
      </>
    ),
  },
  {
    title: 'Greeks version of the PDE',
    body: (
      <>
        <EquationBlock latex="\Theta + \frac{1}{2}\sigma^2S^2\Gamma + rS\Delta - rV = 0" />
        <div className="grid grid-cols-3 gap-3">
          <GreekCard name="Delta" latex="\Delta = \frac{\partial V}{\partial S}" description="Sensitivity to the underlying price." />
          <GreekCard name="Gamma" latex="\Gamma = \frac{\partial^2 V}{\partial S^2}" description="Curvature of the option value." />
          <GreekCard name="Theta" latex="\Theta = \frac{\partial V}{\partial t}" description="Sensitivity to the passage of time." />
        </div>
      </>
    ),
  },
]

export default function BlackScholesDerivation() {
  return (
    <PageLayout
      title="Black-Scholes Equation Derivation"
      rightPanel={{
        known: 'Asset dynamics, a delta-hedged portfolio, and the no-arbitrage argument.',
        unknown: 'The option value function V(S,t) and its governing PDE.',
        method: 'Ito calculus and delta hedging.',
        takeaway:
          'The Black-Scholes equation is obtained by eliminating risk through delta hedging and forcing the resulting portfolio to earn the risk-free rate.',
      }}
    >
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
