import { createHash } from 'crypto'

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

export function computeCommit(serverSeed: string, nonce: string): string {
  return sha256(`${serverSeed}:${nonce}`)
}

export function computeCombined(serverSeed: string, clientSeed: string, nonce: string): string {
  return sha256(`${serverSeed}:${clientSeed}:${nonce}`)
}
