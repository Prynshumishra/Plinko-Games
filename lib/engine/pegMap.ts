import { createHash } from 'crypto'

const ROWS = 12

export type PegMap = number[][]

export function generatePegMap(rand: () => number): { pegMap: PegMap; pegMapHash: string } {
  const pegMap: PegMap = []

  for (let r = 0; r < ROWS; r++) {
    const row: number[] = []
    for (let p = 0; p <= r; p++) {
      const leftBias = Number((0.5 + (rand() - 0.5) * 0.2).toFixed(6))
      row.push(leftBias)
    }
    pegMap.push(row)
  }

  const pegMapHash = createHash('sha256')
    .update(JSON.stringify(pegMap))
    .digest('hex')

  return { pegMap, pegMapHash }
}
