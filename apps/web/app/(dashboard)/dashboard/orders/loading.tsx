import { SectionHeading } from "@wongdigital/ui"

export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <SectionHeading
        description="Loading your orders..."
        title="Orders"
      />

      {/* Top Bar Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="h-10 w-full rounded-[--radius-card] bg-[--bg-surface] sm:w-[320px] animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-24 rounded-[--radius-card] bg-[--bg-surface] animate-pulse" />
          <div className="h-10 w-32 rounded-[--radius-card] bg-[--bg-surface] animate-pulse" />
        </div>
      </div>

      {/* Table Skeletons */}
      <div className="overflow-hidden rounded-[--radius-card] sm:rounded-[--radius-card] border border-[--border] bg-[--bg-card]">
        <div className="grid grid-cols-[1fr] sm:grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-[--border] bg-[--bg-surface] p-4 sm:p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-20 rounded bg-[--bg-card] animate-pulse" />
          ))}
        </div>
        
        <div className="divide-y divide-[--border]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 p-4 sm:grid sm:grid-cols-[1.5fr_1fr_1fr_1fr] sm:items-center sm:p-5">
              <div className="h-12 w-48 rounded bg-[--bg-surface] animate-pulse" />
              <div className="h-6 w-24 rounded bg-[--bg-surface] animate-pulse" />
              <div className="h-6 w-20 rounded bg-[--bg-surface] animate-pulse" />
              <div className="h-8 w-24 rounded-full bg-[--bg-surface] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
