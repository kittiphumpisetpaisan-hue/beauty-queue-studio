import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTimeSlots } from '@/lib/helpers'

export async function GET(req: NextRequest) {
  const serviceId = Number(req.nextUrl.searchParams.get('serviceId'))
  const date = req.nextUrl.searchParams.get('date') ?? ''

  if (!serviceId || !date) {
    return NextResponse.json({ error: 'กรุณาระบุบริการและวันที่' }, { status: 400 })
  }

  const [service, setting, bookings] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.shopSetting.findFirst(),
    prisma.booking.findMany({
      where: {
        serviceId,
        bookingDate: date,
        status: { notIn: ['cancelled'] },
      },
      select: { bookingTime: true },
    }),
  ])

  if (!service || !setting) {
    return NextResponse.json({ slots: [] })
  }

  const closedDays: number[] = JSON.parse(setting.closedDays)
  const dayOfWeek = new Date(date + 'T00:00:00').getDay()
  if (closedDays.includes(dayOfWeek)) {
    return NextResponse.json({ slots: [], message: 'ร้านปิดในวันที่เลือก' })
  }

  const bookedTimes = bookings.map((b) => b.bookingTime)
  const slots = generateTimeSlots(
    setting.openTime,
    setting.closeTime,
    service.durationMinutes,
    bookedTimes
  )

  return NextResponse.json({ slots })
}
