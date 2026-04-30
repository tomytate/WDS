import { Navbar } from "@/components/storefront/navbar"
import { HeroSection } from "@/components/storefront/hero-section"
import { Footer } from "@/components/storefront/footer"

export default function LoadingStorefront() {
  return (
    <main>
      <Navbar />
      <HeroSection />

      {/* Product Grid Skeleton */}
      <section className="container-shell py-14 sm:py-18 lg:py-24">
        <div className="space-y-8 sm:space-y-10">
          <div className="space-y-4">
            <div className="h-2 w-12 bg-[--border] rounded-full animate-skeleton-pulse" />
            <div className="h-8 w-64 bg-[--bg-surface] rounded-xl border border-[--border] animate-skeleton-pulse" />
          </div>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="h-10 w-24 rounded-full bg-[--bg-surface] border border-[--border] animate-skeleton-pulse" 
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>

          <div className="bento-grid">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`rounded-2xl border border-[--border] bg-[var(--bg-card)] p-6 min-h-[300px] animate-skeleton-pulse ${
                  i === 1 ? "md:col-span-2 md:row-span-2" : ""
                }`}
                style={{ animationDelay: `${(i + 4) * 150}ms` }} 
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
