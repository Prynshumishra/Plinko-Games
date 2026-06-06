export function createPrng(combinedSeed: string): () => number {
  let state = parseInt(combinedSeed.slice(0, 8), 16) >>> 0

  return function rand(): number {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state = state >>> 0
    return state / 0x100000000
  }
}
