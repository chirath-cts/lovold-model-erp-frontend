import type { PropsWithChildren, ReactNode } from "react";

interface AppDialogProps extends PropsWithChildren {
  open: boolean;
  title: string;
  description?: string;
  actions?: ReactNode;
  size?: "md" | "lg" | "xl";
  onClose: () => void;
}

const sizeMap = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
} as const;

export function AppDialog({
  open,
  title,
  description,
  actions,
  size = "lg",
  onClose,
  children,
}: AppDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
      <div
        className={`w-full ${sizeMap[size]} overflow-hidden rounded-[1.5rem] border border-[var(--border-soft)] bg-white shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-soft)] px-6 py-5">
          <div className="space-y-1">
            <h2
              id="app-dialog-title"
              className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]"
            >
              {title}
            </h2>
            {description ? (
              <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--surface-soft)]"
            aria-label="Close dialog"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>

        {actions ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border-soft)] bg-[var(--surface-soft)] px-6 py-4">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
