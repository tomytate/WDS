"use client"

import { useActionState, useState } from "react"
import { Check, Star, Loader2 } from "lucide-react"

import { submitReviewAction } from "./actions"
import { buttonStyles, Textarea } from "@wongdigital/ui"

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
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[--radius-card] border border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-[--radius-inner] bg-[--color-success] text-white mb-5">
          <Check size={22} strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[--color-success-text] mb-2">
          Thank you.
        </h2>
        <p className="text-sm text-[--text-secondary] max-w-sm">
          Your feedback has been received and will be reviewed shortly.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="customerName" value={customerName} />
      <input type="hidden" name="customerEmail" value={customerEmail} />
      <input type="hidden" name="rating" value={rating} />

      <div className="space-y-3">
        <label className="block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]">
          How was your experience?
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform active:scale-95"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                size={32}
                strokeWidth={1.5}
                className={`transition-colors duration-200 ${
                  star <= (hoveredRating || rating)
                    ? "fill-[--text-primary] text-[--text-primary]"
                    : "fill-transparent text-[--border]"
                }`}
              />
            </button>
          ))}
        </div>
        {state.fieldErrors?.rating && (
          <p className="text-xs font-medium text-[--color-danger-text]">
            {state.fieldErrors.rating[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          className="block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]"
          htmlFor="content"
        >
          Leave a comment (optional)
        </label>
        <Textarea
          id="content"
          name="content"
          rows={4}
          placeholder="Tell us what you think…"
        />
        {state.fieldErrors?.content && (
          <p className="text-xs font-medium text-[--color-danger-text]">
            {state.fieldErrors.content[0]}
          </p>
        )}
      </div>

      {state.error && (
        <p className="rounded-[--radius-inner] border border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-sm font-medium text-[--color-danger-text]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={buttonStyles({
          size: "lg",
          className: "w-full justify-center gap-2",
        })}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit feedback"
        )}
      </button>
    </form>
  )
}
