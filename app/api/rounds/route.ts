import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '20'), 100)
  const rounds = await prisma.round.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      status: true,
      commitHex: true,
      nonce: true,
      binIndex: true,
      payoutMultiplier: true,
      betCents: true,
      dropColumn: true,
    },
  })
  return NextResponse.json(rounds)
}
