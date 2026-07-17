import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/Layout/AppShell'
import Project1Overview from './pages/Project1Overview'
import OptionPayoffs from './pages/OptionPayoffs'
import EuropeanAmericanOptions from './pages/EuropeanAmericanOptions'
import BlackScholesDerivation from './pages/BlackScholesDerivation'
import BlackScholesAnalyticSolution from './pages/BlackScholesAnalyticSolution'
import HeatEquationTransformation from './pages/HeatEquationTransformation'
import DomainBoundaryConditions from './pages/DomainBoundaryConditions'
import FiniteDifferenceGrid from './pages/FiniteDifferenceGrid'
import ExplicitImplicitMethods from './pages/ExplicitImplicitMethods'
import ExplicitMethod from './pages/ExplicitMethod'
import ImplicitMethod from './pages/ImplicitMethod'
import CrankNicolson from './pages/CrankNicolson'
import RungeKutta4Method from './pages/RungeKutta4Method'
import MethodOfLinesRK4 from './pages/MethodOfLinesRK4'
import EuropeanPutResults from './pages/EuropeanPutResults'
import ObstacleProblem from './pages/ObstacleProblem'
import SORPSORMethods from './pages/SORPSORMethods'
import AmericanPSORMethod from './pages/AmericanPSORMethod'
import AmericanPutResults from './pages/AmericanPutResults'
import MethodComparison from './pages/MethodComparison'
import LinearCongruentialGenerator from './pages/LinearCongruentialGenerator'
import AcceptanceRejectionMethod from './pages/AcceptanceRejectionMethod'
import HaltonNodes from './pages/HaltonNodes'
import MonteCarloQuasiMonteCarlo from './pages/MonteCarloQuasiMonteCarlo'
import StochasticDifferentialEquationsIntro from './pages/StochasticDifferentialEquationsIntro'
import EulerMaruyamaMethod from './pages/EulerMaruyamaMethod'
import MilsteinMethod from './pages/MilsteinMethod'
import StrongWeakConvergence from './pages/StrongWeakConvergence'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<OptionPayoffs />} />
          <Route path="/options-theory/option-payoffs" element={<OptionPayoffs />} />
          <Route path="/options-theory/european-and-american-options" element={<EuropeanAmericanOptions />} />
          <Route path="/options-theory/black-scholes-equation" element={<BlackScholesDerivation />} />
          <Route path="/options-theory/black-scholes-analytic-solution" element={<BlackScholesAnalyticSolution />} />
          <Route path="/options-theory/heat-equation-transformation" element={<HeatEquationTransformation />} />
          <Route path="/numerical-pde-methods/finite-difference-grid" element={<FiniteDifferenceGrid />} />
          <Route path="/numerical-pde-methods/explicit-method" element={<ExplicitMethod />} />
          <Route path="/numerical-pde-methods/implicit-method" element={<ImplicitMethod />} />
          <Route path="/numerical-pde-methods/crank-nicolson-method" element={<CrankNicolson />} />
          <Route path="/numerical-pde-methods/runge-kutta-4-method" element={<RungeKutta4Method />} />
          <Route path="/numerical-pde-methods/method-of-lines-rk4" element={<MethodOfLinesRK4 />} />
          <Route path="/american-option-methods/obstacle-problem" element={<ObstacleProblem />} />
          <Route path="/american-option-methods/sor-psor-methods" element={<SORPSORMethods />} />
          <Route path="/american-option-methods/psor-method" element={<AmericanPSORMethod />} />
          <Route path="/probabilistic-methods/linear-congruential-generator" element={<LinearCongruentialGenerator />} />
          <Route path="/probabilistic-methods/acceptance-rejection-method" element={<AcceptanceRejectionMethod />} />
          <Route path="/probabilistic-methods/halton-nodes" element={<HaltonNodes />} />
          <Route path="/probabilistic-methods/monte-carlo-quasi-monte-carlo" element={<MonteCarloQuasiMonteCarlo />} />
          <Route path="/probabilistic-methods/stochastic-differential-equations" element={<StochasticDifferentialEquationsIntro />} />
          <Route path="/probabilistic-methods/euler-maruyama-method" element={<EulerMaruyamaMethod />} />
          <Route path="/probabilistic-methods/milstein-method" element={<MilsteinMethod />} />
          <Route path="/probabilistic-methods/strong-weak-convergence" element={<StrongWeakConvergence />} />

          <Route path="/project-1" element={<Project1Overview />} />
          <Route path="/project-1/black-scholes-derivation" element={<BlackScholesDerivation />} />
          <Route path="/project-1/heat-equation-transformation" element={<HeatEquationTransformation />} />
          <Route path="/project-1/domain-boundary-conditions" element={<DomainBoundaryConditions />} />
          <Route path="/project-1/finite-difference-grid" element={<FiniteDifferenceGrid />} />
          <Route path="/project-1/explicit-method" element={<ExplicitMethod />} />
          <Route path="/project-1/implicit-method" element={<ImplicitMethod />} />
          <Route path="/project-1/explicit-implicit-methods" element={<ExplicitImplicitMethods />} />
          <Route path="/project-1/crank-nicolson" element={<CrankNicolson />} />
          <Route path="/project-1/runge-kutta-4-method" element={<RungeKutta4Method />} />
          <Route path="/project-1/method-of-lines-rk4" element={<MethodOfLinesRK4 />} />
          <Route path="/project-1/european-put-results" element={<EuropeanPutResults />} />
          <Route path="/project-1/sor-psor-methods" element={<SORPSORMethods />} />
          <Route path="/project-1/american-psor-method" element={<AmericanPSORMethod />} />
          <Route path="/project-1/american-put-results" element={<AmericanPutResults />} />
          <Route path="/project-1/method-comparison" element={<MethodComparison />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
