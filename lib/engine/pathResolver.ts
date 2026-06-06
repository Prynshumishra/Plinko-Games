import type { PegMap } from './pegMap'

export interface PathEntry {
  row: number
  decision: 'Left' | 'Right'
  rnd: number
  bias: number
}

export function resolvePath(
  pegMap: PegMap,
  rand: () => number,
  dropColumn: number
): { binIndex: number; path: PathEntry[] } {
  const ROWS = 12
  const adj = (dropColumn - Math.floor(ROWS / 2)) * 0.01
  let pos = 0
  const path: PathEntry[] = []

  for (let r = 0; r < ROWS; r++) {
    const pegIdx = Math.min(pos, r)
    const bias = Math.max(0, Math.min(1, pegMap[r][pegIdx] + adj))
    const rnd = rand()
    const decision: 'Left' | 'Right' = rnd < bias ? 'Left' : 'Right'
    if (decision === 'Right') pos++
    path.push({ row: r, decision, rnd, bias })
  }

  return { binIndex: pos, path }
}
