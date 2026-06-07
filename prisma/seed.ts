import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.shopSetting.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.service.deleteMany()

  await prisma.shopSetting.create({
    data: {
      shopName: 'Beauty Queue Studio',
      phone: '080-000-0000',
      address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
      openTime: '10:00',
      closeTime: '20:00',
      closedDays: '[1]',
    },
  })

  await prisma.service.createMany({
    data: [
      {
        name: 'ตัดผมหญิง',
        description: 'ตัดและจัดทรงผมสำหรับสุภาพสตรี โดยช่างผมมืออาชีพ',
        durationMinutes: 45,
        price: 350,
        isActive: true,
      },
      {
        name: 'สระไดร์',
        description: 'สระผมและไดร์ผมให้เรียบสวย',
        durationMinutes: 30,
        price: 250,
        isActive: true,
      },
      {
        name: 'ทำสีผม',
        description: 'ทำสีผมด้วยผลิตภัณฑ์คุณภาพสูง มีให้เลือกหลายเฉดสี',
        durationMinutes: 120,
        price: 1800,
        isActive: true,
      },
      {
        name: 'ทรีตเมนต์ผม',
        description: 'บำรุงผมเสียให้กลับมาแข็งแรงและเงางาม',
        durationMinutes: 60,
        price: 900,
        isActive: true,
      },
      {
        name: 'ทำเล็บเจล',
        description: 'ทำเล็บเจลสวยงาม มีลวดลายหลากหลายให้เลือก',
        durationMinutes: 60,
        price: 700,
        isActive: true,
      },
      {
        name: 'แต่งหน้าออกงาน',
        description: 'แต่งหน้าสวยงามสำหรับงานสำคัญต่างๆ โดยช่างแต่งหน้ามืออาชีพ',
        durationMinutes: 90,
        price: 1500,
        isActive: true,
      },
    ],
  })

  console.log('✅ Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
