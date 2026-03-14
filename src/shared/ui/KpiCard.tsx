import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: "default" | "accent" | "warn";
}

const toneMap: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "border-slate-200",
  accent: "border-[#00526C]/30",
  warn: "border-amber-300",
};

export function KpiCard({ label, value, helper, tone = "default" }: KpiCardProps) {
  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${toneMap[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}
