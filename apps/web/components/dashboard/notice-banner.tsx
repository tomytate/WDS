import { AlertCircle, CheckCircle2 } from "lucide-react"

export function NoticeBanner({
  error,
  success,
}: {
  error?: string
  success?: string
}) {
  if (!error && !success) {
    return null
  }

  const isError = Boolean(error)
  const toneClasses = isError
    ? "border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[--color-danger]"
    : "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[--color-success]"

  return (
    <div
      aria-live="polite"
      className={`mb-4 sm:mb-6 flex items-start gap-2.5 sm:gap-3 rounded-2xl sm:rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm ${toneClasses}`}
      role="status"
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{error ?? success}</span>
    </div>
  )
}
