import type { ReactNode } from "react";
import { Card, CardContent, Typography } from "@mui/material";

interface MetricPanelProps {
  title: string;
  children: ReactNode;
}

export function MetricPanel({ title, children }: MetricPanelProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h3" color="text.secondary" sx={{ fontSize: 14, mb: 2 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}
