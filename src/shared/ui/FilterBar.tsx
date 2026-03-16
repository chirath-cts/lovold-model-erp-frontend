import type { ReactNode } from "react";
import { Paper, Stack } from "@mui/material";

interface FilterBarProps {
  children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
        {children}
      </Stack>
    </Paper>
  );
}
