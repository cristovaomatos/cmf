# Project 1 Interactive App Specification

> **Active implementation target.** This document specifies the React
> application currently being built for Project 1. The Jupyter-based
> alternative described in `docs/project_1_jupyter_presentation_spec.md` is
> kept for reference only and is not being implemented.

## 1. Purpose

Build an interactive React application to present **Computational Methods in Finance — Project 1** as a visual, step-by-step explanation of the mathematical model, numerical methods, MATLAB implementation, and financial interpretation.

The application should not behave like a static slide deck. It should behave like an **interactive lecture app**, where the user can move from theory to visual intuition and then to the corresponding MATLAB implementation.

The focus of Project 1 is the numerical pricing of European and American put options under the Black-Scholes framework:

- European put option solved with:
  - Crank-Nicolson finite-difference method;
  - Method of Lines with classical fourth-order Runge-Kutta time integration.
- American put option solved with:
  - Crank-Nicolson discretisation;
  - Projected Successive Over-Relaxation method (PSOR);
  - numerical identification of the continuation region and early exercise boundary.

All explanatory text displayed in the app must be written in **English**.

---

## 2. Source Material

The implementation and mathematical content must follow the nomenclature and structure used in the project report, MATLAB files, and professor's lecture notes.

### Main sources

1. `CMF_Project 1_140686.pdf`  
   Main project report. Use it as the primary reference for the project structure, mathematical model, numerical methods, parameter values, and interpretation of results.

2. `Black-Scholes.pdf`  
   User's handwritten derivation notes. The **Black-Scholes Equation Derivation** page must follow these notes closely, including the sequence:
   - asset dynamics;
   - Ito expansion;
   - separation of deterministic and stochastic terms;
   - delta-hedged portfolio;
   - risk-free portfolio argument;
   - final Black-Scholes PDE;
   - Greeks interpretation.

3. `sebenta.pdf`  
   Professor's lecture notes. Use this source to preserve notation, terminology, and the conceptual framing of finite differences, Crank-Nicolson, Method of Lines, American options, the obstacle problem, SOR, and PSOR.

4. MATLAB source files:
   - `q1.m`
   - `bs_cn.m`
   - `bs_mol_rk4.m`
   - `q2.m`
   - `bs_american_put_psor.m`

---

## 3. General Design Principles

### 3.1 Presentation style

The app should explain each concept progressively:

1. **Mathematical statement**  
   Introduce the equation, condition, method, or algorithm.

2. **Visual interpretation**  
   Show what the object means geometrically or financially.

3. **Numerical discretisation**  
   Show the grid, stencil, matrix, time step, or iteration.

4. **MATLAB implementation**  
   Link the concept to the corresponding implementation in the project files.

5. **Result interpretation**  
   Explain what the computed surface, profile, or region means.

### 3.2 Nomenclature requirements

Use the same notation as the project report and professor's notes wherever possible.

Core notation:

| Object | Required notation |
|---|---|
| Option value in original time | `V(S,t)` |
| Time-reversed value | `U(S,t)` |
| Reverse-time relation | `U(S,t) = V(S,T-t)` |
| Original option value recovery | `V(S,t) = U(S,T-t)` |
| Spatial domain truncation | `0 < S < S*` |
| Truncated computational region | `R_T^V` |
| Initial condition | `U(S,0) = u_0(S)` |
| Boundary conditions | `U(0,t)=u_a(t)`, `U(S*,t)=u_b(t)` |
| Spatial grid | `S_i = i h_S` |
| Time grid | `t_n = n h_t` |
| Numerical approximation | `U_i^n` |
| Crank-Nicolson system | `A U^{n+1} = B U^n + b^n` |
| Method of Lines unknown vector | `W(t)` |
| MOL system | `dW/dt = A W + b(t)` |
| American payoff / obstacle | `g(S)=max(K-S,0)` |
| Free boundary | `S_f(t)` |
| Continuation region | `U(S,t) > g(S)` |
| Exercise region | `U(S,t) = g(S)` |

Avoid introducing alternative notation unless absolutely necessary.

---

## 4. Application Architecture

### 4.1 Suggested route structure

```text
/
/project-1
/project-1/black-scholes-derivation
/project-1/heat-equation-transformation
/project-1/domain-boundary-conditions
/project-1/finite-difference-grid
/project-1/crank-nicolson
/project-1/method-of-lines-rk4
/project-1/european-put-results
/project-1/american-option-obstacle
/project-1/psor-method
/project-1/american-put-results
/project-1/method-comparison
```

### 4.2 Global layout

Each page should use a consistent layout:

```text
---------------------------------------------------------
Top bar: CMF Project 1 | current section | progress
---------------------------------------------------------
Left sidebar: section navigation
---------------------------------------------------------
Main panel:
  - title
  - mathematical / conceptual explanation
  - interactive visualisation
---------------------------------------------------------
Right panel:
  - What is known?
  - What is unknown?
  - Numerical method
  - MATLAB implementation link
  - Key takeaway
---------------------------------------------------------
Bottom controls:
  - previous / next
  - step-by-step reveal
  - reset visualisation
---------------------------------------------------------
```

---

## 5. Page-by-Page Specification

## Page 1 — Project 1 Overview

### Goal
Introduce the problem: pricing European and American put options numerically under the Black-Scholes framework.

### Content
Explain that the project has two parts:

1. European put option:
   - transformed Black-Scholes equation;
   - Crank-Nicolson method;
   - Method of Lines with RK4.

2. American put option:
   - early exercise constraint;
   - free-boundary problem;
   - Crank-Nicolson + PSOR.

### Visual
A two-branch project map:

```text
Black-Scholes PDE
        |
        |-- European put
        |      |-- Crank-Nicolson
        |      |-- Method of Lines + RK4
        |
        |-- American put
               |-- Obstacle condition
               |-- Crank-Nicolson + PSOR
               |-- Continuation region / exercise boundary
```

### Key takeaway
Project 1 converts option pricing into an initial-boundary value problem and solves it numerically using finite-difference and semi-discrete methods.

---

## Page 2 — Black-Scholes Equation Derivation

### Mandatory source requirement

This page must follow the user's handwritten derivation in `Black-Scholes.pdf`.

The derivation should be presented as an animated sequence, matching the structure of the handwritten notes rather than replacing it with a generic textbook derivation.

### Step sequence

1. Start from the asset price dynamics:

```math
 dS_t = \mu S_t dt + \sigma S_t dW_t
```

2. Define the option value:

```math
V = V(S,t)
```

3. Apply Ito's formula:

```math
 dV = V_t dt + V_S dS + \frac{1}{2}V_{SS}(dS)^2
```

with:

```math
(dS)^2 = \sigma^2 S^2 dt
```

4. Substitute the asset dynamics:

```math
 dV = \left(V_t + \mu S V_S + \frac{1}{2}\sigma^2S^2V_{SS}\right)dt
      + \sigma S V_S dW_t
```

5. Identify deterministic and stochastic components visually.

6. Construct the hedged portfolio:

```math
\Pi = V - \Delta S
```

with:

```math
\Delta = V_S
```

7. Compute:

```math
 d\Pi = dV - \Delta dS
```

8. Show cancellation of the stochastic term when `Delta = V_S`.

9. Use the risk-free portfolio argument:

```math
 d\Pi = r\Pi dt
```

10. Obtain the Black-Scholes PDE:

```math
 V_t + \frac{1}{2}\sigma^2S^2V_{SS} + rS V_S - rV = 0
```

11. Present the Greeks version:

```math
 \Theta + \frac{1}{2}\sigma^2S^2\Gamma + rS\Delta - rV = 0
```

### Visual requirements

- Use a derivation timeline.
- Highlight `dt` terms separately from `dW_t` terms.
- Use a colour-coded cancellation animation for the stochastic term.
- Show a small card for each Greek:
  - `Delta = V_S`
  - `Gamma = V_{SS}`
  - `Theta = V_t`

### Key takeaway
The Black-Scholes equation is obtained by eliminating risk through delta hedging and forcing the resulting portfolio to earn the risk-free rate.

---

## Page 3 — From Heat Equation to Black-Scholes

### Goal
Show how the heat equation can be transformed into the Black-Scholes equation and why the project then uses the reverse-time formulation.

### Core equations

Start with:

```math
 y_\tau = y_{xx}
```

Introduce:

```math
 W(x,\tau)=e^{\alpha x+\beta \tau}y(x,\tau)
```

Then:

```math
 W_\tau = W_{xx} - 2\alpha W_x + (\alpha^2+\beta)W
```

Define:

```math
x=\log(S/K), \qquad \tau=\frac{\sigma^2}{2}t, \qquad U(S,t)=KW(x,\tau)
```

Choose:

```math
k=\frac{2r}{\sigma^2}, \qquad \alpha=\frac{1-k}{2}, \qquad \beta=-\frac{(k+1)^2}{4}
```

Then obtain:

```math
U_t = \frac{\sigma^2}{2}S^2U_{SS}+rSU_S-rU
```

### Reverse-time formulation

The app must explicitly explain that the original Black-Scholes equation for `V(S,t)` is a terminal-value problem, because the payoff is known at maturity `t=T`.

To solve it forward in computational time, define:

```math
U(S,t)=V(S,T-t)
```

Then the terminal condition for `V` becomes the initial condition for `U`.

### Visual requirements

- Equation transformation pipeline:

```text
Heat equation → exponential rescaling → logarithmic spatial change → Black-Scholes equation
```

- Animated reversal of the time axis:

```text
V(S,T) known at maturity  →  U(S,0) known at computational time zero
```

### Key takeaway
The numerical methods are applied to the time-reversed formulation for `U(S,t)`, and the original option price is recovered by `V(S,t)=U(S,T-t)`.

---

## Page 4 — Computational Domain and Boundary Conditions

### Goal
Explain the truncated computational domain and identify exactly what is known before solving the PDE.

### Domain

Use:

```math
R_T^V = \{(S,t): 0<S<S^*,\ 0\leq t\leq T\}
```

### Grid rectangle

Display a rectangle with:

- horizontal axis: `S`, from `0` to `S*`;
- vertical axis: computational time `t`, from `0` to `T`.

### European put conditions

```math
U(S,0)=u_0(S)=\max(K-S,0)
```

```math
U(0,t)=u_a(t)=Ke^{-rt}
```

```math
U(S^*,t)=u_b(t)=0
```

### American put conditions

```math
U(S,0)=\max(K-S,0)
```

```math
U(0,t)=K, \qquad U(S^*,t)=0
```

```math
U(S,t)\geq \max(K-S,0)
```

### Visual requirements

- Mark initial condition on the lower boundary.
- Mark left and right boundary conditions.
- Shade the interior as the unknown region.
- Add a toggle: European / American.
- For American option, overlay the obstacle surface `g(S)=max(K-S,0)`.

### Key takeaway
The PDE is solved only in the interior of the grid; the initial and boundary values are imposed from the financial payoff and limiting behaviour of the put option.

---

## Page 5 — Finite-Difference Grid and Spatial Derivatives

### Goal
Explain how the continuous PDE becomes a discrete numerical problem.

### Grid

```math
S_i = i h_S, \qquad i=0,\ldots,N_S
```

```math
t_n = n h_t, \qquad n=0,\ldots,N_t
```

```math
h_S=\frac{S^*}{N_S}, \qquad h_t=\frac{T}{N_t}
```

```math
U_i^n \approx U(S_i,t_n)
```

### Central finite differences

```math
U_S(S_i,t_n) \approx \frac{U_{i+1}^n-U_{i-1}^n}{2h_S}
```

```math
U_{SS}(S_i,t_n) \approx \frac{U_{i+1}^n-2U_i^n+U_{i-1}^n}{h_S^2}
```

Both are second-order accurate in space:

```math
O(h_S^2)
```

### Visual requirements

- Grid with known and unknown points.
- Stencil for first derivative.
- Stencil for second derivative.
- Interactive slider for `N_S` showing how the grid becomes finer.
- Show the three-point molecule: `i-1`, `i`, `i+1`.

### Key takeaway
The spatial derivatives are replaced by second-order central finite differences, producing tridiagonal matrix structures.

---

## Page 6 — Crank-Nicolson Method

### Goal
Explain the Crank-Nicolson method as an average of the spatial operator between two consecutive time levels.

### Mathematical formulation

Let the spatial Black-Scholes operator be:

```math
\mathcal{L}U = \frac{\sigma^2}{2}S^2U_{SS}+rSU_S-rU
```

The PDE is:

```math
U_t = \mathcal{L}U
```

Crank-Nicolson uses:

```math
\frac{U^{n+1}-U^n}{h_t}
=\frac{1}{2}\mathcal{L}U^{n+1}+\frac{1}{2}\mathcal{L}U^n
```

After discretisation:

```math
A U^{n+1} = B U^n + b^n
```

### MATLAB implementation mapping

Reference file: `bs_cn.m`.

Implementation details to show:

- construction of the `S` and `tau` grids;
- initial condition `U(:,1)=arrayfun(u0,S)`;
- boundary conditions `U(1,:)=arrayfun(ua,tau)` and `U(end,:)=arrayfun(ub,tau)`;
- interior index vector `i=(1:NS-1)'`;
- tridiagonal matrices `A` and `B` built with `spdiags`;
- LU decomposition with `decomposition(A,'lu')`;
- time stepping loop solving `A U^{n+1}=rhs`.

### Visual requirements

- Crank-Nicolson molecule showing dependence on nodes at time levels `n` and `n+1`.
- Tridiagonal matrix visualisation for `A` and `B`.
- Toggle between:
  - equation view;
  - stencil view;
  - matrix view;
  - MATLAB code view.

### Properties

```text
Space order: O(h_S^2)
Time order:  O(h_t^2)
Stability:   unconditional
```

### Key takeaway
Crank-Nicolson is accurate and stable because it treats the spatial operator symmetrically between two time levels, at the cost of solving a tridiagonal linear system at each step.

---

## Page 7 — Method of Lines with RK4

### Goal
Explain the Method of Lines as a semi-discrete approach: discretise space first, then solve the resulting ODE system in time.

### Mathematical formulation

After spatial discretisation:

```math
\frac{dW}{dt}=AW+b(t)
```

where `W(t)` is the vector of interior values:

```math
W(t) = [U_1(t), U_2(t), \ldots, U_{N_S-1}(t)]^T
```

The time integration uses classical RK4:

```math
k_1 = h_t f(t_n,W_n)
```

```math
k_2 = h_t f(t_n+h_t/2,W_n+k_1/2)
```

```math
k_3 = h_t f(t_n+h_t/2,W_n+k_2/2)
```

```math
k_4 = h_t f(t_n+h_t,W_n+k_3)
```

```math
W_{n+1}=W_n+\frac{k_1+2k_2+2k_3+k_4}{6}
```

### MATLAB implementation mapping

Reference file: `bs_mol_rk4.m`.

Implementation details to show:

- grid construction;
- initial and boundary conditions;
- construction of the tridiagonal matrix `AML`;
- boundary contribution vector `bML`;
- `rhs_mol` function;
- RK4 stages `f1`, `f2`, `f3`, `f4`;
- update:

```matlab
W = W + (f1 + 2*f2 + 2*f3 + f4) / 6;
```

### Visual requirements

- Show the PDE grid collapsing into an ODE vector `W(t)`.
- Animate the four RK4 stages.
- Show how boundary values enter through `b(t)`.
- Include comparison badge:

```text
Space order: O(h_S^2)
Time order:  O(h_t^4)
Stability:   conditional
```

### Key takeaway
The Method of Lines separates spatial discretisation from time integration. With RK4 it has high temporal accuracy, but because RK4 is explicit, the method is conditionally stable.

---

## Page 8 — European Put Numerical Results

### Goal
Present the European put numerical solution and compare Crank-Nicolson with Method of Lines + RK4.

### Required parameter values

Use the project values:

```text
r      = 0.06
sigma  = 0.3
T      = 1
K      = 10
Smax   = 15
NS     = 200
Nt_cn  = 1000
Nt_mol = 4000
```

### MATLAB implementation mapping

Reference file: `q1.m`.

Important operations:

- solve PDE with Crank-Nicolson:

```matlab
[S_cn, tau_cn, Ucn] = bs_cn(...)
```

- recover physical time:

```matlab
Vcn = Ucn(:, end:-1:1);
```

- solve PDE with MOL + RK4:

```matlab
[S_mol, tau_mol, Umol] = bs_mol_rk4(...)
```

- recover physical time:

```matlab
Vmol = Umol(:, end:-1:1);
```

### Visual requirements

Interactive components:

1. 3D surface viewer:
   - Crank-Nicolson surface;
   - MOL + RK4 surface;
   - optional difference surface `Vcn - Vmol`.

2. Time profile viewer:
   - selected times `t=0`, `t=0.5`, `t=1`;
   - slider for arbitrary `t`.

3. Boundary overlay:
   - mark `S=0` boundary;
   - mark `S=S*` boundary;
   - mark payoff at maturity.

### Interpretive text

Explain that both methods produce smooth surfaces and similar time profiles, confirming consistency between the two approaches. The option value decreases as `S` increases, reflecting the payoff structure of a put option.

### Key takeaway
Both numerical methods produce consistent European put values and recover the expected qualitative behaviour of the Black-Scholes model.

---

## Page 9 — American Option and the Obstacle Problem

### Goal
Explain why American options are more complex than European options.

### Core idea

For an American put, the holder may exercise before maturity. Therefore, the option value must always dominate the payoff:

```math
U(S,t) \geq g(S)
```

where:

```math
g(S)=\max(K-S,0)
```

The domain splits into two regions:

### Continuation region

```math
U(S,t)>g(S)
```

It is better to hold the option.

### Exercise region

```math
U(S,t)=g(S)
```

It is optimal to exercise immediately.

### Free boundary

The boundary between these two regions is the early exercise boundary:

```math
S_f(t)
```

### Visual requirements

- Show payoff as an obstacle/floor.
- Show European-like unconstrained solution trying to fall below the payoff.
- Project the solution upward onto the admissible region.
- Display `S_f(t)` as a curve separating exercise and continuation.

### Key takeaway
The American put is an obstacle problem: the numerical solution must satisfy both the PDE and the inequality constraint imposed by early exercise.

---

## Page 10 — PSOR Method

### Goal
Explain how PSOR solves the linear complementarity problem produced by the American option constraint.

### Crank-Nicolson system

Without the American constraint, one would solve:

```math
A w = rhs
```

With the payoff constraint, the solution must also satisfy:

```math
w \geq g
```

The implementation uses:

```math
x = w - g \geq 0
```

and:

```math
\tilde{b}=rhs - Ag
```

### PSOR iteration

Use the matrix splitting:

```math
A = L + D + R
```

and the relaxation parameter `omega`.

The iteration should be visualised as:

```text
SOR update → projection → feasible iterate
```

Projection step:

```math
x \leftarrow \max(0,z)
```

Recover:

```math
w = x + g
```

### MATLAB implementation mapping

Reference file: `bs_american_put_psor.m`.

Implementation details to show:

- construction of `A` and `B`;
- splitting into `L`, `D`, `R`;
- matrices:

```matlab
M1 = D + omega * L;
M2 = (1 - omega) * D - omega * R;
```

- obstacle:

```matlab
g = max(K - S(2:NS), 0);
```

- complementarity transformation:

```matlab
btilde = rhs - A * g;
```

- projected iteration:

```matlab
z = M1 \ (M2 * x_old + omega * btilde);
x = max(0, z);
```

- stopping rule:

```matlab
err = norm(x - x_old, inf);
```

- solution recovery:

```matlab
w = x + g;
```

### Visual requirements

- Show iteration values moving toward the feasible region.
- Allow a slider for `omega`.
- Display convergence error versus iteration.
- Highlight that projection is what enforces early exercise.

### Key takeaway
PSOR modifies SOR by projecting every iterate onto the admissible set, ensuring the American put value never falls below intrinsic value.

---

## Page 11 — American Put Numerical Results

### Goal
Present the American put numerical solution, continuation region, and early exercise boundary.

### Required parameter values

Use the project values:

```text
r        = 0.06
sigma    = 0.3
T        = 1
K        = 10
Smax     = 15
NS       = 800
Nt       = 10000
omega    = 1.2
tol      = 1e-8
max_iter = 10000
```

### MATLAB implementation mapping

Reference file: `q2.m`.

Important operations:

- solve American put:

```matlab
[S, tau, U, Sf_tau] = bs_american_put_psor(...)
```

- recover physical time:

```matlab
V = U(:, end:-1:1);
```

- reverse free boundary:

```matlab
Sf = Sf_tau(end:-1:1);
```

- mask exercise region in continuation region plot:

```matlab
V_cont(bsxfun(@le, S', Sf)) = NaN;
```

### Visual requirements

1. American put profiles:
   - `t=0`, `t=0.5`, `t=1`;
   - overlay payoff `g(S)`.

2. Continuation region plot:
   - show `U(S,t)>g(S)`;
   - show `U(S,t)=g(S)` exercise region;
   - overlay `S_f(t)`.

3. European versus American comparison:
   - optional toggle to show that American put value is greater than or equal to European put value.

### Interpretive text

Explain that early exercise is concentrated where the put is sufficiently in-the-money. For larger time to maturity, continuation becomes more valuable because the option still has time value.

### Key takeaway
The American put solution captures both the option value and the optimal exercise policy through the continuation region and the free boundary.

---

## Page 12 — Method Comparison

### Goal
Summarise the numerical methods used in Project 1.

### Comparison table

| Method | Problem | Space order | Time order | Stability | Linear system? | Constraint? |
|---|---:|---:|---:|---:|---:|---:|
| Crank-Nicolson | European put | `O(h_S^2)` | `O(h_t^2)` | Unconditional | Yes | No |
| Method of Lines + RK4 | European put | `O(h_S^2)` | `O(h_t^4)` | Conditional | No direct implicit solve | No |
| Crank-Nicolson + PSOR | American put | `O(h_S^2)` | CN-based | Iterative | Yes | Yes, obstacle |

### Visual requirements

- Method cards.
- Toggle between mathematical, computational, and financial perspectives.
- Final summary diagram:

```text
PDE model
  → finite-difference grid
  → numerical method
  → option value surface
  → financial interpretation
```

### Key takeaway
Project 1 demonstrates how a financial pricing problem becomes a PDE problem, how the PDE is discretised, and how the numerical method changes when early exercise introduces an inequality constraint.

---

## 6. Data and Visualisation Requirements

### 6.0 MATLAB role in the application

The React application must **not** run MATLAB, Octave, or a ported numerical
solver in the browser. MATLAB is used outside the application to produce:

- authoritative result data or figures;
- curated code snippets for explanation;
- the numerical surfaces, profiles, continuation region, and free boundary.

Inside the application, interactivity is used primarily to explain how the
methods work: derivation reveals, grid refinement, stencils, matrix structure,
RK4 stages, obstacle projection, and PSOR iteration intuition.

The result pages are presentation / visualisation pages. They may provide
viewing controls such as method toggles, profile selectors, hover labels, and
surface selectors, but they must consume MATLAB-generated outputs rather than
recomputing Crank-Nicolson, Method of Lines, RK4, or PSOR.

### 6.1 Recommended precomputed data

Export precomputed data from MATLAB as JSON or CSV.

Recommended files:

```text
/data/project1/european_cn_surface.json
/data/project1/european_mol_surface.json
/data/project1/american_surface.json
/data/project1/american_free_boundary.json
/data/project1/european_profiles.json
/data/project1/american_profiles.json
```

Each surface file should include:

```json
{
  "S": [ ... ],
  "t": [ ... ],
  "V": [[ ... ], [ ... ]]
}
```

The free boundary file should include:

```json
{
  "t": [ ... ],
  "Sf": [ ... ]
}
```

### 6.2 Recommended libraries

- React
- TypeScript
- Vite
- KaTeX or MathJax for equations
- Plotly.js or Recharts for interactive plots
- D3 for custom grid and stencil animations
- Tailwind CSS for styling

---

## 7. Components

Suggested component structure:

```text
src/
  components/
    Layout/
      AppShell.tsx
      Sidebar.tsx
      TopBar.tsx
      SectionProgress.tsx
    Math/
      EquationBlock.tsx
      DerivationStep.tsx
      GreekCard.tsx
    Visuals/
      ComputationalGrid.tsx
      BoundaryConditionDiagram.tsx
      FiniteDifferenceStencil.tsx
      CrankNicolsonMolecule.tsx
      TridiagonalMatrixView.tsx
      RK4StageAnimator.tsx
      SurfacePlot.tsx
      ProfilePlot.tsx
      ObstacleDiagram.tsx
      PSORIterationView.tsx
      ContinuationRegionPlot.tsx
    Code/
      MatlabCodePanel.tsx
      CodeLinkCard.tsx
    Navigation/
      PreviousNext.tsx
      PageTabs.tsx
  pages/
    Project1Overview.tsx
    BlackScholesDerivation.tsx
    HeatEquationTransformation.tsx
    DomainBoundaryConditions.tsx
    FiniteDifferenceGrid.tsx
    CrankNicolson.tsx
    MethodOfLinesRK4.tsx
    EuropeanPutResults.tsx
    AmericanObstacle.tsx
    PSORMethod.tsx
    AmericanPutResults.tsx
    MethodComparison.tsx
```

---

## 8. Interaction Requirements

### Required interactions

- Step-by-step derivation reveal.
- Grid resolution slider.
- Toggle between European and American boundary conditions.
- Toggle between CN and MOL surfaces.
- Time profile slider.
- Stencil animation.
- Matrix view for tridiagonal systems.
- RK4 stage animation.
- Obstacle projection animation.
- PSOR relaxation parameter slider.
- Continuation / exercise region toggle.

### Optional interactions

- Difference surface `V_CN - V_MOL`.
- American versus European value comparison.
- Hover labels showing `S`, `t`, `V(S,t)`.
- Click on a grid node to show whether the value is known, solved directly, or constrained.

---

## 9. Writing Style

All app text must be:

- in English;
- clear and academic;
- visually oriented;
- consistent with the project report;
- concise enough for oral presentation;
- precise enough to support mathematical explanation.

Avoid vague statements such as:

```text
This method works well.
```

Prefer specific statements such as:

```text
Crank-Nicolson is second-order accurate in time and space and leads to a tridiagonal linear system at each time step.
```

---

## 10. Acceptance Criteria

The Project 1 app is complete when:

1. The Black-Scholes derivation follows `Black-Scholes.pdf` and includes the delta-hedging cancellation argument.
2. The heat-equation transformation uses the same notation as the project report.
3. The computational domain clearly marks `U(S,0)`, `U(0,t)`, and `U(S*,t)`.
4. The finite-difference grid identifies known boundary nodes and unknown interior nodes.
5. Crank-Nicolson is explained using the equation `A U^{n+1}=B U^n+b^n`.
6. Method of Lines is explained using `dW/dt=AW+b(t)` and RK4 stages.
7. European put results show both CN and MOL surfaces and time profiles.
8. American put section explains the obstacle condition `U(S,t)>=max(K-S,0)`.
9. PSOR is explained as SOR plus projection onto the admissible region.
10. American put results show the continuation region and early exercise boundary `S_f(t)`.
11. MATLAB code excerpts are mapped to the corresponding mathematical concepts.
12. All displayed text is in English.
13. The notation remains consistent with the project report and lecture notes.

---

## 11. Initial Implementation Priority

Recommended development order:

1. App shell and sidebar navigation.
2. Project 1 overview page.
3. Black-Scholes derivation page.
4. Domain and boundary condition visualisation.
5. Finite-difference grid and stencil components.
6. Crank-Nicolson page.
7. Method of Lines + RK4 page.
8. European result plots.
9. American obstacle page.
10. PSOR page.
11. American result plots.
12. Final comparison page.

The first prototype should focus on **Project 1 / Black-Scholes Equation Derivation**, because it establishes the theoretical foundation for all subsequent numerical methods.
