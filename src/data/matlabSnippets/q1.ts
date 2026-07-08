import type { MatlabSnippet } from './types'

export const q1Snippets: MatlabSnippet[] = [
  {
    id: 'parameters',
    label: 'Parameters and conditions',
    code: `r = 0.06; sigma = 0.3; T = 1; K = 10; Smax = 15;\nNS = 200; Nt_cn = 1000; Nt_mol = 4000;\n\nu0 = @(S) max(K - S, 0);\nua = @(tau) K * exp(-r * tau);\nub = @(tau) 0;`,
  },
  {
    id: 'solve-cn',
    label: 'Solve with Crank-Nicolson',
    code: `[S_cn, tau_cn, Ucn] = bs_cn(r, sigma, T, Smax, NS, Nt_cn, u0, ua, ub);\nVcn = Ucn(:, end:-1:1);`,
  },
  {
    id: 'solve-mol',
    label: 'Solve with Method of Lines + RK4',
    code: `[S_mol, tau_mol, Umol] = bs_mol_rk4(r, sigma, T, Smax, NS, Nt_mol, u0, ua, ub);\nVmol = Umol(:, end:-1:1);`,
  },
]
