import { describe, it, expect } from 'vitest'
import { computeCommit, computeCombined } from '../hash'
import { createPrng } from '../prng'
import { generatePegMap } from '../pegMap'
import { resolvePath } from '../pathResolver'
import { getMultiplier } from '../payout'

describe('full round lifecycle', () => {
  it('verify recompute matches original engine run', () => {
    const serverSeed = 'b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc'
    const nonce = '42'
    const clientSeed = 'candidate-hello'
    const dropColumn = 6

    // original run (server)
    const combinedSeed = computeCombined(serverSeed, clientSeed, nonce)
    const rand1 = createPrng(combinedSeed)
    const { pegMap: pm1, pegMapHash: hash1 } = generatePegMap(rand1)
    const { binIndex: bin1, path: path1 } = resolvePath(pm1, rand1, dropColumn)
    const mult1 = getMultiplier(bin1)

    // recompute (verifier — same combinedSeed, fresh PRNG)
    const rand2 = createPrng(combinedSeed)
    const { pegMap: pm2, pegMapHash: hash2 } = generatePegMap(rand2)
    const { binIndex: bin2, path: path2 } = resolvePath(pm2, rand2, dropColumn)

    expect(hash1).toBe(hash2)
    expect(bin1).toBe(bin2)
    expect(path1).toEqual(path2)
    expect(mult1).toBe(getMultiplier(bin2))

    // commitHex must match published test vector
    const commit = computeCommit(serverSeed, nonce)
    expect(commit).toBe('bb9acdc67f3f18f3345236a01f0e5072596657a9005c7d8a22cff061451a6b34')
  })
})
