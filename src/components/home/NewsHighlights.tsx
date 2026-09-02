import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/database/client'
import { posts, categories, users } from '@/database/schema'
import { formatDate } from '@/shared/utils'

export async function NewsHighlights() {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      content: posts.content,
      createdAt: posts.createdAt,
      categoryName: categories.name,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(4)

  if (rows.length === 0) return null

  const [featured, ...rest] = rows

  return (
    <section>
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Principais Notícias</h2>
        <Link href="/noticias" className="text-sm font-medium text-emerald-600 hover:underline">
          Ver todas →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Post destaque */}
        <Link href={`/noticias/${featured.slug}`} className="group lg:col-span-2">
          <div className="relative min-h-72 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-slate-800 to-slate-900 lg:min-h-[22rem]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {featured.categoryName && (
                <span className="mb-3 inline-block rounded bg-emerald-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  {featured.categoryName}
                </span>
              )}
              <h3 className="text-xl font-bold leading-tight text-white transition-colors group-hover:text-emerald-300 lg:text-2xl">
                {featured.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-gray-300">
                {featured.content.slice(0, 140)}…
              </p>
              <p className="mt-3 text-xs text-gray-400">
                {featured.authorName && `${featured.authorName} · `}
                {formatDate(featured.createdAt)}
              </p>
            </div>
          </div>
        </Link>

        {/* Posts secundários */}
        <div className="flex flex-col gap-4">
          {rest.map((post) => (
            <Link key={post.id} href={`/noticias/${post.slug}`} className="group">
              <div className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-emerald-200">
                <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-emerald-700 to-slate-800" />
                <div className="flex min-w-0 flex-col justify-between gap-1">
                  {post.categoryName && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      {post.categoryName}
                    </span>
                  )}
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700">
                    {post.title}
                  </h3>
                  <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
