import { Navbar } from "@/components/storefront/navbar"

export default function LoadingOrderForm() {
  return (
    <main className="min-h-screen bg-[--bg-base]">
      <Navbar />
      
      <div className="container-shell max-w-4xl py-6 sm:py-8 lg:py-12 pb-32">
        <div className="space-y-6">
          <div className="h-10 sm:h-12 w-full rounded-xl sm:rounded-[--radius-card] border border-[--border] bg-[var(--bg-card)] animate-skeleton-pulse" />
          
          <div className="rounded-xl sm:rounded-[--radius-card] border border-[--border] bg-[var(--bg-card)] p-6 sm:p-8 space-y-6 animate-skeleton-pulse">
            <div className="h-10 w-48 rounded-xl bg-[--bg-surface]" />
            <div className="h-4 w-64 rounded bg-[--bg-surface]" />
            
            <div className="flex gap-4 pt-6">
              <div className="h-12 w-32 rounded-full bg-[--bg-surface]" />
              <div className="h-12 w-32 rounded-full bg-[--bg-surface]" />
              <div className="h-12 w-32 rounded-full bg-[--bg-surface]" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-[--radius-card] bg-[--bg-surface]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
