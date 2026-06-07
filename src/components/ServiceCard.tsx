import Link from 'next/link'
import { formatPrice, formatDuration } from '@/lib/helpers'
import { Service } from '@/types'

interface ServiceCardProps {
  service: Service
  showBookButton?: boolean
}

const SERVICE_ICONS: Record<string, string> = {
  'ตัดผมหญิง': '✂️',
  'สระไดร์': '💆‍♀️',
  'ทำสีผม': '🎨',
  'ทรีตเมนต์ผม': '✨',
  'ทำเล็บเจล': '💅',
  'แต่งหน้าออกงาน': '💄',
}

function getServiceIcon(name: string): string {
  return SERVICE_ICONS[name] ?? '💇‍♀️'
}

export default function ServiceCard({ service, showBookButton = true }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 flex flex-col hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4 text-center">{getServiceIcon(service.name)}</div>
      <h3 className="font-semibold text-rose-800 text-lg mb-2 text-center">{service.name}</h3>
      {service.description && (
        <p className="text-gray-500 text-sm mb-4 text-center flex-1">{service.description}</p>
      )}
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4 bg-rose-50 rounded-xl p-3">
        <span>⏱ {formatDuration(service.durationMinutes)}</span>
        <span className="font-bold text-rose-700 text-base">{formatPrice(service.price)}</span>
      </div>
      {showBookButton && (
        <Link
          href={`/booking?serviceId=${service.id}`}
          className="block text-center bg-rose-500 hover:bg-rose-600 text-white py-2.5 px-4 rounded-xl font-medium transition-colors text-sm"
        >
          จองบริการนี้
        </Link>
      )}
    </div>
  )
}
