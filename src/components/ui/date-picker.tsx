import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseLocalDateInput } from "@/subdomains/dashboard/utils/month-range";

export function formatDateToYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseYmdToLocalDate(value?: string) {
  if (!value) return undefined;
  const parsed = parseLocalDateInput(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function formatYmdDisplay(value: string, language: string) {
  const date = parseYmdToLocalDate(value);
  if (!date) return value;
  return date.toLocaleDateString(language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  min,
  max,
  id,
  name,
  disabled,
  className,
}: DatePickerProps) {
  return (
    <Input
      id={id}
      name={name}
      type="date"
      value={value}
      min={min}
      max={max}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={cn("bg-background/50 h-10 border-input", className)}
    />
  );
}
