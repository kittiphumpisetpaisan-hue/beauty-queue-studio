'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardStats, Booking } from '@/types'
import { formatPrice, formatThaiDate, STATUS_LABELS } from '@/lib/helpers'
import StatusBadge from '@/components/admin/StatusBadge'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/bookings?limit=5'),
      ])
      const statsData = await statsRes.json()
      const bookingsData = await bookingsRes.json()
      setStats(statsData)
      setRecentBookings(bookingsData.bookings ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const today = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
        <p className="text-gray-500 text-sm mt-1">{today}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">คิววันนี้</p>
            <p className="text-3xl font-bold text-gray-800">{stats?.totalToday ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">รายการ</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-yellow-100">
            <p className="text-sm text-yellow-600 mb-1">รอยืนยัน</p>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pendingToday ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">รายการ</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <p className="text-sm text-green-600 mb-1">เสร็จสิ้น</p>
            <p className="text-3xl font-bold text-green-600">{stats?.completedToday ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">รายการ</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
            <p className="text-sm text-rose-600 mb-1">รายได้วันนี้</p>
            <p className="text-3xl font-bold text-rose-600">{formatPrice(stats?.revenueToday ?? 0)}</p>
            <p className="text-xs text-gray-400 mt-1">โดยประมาณ</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800">การจองล่าสุด</h2>
          <Link href="/admin/bookings" className="text-sm text-rose-500 hover:text-rose-700">
            ดูทั้งหมด →
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">กำลังโหลด...</div>
        ) : recentBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">ยังไม่มีการจอง</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{booking.customerName}</p>
                  <p className="text-xs text-gray-400">{booking.service?.name} · {formatThaiDate(booking.bookingDate)} {booking.bookingTime} น.</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Link href="/admin/bookings" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <span className="text-3xl">📅</span>
          <div>
            <p className="font-semibold text-gray-800">จัดการคิว</p>
            <p className="text-xs text-gray-400">ดู เปลี่ยนสถานะ คิวทั้งหมด</p>
          </div>
        </Link>
        <Link href="/admin/services" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <span className="text-3xl">✂️</span>
          <div>
            <p className="font-semibold text-gray-800">จัดการบริการ</p>
            <p className="text-xs text-gray-400">เพิ่ม แก้ไข บริการต่างๆ</p>
          </div>
        </Link>
        <Link href="/admin/settings" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <span className="text-3xl">⚙️</span>
          <div>
            <p className="font-semibold text-gray-800">ตั้งค่าร้าน</p>
            <p className="text-xs text-gray-400">ชื่อร้าน เวลาเปิดปิด</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
