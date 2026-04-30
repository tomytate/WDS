export function FieldError({ error }: { error?: string }) {
  return error ? (
    <p
      className="text-xs text-[--color-danger] animate-[field-error-in_0.25s_ease-out]"
      data-field-error
      role="alert"
    >
      {error}
    </p>
  ) : null;
}
