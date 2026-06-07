export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serviceSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all') === 'true'
  const services = await prisma.service.findMany({
    where: all ? {} : { isActive: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ services })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = serviceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }
    const service = await prisma.service.create({ data: parsed.data })
    return NextResponse.json({ service }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
