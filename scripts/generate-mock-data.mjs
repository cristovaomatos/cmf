// MOCK DATA generator — closed-form/approximate stand-ins, NOT MATLAB CN/MOL/PSOR output.
// Replace the files under public/data/project1/ with real MATLAB exports matching the
// same JSON schema (see src/data/schemas.ts); no application code changes are required.

import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'data', 'project1')
mkdirSync(outDir, { recursive: true })

const r = 0.06
const sigma = 0.3
const T = 1
const K = 10
const Smax = 15

const NS_MOCK = 60
const NT_MOCK = 40

function linspace(a, b, n) {
  const out = []
  for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n)
  return out
}

function erf(x) {
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x)
  return sign * y
}

function normCdf(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2))
}

function payoff(S) {
  return Math.max(K - S, 0)
}

// Closed-form Black-Scholes European put, tau = time remaining to maturity.
function bsPut(S, tau) {
  if (tau <= 1e-8) return payoff(S)
  if (S <= 1e-8) return K * Math.exp(-r * tau)
  const sqrtTau = Math.sqrt(tau)
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * tau) / (sigma * sqrtTau)
  const d2 = d1 - sigma * sqrtTau
  return K * Math.exp(-r * tau) * normCdf(-d2) - S * normCdf(-d1)
}

const S = linspace(0, Smax, NS_MOCK)
const t = linspace(0, T, NT_MOCK)

const Vcn = S.map((Si) => t.map((tn) => bsPut(Si, T - tn)))

// Small deterministic perturbation so CN vs MOL toggle / difference surface show something.
const Vmol = S.map((Si, i) =>
  t.map((tn, n) => {
    const noise = 0.001 * K * Math.sin((5 * Math.PI * Si) / Smax) * Math.sin((3 * Math.PI * tn) / T)
    return Vcn[i][n] + noise
  }),
)

const Vamerican = S.map((Si, i) => t.map((_, n) => Math.max(Vcn[i][n], payoff(Si))))

// Free boundary: increases from an asymptotic value below K up to exactly K at maturity (t=T).
const Sf = t.map((tn) => K * (1 - 0.3 * Math.sqrt(1 - tn / T)))

function nearestIndex(arr, target) {
  let best = 0
  let bestDiff = Infinity
  arr.forEach((v, i) => {
    const diff = Math.abs(v - target)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  })
  return best
}

function profilesFrom(V) {
  const times = [0, 0.5, 1]
  const series = times.map((tt) => {
    const idx = nearestIndex(t, tt)
    return { label: `t=${tt}`, t: t[idx], V: V.map((row) => row[idx]) }
  })
  return { S, series, payoff: S.map(payoff) }
}

writeFileSync(join(outDir, 'european_cn_surface.json'), JSON.stringify({ S, t, V: Vcn }))
writeFileSync(join(outDir, 'european_mol_surface.json'), JSON.stringify({ S, t, V: Vmol }))
writeFileSync(join(outDir, 'american_surface.json'), JSON.stringify({ S, t, V: Vamerican }))
writeFileSync(join(outDir, 'american_free_boundary.json'), JSON.stringify({ t, Sf }))
writeFileSync(join(outDir, 'european_profiles.json'), JSON.stringify(profilesFrom(Vcn)))
writeFileSync(join(outDir, 'american_profiles.json'), JSON.stringify(profilesFrom(Vamerican)))

console.log(`Mock data written to ${outDir}`)
