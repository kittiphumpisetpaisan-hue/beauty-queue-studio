import Link from 'next/link'
import { getClosedDayNames } from '@/lib/helpers'
import { ShopSetting } from '@/types'

interface FooterProps {
  setting: ShopSetting | null
}

export default function Footer({ setting }: FooterProps) {
  const closedDayNames = setting ? getClosedDayNames(setting.closedDays) : 'วันจันทร์'

  return (
    <footer className="bg-rose-800 text-rose-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💇‍♀️</span>
            <span className="font-bold text-white text-lg">{setting?.shopName ?? 'Beauty Queue Studio'}</span>
          </div>
          <p className="text-rose-300 text-sm">ร้านเสริมสวยครบวงจร บริการด้วยใจ</p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">เวลาทำการ</h4>
          <p className="text-sm text-rose-200 mb-1">
            เปิด: {setting?.openTime ?? '10:00'} - {setting?.closeTime ?? '20:00'} น.
          </p>
          <p className="text-sm text-rose-200">หยุดประจำ: {closedDayNames}</p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">ติดต่อเรา</h4>
          <p className="text-sm text-rose-200 mb-1">โทร: {setting?.phone ?? '080-000-0000'}</p>
          {setting?.address && (
            <p className="text-sm text-rose-200">{setting.address}</p>
          )}
          <div className="flex gap-4 mt-3">
            <Link href="/booking" className="text-sm text-rose-300 hover:text-white transition-colors">
              จองคิว
            </Link>
            <Link href="/check-booking" className="text-sm text-rose-300 hover:text-white transition-colors">
              ตรวจสอบคิว
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-rose-700 text-center py-4 text-xs text-rose-400">
        © 2026 {setting?.shopName ?? 'Beauty Queue Studio'} · สงวนลิขสิทธิ์
      </div>
    </footer>
  )
}
