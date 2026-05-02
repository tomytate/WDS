import { SectionHeading } from "@wongdigital/ui"

export default function SupportLoading() {
  return (
    <div className="space-y-6">
      <SectionHeading
        description="Loading customer inquiries..."
        title="Support Center"
      />

      {/* Top Bar Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="h-10 w-full rounded-[--radius-card] bg-[--bg-surface] sm:w-[320px] animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-24 rounded-[--radius-card] bg-[--bg-surface] animate-pulse" />
        </div>
      </div>

      {/* Chat List Skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-[--radius-card] border border-[--border] bg-[--bg-card] p-5">
            <div className="flex justify-between items-start">
              <div className="h-6 w-32 rounded bg-[--bg-surface] animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-[--bg-surface] animate-pulse" />
            </div>
            <div className="h-4 w-48 rounded bg-[--bg-surface] animate-pulse mt-2" />
            <div className="h-4 w-full rounded bg-[--bg-surface] animate-pulse" />
            
            <div className="mt-4 flex justify-between items-center border-t border-[--border] pt-4">
              <div className="h-4 w-20 rounded bg-[--bg-surface] animate-pulse" />
              <div className="h-8 w-24 rounded-xl bg-[--bg-surface] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
