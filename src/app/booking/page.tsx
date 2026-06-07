export const dynamic = 'force-dynamic'

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatThaiDate, formatPrice, formatDuration } from '@/lib/helpers'
import { Service, ShopSetting } from '@/types'

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const preSelectedServiceId = searchParams.get('serviceId')

  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [shopSetting, setShopSetting] = useState<ShopSetting | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    preSelectedServiceId ? Number(preSelectedServiceId) : null
  )
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    async function load() {
      const [sRes, settingRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/settings'),
      ])
      const sData = await sRes.json()
      const settingData = await settingRes.json()
      setServices(sData.services ?? [])
      setShopSetting(settingData.setting ?? null)
      if (preSelectedServiceId) {
        setStep(2)
      }
    }
    load()
  }, [preSelectedServiceId])

  useEffect(() => {
    if (!selectedServiceId || !selectedDate) return
    setLoadingSlots(true)
    setSelectedTime('')
    setAvailableSlots([])
    fetch(`/api/available-slots?serviceId=${selectedServiceId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => {
        setAvailableSlots(d.slots ?? [])
      })
      .finally(() => setLoadingSlots(false))
  }, [selectedServiceId, selectedDate])

  const selectedService = services.find((s) => s.id === selectedServiceId)

  const today = new Date().toISOString().split('T')[0]

  const closedDays: number[] = shopSetting
    ? JSON.parse(shopSetting.closedDays)
    : [1]

  function isDateDisabled(dateStr: string): boolean {
    if (dateStr < today) return true
    const day = new Date(dateStr + 'T00:00:00').getDay()
    return closedDays.includes(day)
  }

  function validateStep3(): boolean {
    const newErrors: Record<string, string> = {}
    if (!customerName.trim()) newErrors.customerName = 'กรุณากรอกชื่อ-นามสกุล'
    if (!/^0[0-9]{8,9}$/.test(customerPhone.replace(/-/g, ''))) {
      newErrors.customerPhone = 'เบอร์โทรต้องเป็นตัวเลข 9-10 หลัก เริ่มต้นด้วย 0'
    }
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = 'รูปแบบอีเมลไม่ถูกต้อง'
    }
    if (note.length > 500) newErrors.note = 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (step === 1 && selectedServiceId) setStep(2)
    else if (step === 2 && selectedDate && selectedTime) setStep(3)
    else if (step === 3 && validateStep3()) setStep(4)
  }

  async function handleSubmit() {
    if (!validateStep3()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          bookingDate: selectedDate,
          bookingTime: selectedTime,
          customerName: customerName.trim(),
          customerPhone: customerPhone.replace(/-/g, ''),
          customerEmail: customerEmail || undefined,
          note: note || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด')
      router.push(`/booking/success?bookingCode=${data.booking.bookingCode}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = ['เลือกบริการ', 'เลือกวันเวลา', 'กรอกข้อมูล', 'ยืนยัน']

  return (
    <>
      <Navbar shopName={shopSetting?.shopName ?? 'Beauty Queue Studio'} />
      <main className="flex-1 bg-gradient-to-b from-rose-50 to-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold text-rose-800 text-center mb-2">จองคิวบริการ</h1>
          <p className="text-center text-gray-500 text-sm mb-8">กรอกข้อมูลเพื่อจองคิว</p>

          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((label, i) => {
              const num = i + 1
              const active = step === num
              const done = step > num
              return (
                <div key={label} className="flex-1 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-colors ${
                    done ? 'bg-rose-500 text-white' : active ? 'bg-rose-500 text-white ring-4 ring-rose-100' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {done ? '✓' : num}
                  </div>
                  <span className={`text-xs hidden sm:block ${active ? 'text-rose-600 font-medium' : 'text-gray-400'}`}>{label}</span>
                  {i < steps.length - 1 && (
                    <div className={`absolute hidden`} />
                  )}
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
            {/* Step 1: Service */}
            {step === 1 && (
              <div>
                <h2 className="font-semibold text-rose-800 text-lg mb-4">เลือกบริการที่ต้องการ</h2>
                {services.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">กำลังโหลด...</p>
                ) : (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => { setSelectedServiceId(service.id); setSelectedDate(''); setSelectedTime(''); }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedServiceId === service.id
                            ? 'border-rose-400 bg-rose-50'
                            : 'border-gray-100 hover:border-rose-200 hover:bg-rose-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{service.name}</p>
                            {service.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">⏱ {formatDuration(service.durationMinutes)}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-rose-700">{formatPrice(service.price)}</p>
                            {selectedServiceId === service.id && (
                              <span className="text-xs text-rose-500">✓ เลือกแล้ว</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleNext}
                  disabled={!selectedServiceId}
                  className="mt-6 w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  ถัดไป →
                </button>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div>
                <h2 className="font-semibold text-rose-800 text-lg mb-4">เลือกวันที่และเวลา</h2>
                {selectedService && (
                  <div className="bg-rose-50 rounded-xl p-3 mb-5 text-sm">
                    <span className="text-gray-500">บริการที่เลือก: </span>
                    <span className="font-medium text-rose-700">{selectedService.name}</span>
                    <span className="text-gray-400"> · {formatDuration(selectedService.durationMinutes)}</span>
                  </div>
                )}

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    onChange={(e) => {
                      const val = e.target.value
                      if (!isDateDisabled(val)) {
                        setSelectedDate(val)
                        setSelectedTime('')
                      } else {
                        setSelectedDate('')
                        alert('ร้านปิดในวันที่เลือก กรุณาเลือกวันอื่น')
                      }
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
                  />
                  {shopSetting && (
                    <p className="text-xs text-gray-400 mt-1">
                      หยุดประจำ: {JSON.parse(shopSetting.closedDays).map((d: number) => ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'][d]).join(', ')}
                    </p>
                  )}
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เวลา {shopSetting && `(เปิด ${shopSetting.openTime} - ${shopSetting.closeTime} น.)`}
                    </label>
                    {loadingSlots ? (
                      <p className="text-center text-gray-400 py-4 text-sm">กำลังโหลดช่วงเวลา...</p>
                    ) : availableSlots.length === 0 ? (
                      <div className="bg-yellow-50 rounded-xl p-4 text-center text-sm text-yellow-700">
                        ไม่มีช่วงเวลาว่างในวันที่เลือก กรุณาเลือกวันอื่น
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                              selectedTime === slot
                                ? 'bg-rose-500 text-white'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    ← ย้อนกลับ
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-200 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    ถัดไป →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Customer Info */}
            {step === 3 && (
              <div>
                <h2 className="font-semibold text-rose-800 text-lg mb-4">กรอกข้อมูลของคุณ</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => { setCustomerName(e.target.value); setErrors((p) => ({ ...p, customerName: '' })) }}
                      placeholder="กรอกชื่อ-นามสกุล"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 ${errors.customerName ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => { setCustomerPhone(e.target.value); setErrors((p) => ({ ...p, customerPhone: '' })) }}
                      placeholder="เช่น 0812345678"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 ${errors.customerPhone ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อีเมล <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => { setCustomerEmail(e.target.value); setErrors((p) => ({ ...p, customerEmail: '' })) }}
                      placeholder="example@email.com"
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 ${errors.customerEmail ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      หมายเหตุ <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => { setNote(e.target.value); setErrors((p) => ({ ...p, note: '' })) }}
                      placeholder="แจ้งรายละเอียดเพิ่มเติม เช่น ทรงผมที่ต้องการ"
                      rows={3}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none ${errors.note ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    <div className="flex justify-between">
                      {errors.note ? <p className="text-red-500 text-xs mt-1">{errors.note}</p> : <span />}
                      <p className="text-xs text-gray-400 mt-1">{note.length}/500</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    ← ย้อนกลับ
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    ตรวจสอบข้อมูล →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div>
                <h2 className="font-semibold text-rose-800 text-lg mb-4">ตรวจสอบและยืนยันการจอง</h2>

                <div className="bg-rose-50 rounded-xl p-5 space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">บริการ</span>
                    <span className="font-medium text-gray-800">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ราคา</span>
                    <span className="font-bold text-rose-700">{selectedService && formatPrice(selectedService.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ระยะเวลา</span>
                    <span className="font-medium text-gray-800">{selectedService && formatDuration(selectedService.durationMinutes)}</span>
                  </div>
                  <div className="border-t border-rose-200 pt-3 flex justify-between text-sm">
                    <span className="text-gray-500">วันที่</span>
                    <span className="font-medium text-gray-800">{formatThaiDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">เวลา</span>
                    <span className="font-medium text-gray-800">{selectedTime} น.</span>
                  </div>
                  <div className="border-t border-rose-200 pt-3 flex justify-between text-sm">
                    <span className="text-gray-500">ชื่อ</span>
                    <span className="font-medium text-gray-800">{customerName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">เบอร์โทร</span>
                    <span className="font-medium text-gray-800">{customerPhone}</span>
                  </div>
                  {customerEmail && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">อีเมล</span>
                      <span className="font-medium text-gray-800">{customerEmail}</span>
                    </div>
                  )}
                  {note && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">หมายเหตุ</span>
                      <span className="font-medium text-gray-800 text-right max-w-[200px]">{note}</span>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 mb-5">
                  📋 กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน
                </div>

                {submitError && (
                  <div className="bg-red-50 rounded-xl p-3 text-sm text-red-600 mb-4">
                    {submitError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    ← ย้อนกลับ
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    {submitting ? 'กำลังจอง...' : '✓ ยืนยันการจอง'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer setting={shopSetting} />
    </>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <p className="text-rose-400">กำลังโหลด...</p>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
