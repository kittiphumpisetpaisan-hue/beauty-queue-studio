'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'แดชบอร์ด', icon: '📊', exact: true },
  { href: '/admin/bookings', label: 'จัดการคิว', icon: '📅', exact: false },
  { href: '/admin/services', label: 'จัดการบริการ', icon: '✂️', exact: false },
  { href: '/admin/settings', label: 'ตั้งค่าร้าน', icon: '⚙️', exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="w-64 bg-white border-r border-rose-100 min-h-screen flex flex-col">
      <div className="p-6 border-b border-rose-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💇‍♀️</span>
          <div>
            <p className="font-bold text-rose-700 text-sm">Beauty Queue</p>
            <p className="text-xs text-gray-400">ระบบจัดการร้าน</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item.href, item.exact)
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-rose-100">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg">🏠</span>
          กลับหน้าหลัก
        </Link>
      </div>
    </aside>
  )
}
