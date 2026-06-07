export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query') ?? ''

  if (!query.trim()) {
    return NextResponse.json({ error: 'กรุณาระบุเบอร์โทรหรือรหัสการจอง' }, { status: 400 })
  }

  const isCode = query.startsWith('BK-')

  const bookings = await prisma.booking.findMany({
    where: isCode
      ? { bookingCode: query.trim() }
      : { customerPhone: query.trim().replace(/-/g, '') },
    include: { service: true },
    orderBy: { bookingDate: 'desc' },
    take: 10,
  })

  return NextResponse.json({ bookings })
}
