import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '@/database/client'
import { matches, teams, leagues } from '@/database/schema'
import { cn } from '@/shared/utils'

type MatchRow = {
  id: string
  homeTeamName: string | null
  awayTeamName: string | null
  homeScore: number | null
  awayScore: number | null
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED'
  date: Date
  leagueName: string | null
}

function StatusBadge({ status, date }: { status: MatchRow['status']; date: Date }) {
  if (status === 'LIVE') {
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-red-600">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
        </span>
        AO VIVO
      </span>
    )
  }
  if (status === 'FINISHED') {
    return <span className="text-xs text-gray-400">Encerrado</span>
  }
  if (status === 'POSTPONED') {
    return <span className="text-xs text-amber-500 font-medium">Adiado</span>
  }
  return (
    <span className="text-xs text-gray-400">
      {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(
        new Date(date),
      )}
    </span>
  )
}

function MatchCard({ match }: { match: MatchRow }) {
  const isLive = match.status === 'LIVE'
  const showScore = match.status === 'FINISHED' || isLive

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border bg-white px-5 py-4 shadow-sm',
        isLive && 'border-red-200 bg-red-50/40',
      )}
    >
      {/* Time da casa */}
      <div className="flex w-5/12 items-center justify-end gap-3">
        <span className="truncate text-right text-sm font-semibold text-slate-800">
          {match.homeTeamName}
        </span>
        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-600 to-slate-900" />
      </div>

      {/* Placar / Horário */}
      <div className="flex w-2/12 flex-col items-center gap-1">
        {showScore ? (
          <span className="text-xl font-bold tabular-nums text-slate-900">
            {match.homeScore ?? 0}
            <span className="mx-1 text-slate-300">×</span>
            {match.awayScore ?? 0}
          </span>
        ) : (
          <span className="text-sm font-semibold text-slate-600">
            {new Intl.DateTimeFormat('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(match.date))}
          </span>
        )}
        <StatusBadge status={match.status} date={match.date} />
      </div>

      {/* Time visitante */}
      <div className="flex w-5/12 items-center gap-3">
        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-600 to-slate-900" />
        <span className="truncate text-sm font-semibold text-slate-800">{match.awayTeamName}</span>
      </div>
    </div>
  )
}

export async function MatchesSection() {
  const homeTeamAlias = alias(teams, 'home_team')
  const awayTeamAlias = alias(teams, 'away_team')

  const rows = await db
    .select({
      id: matches.id,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      status: matches.status,
      date: matches.date,
      leagueName: leagues.name,
      homeTeamName: homeTeamAlias.name,
      awayTeamName: awayTeamAlias.name,
    })
    .from(matches)
    .leftJoin(homeTeamAlias, eq(matches.homeTeamId, homeTeamAlias.id))
    .leftJoin(awayTeamAlias, eq(matches.awayTeamId, awayTeamAlias.id))
    .leftJoin(leagues, eq(matches.leagueId, leagues.id))
    .orderBy(matches.date)

  if (rows.length === 0) return null

  const live = rows.filter((m) => m.status === 'LIVE')
  const finished = rows.filter((m) => m.status === 'FINISHED')
  const scheduled = rows.filter((m) => m.status === 'SCHEDULED')

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Jogos</h2>
        <Link href="/jogos" className="text-sm font-medium text-emerald-600 hover:underline">
          Ver todos →
        </Link>
      </div>

      <div className="space-y-8">
        {live.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-red-600">
                Ao Vivo
              </span>
            </div>
            <div className="space-y-3">
              {live.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}

        {finished.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
              Encerrados
            </h3>
            <div className="space-y-3">
              {finished.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}

        {scheduled.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
              Próximos Jogos
            </h3>
            <div className="space-y-3">
              {scheduled.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
