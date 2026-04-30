"use client"

import { useActionState, useState } from "react"
import { Check, Star, Loader2 } from "lucide-react"

import { submitReviewAction } from "./actions"
import { buttonStyles, Input } from "@wongdigital/ui"

export function ReviewForm({
  orderId,
  customerName,
  customerEmail,
}: {
  orderId: string
  customerName: string
  customerEmail: string
}) {
  const [state, formAction, isPending] = useActionState(submitReviewAction, {})
  const [rating, setRating] = useState<number>(5)
  const [hoveredRating, setHoveredRating] = useState<number>(0)

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-[--border] bg-[color-mix(in_srgb,var(--color-success)_4%,var(--bg-card))]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[--color-success] text-[--color-success-fg] mb-6 shadow-[0_0_24px_color-mix(in_srgb,var(--color-success)_30%,transparent)]">
          <Check size={32} strokeWidth={3} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl tracking-tight mb-2">Thank You!</h2>
        <p className="text-[--text-secondary] max-w-sm">
          Your feedback has been received and will be reviewed shortly.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6 sm:space-y-8">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="customerName" value={customerName} />
      <input type="hidden" name="customerEmail" value={customerEmail} />
      <input type="hidden" name="rating" value={rating} />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[--text-primary]">How was your experience?</label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform hover:scale-110 active:scale-95"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                size={36}
                strokeWidth={1.5}
                className={`transition-colors duration-200 ${
                  star <= (hoveredRating || rating)
                    ? "fill-[--color-warning] text-[--color-warning]"
                    : "fill-transparent text-[--border]"
                }`}
              />
            </button>
          ))}
        </div>
        {state.fieldErrors?.rating && (
          <p className="text-xs text-[--color-danger]">{state.fieldErrors.rating[0]}</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[--text-primary]" htmlFor="content">
          Leave a comment (Optional)
        </label>
        <textarea
          id="content"
          name="content"
          rows={4}
          className="w-full rounded-2xl border border-[--border] bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] px-4 py-3 text-sm transition-all placeholder-[--text-muted] focus:border-[--accent] focus:outline-none focus:ring-4 focus:ring-[--accent-tint-medium]"
          placeholder="Tell us what you think..."
        />
        {state.fieldErrors?.content && (
          <p className="text-xs text-[--color-danger]">{state.fieldErrors.content[0]}</p>
        )}
      </div>

      {state.error && (
        <p className="rounded-xl border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-3 text-sm text-[--color-danger]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonStyles({ size: "lg", className: "w-full justify-center h-12 rounded-2xl shadow-[0_4px_16px_var(--accent-tint-medium)]" })}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Feedback"
        )}
      </button>
    </form>
  )
}
