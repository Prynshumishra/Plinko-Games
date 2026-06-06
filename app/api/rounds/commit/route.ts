import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { computeCommit } from '@/lib/engine/hash'

export async function POST() {
  const serverSeed = randomBytes(32).toString('hex')
  const nonce = String(Math.floor(Math.random() * 1_000_000))
  const commitHex = computeCommit(serverSeed, nonce)

  const round = await prisma.round.create({
    data: { status: 'CREATED', nonce, commitHex, serverSeed },
  })

  return NextResponse.json({ roundId: round.id, commitHex, nonce })
}
