import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeCombined } from '@/lib/engine/hash'
import { createPrng } from '@/lib/engine/prng'
import { generatePegMap } from '@/lib/engine/pegMap'
import { resolvePath } from '@/lib/engine/pathResolver'
import { getMultiplier } from '@/lib/engine/payout'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { clientSeed, betCents, dropColumn } = body

  if (typeof dropColumn !== 'number' || dropColumn < 0 || dropColumn > 12 || !Number.isInteger(dropColumn)) {
    return NextResponse.json({ error: 'dropColumn must be integer 0–12' }, { status: 400 })
  }
  if (typeof betCents !== 'number' || betCents < 1 || !Number.isInteger(betCents)) {
    return NextResponse.json({ error: 'betCents must be positive integer' }, { status: 400 })
  }
  if (typeof clientSeed !== 'string' || clientSeed.length > 128) {
    return NextResponse.json({ error: 'clientSeed must be string ≤128 chars' }, { status: 400 })
  }

  const round = await prisma.round.findUnique({ where: { id: params.id } })
  if (!round) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (round.status !== 'CREATED') return NextResponse.json({ error: 'Round already started' }, { status: 409 })

  const combinedSeed = computeCombined(round.serverSeed!, clientSeed, round.nonce)
  const rand = createPrng(combinedSeed)
  const { pegMap, pegMapHash } = generatePegMap(rand)
  const { binIndex, path } = resolvePath(pegMap, rand, dropColumn)
  const payoutMultiplier = getMultiplier(binIndex)

  try {
    await prisma.round.update({
      where: { id: params.id },
      data: {
        status: 'STARTED',
        clientSeed,
        combinedSeed,
        pegMapHash,
        dropColumn,
        betCents,
        binIndex,
        payoutMultiplier,
        pathJson: path as object[],
      },
    })
  } catch (err) {
    console.error('[start] prisma update failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ binIndex, pathJson: path, pegMapHash, payoutMultiplier })
}
