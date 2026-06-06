const MULTIPLIERS = [10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10]

export function getMultiplier(binIndex: number): number {
  return MULTIPLIERS[binIndex] ?? 1
}
