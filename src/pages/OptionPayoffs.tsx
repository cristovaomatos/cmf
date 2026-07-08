import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { PayoffChart } from '../components/Visuals/PayoffChart'

export default function OptionPayoffs() {
  return (
    <PageLayout
      title="Option Payoffs"
      rightPanel={{
        known: 'Underlying asset price S, strike K, maturity T, option type, and premium.',
        unknown: 'The payoff received at exercise or maturity, and the profit after paying the premium.',
        method: 'Compare the asset price with the strike and keep only the positive part.',
        takeaway:
          'The payoff is the terminal condition for European options and the obstacle for American options.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">What Is an Option?</h2>
        <p className="text-slate-700">
          An option is a derivative contract: its value depends on the price of an underlying asset.
          The buyer, or holder, pays a premium to the seller, or writer. In exchange, the holder
          receives a right, but not an obligation, to trade the asset at a fixed strike price{' '}
          <InlineEquation latex="K" />.
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['Underlying', 'Asset whose price is denoted by S or S_t.'],
            ['Strike', 'Exercise price K fixed in the contract.'],
            ['Maturity', 'Final date T of the contract.'],
            ['Premium', 'Price paid today for the option right.'],
          ].map(([term, description]) => (
            <div key={term} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">{term}</p>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Why Options Are Used</h2>
        <p className="text-slate-700">
          Options are useful because their payoff is asymmetric. The holder can benefit from favourable
          price movements while the downside of the option position is limited by the premium.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Hedging</p>
            <p className="mt-1 text-sm text-slate-700">
              A put can protect a portfolio against a fall in the underlying asset price.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Speculation</p>
            <p className="mt-1 text-sm text-slate-700">
              A call gives leveraged exposure to an upward move without buying the asset outright.
            </p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Income and structure</p>
            <p className="mt-1 text-sm text-slate-700">
              Writers receive the premium and can combine options to shape risk profiles.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Call and Put Payoffs</h2>
        <p className="text-slate-700">
          A call gives the holder the right to buy the asset for <InlineEquation latex="K" />. A put gives
          the holder the right to sell the asset for <InlineEquation latex="K" />. At maturity, the
          underlying price is written <InlineEquation latex="S_T" />.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Call payoff</p>
            <EquationBlock latex="V_{E,C}(S_T,T)=(S_T-K)^+=\max(S_T-K,0)" />
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">Put payoff</p>
            <EquationBlock latex="V_{E,P}(S_T,T)=(K-S_T)^+=\max(K-S_T,0)" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <PayoffChart kind="call" />
          <PayoffChart kind="put" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Payoff Versus Profit</h2>
        <p className="text-slate-700">
          The payoff is what the contract delivers at exercise or maturity. The profit also subtracts the
          premium paid at <InlineEquation latex="t=0" />. If the call premium is{' '}
          <InlineEquation latex="c" /> and the put premium is <InlineEquation latex="p" />, then
        </p>
        <EquationBlock latex="\Pi_{\mathrm{call}}(S_T)=(S_T-K)^+-c,\qquad \Pi_{\mathrm{put}}(S_T)=(K-S_T)^+-p." />
        <div className="grid gap-4 lg:grid-cols-2">
          <PayoffChart kind="call" mode="profit" />
          <PayoffChart kind="put" mode="profit" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Role in the Numerical PDE</h2>
        <p className="text-slate-700">
          The Black-Scholes problem is naturally posed backwards in calendar time because the payoff is
          known at maturity. In the reversed-time variable <InlineEquation latex="\tau=T-t" />, we use
          <InlineEquation latex="U(S,\tau)=V(S,T-\tau)" /> and the payoff becomes the initial condition:
        </p>
        <EquationBlock latex="U(S,0)=u_0(S)=V(S,T)." />
        <p className="text-slate-700">
          For a European put, this gives the initial and boundary data used throughout the numerical
          method pages:
        </p>
        <EquationBlock latex="u_0(S)=\max(K-S,0),\qquad U(0,\tau)=Ke^{-r\tau},\qquad U(S^*,\tau)=0." />
        <p className="text-slate-700">
          For an American option, the payoff also acts as an obstacle:
        </p>
        <EquationBlock latex="U(S,\tau)\geq u_0(S)." />
      </section>
    </PageLayout>
  )
}
