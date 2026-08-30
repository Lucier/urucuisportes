export default function NoticiaLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex gap-2">
        {[48, 8, 64, 8, 80].map((w, i) => (
          <div key={i} className="h-4 rounded bg-slate-200" style={{ width: `${w}px` }} />
        ))}
      </div>

      {/* Badge */}
      <div className="h-5 w-20 rounded bg-slate-200" />

      {/* Title */}
      <div className="mt-4 space-y-3">
        <div className="h-9 w-full rounded bg-slate-200" />
        <div className="h-9 w-4/5 rounded bg-slate-200" />
      </div>

      {/* Meta */}
      <div className="mt-5 flex gap-4 border-b border-slate-100 pb-5">
        <div className="h-7 w-7 rounded-full bg-slate-200" />
        <div className="h-5 w-28 rounded bg-slate-200" />
        <div className="h-5 w-36 rounded bg-slate-200" />
      </div>

      {/* Hero image */}
      <div className="mt-8 h-64 rounded-2xl bg-slate-200 lg:h-80" />

      {/* Content paragraphs */}
      <div className="mt-10 space-y-4">
        {[100, 95, 100, 88, 92, 100, 75].map((w, i) => (
          <div key={i} className="h-5 rounded bg-slate-200" style={{ width: `${w}%` }} />
        ))}
        <div className="!mt-8 space-y-3">
          {[100, 90, 100, 80].map((w, i) => (
            <div key={i} className="h-5 rounded bg-slate-200" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
