export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  const [totalToday, pendingToday, completedToday, revenueBookings] = await Promise.all([
    prisma.booking.count({ where: { bookingDate: today } }),
    prisma.booking.count({ where: { bookingDate: today, status: 'pending' } }),
    prisma.booking.count({ where: { bookingDate: today, status: 'completed' } }),
    prisma.booking.findMany({
      where: {
        bookingDate: today,
        status: { in: ['confirmed', 'completed'] },
      },
      include: { service: true },
    }),
  ])

  const revenueToday = revenueBookings.reduce(
    (sum, b) => sum + (b.service?.price ?? 0),
    0
  )

  return NextResponse.json({
    totalToday,
    pendingToday,
    completedToday,
    revenueToday,
  })
}
