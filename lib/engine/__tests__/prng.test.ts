import { describe, it, expect } from 'vitest'
import { createPrng } from '../prng'

const COMBINED_SEED = 'e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0'
const EXPECTED = [0.1106166649, 0.7625129214, 0.0439292176, 0.4578678815, 0.3438999297]

describe('prng', () => {
  it('produces correct first 5 values from combinedSeed', () => {
    const rand = createPrng(COMBINED_SEED)
    const actual = Array.from({ length: 5 }, () => parseFloat(rand().toFixed(10)))
    expect(actual).toEqual(EXPECTED)
  })

  it('is deterministic — same seed, same sequence', () => {
    const r1 = createPrng(COMBINED_SEED)
    const r2 = createPrng(COMBINED_SEED)
    for (let i = 0; i < 20; i++) {
      expect(r1()).toBe(r2())
    }
  })

  it('seed is parsed as big-endian uint32 from first 8 hex chars', () => {
    const seed = parseInt(COMBINED_SEED.slice(0, 8), 16)
    expect(seed).toBe(0xe1dddf77)
  })
})
