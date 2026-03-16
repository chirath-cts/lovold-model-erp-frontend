import type { ReactNode } from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: "default" | "accent" | "warn";
}

const toneStyles: Record<NonNullable<KpiCardProps["tone"]>, object> = {
  default: { borderColor: "divider" },
  accent: { borderColor: "primary.light", backgroundColor: "rgba(0, 82, 108, 0.04)" },
  warn: { borderColor: "warning.light", backgroundColor: "rgba(178, 106, 0, 0.05)" },
};

export function KpiCard({ label, value, helper, tone = "default" }: KpiCardProps) {
  return (
    <Card sx={toneStyles[tone]}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {helper}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
