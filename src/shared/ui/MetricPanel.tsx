import type { ReactNode } from "react";

interface MetricPanelProps {
  title: string;
  children: ReactNode;
}

export function MetricPanel({ title, children }: MetricPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
