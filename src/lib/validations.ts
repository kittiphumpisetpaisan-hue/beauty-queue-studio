import { z } from 'zod'

export const bookingSchema = z.object({
  serviceId: z.number({ required_error: 'กรุณาเลือกบริการ' }).min(1, 'กรุณาเลือกบริการ'),
  bookingDate: z.string().min(1, 'กรุณาเลือกวันที่'),
  bookingTime: z.string().min(1, 'กรุณาเลือกเวลา'),
  customerName: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
  customerPhone: z
    .string()
    .regex(/^0[0-9]{8,9}$/, 'เบอร์โทรต้องเป็นตัวเลข 9-10 หลัก เริ่มต้นด้วย 0'),
  customerEmail: z
    .string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  note: z.string().max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร').optional(),
})

export const serviceSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อบริการ'),
  description: z.string().optional(),
  durationMinutes: z
    .number({ invalid_type_error: 'กรุณากรอกระยะเวลา' })
    .min(1, 'ระยะเวลาต้องมากกว่า 0 นาที'),
  price: z
    .number({ invalid_type_error: 'กรุณากรอกราคา' })
    .min(0, 'ราคาต้องมากกว่าหรือเท่ากับ 0'),
})

export const settingsSchema = z.object({
  shopName: z.string().min(1, 'กรุณากรอกชื่อร้าน'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทร'),
  address: z.string().optional(),
  openTime: z.string().min(1, 'กรุณาเลือกเวลาเปิด'),
  closeTime: z.string().min(1, 'กรุณาเลือกเวลาปิด'),
  closedDays: z.array(z.number()),
})

export type BookingInput = z.infer<typeof bookingSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
