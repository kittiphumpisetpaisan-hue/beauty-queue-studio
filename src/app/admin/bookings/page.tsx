'use client'

import { useState, useEffect, useCallback } from 'react'
import { Booking, BookingStatus } from '@/types'
import { formatThaiDate, formatPrice, STATUS_LABELS, STATUS_COLORS } from '@/lib/helpers'
import StatusBadge from '@/components/admin/StatusBadge'

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'pending', label: 'รอยืนยัน' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'completed', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' },
]

const EXPORT_KEY = 'beauty2024'
const EXPORTS = [
  { type: 'bookings', label: 'รายการจองทั้งหมด', file: 'bookings.csv' },
  { type: 'daily',    label: 'รายได้รายวัน',      file: 'revenue-daily.csv' },
  { type: 'monthly',  label: 'รายได้รายเดือน',    file: 'revenue-monthly.csv' },
  { type: 'yearly',   label: 'รายได้รายปี',       file: 'revenue-yearly.csv' },
]

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState('')

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterDate) params.set('date', filterDate)
    if (filterStatus) params.set('status', filterStatus)
    const res = await fetch(`/api/bookings?${params.toString()}`)
    const data = await res.json()
    setBookings(data.bookings ?? [])
    setLoading(false)
  }, [filterDate, filterStatus])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  async function handleStatusChange(bookingId: number, newStatus: string) {
    setUpdatingId(bookingId)
    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    await fetchBookings()
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking((b) => b ? { ...b, status: newStatus as BookingStatus } : null)
    }
    setUpdatingId(null)
  }

  function downloadCSV(type: string, filename: string) {
    const a = document.createElement('a')
    a.href = `/api/admin/export?key=${EXPORT_KEY}&type=${type}`
    a.download = filename
    a.click()
  }

  function copyFormula(type: string) {
    const url = `https://beauty-queue.vercel.app/api/admin/export?key=${EXPORT_KEY}&type=${type}`
    navigator.clipboard.writeText(`=IMPORTDATA("${url}")`)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-wrap gap-3 items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการคิว</h1>
          <p className="text-gray-500 text-sm mt-1">ดูและจัดการการจองทั้งหมด</p>
        </div>
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          ⬇ Export / Google Sheets
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">กรองตามวันที่</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">กรองตามสถานะ</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { setFilterDate(''); setFilterStatus('') }}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          รีเซ็ต
        </button>
        <div className="ml-auto text-sm text-gray-400">
          ทั้งหมด {bookings.length} รายการ
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">กำลังโหลด...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p>ไม่พบการจอง</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">รหัสจอง</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">ลูกค้า</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">บริการ</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">วันเวลา</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">สถานะ</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-rose-700">{booking.bookingCode}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{booking.customerName}</p>
                      <p className="text-xs text-gray-400">{booking.customerPhone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p>{booking.service?.name}</p>
                      {booking.service && (
                        <p className="text-xs text-rose-600">{formatPrice(booking.service.price)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p>{formatThaiDate(booking.bookingDate)}</p>
                      <p className="text-xs text-gray-400">{booking.bookingTime} น.</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                        >
                          รายละเอียด
                        </button>
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          disabled={updatingId === booking.id}
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-rose-200 disabled:opacity-50"
                        >
                          <option value="pending">รอยืนยัน</option>
                          <option value="confirmed">ยืนยัน</option>
                          <option value="completed">เสร็จสิ้น</option>
                          <option value="cancelled">ยกเลิก</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <h2 className="font-bold text-gray-800 text-lg">Export ข้อมูล</h2>
              <button onClick={() => setShowExport(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <p className="text-sm font-semibold text-gray-700 mb-3">⬇ ดาวน์โหลด Excel / CSV</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {EXPORTS.map(e => (
                <button
                  key={e.type}
                  onClick={() => downloadCSV(e.type, e.file)}
                  className="p-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 text-sm text-left transition-colors"
                >
                  📥 {e.label}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-semibold text-gray-700 mb-1">🔗 เชื่อม Google Sheets อัตโนมัติ</p>
              <p className="text-xs text-gray-500 mb-3">เปิด Google Sheets → วาง formula ใน cell A1 → ข้อมูลอัปเดตอัตโนมัติทุกครั้งที่เปิด</p>
              <div className="space-y-2">
                {EXPORTS.map(e => {
                  const formula = `=IMPORTDATA("https://beauty-queue.vercel.app/api/admin/export?key=${EXPORT_KEY}&type=${e.type}")`
                  return (
                    <div key={e.type} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1.5">{e.label}</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-green-700 bg-white border border-gray-200 px-2 py-1.5 rounded flex-1 overflow-hidden block whitespace-nowrap overflow-ellipsis">
                          {formula}
                        </code>
                        <button
                          onClick={() => copyFormula(e.type)}
                          className={`text-xs shrink-0 border rounded px-2 py-1.5 transition-colors ${
                            copied === e.type ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {copied === e.type ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              onClick={() => setShowExport(false)}
              className="mt-5 w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50"
            >ปิด</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-bold text-gray-800 text-lg">รายละเอียดการจอง</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">รหัสจอง</span>
                <span className="font-bold text-rose-700">{selectedBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">สถานะ</span>
                <StatusBadge status={selectedBooking.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">บริการ</span>
                <span className="font-medium">{selectedBooking.service?.name}</span>
              </div>
              {selectedBooking.service && (
                <div className="flex justify-between">
                  <span className="text-gray-500">ราคา</span>
                  <span className="font-medium text-rose-700">{formatPrice(selectedBooking.service.price)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">วันที่</span>
                <span className="font-medium">{formatThaiDate(selectedBooking.bookingDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">เวลา</span>
                <span className="font-medium">{selectedBooking.bookingTime} น.</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-gray-500">ชื่อ</span>
                <span className="font-medium">{selectedBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">เบอร์โทร</span>
                <span className="font-medium">{selectedBooking.customerPhone}</span>
              </div>
              {selectedBooking.customerEmail && (
                <div className="flex justify-between">
                  <span className="text-gray-500">อีเมล</span>
                  <span className="font-medium">{selectedBooking.customerEmail}</span>
                </div>
              )}
              {selectedBooking.note && (
                <div className="border-t border-gray-100 pt-3">
                  <span className="text-gray-500 block mb-1">หมายเหตุ</span>
                  <span className="text-gray-800">{selectedBooking.note}</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-2">เปลี่ยนสถานะ:</p>
              <div className="grid grid-cols-2 gap-2">
                {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selectedBooking.id, s)}
                    disabled={selectedBooking.status === s || updatingId === selectedBooking.id}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
                      selectedBooking.status === s
                        ? STATUS_COLORS[s] + ' cursor-default'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="mt-4 w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
