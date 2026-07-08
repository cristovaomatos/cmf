import type { MatlabSnippet } from './types'

export const bsCnSnippets: MatlabSnippet[] = [
  {
    id: 'grid-construction',
    label: 'Spatial and time grid construction',
    code: `S   = linspace(0, Smax, NS + 1)';\ntau = linspace(0, T, Nt + 1);`,
  },
  {
    id: 'ic-bc',
    label: 'Initial and boundary conditions',
    code: `U(:, 1) = arrayfun(u0, S);\nU(1, :) = arrayfun(ua, tau);\nU(end, :) = arrayfun(ub, tau);`,
  },
  {
    id: 'interior-index',
    label: 'Interior index vector',
    code: `i = (1:NS-1)';`,
  },
  {
    id: 'coefficients',
    label: 'Crank-Nicolson coefficients',
    code: `a = -(sigma^2 * ht / 4) .* (i.^2) + (r * ht / 4) .* i;\nb = 1 + (sigma^2 * ht / 2) .* (i.^2) + (r * ht / 2);\nc = -(sigma^2 * ht / 4) .* (i.^2) - (r * ht / 4) .* i;\nd = 1 - (sigma^2 * ht / 2) .* (i.^2) - (r * ht / 2);`,
  },
  {
    id: 'spdiags',
    label: 'Tridiagonal matrices A, B via spdiags',
    code: `A = spdiags([[a(2:end); 0], b, [0; c(1:end-1)]], [-1 0 1], NS-1, NS-1);\nB = spdiags([[-a(2:end); 0], d, [0; -c(1:end-1)]], [-1 0 1], NS-1, NS-1);`,
  },
  {
    id: 'lu-decomp',
    label: 'LU decomposition of A',
    code: `Adec = decomposition(A, 'lu');`,
  },
  {
    id: 'time-loop',
    label: 'Time-stepping loop',
    code: `for n = 1:Nt\n    rhs = B * U(2:NS, n);\n\n    rhs(1)   = rhs(1)   - a(1)   * (U(1,   n+1) + U(1,   n));\n    rhs(end) = rhs(end) - c(end) * (U(end, n+1) + U(end, n));\n\n    U(2:NS, n+1) = Adec \\ rhs;\nend`,
  },
]
