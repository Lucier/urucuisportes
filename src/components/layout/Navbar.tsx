'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { label: 'Início', href: '/' },
  { label: 'Notícias', href: '/noticias' },
  { label: 'Fotos', href: '/fotos' },
  { label: 'Jogos', href: '/jogos' },
  { label: 'Classificação', href: '/classificacao' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="text-2xl" aria-hidden>
              ⚽
            </span>
            <span>
              Urucuí <span className="text-emerald-400">Esportes</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            className="rounded-md p-2 text-gray-400 hover:bg-slate-800 hover:text-white md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="border-t border-slate-800 py-3 md:hidden" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-4 py-2 text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
