export type Section =
  | 'project'
  | 'optionsTheory'
  | 'numericalPdeMethods'
  | 'americanOptionMethods'
  | 'probabilisticMethods'

export interface RouteEntry {
  path: string
  label: string
  section: Section
}

export const routeList: RouteEntry[] = [
  { path: '/', label: 'Project Home', section: 'project' },
  { path: '/options-theory/option-payoffs', label: 'Option Payoffs', section: 'optionsTheory' },
  { path: '/options-theory/european-and-american-options', label: 'European and American Options', section: 'optionsTheory' },
  { path: '/options-theory/black-scholes-equation', label: 'Black-Scholes Equation', section: 'optionsTheory' },
  { path: '/options-theory/black-scholes-analytic-solution', label: 'Analytic Black-Scholes Solution', section: 'optionsTheory' },
  { path: '/options-theory/heat-equation-transformation', label: 'Heat Equation Transformation', section: 'optionsTheory' },
  { path: '/numerical-pde-methods/finite-difference-grid', label: 'Finite-Difference Grid', section: 'numericalPdeMethods' },
  { path: '/numerical-pde-methods/explicit-method', label: 'Explicit Method', section: 'numericalPdeMethods' },
  { path: '/numerical-pde-methods/implicit-method', label: 'Implicit Method', section: 'numericalPdeMethods' },
  { path: '/numerical-pde-methods/crank-nicolson-method', label: 'Crank-Nicolson Method', section: 'numericalPdeMethods' },
  { path: '/numerical-pde-methods/runge-kutta-4-method', label: 'Runge-Kutta 4 Method', section: 'numericalPdeMethods' },
  { path: '/numerical-pde-methods/method-of-lines-rk4', label: 'Method of Lines + RK4', section: 'numericalPdeMethods' },
  { path: '/american-option-methods/obstacle-problem', label: 'Obstacle Problem', section: 'americanOptionMethods' },
  { path: '/american-option-methods/sor-psor-methods', label: 'SOR and PSOR Methods', section: 'americanOptionMethods' },
  { path: '/american-option-methods/psor-method', label: 'PSOR Method', section: 'americanOptionMethods' },
  { path: '/probabilistic-methods/linear-congruential-generator', label: 'Linear Congruential Generator', section: 'probabilisticMethods' },
  { path: '/probabilistic-methods/acceptance-rejection-method', label: 'Acceptance-Rejection Method', section: 'probabilisticMethods' },
  { path: '/probabilistic-methods/halton-nodes', label: 'Halton Nodes', section: 'probabilisticMethods' },
  { path: '/probabilistic-methods/monte-carlo-quasi-monte-carlo', label: 'Monte Carlo and Quasi-Monte Carlo', section: 'probabilisticMethods' },
  { path: '/probabilistic-methods/stochastic-differential-equations', label: 'Numerical SDE Methods', section: 'probabilisticMethods' },
  { path: '/probabilistic-methods/euler-maruyama-method', label: 'Euler-Maruyama Method', section: 'probabilisticMethods' },
  { path: '/probabilistic-methods/milstein-method', label: 'Milstein Method', section: 'probabilisticMethods' },
  { path: '/probabilistic-methods/strong-weak-convergence', label: 'Strong and Weak Convergence', section: 'probabilisticMethods' },
]

export const sectionLabels: Record<Section, string> = {
  project: 'Project',
  optionsTheory: 'Options Theory',
  numericalPdeMethods: 'Numerical PDE Methods',
  americanOptionMethods: 'American Option Methods',
  probabilisticMethods: 'Probabilistic Methods in Finance',
}

export function routeIndex(pathname: string): number {
  return routeList.findIndex((r) => r.path === pathname)
}
