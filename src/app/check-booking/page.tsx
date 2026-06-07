export const dynamic = 'force-dynamic'

'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import StatusBadge from '@/components/admin/StatusBadge'
import { formatThaiDate, formatPrice, formatDuration } from '@/lib/helpers'
import { Booking } from '@/types'

export default function CheckBookingPage() {
  const [query, setQuery] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setSearched(false)

    try {
      const res = await fetch(`/api/check-booking?query=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด')
      setBookings(data.bookings)
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar shopName="Beauty Queue Studio" />
      <main className="flex-1 bg-gradient-to-b from-rose-50 to-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-rose-800 mb-2">ตรวจสอบสถานะคิว</h1>
            <p className="text-gray-500 text-sm">กรอกเบอร์โทรศัพท์หรือหมายเลขการจองของคุณ</p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เบอร์โทรศัพท์ หรือ หมายเลขการจอง
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="เช่น 080-000-0000 หรือ BK-20260607-0001"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white px-6 py-3 rounded-xl font-medium transition-colors text-sm"
              >
                {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </form>

          {searched && bookings.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-medium">ไม่พบข้อมูลการจอง</p>
              <p className="text-sm mt-1">ลองตรวจสอบเบอร์โทรหรือรหัสการจองอีกครั้ง</p>
            </div>
          )}

          {bookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-rose-800">ผลการค้นหา ({bookings.length} รายการ)</h2>
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-rose-700 text-lg">{booking.bookingCode}</p>
                      <p className="text-gray-500 text-sm">{booking.customerName}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 border-t border-rose-50 pt-4">
                    <div className="flex justify-between">
                      <span>บริการ</span>
                      <span className="font-medium text-gray-800">{booking.service?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>วันที่</span>
                      <span className="font-medium text-gray-800">{formatThaiDate(booking.bookingDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>เวลา</span>
                      <span className="font-medium text-gray-800">{booking.bookingTime} น.</span>
                    </div>
                    {booking.service && (
                      <div className="flex justify-between">
                        <span>ราคา</span>
                        <span className="font-medium text-rose-700">{formatPrice(booking.service.price)}</span>
                      </div>
                    )}
                    {booking.note && (
                      <div className="flex justify-between">
                        <span>หมายเหตุ</span>
                        <span className="font-medium text-gray-800">{booking.note}</span>
                      </div>
                    )}
                  </div>
                  {booking.status === 'pending' && (
                    <div className="mt-4 bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700">
                      ⏳ การจองของคุณรอการยืนยันจากทางร้าน
                    </div>
                  )}
                  {booking.status === 'confirmed' && (
                    <div className="mt-4 bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                      ✅ การจองยืนยันแล้ว กรุณามาก่อนเวลานัด 10 นาที
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer setting={null} />
    </>
  )
}
