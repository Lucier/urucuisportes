import { cn } from '@/shared/utils'

export interface StandingRow {
  id: string
  teamName: string | null
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

interface Zone {
  label: string
  color: string
  border: string
  text: string
  from: number
  to: number
}

const ZONE_MAP: Record<string, Zone[]> = {
  'brasileirao-serie-a': [
    { label: 'Libertadores', color: 'bg-emerald-500', border: 'border-l-emerald-500', text: 'text-emerald-700', from: 1, to: 4 },
    { label: 'Sul-Americana', color: 'bg-sky-400', border: 'border-l-sky-400', text: 'text-sky-600', from: 5, to: 6 },
    { label: 'Rebaixamento', color: 'bg-red-500', border: 'border-l-red-500', text: 'text-red-600', from: 17, to: 20 },
  ],
  'brasileirao-serie-b': [
    { label: 'Acesso Série A', color: 'bg-emerald-500', border: 'border-l-emerald-500', text: 'text-emerald-700', from: 1, to: 4 },
    { label: 'Rebaixamento', color: 'bg-red-500', border: 'border-l-red-500', text: 'text-red-600', from: 17, to: 20 },
  ],
}

function getZone(slug: string, pos: number): Zone | null {
  const zones = ZONE_MAP[slug] ?? []
  return zones.find((z) => pos >= z.from && pos <= z.to) ?? null
}

export function StandingsTable({
  standings,
  leagueSlug,
}: {
  standings: StandingRow[]
  leagueSlug: string
}) {
  const usedZones = new Set<string>()

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full text-sm sm:min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="w-8 px-2 py-3 text-left sm:w-10 sm:px-4">#</th>
              <th className="px-2 py-3 text-left sm:px-4">Time</th>
              <th className="px-2 py-3 text-center sm:px-4" title="Jogos">J</th>
              <th className="hidden px-2 py-3 text-center sm:table-cell sm:px-4" title="Vitórias">V</th>
              <th className="hidden px-2 py-3 text-center sm:table-cell sm:px-4" title="Empates">E</th>
              <th className="hidden px-2 py-3 text-center sm:table-cell sm:px-4" title="Derrotas">D</th>
              <th className="hidden px-2 py-3 text-center md:table-cell sm:px-4" title="Gols Pró">GP</th>
              <th className="hidden px-2 py-3 text-center md:table-cell sm:px-4" title="Gols Contra">GC</th>
              <th className="px-2 py-3 text-center sm:px-4" title="Saldo de Gols">SG</th>
              <th className="px-2 py-3 text-right font-bold text-slate-700 sm:px-4" title="Pontos">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {standings.map((row, i) => {
              const pos = i + 1
              const zone = getZone(leagueSlug, pos)
              const gd = row.goalsFor - row.goalsAgainst

              return (
                <tr
                  key={row.id}
                  className={cn(
                    'border-l-4 border-l-transparent transition-colors hover:bg-slate-50',
                    zone && zone.border,
                  )}
                >
                  <td className="px-2 py-3 sm:px-4 sm:py-3.5">
                    <span className={cn('text-sm font-bold', zone ? zone.text : 'text-gray-400')}>
                      {pos}
                    </span>
                  </td>
                  <td className="px-2 py-3 sm:px-4 sm:py-3.5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-500 to-slate-800 sm:h-8 sm:w-8" />
                      <span className="font-semibold text-slate-800">{row.teamName}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center text-slate-600 sm:px-4 sm:py-3.5">{row.played}</td>
                  <td className="hidden px-2 py-3 text-center font-medium text-emerald-700 sm:table-cell sm:px-4 sm:py-3.5">{row.won}</td>
                  <td className="hidden px-2 py-3 text-center text-slate-600 sm:table-cell sm:px-4 sm:py-3.5">{row.drawn}</td>
                  <td className="hidden px-2 py-3 text-center text-slate-600 sm:table-cell sm:px-4 sm:py-3.5">{row.lost}</td>
                  <td className="hidden px-2 py-3 text-center text-slate-600 md:table-cell sm:px-4 sm:py-3.5">{row.goalsFor}</td>
                  <td className="hidden px-2 py-3 text-center text-slate-600 md:table-cell sm:px-4 sm:py-3.5">{row.goalsAgainst}</td>
                  <td className="px-2 py-3 text-center font-medium text-slate-700 sm:px-4 sm:py-3.5">
                    {gd > 0 ? `+${gd}` : gd}
                  </td>
                  <td className="px-2 py-3 text-right text-base font-bold text-slate-900 sm:px-4 sm:py-3.5">
                    {row.points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legenda das zonas */}
      {(() => {
        const zones = ZONE_MAP[leagueSlug] ?? []
        const activeZones = zones.filter((z) =>
          standings.some((_, i) => {
            const pos = i + 1
            return pos >= z.from && pos <= z.to
          }),
        )
        if (activeZones.length === 0) return null
        return (
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 px-4 py-3 text-xs text-gray-400">
            {activeZones.map((z) => (
              <span key={z.label} className="flex items-center gap-1.5">
                <span className={cn('h-3 w-3 rounded-sm', z.color)} />
                {z.label}
              </span>
            ))}
          </div>
        )
      })()}
    </div>
  )
}
