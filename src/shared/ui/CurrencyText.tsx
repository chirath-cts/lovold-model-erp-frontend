import { formatNok } from "@/shared/lib/format";

interface CurrencyTextProps {
  value: number;
  className?: string;
}

export function CurrencyText({ value, className }: CurrencyTextProps) {
  return <span className={className}>{formatNok(value)}</span>;
}
