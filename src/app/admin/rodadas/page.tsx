import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { eq, asc } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '@/database/client'
import { leagues, rounds, matches, teams } from '@/database/schema'
import { RoundManager } from '@/components/admin/RoundManager'

export const metadata = { title: 'Rodadas — Admin | Urucuí Esportes' }

type Props = { searchParams: Promise<{ liga?: string }> }

const homeTeamAlias = alias(teams, 'home_team')
const awayTeamAlias = alias(teams, 'away_team')

export default async function AdminRodadasPage({ searchParams }: Props) {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role')
  if (!userId || userRole !== 'ADMIN') redirect('/login')

  const { liga: leagueId } = await searchParams

  // Sempre busca todas as ligas para o seletor
  const allLeagues = await db
    .select({ id: leagues.id, name: leagues.name, logoUrl: leagues.logoUrl, tipo: leagues.tipo })
    .from(leagues)
    .orderBy(asc(leagues.name))

  // ── Sem liga selecionada: mostra seletor ─────────────────────────────────
  if (!leagueId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Rodadas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Selecione uma liga para gerenciar suas rodadas e confrontos
          </p>
        </div>

        {allLeagues.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-400">Nenhuma liga cadastrada ainda.</p>
            <Link
              href="/admin/ligas"
              className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Criar liga
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {allLeagues.map((league) => (
              <Link
                key={league.id}
                href={`/admin/rodadas?liga=${league.id}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                {league.logoUrl ? (
                  <img
                    src={league.logoUrl}
                    alt={league.name}
                    className="h-12 w-12 flex-shrink-0 rounded-xl border border-slate-100 object-contain bg-slate-50 p-0.5"
                  />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                    🏆
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{league.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {league.tipo === 'grupos' ? 'Por grupos' : 'Pontos corridos'}
                  </p>
                </div>
                <svg
                  className="ml-auto h-4 w-4 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Com liga selecionada ─────────────────────────────────────────────────
  const [league] = await db
    .select({
      id: leagues.id,
      name: leagues.name,
      logoUrl: leagues.logoUrl,
      tipo: leagues.tipo,
      numeroGrupos: leagues.numeroGrupos,
    })
    .from(leagues)
    .where(eq(leagues.id, leagueId))

  if (!league) redirect('/admin/rodadas')

  // Rodadas da liga
  const roundRows = await db
    .select({
      id: rounds.id,
      numero: rounds.numero,
      nome: rounds.nome,
      grupo: rounds.grupo,
    })
    .from(rounds)
    .where(eq(rounds.leagueId, leagueId))
    .orderBy(asc(rounds.grupo), asc(rounds.numero))

  // Confrontos com nomes dos times (alias para home e away)
  const matchRows = await db
    .select({
      id: matches.id,
      roundId: matches.roundId,
      homeTeamId: matches.homeTeamId,
      homeTeamName: homeTeamAlias.name,
      homeTeamLogo: homeTeamAlias.logoUrl,
      awayTeamId: matches.awayTeamId,
      awayTeamName: awayTeamAlias.name,
      awayTeamLogo: awayTeamAlias.logoUrl,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      status: matches.status,
      date: matches.date,
    })
    .from(matches)
    .leftJoin(homeTeamAlias, eq(matches.homeTeamId, homeTeamAlias.id))
    .leftJoin(awayTeamAlias, eq(matches.awayTeamId, awayTeamAlias.id))
    .where(eq(matches.leagueId, leagueId))
    .orderBy(asc(matches.date))

  // Times da liga (com info de grupo)
  const teamRows = await db
    .select({ id: teams.id, name: teams.name, logoUrl: teams.logoUrl, grupo: teams.grupo })
    .from(teams)
    .where(eq(teams.leagueId, leagueId))
    .orderBy(asc(teams.grupo), asc(teams.name))

  // Monta rodadas com confrontos aninhados
  const roundsWithMatches = roundRows.map((r) => ({
    ...r,
    matches: matchRows.filter((m) => m.roundId === r.id),
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb + header */}
      <div className="mb-8">
        <Link
          href="/admin/rodadas"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-slate-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Todas as ligas
        </Link>

        <div className="flex items-center gap-3">
          {league.logoUrl ? (
            <img
              src={league.logoUrl}
              alt={league.name}
              className="h-10 w-10 rounded-xl border border-slate-100 object-contain bg-slate-50 p-0.5"
            />
          ) : (
            <span className="text-3xl">🏆</span>
          )}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{league.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {league.tipo === 'grupos'
                ? `Por grupos · ${league.numeroGrupos} grupo${(league.numeroGrupos ?? 0) > 1 ? 's' : ''}`
                : 'Pontos corridos'}
            </p>
          </div>
        </div>
      </div>

      <RoundManager
        league={league}
        rounds={roundsWithMatches}
        teams={teamRows}
      />
    </div>
  )
}
