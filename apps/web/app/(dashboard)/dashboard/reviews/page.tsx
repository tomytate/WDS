import { Check, X, Trash2, Star } from "lucide-react"

import { getDashboardReviews } from "@wongdigital/db/storefront"
import { Badge, buttonStyles, PageHeader } from "@wongdigital/ui"
import { formatDate } from "@/lib/format"
import { toggleReviewStatusAction, deleteReviewAction } from "../actions"
import Link from "next/link"

import { NoticeBanner } from "@/components/dashboard/notice-banner"
import { requireDashboardAdmin } from "@/lib/dashboard-auth"

export const metadata = {
  title: "Reviews | Dashboard",
}

type ReviewsPageProps = {
  searchParams: Promise<{
    error?: string
    success?: string
  }>
}

export default async function DashboardReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  await requireDashboardAdmin()
  const resolvedSearchParams = await searchParams
  const reviews = await getDashboardReviews(100, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        icon={<Star size={20} />}
        title="Reviews"
        description="Approve or reject customer reviews before they appear on the storefront."
      />

      <NoticeBanner
        error={resolvedSearchParams.error}
        success={resolvedSearchParams.success}
      />

      <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-[--text-muted]">
            <Star size={32} className="mb-4 text-[--border]" />
            <p>No reviews yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)] text-[--text-secondary]">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Customer</th>
                  <th scope="col" className="px-6 py-4 font-medium">Order</th>
                  <th scope="col" className="px-6 py-4 font-medium">Rating</th>
                  <th scope="col" className="px-6 py-4 font-medium">Content</th>
                  <th scope="col" className="px-6 py-4 font-medium">Date</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border]">
                {reviews.map((review) => (
                  <tr key={review.id} className="transition-colors hover:bg-[color-mix(in_srgb,var(--bg-surface)_40%,transparent)]">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[--text-primary]">{review.customerName}</p>
                      <p className="text-xs text-[--text-secondary]">{review.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      {review.orderCode ? (
                        <Link href={`/dashboard/orders/${review.orderId}`} className="font-mono text-[--accent] hover:underline">
                          {review.orderCode}
                        </Link>
                      ) : (
                        <span className="text-[--text-muted]">Deleted</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-[--color-warning]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "fill-current" : "fill-transparent border-current"} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-[--text-secondary]">
                      {review.content || <span className="text-[--text-muted] italic">No content</span>}
                    </td>
                    <td className="px-6 py-4 text-[--text-secondary] whitespace-nowrap">
                      {formatDate(review.createdAt.toISOString())}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {review.isApproved ? (
                        <Badge tone="success" size="sm">Approved</Badge>
                      ) : (
                        <Badge size="sm">Pending</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <form action={toggleReviewStatusAction}>
                          <input type="hidden" name="id" value={review.id} />
                          <input type="hidden" name="isApproved" value={(!review.isApproved).toString()} />
                          <button
                            type="submit"
                            aria-label={review.isApproved ? "Reject review" : "Approve review"}
                            title={review.isApproved ? "Reject review" : "Approve review"}
                            className={buttonStyles({
                              variant: "ghost",
                              size: "sm",
                              className: `h-8 w-8 p-0 border-[--border] ${review.isApproved ? "hover:text-[--color-warning]" : "hover:text-[--color-success]"}`,
                            })}
                          >
                            {review.isApproved ? <X size={14} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}
                          </button>
                        </form>
                        <form action={deleteReviewAction}>
                          <input type="hidden" name="id" value={review.id} />
                          <button
                            type="submit"
                            aria-label="Delete review"
                            title="Delete review"
                            className={buttonStyles({
                              variant: "ghost",
                              size: "sm",
                              className: "h-8 w-8 p-0 border-[--border] hover:text-[--color-danger] text-[--text-muted]",
                            })}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
