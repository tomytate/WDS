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
    ? "border-[--color-danger] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[--color-danger-text]"
    : "border-[--color-success] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[--color-success-text]"

  return (
    <div
      aria-live="polite"
      className={`mb-4 sm:mb-6 flex items-start gap-3 rounded-[--radius-inner] border px-4 py-3 text-sm font-medium ${toneClasses}`}
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
