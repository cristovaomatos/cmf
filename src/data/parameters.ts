export const europeanParams = {
  r: 0.06,
  sigma: 0.3,
  T: 1,
  K: 10,
  Smax: 15,
  NS: 200,
  Nt_cn: 1000,
  Nt_mol: 4000,
}

export const americanParams = {
  r: 0.06,
  sigma: 0.3,
  T: 1,
  K: 10,
  Smax: 15,
  NS: 800,
  Nt: 10000,
  omega: 1.2,
  tol: 1e-8,
  max_iter: 10000,
}

export const crankNicolsonSimulationDefaults = {
  r: 0.06,
  sigma: 0.3,
  T: 1,
  K: 10,
  Smax: 15,
  NS: 10,
  Nt: 10,
}

export const profileTimes = [0, 0.5, 1]
