'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/shared/utils'

const BASE_TABS = [
  { key: 'classificacao', label: 'Classificação' },
  { key: 'artilharia', label: 'Artilharia' },
  { key: 'calendario', label: 'Calendário' },
] as const

const KNOCKOUT_TAB = { key: 'fase-final', label: 'Fase Final' } as const

export type TabKey = (typeof BASE_TABS)[number]['key'] | 'fase-final'

export function LeagueTabs({
  activeTab,
  showKnockout = false,
}: {
  activeTab: TabKey
  showKnockout?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tabs: readonly { key: TabKey; label: string }[] = showKnockout
    ? [...BASE_TABS, KNOCKOUT_TAB]
    : BASE_TABS

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
      {tabs.map((tab) => (
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
