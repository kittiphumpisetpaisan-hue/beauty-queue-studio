'use client'

import { useState, useEffect } from 'react'
import { Service } from '@/types'
import { formatPrice, formatDuration } from '@/lib/helpers'

interface ServiceForm {
  name: string
  description: string
  durationMinutes: string
  price: string
}

const emptyForm: ServiceForm = { name: '', description: '', durationMinutes: '', price: '' }

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  async function fetchServices() {
    const res = await fetch('/api/services?all=true')
    const data = await res.json()
    setServices(data.services ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [])

  function openAdd() {
    setEditingService(null)
    setForm(emptyForm)
    setErrors({})
    setShowModal(true)
  }

  function openEdit(service: Service) {
    setEditingService(service)
    setForm({
      name: service.name,
      description: service.description ?? '',
      durationMinutes: String(service.durationMinutes),
      price: String(service.price),
    })
    setErrors({})
    setShowModal(true)
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'กรุณากรอกชื่อบริการ'
    const dur = Number(form.durationMinutes)
    if (!form.durationMinutes || isNaN(dur) || dur <= 0) newErrors.durationMinutes = 'กรุณากรอกระยะเวลาที่ถูกต้อง'
    const price = Number(form.price)
    if (!form.price || isNaN(price) || price < 0) newErrors.price = 'กรุณากรอกราคาที่ถูกต้อง'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    const body = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      durationMinutes: Number(form.durationMinutes),
      price: Number(form.price),
    }
    if (editingService) {
      await fetch(`/api/services/${editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    await fetchServices()
    setSaving(false)
    setShowModal(false)
  }

  async function handleToggleActive(service: Service) {
    await fetch(`/api/services/${service.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !service.isActive }),
    })
    fetchServices()
  }

  async function handleDelete(service: Service) {
    if (!confirm(`ต้องการลบบริการ "${service.name}" ใช่หรือไม่?`)) return
    await fetch(`/api/services/${service.id}`, { method: 'DELETE' })
    fetchServices()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการบริการ</h1>
          <p className="text-gray-500 text-sm mt-1">เพิ่ม แก้ไข หรือปิดบริการ</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          + เพิ่มบริการ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">กำลังโหลด...</div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-5xl mb-3">✂️</div>
            <p>ยังไม่มีบริการ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">ชื่อบริการ</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">ระยะเวลา</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">ราคา</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">สถานะ</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map((service) => (
                  <tr key={service.id} className={`hover:bg-gray-50 ${!service.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-gray-400 line-clamp-1">{service.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{formatDuration(service.durationMinutes)}</td>
                    <td className="px-5 py-4 font-medium text-rose-700">{formatPrice(service.price)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {service.isActive ? 'เปิด' : 'ปิด'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(service)}
                          className="text-xs text-blue-600 hover:text-blue-800 px-2.5 py-1 rounded border border-blue-200 hover:bg-blue-50"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleToggleActive(service)}
                          className="text-xs text-gray-600 hover:text-gray-800 px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50"
                        >
                          {service.isActive ? 'ปิดบริการ' : 'เปิดบริการ'}
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="text-xs text-red-500 hover:text-red-700 px-2.5 py-1 rounded border border-red-200 hover:bg-red-50"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-start mb-5">
              <h2 className="font-bold text-gray-800 text-lg">
                {editingService ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อบริการ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ระยะเวลา (นาที) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.durationMinutes}
                    onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 ${errors.durationMinutes ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.durationMinutes && <p className="text-red-500 text-xs mt-1">{errors.durationMinutes}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ราคา (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 ${errors.price ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
