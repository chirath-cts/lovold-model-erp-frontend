import { Typography } from "@mui/material";

import { formatNok } from "@/shared/lib/format";

interface CurrencyTextProps {
  value: number;
  className?: string;
}

export function CurrencyText({ value, className }: CurrencyTextProps) {
  if (!className) {
    return <>{formatNok(value)}</>;
  }

  return (
    <Typography component="span" className={className}>
      {formatNok(value)}
    </Typography>
  );
}
