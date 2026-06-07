'use client'

import { useState, useEffect } from 'react'
import { TH_DAYS } from '@/lib/helpers'

interface SettingsForm {
  shopName: string
  phone: string
  address: string
  openTime: string
  closeTime: string
  closedDays: number[]
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    shopName: '',
    phone: '',
    address: '',
    openTime: '10:00',
    closeTime: '20:00',
    closedDays: [1],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.setting) {
          setForm({
            shopName: data.setting.shopName,
            phone: data.setting.phone,
            address: data.setting.address ?? '',
            openTime: data.setting.openTime,
            closeTime: data.setting.closeTime,
            closedDays: JSON.parse(data.setting.closedDays) as number[],
          })
        }
        setLoading(false)
      })
  }, [])

  function toggleClosedDay(day: number) {
    setForm((f) => ({
      ...f,
      closedDays: f.closedDays.includes(day)
        ? f.closedDays.filter((d) => d !== day)
        : [...f.closedDays, day],
    }))
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!form.shopName.trim()) newErrors.shopName = 'กรุณากรอกชื่อร้าน'
    if (!form.phone.trim()) newErrors.phone = 'กรุณากรอกเบอร์โทร'
    if (!form.openTime) newErrors.openTime = 'กรุณาเลือกเวลาเปิด'
    if (!form.closeTime) newErrors.closeTime = 'กรุณาเลือกเวลาปิด'
    if (form.openTime >= form.closeTime) newErrors.closeTime = 'เวลาปิดต้องมากกว่าเวลาเปิด'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    setSaved(false)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-400">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าร้าน</h1>
        <p className="text-gray-500 text-sm mt-1">จัดการข้อมูลและเวลาทำการของร้าน</p>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อร้าน <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.shopName}
              onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 ${errors.shopName ? 'border-red-300' : 'border-gray-200'}`}
            />
            {errors.shopName && <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทร <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เวลาเปิด <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={form.openTime}
                onChange={(e) => setForm((f) => ({ ...f, openTime: e.target.value }))}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 ${errors.openTime ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.openTime && <p className="text-red-500 text-xs mt-1">{errors.openTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เวลาปิด <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={form.closeTime}
                onChange={(e) => setForm((f) => ({ ...f, closeTime: e.target.value }))}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 ${errors.closeTime ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.closeTime && <p className="text-red-500 text-xs mt-1">{errors.closeTime}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">วันหยุดประจำสัปดาห์</label>
            <div className="flex flex-wrap gap-2">
              {TH_DAYS.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleClosedDay(index)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.closedDays.includes(index)
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              วันหยุด: {form.closedDays.length === 0 ? 'ไม่มี' : form.closedDays.map((d) => TH_DAYS[d]).join(', ')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium">✓ บันทึกสำเร็จ</span>
          )}
        </div>
      </div>
    </div>
  )
}
