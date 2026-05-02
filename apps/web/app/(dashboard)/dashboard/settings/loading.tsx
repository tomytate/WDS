export default function DashboardSettingsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-20 rounded-full bg-[--bg-surface]" />
        <div className="h-8 w-56 rounded-[--radius-card] bg-[--bg-surface]" />
        <div className="h-4 w-full max-w-xl rounded-full bg-[--bg-surface]" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5"
            key={index}
          >
            <div className="space-y-3">
              {Array.from({ length: index === 0 ? 5 : 4 }).map((__, rowIndex) => (
                <div
                  className="h-12 rounded-full bg-[--bg-surface]"
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
