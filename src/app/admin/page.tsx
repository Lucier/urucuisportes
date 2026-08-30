import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq, desc } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '@/database/client'
import { categories, posts, matches, teams } from '@/database/schema'
import Link from 'next/link'
import { PostFormSection } from '@/components/admin/PostFormSection'
import { MatchEditorSection } from '@/components/admin/MatchEditorSection'

export const metadata = { title: 'Admin | Urucuí Esportes' }

export default async function AdminPage() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role')

  if (!userId || userRole !== 'ADMIN') redirect('/login')

  const homeTeam = alias(teams, 'home_team')
  const awayTeam = alias(teams, 'away_team')

  const [categoryRows, postRows, matchRows] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories),

    db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        imageUrl: posts.imageUrl,
        categoryId: posts.categoryId,
        categoryName: categories.name,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .orderBy(desc(posts.createdAt)),

    db
      .select({
        id: matches.id,
        homeTeamId: matches.homeTeamId,
        awayTeamId: matches.awayTeamId,
        homeTeamName: homeTeam.name,
        awayTeamName: awayTeam.name,
        homeScore: matches.homeScore,
        awayScore: matches.awayScore,
        status: matches.status,
        date: matches.date,
      })
      .from(matches)
      .leftJoin(homeTeam, eq(matches.homeTeamId, homeTeam.id))
      .leftJoin(awayTeam, eq(matches.awayTeamId, awayTeam.id))
      .orderBy(desc(matches.date)),
  ])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-slate-500">Gerencie notícias, partidas e fotos</p>
        </div>
        <Link
          href="/admin/fotos"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Gerenciar fotos
        </Link>
        <Link
          href="/admin/transmissoes"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Gerenciar transmissões
        </Link>
      </div>

      <div className="space-y-12">
        <PostFormSection categories={categoryRows} initialPosts={postRows} adminId={userId} />
        <MatchEditorSection matches={matchRows} />
      </div>
    </div>
  )
}
