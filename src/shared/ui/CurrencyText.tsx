import { formatNok } from "@/shared/lib/format";

interface CurrencyTextProps {
  value: number;
  className?: string;
}

export function CurrencyText({ value, className }: CurrencyTextProps) {
  if (!className) {
    return <>{formatNok(value)}</>;
  }

  return <div className={className}>{formatNok(value)}</div>;
}
