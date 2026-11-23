export function MaterialsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Class Banner Skeleton */}
      <div className="flex animate-pulse flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-100/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded-md bg-slate-200" />
            <div className="h-3 w-64 rounded-md bg-slate-200" />
          </div>
        </div>
        <div className="h-10 w-36 rounded-xl bg-slate-200" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex animate-pulse flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-full rounded-xl bg-slate-100 sm:w-72" />
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-xl bg-slate-100" />
          <div className="h-10 w-28 rounded-xl bg-slate-100" />
        </div>
      </div>

      {/* Resource Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex animate-pulse flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 rounded-full bg-slate-100" />
                <div className="h-8 w-8 rounded-lg bg-slate-100" />
              </div>
              <div className="mt-4 h-5 w-3/4 rounded-md bg-slate-200" />
              <div className="mt-2 h-3 w-full rounded-md bg-slate-100" />
              <div className="mt-1.5 h-3 w-2/3 rounded-md bg-slate-100" />
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 rounded-md bg-slate-100" />
                <div className="h-8 w-24 rounded-lg bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

