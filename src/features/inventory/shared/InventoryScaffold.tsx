import type { ReactNode } from "react";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export function InventoryPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="app-page-header">
      <div className="space-y-3">
        {eyebrow ? (
          <span className="inline-flex rounded-full bg-[var(--brand-100)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-900)]">
            {eyebrow}
          </span>
        ) : null}
        <div className="space-y-1">
          <h1 className="app-page-title">{title}</h1>
          <p className="app-page-copy max-w-3xl">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  tone = "default",
  supporting,
}: {
  label: string;
  value: string;
  tone?: "default" | "brand" | "warning";
  supporting?: string;
}) {
  return (
    <div
      className={cn(
        "app-kpi-card",
        tone === "brand" && "border-[var(--brand-700)] bg-[var(--brand-900)] text-white",
        tone === "warning" && "border-amber-300 bg-amber-50",
      )}
    >
      <div className={cn("app-kpi-label", tone === "brand" && "text-white/70")}>
        {label}
      </div>
      <div
        className={cn(
          "text-3xl font-semibold tracking-tight",
          tone === "warning" && "text-amber-900",
        )}
      >
        {value}
      </div>
      {supporting ? (
        <p
          className={cn(
            "text-sm",
            tone === "brand" ? "text-white/80" : "text-[var(--text-secondary)]",
          )}
        >
          {supporting}
        </p>
      ) : null}
    </div>
  );
}

export function DataPanel({
  title,
  description,
  children,
  actions,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`app-card overflow-hidden rounded-sm ${className || ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-soft)] px-5 py-4 md:px-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          {description ? (
            <p className="text-sm text-[var(--text-secondary)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export function FieldGrid({
  fields,
}: {
  fields: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.label}
          className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {field.label}
          </div>
          <div className="mt-2 text-sm font-medium text-slate-800">
            {field.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyPanel({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="app-card flex flex-col items-start gap-4 border-dashed">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{copy}</p>
      </div>
      {action}
    </div>
  );
}
