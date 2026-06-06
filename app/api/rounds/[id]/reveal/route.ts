import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const round = await prisma.round.findUnique({ where: { id: params.id } })
  if (!round) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (round.status !== 'STARTED') return NextResponse.json({ error: 'Round not started' }, { status: 409 })

  await prisma.round.update({
    where: { id: params.id },
    data: { status: 'REVEALED', revealedAt: new Date() },
  })

  return NextResponse.json({ serverSeed: round.serverSeed })
}
