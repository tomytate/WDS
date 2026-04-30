import { CheckCircle2 } from "lucide-react";

export function ReviewBlock({
  label,
  rows,
}: {
  label: string;
  rows: Array<{
    label: string;
    value: string;
  }>;
}) {
  return (
    <div className="group rounded-2xl border border-[--border] bg-[--bg-card] p-5 transition-all duration-300 hover:border-[--accent-border] hover:shadow-[0_0_20px_var(--accent-tint-soft)]">
      <div className="flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[--accent-tint-soft]">
          <CheckCircle2
            size={14}
            className="text-[--accent]"
            aria-hidden="true"
          />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-[--accent] font-semibold">
          {label}
        </p>
      </div>
      <div className="mt-4 space-y-1">
        {rows.map((row, _index) => (
          <div
            className="flex flex-col gap-1 rounded-xl px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--bg-surface)_70%,transparent)] sm:flex-row sm:items-center sm:justify-between"
            key={`${label}-${row.label}`}
          >
            <span className="text-sm text-[--text-muted]">{row.label}</span>
            <span
              className={`text-sm font-medium ${
                row.value === "—" || row.value === "No file uploaded"
                  ? "text-[--text-muted]"
                  : "text-[--text-primary]"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
