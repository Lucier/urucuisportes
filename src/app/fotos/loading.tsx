function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="h-52 bg-slate-200" />
      <div className="space-y-2.5 p-5">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
          <div className="h-3 w-16 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export default function FotosLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}
