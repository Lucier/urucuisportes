export default function LeagueLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex gap-2">
        {[40, 8, 72, 8, 120].map((w, i) => (
          <div key={i} className="h-4 rounded bg-slate-200" style={{ width: `${w}px` }} />
        ))}
      </div>

      {/* Hero */}
      <div className="mb-6 h-28 rounded-2xl bg-slate-200" />

      {/* Tabs */}
      <div className="flex gap-2 rounded-t-xl border border-b-0 border-slate-100 bg-white px-4 py-3">
        {[88, 72, 72].map((w, i) => (
          <div key={i} className="h-5 rounded bg-slate-200" style={{ width: `${w}px` }} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-b-xl border border-t-0 border-slate-100 bg-white">
        {/* Header */}
        <div className="grid grid-cols-[2.5rem_1fr_repeat(8,2.5rem)] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-3 rounded bg-slate-200" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2.5rem_1fr_repeat(8,2.5rem)] items-center gap-3 border-b border-slate-50 px-4 py-4"
          >
            <div className="h-4 w-4 rounded bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-200" />
            </div>
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="h-4 rounded bg-slate-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
