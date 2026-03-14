interface StatusBadgeProps {
  value: string;
}

const colorMap: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-200 text-slate-600",
  future: "bg-blue-100 text-blue-700",
  expired: "bg-rose-100 text-rose-700",
  draft: "bg-slate-100 text-slate-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  dispatched: "bg-amber-100 text-amber-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

export function StatusBadge({ value }: StatusBadgeProps) {
  const className = colorMap[value] ?? "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${className}`}>
      {value}
    </span>
  );
}
