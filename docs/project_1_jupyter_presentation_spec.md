# Project 1 Jupyter Notebook Presentation Specification

This specification supersedes the earlier React-oriented app specification for
the current implementation.

## Purpose

Present Computational Methods in Finance - Project 1 as a sequence of
root-level Jupyter notebooks. The notebooks combine mathematical exposition,
method-focused visual interactivity, curated MATLAB code snippets, and
MATLAB-generated numerical results.

All explanatory text shown in the notebooks must be in English.

## Source Material

Use the following sources as the authority for notation, structure, and
implementation details:

- `docs/project 1/CMF_Project 1_140686.pdf`
- `docs/Black-Scholes.pdf`
- `docs/sebenta.pdf`
- `docs/project 1/q1.m`
- `docs/project 1/bs_cn.m`
- `docs/project 1/bs_mol_rk4.m`
- `docs/project 1/q2.m`
- `docs/project 1/bs_american_put_psor.m`

## Architecture

Root-level notebooks:

- `00_project_1_overview.ipynb`
- `01_black_scholes_derivation.ipynb`
- `02_heat_equation_domain_grid.ipynb`
- `03_crank_nicolson.ipynb`
- `04_method_of_lines_rk4.ipynb`
- `05_american_obstacle_psor.ipynb`
- `06_results_and_comparison.ipynb`

Shared files:

- `params.py` stores global parameters, source paths, export paths, labels, and
  plot style constants.
- `presentation_utils.py` stores reusable display helpers, payoff functions,
  visual sketches, MATLAB snippet readers, and export loaders.
- `requirements.txt` stores the Python/Jupyter dependencies.
- `matlab_exports/README.md` documents the expected MATLAB-generated result
  files.

## MATLAB Role

MATLAB is the authoritative computation environment. The notebooks must not
port the full production Crank-Nicolson, Method of Lines/RK4, or PSOR solvers
into Python.

The Python notebooks may use small illustrative calculations to explain method
mechanics, but result surfaces, profiles, continuation regions, and free
boundaries should come from MATLAB exports.

MATLAB code should appear as curated snippets from the original `.m` files and
be mapped to the corresponding mathematical ideas.

## Interactivity

Interactivity is used to explain how the numerical methods work:

- Black-Scholes derivation step reveal.
- Grid resolution sliders.
- Finite-difference stencil toggles.
- Crank-Nicolson tridiagonal matrix visualization.
- RK4 stage visualization.
- American obstacle projection visualization.
- PSOR relaxation and convergence intuition.

Result pages are presentation/visualization pages. They may include method
toggles, selected-time profiles, hover labels, and clear placeholders when
MATLAB exports are missing.

## Acceptance Criteria

- All notebooks execute top-to-bottom with the Python kernel and without MATLAB.
- Missing MATLAB exports produce clear placeholder messages instead of errors.
- Notation remains consistent with the report and lecture notes:
  `V(S,t)`, `U(S,t)`, `U(S,t)=V(S,T-t)`, `R_T^V`, `U_i^n`,
  `A U^{n+1}=B U^n+b^n`, `dW/dt=AW+b(t)`, `g(S)=max(K-S,0)`, and `S_f(t)`.
- MATLAB snippets are loaded from the existing project `.m` files.
- The result notebook is ready to display MATLAB-exported JSON files once they
  are added to `matlab_exports/`.
