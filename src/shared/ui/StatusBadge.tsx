import { Chip } from "@mui/material";

interface StatusBadgeProps {
  value: string;
}

const styleMap: Record<string, object> = {
  active: { bgcolor: "success.light", color: "success.dark" },
  inactive: { bgcolor: "grey.200", color: "text.secondary" },
  future: { bgcolor: "info.light", color: "info.dark" },
  expired: { bgcolor: "error.light", color: "error.dark" },
  draft: { bgcolor: "grey.200", color: "text.secondary" },
  confirmed: { bgcolor: "secondary.light", color: "secondary.contrastText" },
  dispatched: { bgcolor: "warning.light", color: "warning.dark" },
  delivered: { bgcolor: "success.light", color: "success.dark" },
  critical: { bgcolor: "error.light", color: "error.dark" },
  low: { bgcolor: "warning.light", color: "warning.dark" },
  healthy: { bgcolor: "success.light", color: "success.dark" },
};

export function StatusBadge({ value }: StatusBadgeProps) {
  return <Chip size="small" label={value} sx={styleMap[value] ?? { bgcolor: "grey.200", color: "text.primary" }} />;
}
