import type { MatlabSnippet } from './types'

export const bsAmericanPutPsorSnippets: MatlabSnippet[] = [
  {
    id: 'splitting',
    label: 'Matrix splitting A = L + D + R',
    code: `L = tril(A, -1);\nD = spdiags(diag(A), 0, NS-1, NS-1);\nR = triu(A, 1);\n\nM1 = D + omega * L;\nM2 = (1 - omega) * D - omega * R;`,
  },
  {
    id: 'obstacle',
    label: 'Obstacle (payoff inside the domain)',
    code: `g = max(K - S(2:NS), 0);`,
  },
  {
    id: 'complementarity',
    label: 'Complementarity transformation',
    code: `btilde = rhs - A * g;\nx_old = max(U(2:NS, n) - g, 0);`,
  },
  {
    id: 'psor-iteration',
    label: 'Projected iteration',
    code: `while err > tol && iter < max_iter\n    z = M1 \\ (M2 * x_old + omega * btilde);\n    x = max(0, z);\n\n    err = norm(x - x_old, inf);\n    x_old = x;\n    iter = iter + 1;\nend`,
  },
  {
    id: 'recover',
    label: 'Solution recovery',
    code: `w = x + g;\nU(2:NS, n+1) = w;`,
  },
  {
    id: 'free-boundary',
    label: 'Free boundary extraction (linear interpolation)',
    code: `idx = find(diff_now > 1e-8, 1, 'first');\n\nif isempty(idx)\n    Sf(n+1) = Smax;\nelseif idx == 1\n    Sf(n+1) = 0;\nelse\n    sL = S(idx-1); sR = S(idx);\n    dL = diff_now(idx-1); dR = diff_now(idx);\n    Sf(n+1) = sL - dL * (sR - sL) / (dR - dL);\nend`,
  },
]
