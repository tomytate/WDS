export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded-full bg-[--bg-surface]" />
        <div className="h-12 w-64 animate-pulse rounded-full bg-[--bg-surface]" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-[--bg-surface]" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="rounded-2xl border border-[--border] bg-[--bg-surface] p-5"
            key={index}
          >
            <div className="h-4 w-24 animate-pulse rounded-full bg-[--bg-card]" />
            <div className="mt-4 h-10 w-28 animate-pulse rounded-full bg-[--bg-card]" />
            <div className="mt-3 h-4 w-32 animate-pulse rounded-full bg-[--bg-card]" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            className="rounded-[32px] border border-[--border] bg-[--bg-surface] p-6"
            key={index}
          >
            <div className="h-6 w-36 animate-pulse rounded-full bg-[--bg-card]" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <div
                  className="h-14 animate-pulse rounded-2xl bg-[--bg-card]"
                  key={rowIndex}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
