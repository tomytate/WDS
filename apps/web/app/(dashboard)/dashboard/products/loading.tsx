export default function DashboardProductsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-20 rounded-full bg-[--bg-surface]" />
        <div className="h-8 w-56 rounded-2xl bg-[--bg-surface]" />
        <div className="h-4 w-full max-w-xl rounded-full bg-[--bg-surface]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5">
          <div className="h-12 rounded-full bg-[--bg-surface]" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="h-24 rounded-2xl bg-[--bg-surface]"
                key={index}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[--border] bg-[--bg-card] p-5">
          <div className="h-6 w-32 rounded-full bg-[--bg-surface]" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="h-11 rounded-full bg-[--bg-surface]"
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
