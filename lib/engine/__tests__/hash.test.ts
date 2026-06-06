import { describe, it, expect } from 'vitest'
import { computeCommit, computeCombined } from '../hash'

const SERVER_SEED = 'b2a5f3f32a4d9c6ee7a8c1d33456677890abcdeffedcba0987654321ffeeddcc'
const NONCE = '42'
const CLIENT_SEED = 'candidate-hello'

describe('hash', () => {
  it('computeCommit matches test vector', () => {
    expect(computeCommit(SERVER_SEED, NONCE)).toBe(
      'bb9acdc67f3f18f3345236a01f0e5072596657a9005c7d8a22cff061451a6b34'
    )
  })

  it('computeCombined matches test vector', () => {
    expect(computeCombined(SERVER_SEED, CLIENT_SEED, NONCE)).toBe(
      'e1dddf77de27d395ea2be2ed49aa2a59bd6bf12ee8d350c16c008abd406c07e0'
    )
  })
})
