import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const round = await prisma.round.findUnique({ where: { id: params.id } })
  if (!round) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Only expose serverSeed after it has been revealed
  const { serverSeed, ...rest } = round
  return NextResponse.json(round.status === 'REVEALED' ? round : { ...rest, serverSeed: null })
}
