export const dynamic = 'force-dynamic'

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatThaiDate, formatPrice, formatDuration } from '@/lib/helpers'
import { Booking } from '@/types'

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const bookingCode = searchParams.get('bookingCode')

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!bookingCode) {
      setError('ไม่พบหมายเลขการจอง')
      setLoading(false)
      return
    }
    fetch(`/api/check-booking?query=${encodeURIComponent(bookingCode)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.bookings?.length > 0) setBooking(d.bookings[0])
        else setError('ไม่พบข้อมูลการจอง')
      })
      .catch(() => setError('เกิดข้อผิดพลาด'))
      .finally(() => setLoading(false))
  }, [bookingCode])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <p className="text-rose-400">กำลังโหลด...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 px-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm shadow-sm">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-gray-600">{error}</p>
          <Link href="/booking" className="mt-4 inline-block text-rose-500 hover:text-rose-700">
            กลับไปจองคิว
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-rose-800 mb-2">จองคิวสำเร็จ!</h1>
          <p className="text-gray-500 text-sm">เราได้รับการจองของคุณแล้ว กรุณารอการยืนยันจากทางร้าน</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6 mb-6">
          <div className="text-center mb-6 pb-4 border-b border-rose-100">
            <p className="text-sm text-gray-500 mb-1">หมายเลขการจอง</p>
            <p className="text-2xl font-bold text-rose-700 tracking-wider">{booking?.bookingCode}</p>
          </div>

          {booking && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">บริการ</span>
                <span className="font-medium">{booking.service?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ราคา</span>
                <span className="font-bold text-rose-700">{booking.service && formatPrice(booking.service.price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ระยะเวลา</span>
                <span className="font-medium">{booking.service && formatDuration(booking.service.durationMinutes)}</span>
              </div>
              <div className="border-t border-rose-50 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">วันที่</span>
                <span className="font-medium">{formatThaiDate(booking.bookingDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">เวลา</span>
                <span className="font-medium">{booking.bookingTime} น.</span>
              </div>
              <div className="border-t border-rose-50 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">ชื่อ</span>
                <span className="font-medium">{booking.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">เบอร์โทร</span>
                <span className="font-medium">{booking.customerPhone}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-amber-800 text-sm mb-2">📌 คำแนะนำ</h3>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• กรุณามาก่อนเวลานัดอย่างน้อย 10 นาที</li>
            <li>• บันทึกหมายเลขการจองไว้เพื่อตรวจสอบสถานะ</li>
            <li>• หากต้องการยกเลิกหรือเปลี่ยนเวลา กรุณาติดต่อร้านโดยตรง</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/check-booking"
            className="block text-center bg-rose-500 hover:bg-rose-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
          >
            ตรวจสอบสถานะคิว
          </Link>
          <Link
            href="/"
            className="block text-center border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 px-6 rounded-xl font-medium transition-colors"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <p className="text-rose-400">กำลังโหลด...</p>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}
