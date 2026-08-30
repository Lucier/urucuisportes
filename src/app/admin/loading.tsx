export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10">
      <div className="mb-8 space-y-2">
        <div className="h-9 w-72 rounded bg-slate-200" />
        <div className="h-4 w-64 rounded bg-slate-200" />
      </div>

      {/* Post form skeleton */}
      <div className="mb-12 space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 rounded bg-slate-200" />
          <div className="h-10 rounded bg-slate-200" />
        </div>
        <div className="h-10 rounded bg-slate-200" />
        <div className="h-32 rounded bg-slate-200" />
        <div className="h-10 w-32 rounded bg-slate-200" />
      </div>

      {/* Match editor skeleton */}
      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="h-6 w-48 rounded bg-slate-200" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-slate-100 p-4">
            <div className="h-4 flex-1 rounded bg-slate-200" />
            <div className="h-9 w-16 rounded bg-slate-200" />
            <div className="h-4 w-6 rounded bg-slate-200" />
            <div className="h-9 w-16 rounded bg-slate-200" />
            <div className="h-4 flex-1 rounded bg-slate-200" />
            <div className="h-9 w-28 rounded bg-slate-200" />
            <div className="h-9 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
