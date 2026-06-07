export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const TH_MONTHS = ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

const STATUS_TH: Record<string, string> = {
  pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', completed: 'เสร็จสิ้น', cancelled: 'ยกเลิก'
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (key !== 'beauty2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = request.nextUrl.searchParams.get('type') ?? 'bookings'

  const bookings = await prisma.booking.findMany({
    include: { service: true },
    orderBy: { bookingDate: 'desc' },
  })

  const completed = bookings.filter(b => ['confirmed', 'completed'].includes(b.status))

  if (type === 'daily') {
    // รายได้รายวัน
    const map: Record<string, { count: number; revenue: number }> = {}
    completed.forEach(b => {
      if (!map[b.bookingDate]) map[b.bookingDate] = { count: 0, revenue: 0 }
      map[b.bookingDate].count++
      map[b.bookingDate].revenue += b.service?.price ?? 0
    })
    const rows = [csvRow(['วันที่', 'จำนวนคิว', 'รายได้ (บาท)'])]
    Object.entries(map).sort((a, b) => b[0].localeCompare(a[0])).forEach(([date, v]) => {
      const d = new Date(date)
      const thDate = `${d.getDate()} ${TH_MONTHS[d.getMonth() + 1]} ${d.getFullYear() + 543}`
      rows.push(csvRow([thDate, v.count, v.revenue]))
    })
    const total = completed.reduce((s, b) => s + (b.service?.price ?? 0), 0)
    rows.push(csvRow(['รวมทั้งหมด', completed.length, total]))
    return new NextResponse('﻿' + rows.join('\n'), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="revenue-daily.csv"' }
    })
  }

  if (type === 'monthly') {
    // รายได้รายเดือน
    const map: Record<string, { count: number; revenue: number }> = {}
    completed.forEach(b => {
      const key = b.bookingDate.substring(0, 7) // YYYY-MM
      if (!map[key]) map[key] = { count: 0, revenue: 0 }
      map[key].count++
      map[key].revenue += b.service?.price ?? 0
    })
    const rows = [csvRow(['ปี (พ.ศ.)', 'เดือน', 'จำนวนคิว', 'รายได้ (บาท)'])]
    Object.entries(map).sort((a, b) => b[0].localeCompare(a[0])).forEach(([ym, v]) => {
      const [y, m] = ym.split('-').map(Number)
      rows.push(csvRow([y + 543, TH_MONTHS[m], v.count, v.revenue]))
    })
    return new NextResponse('﻿' + rows.join('\n'), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="revenue-monthly.csv"' }
    })
  }

  if (type === 'yearly') {
    // รายได้รายปี
    const map: Record<string, { count: number; revenue: number }> = {}
    completed.forEach(b => {
      const y = b.bookingDate.substring(0, 4)
      if (!map[y]) map[y] = { count: 0, revenue: 0 }
      map[y].count++
      map[y].revenue += b.service?.price ?? 0
    })
    const rows = [csvRow(['ปี (พ.ศ.)', 'จำนวนคิว', 'รายได้ (บาท)'])]
    Object.entries(map).sort((a, b) => b[0].localeCompare(a[0])).forEach(([y, v]) => {
      rows.push(csvRow([Number(y) + 543, v.count, v.revenue]))
    })
    return new NextResponse('﻿' + rows.join('\n'), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="revenue-yearly.csv"' }
    })
  }

  // default: bookings รายการจองทั้งหมด
  const rows = [csvRow(['รหัสการจอง', 'วันที่', 'เวลา', 'บริการ', 'ชื่อลูกค้า', 'เบอร์โทร', 'ราคา (บาท)', 'สถานะ', 'หมายเหตุ'])]
  bookings.forEach(b => {
    const d = new Date(b.bookingDate)
    const thDate = `${d.getDate()} ${TH_MONTHS[d.getMonth() + 1]} ${d.getFullYear() + 543}`
    rows.push(csvRow([
      b.bookingCode, thDate, b.bookingTime, b.service?.name ?? '', b.customerName,
      b.customerPhone, b.service?.price ?? 0, STATUS_TH[b.status] ?? b.status, b.note ?? ''
    ]))
  })
  return new NextResponse('﻿' + rows.join('\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="bookings.csv"' }
  })
}
