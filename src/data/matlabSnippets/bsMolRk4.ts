import type { MatlabSnippet } from './types'

export const bsMolRk4Snippets: MatlabSnippet[] = [
  {
    id: 'grid-and-data',
    label: 'Grid, initial condition, and boundary conditions',
    code: `ht = T / Nt;

S = linspace(0, Smax, NS + 1)';
t = linspace(0, T, Nt + 1);

U = zeros(NS + 1, Nt + 1);
U(:,1) = arrayfun(u0, S);
U(1,:) = arrayfun(ua, t);
U(end,:) = arrayfun(ub, t);`,
  },
  {
    id: 'operator-matrix',
    label: 'Tridiagonal MOL operator AML',
    code: `i = (1:NS-1)';

alpha = 0.5 * sigma^2 * i.^2 - 0.5 * r * i;
beta  = -sigma^2 * i.^2 - r;
gamma = 0.5 * sigma^2 * i.^2 + 0.5 * r * i;

AML = spdiags([[alpha(2:end); 0], beta, [0; gamma(1:end-1)]], [-1 0 1], NS-1, NS-1);`,
  },
  {
    id: 'initial-interior',
    label: 'Initial interior vector',
    code: `W = U(2:NS,1);`,
  },
  {
    id: 'rhs-mol',
    label: 'rhs_mol: boundary contribution and ODE right-hand side',
    code: `function F = rhs_mol(tt, W, AML, alpha, gamma, ua, ub)\n    m = length(W);\n\n    bML = zeros(m,1);\n    bML(1)   = alpha(1)   * ua(tt);\n    bML(end) = gamma(end) * ub(tt);\n\n    F = AML * W + bML;\nend`,
  },
  {
    id: 'rk4-stages',
    label: 'RK4 stages',
    code: `f1 = ht * rhs_mol(tn,         W,        AML, alpha, gamma, ua, ub);\nf2 = ht * rhs_mol(tn + ht/2,  W + f1/2, AML, alpha, gamma, ua, ub);\nf3 = ht * rhs_mol(tn + ht/2,  W + f2/2, AML, alpha, gamma, ua, ub);\nf4 = ht * rhs_mol(tn + ht,    W + f3,   AML, alpha, gamma, ua, ub);`,
  },
  {
    id: 'rk4-update',
    label: 'RK4 weighted update',
    code: `W = W + (f1 + 2*f2 + 2*f3 + f4) / 6;`,
  },
]
