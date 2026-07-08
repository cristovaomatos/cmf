export interface NotationEntry {
  key: string
  latex: string
  meaning: string
}

export const notationTable: NotationEntry[] = [
  { key: 'V', latex: 'V(S,t)', meaning: 'Option value in original time' },
  { key: 'U', latex: 'U(S,t)', meaning: 'Time-reversed value' },
  { key: 'U-from-V', latex: 'U(S,t) = V(S,T-t)', meaning: 'Reverse-time relation' },
  { key: 'V-from-U', latex: 'V(S,t) = U(S,T-t)', meaning: 'Original option value recovery' },
  { key: 'domain', latex: '0 < S < S^*', meaning: 'Spatial domain truncation' },
  { key: 'R_T^V', latex: 'R_T^V', meaning: 'Truncated computational region' },
  { key: 'ic', latex: 'U(S,0) = u_0(S)', meaning: 'Initial condition' },
  { key: 'bc', latex: 'U(0,t)=u_a(t),\\ U(S^*,t)=u_b(t)', meaning: 'Boundary conditions' },
  { key: 'S_i', latex: 'S_i = i\\,h_S', meaning: 'Spatial grid' },
  { key: 't_j', latex: 't_j = j\\,h_t', meaning: 'Time grid' },
  { key: 'U_i,j', latex: 'U_{i,j}', meaning: 'Numerical approximation' },
  { key: 'cn-system', latex: 'A_{CN}\\,\\mathbf{U}^{j+1} = B_{CN}\\,\\mathbf{U}^j + \\mathbf{q}_{CN}^{j,j+1}', meaning: 'Crank-Nicolson system' },
  { key: 'W', latex: 'W(t)', meaning: 'Method of Lines unknown vector' },
  { key: 'mol-system', latex: '\\frac{dW}{dt} = A W + b(t)', meaning: 'MOL system' },
  { key: 'g', latex: 'g(S)=\\max(K-S,0)', meaning: 'American payoff / obstacle' },
  { key: 'S_f', latex: 'S_f(t)', meaning: 'Free boundary' },
  { key: 'continuation', latex: 'U(S,t) > g(S)', meaning: 'Continuation region' },
  { key: 'exercise', latex: 'U(S,t) = g(S)', meaning: 'Exercise region' },
]

export function notation(key: string): NotationEntry {
  const entry = notationTable.find((n) => n.key === key)
  if (!entry) throw new Error(`Unknown notation key: ${key}`)
  return entry
}
