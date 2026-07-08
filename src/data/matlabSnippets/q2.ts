import type { MatlabSnippet } from './types'

export const q2Snippets: MatlabSnippet[] = [
  {
    id: 'parameters',
    label: 'Parameters',
    code: `r = 0.06; sigma = 0.3; T = 1; K = 10; Smax = 15;\nNS = 800; Nt = 10000;\nomega = 1.2; tol = 1e-8; max_iter = 10000;`,
  },
  {
    id: 'solve',
    label: 'Solve American put (CN + PSOR)',
    code: `[S, tau, U, Sf_tau] = bs_american_put_psor(r, sigma, T, K, Smax, NS, Nt, omega, tol, max_iter);\n\nt = linspace(0, T, length(tau));\nV = U(:, end:-1:1);\nSf = Sf_tau(end:-1:1);`,
  },
  {
    id: 'continuation-mask',
    label: 'Continuation region masking',
    code: `Vt = V';\nV_cont = Vt;\nV_cont(bsxfun(@le, S', Sf)) = NaN;`,
  },
]
