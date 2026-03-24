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
  dispatched: { bg: "#fef3c7", color: "#92400e" },
  delivered: { bg: "#d1fae5", color: "#065f46" },
  critical: { bg: "#fee2e2", color: "#991b1b" },
  low: { bg: "#fef3c7", color: "#92400e" },
  healthy: { bg: "#d1fae5", color: "#065f46" },
};

export function StatusBadge({ value }: StatusBadgeProps) {
  const styles = styleMap[value.toLowerCase()] ?? {
    bg: "#e5e7eb",
    color: "#111827",
  };

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
      style={{ backgroundColor: styles.bg, color: styles.color }}
    >
      {value}
    </span>
  );
}
