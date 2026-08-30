function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="h-32 bg-slate-200" />
      <div className="p-5 space-y-2.5">
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-3.5 w-1/2 rounded bg-slate-200" />
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">
          <div className="h-3 w-16 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export default function EstatisticasLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
