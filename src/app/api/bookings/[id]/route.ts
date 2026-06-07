import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const booking = await prisma.booking.findUnique({
    where: { id: Number(params.id) },
    include: { service: true },
  })
  if (!booking) return NextResponse.json({ error: 'ไม่พบการจอง' }, { status: 404 })
  return NextResponse.json({ booking })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { status } = body

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'สถานะไม่ถูกต้อง' }, { status: 400 })
    }

    const booking = await prisma.booking.update({
      where: { id: Number(params.id) },
      data: { status },
      include: { service: true },
    })

    return NextResponse.json({ booking })
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
