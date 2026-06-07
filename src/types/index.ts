export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Service {
  id: number
  name: string
  description: string | null
  durationMinutes: number
  price: number
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Booking {
  id: number
  bookingCode: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  serviceId: number
  service?: Service
  bookingDate: string
  bookingTime: string
  status: BookingStatus
  note: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ShopSetting {
  id: number
  shopName: string
  phone: string
  address: string | null
  openTime: string
  closeTime: string
  closedDays: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface DashboardStats {
  totalToday: number
  pendingToday: number
  completedToday: number
  revenueToday: number
}
