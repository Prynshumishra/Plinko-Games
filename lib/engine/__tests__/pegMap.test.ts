import { describe, it, expect } from 'vitest'
import { generatePegMap } from '../pegMap'
import { createPrng } from '../prng'

const COMBINED_SEED = 'e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0'

describe('pegMap', () => {
  it('produces correct row 0 leftBias from test vector', () => {
    const rand = createPrng(COMBINED_SEED)
    const { pegMap } = generatePegMap(rand)
    expect(pegMap[0]).toEqual([0.422123])
  })

  it('produces correct row 1 leftBias from test vector', () => {
    const rand = createPrng(COMBINED_SEED)
    const { pegMap } = generatePegMap(rand)
    expect(pegMap[1]).toEqual([0.552503, 0.408786])
  })

  it('produces correct row 2 leftBias from test vector', () => {
    const rand = createPrng(COMBINED_SEED)
    const { pegMap } = generatePegMap(rand)
    expect(pegMap[2]).toEqual([0.491574, 0.46878, 0.43654])
  })

  it('consumes exactly 78 rand calls for 12 rows', () => {
    let count = 0
    const countingRand = () => { count++; return Math.random() }
    generatePegMap(countingRand)
    expect(count).toBe(78)
  })

  it('pegMapHash is a 64-char hex string and is stable', () => {
    const rand1 = createPrng(COMBINED_SEED)
    const rand2 = createPrng(COMBINED_SEED)
    const { pegMapHash: h1 } = generatePegMap(rand1)
    const { pegMapHash: h2 } = generatePegMap(rand2)
    expect(h1).toMatch(/^[0-9a-f]{64}$/)
    expect(h1).toBe(h2)
  })
})
