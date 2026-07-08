import { useMemo, useState } from 'react'
import { PageLayout } from '../components/Layout/PageLayout'
import { EquationBlock, InlineEquation } from '../components/Math/EquationBlock'
import { Katex } from '../components/Math/Katex'
import { SurfacePlot } from '../components/Visuals/SurfacePlot'
import { europeanParams } from '../data/parameters'

type OptionType = 'call' | 'put'

function erf(x: number) {
  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const t = 1 / (1 + p * absX)
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX))
  return sign * y
}

function normalCdf(x: number) {
  return 0.5 * (1 + erf(x / Math.SQRT2))
}

function payoff(S: number, K: number, optionType: OptionType) {
  return optionType === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0)
}

function blackScholesValue(S: number, tau: number, K: number, r: number, sigma: number, optionType: OptionType) {
  if (tau <= 1e-10) return payoff(S, K, optionType)
  if (S <= 1e-10) return optionType === 'call' ? 0 : K * Math.exp(-r * tau)

  const sqrtTau = Math.sqrt(tau)
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma ** 2) * tau) / (sigma * sqrtTau)
  const d2 = d1 - sigma * sqrtTau

  if (optionType === 'call') return S * normalCdf(d1) - K * Math.exp(-r * tau) * normalCdf(d2)
  return K * Math.exp(-r * tau) * normalCdf(-d2) - S * normalCdf(-d1)
}

function blackScholesDValues(S: number, tau: number, K: number, r: number, sigma: number) {
  if (tau <= 1e-10 || S <= 1e-10) return null
  const sqrtTau = Math.sqrt(tau)
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma ** 2) * tau) / (sigma * sqrtTau)
  return { d1, d2: d1 - sigma * sqrtTau }
}

function fmt(value: number, digits = 4) {
  return value.toFixed(digits)
}

export default function BlackScholesAnalyticSolution() {
  const [optionType, setOptionType] = useState<OptionType>('put')
  const [K, setK] = useState(europeanParams.K)
  const [r, setR] = useState(europeanParams.r)
  const [sigma, setSigma] = useState(europeanParams.sigma)
  const [T, setT] = useState(europeanParams.T)
  const [Smax, setSmax] = useState(europeanParams.Smax)
  const [selectedS, setSelectedS] = useState(europeanParams.K)
  const [selectedT, setSelectedT] = useState(0)

  const grid = useMemo(() => {
    const S = Array.from({ length: 45 }, (_, i) => (i / 44) * Smax)
    const t = Array.from({ length: 35 }, (_, j) => (j / 34) * T)
    const V = S.map((asset) =>
      t.map((time) => blackScholesValue(asset, T - time, K, r, sigma, optionType)),
    )
    return { S, t, V }
  }, [K, Smax, T, optionType, r, sigma])

  const displayedSelectedS = Math.min(selectedS, Smax)
  const displayedSelectedT = Math.min(selectedT, T)
  const selectedTau = T - displayedSelectedT
  const selectedValue = blackScholesValue(displayedSelectedS, selectedTau, K, r, sigma, optionType)
  const dValues = blackScholesDValues(displayedSelectedS, selectedTau, K, r, sigma)

  return (
    <PageLayout
      title="Analytic Black-Scholes Solution"
      rightPanel={{
        known: 'European option type, S, K, r, sigma, and time to maturity tau = T - t.',
        unknown: 'The closed-form value V(S,t) before maturity.',
        method: 'Use the Black-Scholes formula with the standard normal cumulative distribution.',
        takeaway:
          'The analytic solution is a benchmark for European options and a reference surface for validating numerical PDE methods.',
      }}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Closed-Form European Prices</h2>
        <p className="text-slate-700">
          For a European option, the Black-Scholes equation has a closed-form solution. Write the time
          to maturity as <InlineEquation latex="\tau=T-t" />. For <InlineEquation latex="\tau>0" />,
        </p>
        <EquationBlock latex="d_1=\frac{\ln(S/K)+(r+\frac{1}{2}\sigma^2)\tau}{\sigma\sqrt{\tau}},\qquad d_2=d_1-\sigma\sqrt{\tau}." />
        <p className="text-slate-700">
          Let <InlineEquation latex="N(x)" /> denote the cumulative distribution function of a standard
          normal random variable. Then the European call and put prices are
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">European call</p>
            <EquationBlock latex="C(S,t)=SN(d_1)-Ke^{-r\tau}N(d_2)" />
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">European put</p>
            <EquationBlock latex="P(S,t)=Ke^{-r\tau}N(-d_2)-SN(-d_1)" />
          </div>
        </div>
        <p className="text-slate-700">
          At maturity, <InlineEquation latex="\tau=0" />, the formulas reduce to the payoff:
          <InlineEquation latex="C(S,T)=(S-K)^+" /> and <InlineEquation latex="P(S,T)=(K-S)^+" />.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Put-Call Parity</h2>
        <p className="text-slate-700">
          The call and put formulas are linked by put-call parity. For European options with the same
          strike and maturity,
        </p>
        <EquationBlock latex="C(S,t)-P(S,t)=S-Ke^{-r(T-t)}." />
        <p className="text-slate-700">
          This identity is useful as a consistency check for implementations and numerical results.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">3D Visualizer</h2>
        <div className="flex flex-wrap items-center justify-start gap-3">
          <p className="text-sm font-medium text-slate-700">Option type</p>
          <div className="flex rounded-md border border-slate-300 p-1 text-sm">
            {(['put', 'call'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOptionType(type)}
                className={`rounded px-3 py-1 font-medium capitalize ${
                  optionType === type ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-5">
          <label>
            <span className="mb-1 block font-medium">
              <Katex math={`K=${fmt(K, 2)}`} />
            </span>
            <input type="range" min={5} max={20} step={0.5} value={K} onChange={(event) => setK(Number(event.target.value))} className="w-full" />
          </label>
          <label>
            <span className="mb-1 block font-medium">
              <Katex math={`r=${fmt(r, 3)}`} />
            </span>
            <input type="range" min={0} max={0.15} step={0.005} value={r} onChange={(event) => setR(Number(event.target.value))} className="w-full" />
          </label>
          <label>
            <span className="mb-1 block font-medium">
              <Katex math={`\\sigma=${fmt(sigma, 2)}`} />
            </span>
            <input type="range" min={0.05} max={0.8} step={0.01} value={sigma} onChange={(event) => setSigma(Number(event.target.value))} className="w-full" />
          </label>
          <label>
            <span className="mb-1 block font-medium">
              <Katex math={`T=${fmt(T, 2)}`} />
            </span>
            <input type="range" min={0.25} max={3} step={0.05} value={T} onChange={(event) => setT(Number(event.target.value))} className="w-full" />
          </label>
          <label>
            <span className="mb-1 block font-medium">
              <Katex math={`S^*=${fmt(Smax, 1)}`} />
            </span>
            <input type="range" min={10} max={35} step={0.5} value={Smax} onChange={(event) => setSmax(Number(event.target.value))} className="w-full" />
          </label>
        </div>

        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
          <SurfacePlot
            S={grid.S}
            t={grid.t}
            V={grid.V}
            title={`${optionType === 'call' ? 'European call' : 'European put'} analytic Black-Scholes surface`}
            zMax={optionType === 'call' ? Math.max(Smax - K * Math.exp(-r * T), K) : K}
            colorscale={optionType === 'call' ? 'Blues' : 'Viridis'}
            yLabel="t"
            zLabel="V(S,t)"
            valueLabel="V"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Point Evaluation</h2>
        <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
          <label>
            <span className="mb-1 block font-medium">
              <Katex math={`S=${fmt(displayedSelectedS, 2)}`} />
            </span>
            <input
              type="range"
              min={0.01}
              max={Smax}
              step={0.05}
              value={displayedSelectedS}
              onChange={(event) => setSelectedS(Number(event.target.value))}
              className="w-full"
            />
          </label>
          <label>
            <span className="mb-1 block font-medium">
              <Katex math={`t=${fmt(displayedSelectedT, 2)}`} />
            </span>
            <input
              type="range"
              min={0}
              max={T}
              step={0.01}
              value={displayedSelectedT}
              onChange={(event) => setSelectedT(Number(event.target.value))}
              className="w-full"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time to maturity</p>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              <Katex math={`\\tau=T-t=${fmt(Math.max(selectedTau, 0), 4)}`} />
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">d-values</p>
            <div className="mt-2 text-sm text-slate-900">
              {dValues ? (
                <Katex math={`d_1=${fmt(dValues.d1, 4)},\\quad d_2=${fmt(dValues.d2, 4)}`} />
              ) : (
                <span>At maturity, use the payoff directly.</span>
              )}
            </div>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Analytic value</p>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              <Katex math={`V(S,t)=${fmt(selectedValue, 4)}`} />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
