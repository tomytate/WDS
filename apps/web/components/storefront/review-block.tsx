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
    <div className="rounded-[--radius-card] border border-[--border] bg-[--bg-card] overflow-hidden transition-colors duration-200 hover:border-[--text-primary]">
      <div className="flex items-center gap-2.5 border-b border-[--border] bg-[--bg-surface] px-4 py-3">
        <CheckCircle2
          size={13}
          className="text-[--accent-strong]"
          aria-hidden="true"
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-secondary] font-medium">
          {label}
        </p>
      </div>
      <div className="divide-y divide-[--border]">
        {rows.map((row) => (
          <div
            className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            key={`${label}-${row.label}`}
          >
            <span className="text-xs uppercase tracking-tight text-[--text-muted] sm:text-sm sm:normal-case">
              {row.label}
            </span>
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
