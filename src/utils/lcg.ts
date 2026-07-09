export const PARK_MILLER_M = 2 ** 31 - 1
export const PARK_MILLER_A = 16807
export const PARK_MILLER_B = 0

export function matlabModulo(value: number, modulus: number) {
  return ((value % modulus) + modulus) % modulus
}

export function lcg(
  count: number,
  seed: number,
  lower = 0,
  upper = 1,
  multiplier = PARK_MILLER_A,
  increment = PARK_MILLER_B,
  modulus = PARK_MILLER_M,
) {
  const values = new Array<number>(Math.max(0, Math.trunc(count)))
  let state = seed

  for (let index = 0; index < values.length; index += 1) {
    state = matlabModulo(multiplier * state + increment, modulus)
    values[index] = lower + (upper - lower) * (state / modulus)
  }

  return values
}

export function createLcg(seed: number) {
  let state = seed

  return () => {
    state = matlabModulo(PARK_MILLER_A * state + PARK_MILLER_B, PARK_MILLER_M)
    return state / PARK_MILLER_M
  }
}
