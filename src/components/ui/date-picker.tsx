import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
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
  placeholder,
  className,
}: DatePickerProps) {
  const { i18n, t } = useTranslation();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const selected = parseYmdToLocalDate(value);
  const minDate = parseYmdToLocalDate(min);
  const maxDate = parseYmdToLocalDate(max);
  const display =
    value && selected
      ? formatYmdDisplay(value, i18n.language)
      : placeholder ?? t("datePicker.placeholder", "Selecionar data");

  if (isMobile) {
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "relative flex h-10 w-full items-center rounded-md border border-input bg-background/50 px-3 pl-9 text-left text-sm shadow-sm transition-colors hover:bg-background/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <span className="truncate">{display}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? minDate ?? maxDate}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          onSelect={(date) => {
            if (!date) return;
            onChange(formatDateToYmd(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
