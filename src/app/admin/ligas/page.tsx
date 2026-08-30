import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { count, eq } from 'drizzle-orm'
import { db } from '@/database/client'
import { leagues, teams } from '@/database/schema'
import { LeagueManager } from '@/components/admin/LeagueManager'
import { LeagueTeamsPanel } from '@/components/admin/LeagueTeamsPanel'

export const metadata = { title: 'Ligas — Admin | Urucuí Esportes' }

type Props = { searchParams: Promise<{ liga?: string }> }

export default async function AdminLigasPage({ searchParams }: Props) {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role')
  if (!userId || userRole !== 'ADMIN') redirect('/login')

  const { liga: leagueId } = await searchParams

  // ── Vista de times de uma liga ─────────────────────────────────────────────
  if (leagueId) {
    const [league] = await db
      .select({ id: leagues.id, name: leagues.name, slug: leagues.slug, logoUrl: leagues.logoUrl })
      .from(leagues)
      .where(eq(leagues.id, leagueId))

    if (!league) redirect('/admin/ligas')

    const allTeams = await db
      .select({ id: teams.id, name: teams.name, logoUrl: teams.logoUrl, leagueId: teams.leagueId })
      .from(teams)
      .orderBy(teams.name)

    const inLeague = allTeams.filter((t) => t.leagueId === leagueId)
    const outLeague = allTeams.filter((t) => t.leagueId !== leagueId)

    return (
      <div className="py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/admin/ligas"
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
                className="h-10 w-10 rounded-lg border border-slate-100 object-contain bg-slate-50 p-0.5"
              />
            ) : (
              <span className="text-3xl">🏆</span>
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">{league.name}</h1>
              <p className="mt-0.5 text-sm text-slate-500">Gerencie os times desta liga</p>
            </div>
          </div>
        </div>

        <LeagueTeamsPanel
          leagueId={leagueId}
          inLeague={inLeague}
          outLeague={outLeague}
          noTeams={allTeams.length === 0}
        />
      </div>
    )
  }

  // ── Vista principal: lista + formulário ────────────────────────────────────
  const rows = await db
    .select({
      id: leagues.id,
      name: leagues.name,
      slug: leagues.slug,
      logoUrl: leagues.logoUrl,
      teamCount: count(teams.id),
    })
    .from(leagues)
    .leftJoin(teams, eq(teams.leagueId, leagues.id))
    .groupBy(leagues.id)
    .orderBy(leagues.name)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Ligas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie as competições e seus times participantes
        </p>
      </div>
      <LeagueManager leagues={rows} />
    </div>
  )
}
