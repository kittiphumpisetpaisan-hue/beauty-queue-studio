import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  durationMinutes: number,
  bookedTimes: string[]
): string[] {
  const slots: string[] = []
  const [openHour, openMin] = openTime.split(':').map(Number)
  const [closeHour, closeMin] = closeTime.split(':').map(Number)

  const openTotal = openHour * 60 + openMin
  const closeTotal = closeHour * 60 + closeMin

  for (let minutes = openTotal; minutes + durationMinutes <= closeTotal; minutes += 30) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    if (!bookedTimes.includes(timeStr)) {
      slots.push(timeStr)
    }
  }

  return slots
}

export async function generateBookingCode(
  date: string,
  currentCount: number
): Promise<string> {
  const dateStr = date.replace(/-/g, '')
  const seq = (currentCount + 1).toString().padStart(4, '0')
  return `BK-${dateStr}-${seq}`
}

export function formatThaiDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return format(date, 'EEEE dd MMMM yyyy', { locale: th })
  } catch {
    return dateStr
  }
}

export function formatPrice(price: number): string {
  return price.toLocaleString('th-TH') + ' บาท'
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} นาที`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} ชั่วโมง ${m} นาที` : `${h} ชั่วโมง`
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

export const TH_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

export function getClosedDayNames(closedDaysJson: string): string {
  try {
    const days = JSON.parse(closedDaysJson) as number[]
    return days.map((d) => TH_DAYS[d]).join(', ')
  } catch {
    return ''
  }
}
