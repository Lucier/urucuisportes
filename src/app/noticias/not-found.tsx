import Link from 'next/link'

export default function NoticiasNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl" aria-hidden>
        📰
      </span>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Notícia não encontrada</h1>
      <p className="mt-2 text-gray-500">
        A notícia que você está procurando não existe ou foi removida.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/noticias"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Ver todas as notícias
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Ir para o início
        </Link>
      </div>
    </div>
  )
}
