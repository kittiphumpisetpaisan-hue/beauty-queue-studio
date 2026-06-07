import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const setting = await prisma.shopSetting.findFirst()
  return NextResponse.json({ setting })
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { shopName, phone, address, openTime, closeTime, closedDays } = body

    if (!shopName || !phone || !openTime || !closeTime) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 })
    }

    const existing = await prisma.shopSetting.findFirst()
    const data = {
      shopName,
      phone,
      address: address || null,
      openTime,
      closeTime,
      closedDays: JSON.stringify(closedDays ?? []),
    }

    const setting = existing
      ? await prisma.shopSetting.update({ where: { id: existing.id }, data })
      : await prisma.shopSetting.create({ data })

    return NextResponse.json({ setting })
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
