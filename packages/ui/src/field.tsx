import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "./cn";

const fieldBase =
  "w-full rounded-[--radius-inner] border border-[--border] bg-[--bg-card] text-sm text-[--text-primary] outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[--text-muted] focus:border-[--text-primary] focus:shadow-[0_0_0_3px_var(--accent-tint-medium)]";

const fieldError =
  "border-[--color-danger] focus:border-[--color-danger] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-danger)_18%,transparent)]";

export function Input({
  className,
  leftIcon,
  rightIcon,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: boolean;
}) {
  if (leftIcon || rightIcon) {
    return (
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[--text-muted]">
            {leftIcon}
          </span>
        ) : null}
        <input
          className={cn(
            fieldBase,
            "h-11 px-3.5",
            !!leftIcon && "pl-10",
            !!rightIcon && "pr-10",
            error && fieldError,
            className,
          )}
          {...props}
        />
        {rightIcon ? (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[--text-muted]">
            {rightIcon}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <input
      className={cn(fieldBase, "h-11 px-3.5", error && fieldError, className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={cn(
        fieldBase,
        "min-h-28 px-3.5 py-3",
        error && fieldError,
        className,
      )}
      {...props}
    />
  );
}

const selectChevron =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E";

export function Select({
  className,
  error,
  "aria-invalid": ariaInvalid,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      aria-invalid={ariaInvalid ?? (error ? true : undefined)}
      style={{
        backgroundImage: `url("${selectChevron}")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "12px 12px",
      }}
      className={cn(
        fieldBase,
        "appearance-none h-11 min-h-[44px] px-3.5 pr-9",
        error && fieldError,
        className,
      )}
      {...props}
    />
  );
}

type FieldWrapperProps = {
  children: ReactNode;
  className?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  label?: string;
};

export function FieldWrapper({
  children,
  className,
  error,
  hint,
  htmlFor,
  label,
}: FieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <label
          className="block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[--text-muted]"
          htmlFor={htmlFor}
        >
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p
          className="animate-[field-error-in_0.25s_ease-out] text-xs font-medium text-[--color-danger-text]"
          data-field-error
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-5 text-[--text-secondary]">{hint}</p>
      ) : null}
    </div>
  );
}
