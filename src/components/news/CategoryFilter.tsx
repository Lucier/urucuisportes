'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/shared/utils'

interface Category {
  id: string
  name: string
  slug: string
}

interface Props {
  categories: Category[]
  activeSlug: string | null
}

export function CategoryFilter({ categories, activeSlug }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function select(slug: string | null) {
    router.push(slug ? `${pathname}?categoria=${slug}` : pathname, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => select(null)}
        className={cn(
          'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
          activeSlug === null
            ? 'border-emerald-600 bg-emerald-600 text-white'
            : 'border-slate-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700',
        )}
      >
        Todas
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => select(cat.slug)}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            activeSlug === cat.slug
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-slate-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700',
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
