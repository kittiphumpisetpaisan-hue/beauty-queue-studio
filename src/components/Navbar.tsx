'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavbarProps {
  shopName: string
}

export default function Navbar({ shopName }: NavbarProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/', label: 'หน้าแรก' },
    { href: '/services', label: 'บริการ' },
    { href: '/booking', label: 'จองคิว' },
    { href: '/check-booking', label: 'ตรวจสอบคิว' },
  ]

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-rose-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💇‍♀️</span>
          <span className="font-bold text-rose-600 text-lg">{shopName}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-rose-600 border-b-2 border-rose-500 pb-0.5'
                  : 'text-gray-600 hover:text-rose-500'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            แอดมิน
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-600 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-rose-100 px-4 py-3 flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium py-1 ${
                pathname === link.href ? 'text-rose-600' : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-xs text-gray-400 py-1">
            แอดมิน
          </Link>
        </div>
      )}
    </nav>
  )
}
