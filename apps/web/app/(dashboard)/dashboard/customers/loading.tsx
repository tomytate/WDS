export default function DashboardCustomersLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-20 rounded-full bg-[--bg-surface]" />
        <div className="h-8 w-56 rounded-[--radius-card] bg-[--bg-surface]" />
        <div className="h-4 w-full max-w-xl rounded-full bg-[--bg-surface]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="h-28 rounded-[--radius-card] border border-[--border] bg-[--bg-card]"
            key={index}
          />
        ))}
      </div>

      <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="h-12 rounded-full bg-[--bg-surface]" />
          <div className="h-12 rounded-full bg-[--bg-surface]" />
        </div>

        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className="h-28 rounded-[--radius-card] bg-[--bg-surface]"
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
