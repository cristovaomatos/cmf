export function nearestIndex(arr: number[], target: number): number {
  let best = 0
  let bestDiff = Infinity
  arr.forEach((v, i) => {
    const diff = Math.abs(v - target)
    if (diff < bestDiff) {
      bestDiff = diff
      best = i
    }
  })
  return best
}
