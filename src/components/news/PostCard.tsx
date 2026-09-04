import Link from 'next/link'
import { SafeImage } from '@/components/ui/SafeImage'
import { formatDate } from '@/shared/utils'

export interface PostCardData {
  id: string
  title: string
  slug: string
  content: string
  imageUrl: string | null
  createdAt: Date
  categoryName: string | null
  categorySlug: string | null
  authorName: string | null
}

export function PostCard({ post }: { post: PostCardData }) {
  return (
    <Link href={`/noticias/${post.slug}`} className="group flex flex-col">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-800 to-slate-900">
        {post.imageUrl && (
          <SafeImage
            src={post.imageUrl}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {post.categoryName && (
          <span className="absolute left-3 top-3 rounded bg-emerald-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow">
            {post.categoryName}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mt-4 flex flex-1 flex-col gap-2">
        <h2 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700">
          {post.title}
        </h2>
        <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
          {post.content.slice(0, 120)}…
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-gray-400">
          {post.authorName && <span className="font-medium">{post.authorName}</span>}
          <time dateTime={post.createdAt.toISOString()}>{formatDate(post.createdAt)}</time>
        </div>
      </div>
    </Link>
  )
}
