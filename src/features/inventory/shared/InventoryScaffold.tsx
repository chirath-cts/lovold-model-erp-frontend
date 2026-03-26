import type { ReactNode } from "react";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export function InventoryPageHeader({
  eyebrow,
  title,
  description,
  actions,
  variant = "default",
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  variant?: "default" | "ops";
}) {
  return (
    <div
      className={cn(
        "app-page-header",
        variant === "ops" && "gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start",
      )}
    >
      <div className={cn("space-y-3", variant === "ops" && "min-w-0")}>
        {eyebrow ? (
          <span
            className={cn(
              "inline-flex rounded-full bg-[var(--brand-100)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-900)]",
              variant === "ops" &&
                "rounded-sm bg-transparent px-0 py-0 app-ops-eyebrow",
            )}
          >
            {eyebrow}
          </span>
        ) : null}
        <div className="space-y-1">
          <h1 className={cn("app-page-title", variant === "ops" && "app-ops-title")}>
            {title}
          </h1>
          <p className={cn("app-page-copy max-w-3xl", variant === "ops" && "app-ops-copy")}>
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div
          className={cn(
            "flex flex-wrap gap-3",
            variant === "ops" && "items-start lg:justify-end",
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  tone = "default",
  supporting,
  variant = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "brand" | "warning";
  supporting?: string;
  variant?: "default" | "ops";
}) {
  if (variant === "ops") {
    return (
      <div
        className={cn(
          "app-ops-kpi-card",
          tone === "brand" && "border-[var(--brand-700)] bg-[var(--brand-900)] text-white",
          tone === "warning" && "border-amber-300 bg-amber-50",
        )}
      >
        <div className={cn("app-ops-kpi-label", tone === "brand" && "text-white/70", tone === "warning" && "text-amber-800")}>
          {label}
        </div>
        <div
          className={cn(
            "text-3xl font-black tracking-tight",
            tone === "brand" ? "text-white" : "text-slate-800",
            tone === "warning" && "text-amber-950",
          )}
        >
          {value}
        </div>
        {supporting ? (
          <p
            className={cn(
              "text-sm",
              tone === "brand" ? "text-white/80" : "text-slate-500",
              tone === "warning" && "text-amber-900/80",
            )}
          >
            {supporting}
          </p>
        ) : null}
      </div>
    );
  }

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
  variant = "default",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  variant?: "default" | "ops";
}) {
  return (
    <section className={`app-card overflow-hidden rounded-sm ${className || ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-soft)] px-5 py-4 md:px-6">
        <div className="space-y-1">
          <h2
            className={cn(
              "text-lg font-semibold text-[var(--text-primary)]",
              variant === "ops" && "text-base font-bold tracking-tight text-slate-800",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                "text-sm text-[var(--text-secondary)]",
                variant === "ops" && "text-sm text-slate-500",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </div>
      <div className={cn("p-5 md:p-6", variant === "ops" && "p-4 md:p-4")}>{children}</div>
    </section>
  );
}

export function FieldGrid({
  fields,
  variant = "default",
}: {
  fields: Array<{ label: string; value: ReactNode }>;
  variant?: "default" | "ops";
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
  variant = "default",
}: {
  title: string;
  copy: string;
  action?: ReactNode;
  variant?: "default" | "ops";
}) {
  return (
    <div
      className={cn(
        "app-card flex flex-col items-start gap-4 border-dashed",
        variant === "ops" && "app-ops-card rounded-sm border-dashed border-slate-300 p-5",
      )}
    >
      <div className="space-y-1">
        <h2
          className={cn(
            "text-lg font-semibold text-[var(--text-primary)]",
            variant === "ops" && "text-base font-bold text-slate-800",
          )}
        >
          {title}
        </h2>
        <p
          className={cn(
            "text-sm text-[var(--text-secondary)]",
            variant === "ops" && "text-sm text-slate-500",
          )}
        >
          {copy}
        </p>
      </div>
      {action}
    </div>
  );
}
