export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ServiceCard from '@/components/ServiceCard'
import { ShopSetting, Service } from '@/types'

async function getPageData() {
  const [setting, services] = await Promise.all([
    prisma.shopSetting.findFirst(),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])
  return { setting, services }
}

export default async function ServicesPage() {
  const { setting, services } = await getPageData()
  const shopName = setting?.shopName ?? 'Beauty Queue Studio'

  return (
    <>
      <Navbar shopName={shopName} />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-rose-800 mb-2">บริการทั้งหมด</h1>
            <p className="text-rose-500">เลือกบริการที่คุณต้องการ แล้วจองคิวได้เลย</p>
          </div>
        </div>

        <section className="py-12 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            {services.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">✂️</div>
                <p>ยังไม่มีบริการในขณะนี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service as Service}
                    showBookButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer setting={setting as ShopSetting | null} />
    </>
  )
}
