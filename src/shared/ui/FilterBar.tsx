import type { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">{children}</div>;
}
