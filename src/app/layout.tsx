import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Beauty Queue Studio - ระบบจองคิวร้านเสริมสวย',
  description: 'จองคิวร้านเสริมสวย Beauty Queue Studio ง่ายๆ ผ่านออนไลน์',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
}
