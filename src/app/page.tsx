export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatPrice, formatDuration, getClosedDayNames } from '@/lib/helpers'
import { ShopSetting } from '@/types'

async function getPageData() {
  const [setting, services] = await Promise.all([
    prisma.shopSetting.findFirst(),
    prisma.service.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { createdAt: 'asc' },
    }),
  ])
  return { setting, services }
}

export default async function HomePage() {
  const { setting, services } = await getPageData()
  const shopName = setting?.shopName ?? 'Beauty Queue Studio'
  const closedDayNames = setting ? getClosedDayNames(setting.closedDays) : 'วันจันทร์'

  return (
    <>
      <Navbar shopName={shopName} />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white/70 backdrop-blur rounded-full px-4 py-1.5 text-rose-600 text-sm font-medium mb-6 shadow-sm">
              ✨ ร้านเสริมสวยครบวงจร
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-rose-800 mb-4 leading-tight">
              {shopName}
            </h1>
            <p className="text-lg text-rose-500 mb-10 max-w-lg mx-auto">
              บริการความสวยงามด้วยช่างมืออาชีพ จองคิวล่วงหน้าง่ายๆ ผ่านออนไลน์
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/booking"
                className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-rose-200 hover:-translate-y-0.5"
              >
                จองคิวเลย 🗓
              </Link>
              <Link
                href="/services"
                className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-8 py-4 rounded-full text-lg font-semibold transition-all"
              >
                ดูบริการทั้งหมด
              </Link>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-rose-800 mb-4">ทำไมต้องเลือกเรา?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                { icon: '👩‍🎨', title: 'ช่างมืออาชีพ', desc: 'ทีมช่างที่มีประสบการณ์ ผ่านการฝึกอบรม' },
                { icon: '🌸', title: 'บรรยากาศผ่อนคลาย', desc: 'ร้านสะอาด อบอุ่น ให้คุณรู้สึกดีทุกครั้ง' },
                { icon: '📱', title: 'จองออนไลน์ได้', desc: 'จองคิวล่วงหน้าผ่านเว็บ สะดวก ไม่ต้องโทร' },
              ].map((item) => (
                <div key={item.title} className="p-6 rounded-2xl bg-rose-50">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-rose-800 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Services */}
        <section className="py-16 px-4 bg-gradient-to-b from-white to-rose-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-rose-800 mb-2">บริการยอดนิยม</h2>
              <p className="text-gray-500 text-sm">เลือกบริการที่คุณต้องการ แล้วจองคิวได้เลย</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-rose-800 text-lg mb-1">{service.name}</h3>
                  {service.description && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-rose-50">
                    <span className="text-sm text-gray-500">⏱ {formatDuration(service.durationMinutes)}</span>
                    <span className="font-bold text-rose-700">{formatPrice(service.price)}</span>
                  </div>
                  <Link
                    href={`/booking?serviceId=${service.id}`}
                    className="mt-4 block text-center bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                  >
                    จองบริการนี้
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/services" className="text-rose-500 hover:text-rose-700 font-medium text-sm">
                ดูบริการทั้งหมด →
              </Link>
            </div>
          </div>
        </section>

        {/* Hours & Contact */}
        <section className="py-16 px-4 bg-rose-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-rose-800 text-center mb-10">ข้อมูลร้าน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-rose-700 text-lg mb-4 flex items-center gap-2">
                  🕐 เวลาทำการ
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>เปิดบริการ: <span className="font-medium text-rose-700">{setting?.openTime ?? '10:00'} - {setting?.closeTime ?? '20:00'} น.</span></p>
                  <p>วันหยุดประจำ: <span className="font-medium text-rose-700">{closedDayNames}</span></p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-rose-700 text-lg mb-4 flex items-center gap-2">
                  📞 ติดต่อเรา
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>โทร: <span className="font-medium">{setting?.phone ?? '080-000-0000'}</span></p>
                  {setting?.address && (
                    <p>ที่อยู่: <span className="font-medium">{setting.address}</span></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer setting={setting as ShopSetting | null} />
    </>
  )
}
