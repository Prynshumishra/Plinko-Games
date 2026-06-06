import { describe, it, expect } from 'vitest'
import { resolvePath } from '../pathResolver'
import { createPrng } from '../prng'
import { generatePegMap } from '../pegMap'

const COMBINED_SEED = 'e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0'

function freshEngine() {
  const rand = createPrng(COMBINED_SEED)
  const { pegMap } = generatePegMap(rand)
  return { rand, pegMap }
}

describe('pathResolver', () => {
  it('center drop (col 6) → binIndex 6 for test vector', () => {
    const { rand, pegMap } = freshEngine()
    const { binIndex } = resolvePath(pegMap, rand, 6)
    expect(binIndex).toBe(6)
  })

  it('returns a path with 12 entries', () => {
    const { rand, pegMap } = freshEngine()
    const { path } = resolvePath(pegMap, rand, 6)
    expect(path).toHaveLength(12)
  })

  it('path entries have correct shape', () => {
    const { rand, pegMap } = freshEngine()
    const { path } = resolvePath(pegMap, rand, 6)
    for (const entry of path) {
      expect(entry).toHaveProperty('row')
      expect(entry).toHaveProperty('decision')
      expect(entry).toHaveProperty('rnd')
      expect(entry).toHaveProperty('bias')
      expect(['Left', 'Right']).toContain(entry.decision)
      expect(entry.rnd).toBeGreaterThanOrEqual(0)
      expect(entry.rnd).toBeLessThan(1)
    }
  })

  it('is deterministic — same seeds + column → same path', () => {
    const e1 = freshEngine()
    const e2 = freshEngine()
    const r1 = resolvePath(e1.pegMap, e1.rand, 4)
    const r2 = resolvePath(e2.pegMap, e2.rand, 4)
    expect(r1.binIndex).toBe(r2.binIndex)
    expect(r1.path).toEqual(r2.path)
  })
})
