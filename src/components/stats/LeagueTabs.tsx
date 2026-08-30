'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/shared/utils'

const TABS = [
  { key: 'classificacao', label: 'Classificação' },
  { key: 'artilharia', label: 'Artilharia' },
  { key: 'calendario', label: 'Calendário' },
] as const

export type TabKey = (typeof TABS)[number]['key']

export function LeagueTabs({ activeTab }: { activeTab: TabKey }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function navigate(tab: TabKey) {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'classificacao') {
      params.delete('aba')
    } else {
      params.set('aba', tab)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className="flex overflow-x-auto border-b border-slate-200 bg-white scrollbar-none">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => navigate(tab.key)}
          className={cn(
            '-mb-px flex-shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors sm:px-6 sm:py-3.5',
            activeTab === tab.key
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-slate-800',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
