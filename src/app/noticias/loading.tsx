function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col">
      <div className="h-48 rounded-xl bg-slate-200" />
      <div className="mt-4 space-y-2.5">
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-5/6 rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
        <div className="mt-2 flex justify-between">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-3 w-16 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

export default function NoticiasLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-36 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>

      {/* Filter skeleton */}
      <div className="flex gap-2">
        {[80, 60, 96, 72, 84].map((w, i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded-full bg-slate-200"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
