'use client'

import { useRouter } from 'next/navigation'

export function LeagueSelect({
  leagues,
  selectedId,
}: {
  leagues: { id: string; name: string }[]
  selectedId?: string
}) {
  const router = useRouter()

  return (
    <select
      value={selectedId ?? ''}
      onChange={(e) => {
        const val = e.target.value
        router.push(val ? `/admin/dashboard?leagueId=${val}` : '/admin/dashboard')
      }}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
    >
      <option value="">Selecionar liga…</option>
      {leagues.map((l) => (
        <option key={l.id} value={l.id}>
          {l.name}
        </option>
      ))}
    </select>
  )
}
