import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Beauty Queue Studio - ระบบจองคิวร้านเสริมสวย',
  description: 'จองคิวร้านเสริมสวย Beauty Queue Studio ง่ายๆ ผ่านออนไลน์',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Beauty Queue',
  },
}

export const viewport: Viewport = {
  themeColor: '#e11d48',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
}
