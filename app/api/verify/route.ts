import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeCommit, computeCombined } from '@/lib/engine/hash'
import { createPrng } from '@/lib/engine/prng'
import { generatePegMap } from '@/lib/engine/pegMap'
import { resolvePath } from '@/lib/engine/pathResolver'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const serverSeed = sp.get('serverSeed') ?? ''
  const clientSeed = sp.get('clientSeed') ?? ''
  const nonce = sp.get('nonce') ?? ''
  const dropColumn = parseInt(sp.get('dropColumn') ?? '6')
  const roundId = sp.get('roundId')

  if (!serverSeed || !clientSeed || !nonce) {
    return NextResponse.json({ error: 'serverSeed, clientSeed, nonce required' }, { status: 400 })
  }

  const commitHex = computeCommit(serverSeed, nonce)
  const combinedSeed = computeCombined(serverSeed, clientSeed, nonce)
  const rand = createPrng(combinedSeed)
  const { pegMap, pegMapHash } = generatePegMap(rand)
  const { binIndex, path } = resolvePath(pegMap, rand, dropColumn)

  let match: boolean | undefined
  let stored: { binIndex: number; pegMapHash: string; dropColumn: number; payoutMultiplier: number; betCents: number; commitHex: string } | null = null
  if (roundId) {
    const row = await prisma.round.findUnique({ where: { id: roundId } })
    if (row) {
      match = row.binIndex === binIndex && row.pegMapHash === pegMapHash
      stored = {
        binIndex: row.binIndex,
        pegMapHash: row.pegMapHash,
        dropColumn: row.dropColumn,
        payoutMultiplier: row.payoutMultiplier,
        betCents: row.betCents,
        commitHex: row.commitHex,
      }
    }
  }

  return NextResponse.json({ commitHex, combinedSeed, pegMapHash, binIndex, path, match, stored })
}
