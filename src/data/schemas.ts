export interface SurfaceData {
  S: number[]
  t: number[]
  V: number[][]
}

export interface FreeBoundaryData {
  t: number[]
  Sf: number[]
}

export interface ProfileSeries {
  label: string
  t: number
  V: number[]
}

export interface ProfileData {
  S: number[]
  series: ProfileSeries[]
  payoff: number[]
}
