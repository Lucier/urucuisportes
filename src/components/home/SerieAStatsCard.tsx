import { and, eq } from 'drizzle-orm'
import { db } from '@/database/client'
import { matches, teams, leagues } from '@/database/schema'
import { alias } from 'drizzle-orm/pg-core'

type StandingRow = {
  id: string
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

function computeStandings(
  teamList: { id: string; name: string }[],
  finishedMatches: {
    homeTeamId: string
    awayTeamId: string
    homeScore: number | null
    awayScore: number | null
  }[],
): StandingRow[] {
  const map = new Map<string, StandingRow>()

  for (const t of teamList) {
    map.set(t.id, {
      id: t.id,
      name: t.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    })
  }

  for (const m of finishedMatches) {
    const hg = m.homeScore ?? 0
    const ag = m.awayScore ?? 0
    const home = map.get(m.homeTeamId)
    const away = map.get(m.awayTeamId)

    if (home) {
      home.played++
      home.goalsFor += hg
      home.goalsAgainst += ag
      if (hg > ag) { home.won++; home.points += 3 }
      else if (hg === ag) { home.drawn++; home.points += 1 }
      else home.lost++
    }
    if (away) {
      away.played++
      away.goalsFor += ag
      away.goalsAgainst += hg
      if (ag > hg) { away.won++; away.points += 3 }
      else if (ag === hg) { away.drawn++; away.points += 1 }
      else away.lost++
    }
  }

  return [...map.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.won !== a.won) return b.won - a.won
    return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)
  })
}

export async function SerieAStatsCard() {
  const homeTeam = alias(teams, 'home_team')
  const awayTeam = alias(teams, 'away_team')

  const [leagueRows, matchRows, teamRows] = await Promise.all([
    db.select({ id: leagues.id }).from(leagues).where(eq(leagues.slug, 'seria-a')).limit(1),

    db
      .select({
        homeTeamId: matches.homeTeamId,
        awayTeamId: matches.awayTeamId,
        homeScore: matches.homeScore,
        awayScore: matches.awayScore,
      })
      .from(matches)
      .innerJoin(leagues, eq(matches.leagueId, leagues.id))
      .where(and(eq(leagues.slug, 'seria-a'), eq(matches.status, 'FINISHED'))),

    db
      .select({ id: teams.id, name: teams.name })
      .from(teams)
      .innerJoin(leagues, eq(teams.leagueId, leagues.id))
      .where(eq(leagues.slug, 'seria-a')),
  ])

  if (leagueRows.length === 0 || teamRows.length === 0) return null

  const standings = computeStandings(teamRows, matchRows)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 px-4 py-3">
        <p className="text-sm font-bold text-white">Série A — Classificação</p>
      </div>

      {/* Colunas */}
      <div className="grid grid-cols-[1.25rem_1fr_2rem_1.75rem] gap-x-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span>#</span>
        <span>Time</span>
        <span className="text-center font-bold text-slate-600">Pts</span>
        <span className="text-center">J</span>
      </div>

      <div className="divide-y divide-slate-50">
        {standings.map((row, i) => (
          <div
            key={row.id}
            className="grid grid-cols-[1.25rem_1fr_2rem_1.75rem] items-center gap-x-2 px-3 py-2.5"
          >
            <span className={`text-xs font-bold ${i === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {i + 1}
            </span>
            <span className="truncate text-sm font-semibold text-slate-800">{row.name}</span>
            <span className="text-center text-sm font-bold text-slate-900">{row.points}</span>
            <span className="text-center text-xs text-slate-500">{row.played}</span>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="border-t border-slate-100 px-3 py-2 text-xs text-slate-400">
        J = jogos · Pts = pontos
      </div>
    </div>
  )
}
