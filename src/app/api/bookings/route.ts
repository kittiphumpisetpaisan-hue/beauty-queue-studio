import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingSchema } from '@/lib/validations'
import { generateBookingCode, generateTimeSlots } from '@/lib/helpers'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? ''
  const status = req.nextUrl.searchParams.get('status') ?? ''
  const limit = Number(req.nextUrl.searchParams.get('limit')) || undefined

  const where: Record<string, unknown> = {}
  if (date) where.bookingDate = date
  if (status) where.status = status

  const bookings = await prisma.booking.findMany({
    where,
    include: { service: true },
    orderBy: [{ bookingDate: 'desc' }, { bookingTime: 'asc' }],
    take: limit,
  })

  return NextResponse.json({ bookings })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = bookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { serviceId, bookingDate, bookingTime, customerName, customerPhone, customerEmail, note } = parsed.data

    const today = new Date().toISOString().split('T')[0]
    if (bookingDate < today) {
      return NextResponse.json({ error: 'ไม่สามารถจองวันที่ผ่านมาแล้วได้' }, { status: 400 })
    }

    const [service, setting] = await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.shopSetting.findFirst(),
    ])

    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'ไม่พบบริการที่เลือก' }, { status: 400 })
    }

    if (setting) {
      const closedDays: number[] = JSON.parse(setting.closedDays)
      const dayOfWeek = new Date(bookingDate + 'T00:00:00').getDay()
      if (closedDays.includes(dayOfWeek)) {
        return NextResponse.json({ error: 'ร้านปิดทำการในวันที่เลือก' }, { status: 400 })
      }

      const validSlots = generateTimeSlots(setting.openTime, setting.closeTime, service.durationMinutes, [])
      if (!validSlots.includes(bookingTime)) {
        return NextResponse.json({ error: 'เวลาที่เลือกไม่อยู่ในช่วงเวลาเปิดร้าน' }, { status: 400 })
      }
    }

    const existing = await prisma.booking.findFirst({
      where: {
        serviceId,
        bookingDate,
        bookingTime,
        status: { notIn: ['cancelled'] },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'ช่วงเวลาที่เลือกถูกจองแล้ว กรุณาเลือกเวลาอื่น' }, { status: 400 })
    }

    const todayBookingCount = await prisma.booking.count({ where: { bookingDate } })
    const bookingCode = await generateBookingCode(bookingDate, todayBookingCount)

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        serviceId,
        bookingDate,
        bookingTime,
        status: 'pending',
        note: note || null,
      },
      include: { service: true },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 })
  }
}
