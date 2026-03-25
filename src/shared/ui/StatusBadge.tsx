interface StatusBadgeProps {
  value: string;
}

const styleMap: Record<
  string,
  { bg: string; color: string }
> = {
  active: { bg: "#d1fae5", color: "#065f46" },
  inactive: { bg: "#e5e7eb", color: "#4b5563" },
  future: { bg: "#dbeafe", color: "#1d4ed8" },
  expired: { bg: "#fee2e2", color: "#991b1b" },
  draft: { bg: "#e5e7eb", color: "#4b5563" },
  confirmed: { bg: "#c7d2fe", color: "#1e3a8a" },
  reserved: { bg: "#dbeafe", color: "#1d4ed8" },
  in_production: { bg: "#e0f2fe", color: "#075985" },
  ready: { bg: "#dcfce7", color: "#166534" },
  dispatched: { bg: "#fef3c7", color: "#92400e" },
  delivered: { bg: "#d1fae5", color: "#065f46" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
  ordered: { bg: "#dbeafe", color: "#1d4ed8" },
  partially_received: { bg: "#fef3c7", color: "#92400e" },
  received: { bg: "#d1fae5", color: "#065f46" },
  pending: { bg: "#e5e7eb", color: "#4b5563" },
  in_progress: { bg: "#dbeafe", color: "#1d4ed8" },
  completed: { bg: "#d1fae5", color: "#065f46" },
  critical: { bg: "#fee2e2", color: "#991b1b" },
  low: { bg: "#fef3c7", color: "#92400e" },
  healthy: { bg: "#d1fae5", color: "#065f46" },
};

export function StatusBadge({ value }: StatusBadgeProps) {
  const styles = styleMap[value.toLowerCase()] ?? {
    bg: "#e5e7eb",
    color: "#111827",
  };
  const label = value.replaceAll("_", " ");

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
      style={{ backgroundColor: styles.bg, color: styles.color }}
    >
      {label}
    </span>
  );
}
