import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DatePicker,
  formatYmdDisplay,
} from "@/components/ui/date-picker";
import { ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isCurrentMonthKey } from "../../utils/month-range";
import type { ReportBillStatus, ReportSections } from "./report-data";
import type { ReportTextSize } from "./report-text-size";

type ReportFiltersProps = {
  selectedMonth: string;
  monthLabel: string;
  monthMinDate: string;
  monthMaxDate: string;
  startDate: string;
  endDate: string;
  sections: ReportSections;
  billStatus: ReportBillStatus;
  textSize: ReportTextSize;
  canExport: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onPeriodChange: (startDate: string, endDate: string) => void;
  onResetDateRange: () => void;
  onSectionsChange: (sections: ReportSections) => void;
  onBillStatusChange: (status: ReportBillStatus) => void;
  onTextSizeChange: (size: ReportTextSize) => void;
  onExport: () => void;
  labels: {
    month: string;
    previous: string;
    next: string;
    current: string;
    from: string;
    till: string;
    selectDays: string;
    fullMonth: string;
    resetDates: string;
    sections: string;
    bills: string;
    income: string;
    expenses: string;
    billStatus: string;
    statusAll: string;
    statusPaid: string;
    statusPending: string;
    textSize: string;
    textSizeSm: string;
    textSizeMd: string;
    textSizeLg: string;
    textSizeXl: string;
    exportPdf: string;
    emptyHint: string;
  };
};

export default function ReportFilters({
  selectedMonth,
  monthLabel,
  monthMinDate,
  monthMaxDate,
  startDate,
  endDate,
  sections,
  billStatus,
  textSize,
  canExport,
  onPreviousMonth,
  onNextMonth,
  onResetMonth,
  onStartDateChange,
  onEndDateChange,
  onPeriodChange,
  onResetDateRange,
  onSectionsChange,
  onBillStatusChange,
  onTextSizeChange,
  onExport,
  labels,
}: ReportFiltersProps) {
  const { i18n } = useTranslation();

  const toggleSection = (key: keyof ReportSections) => {
    onSectionsChange({ ...sections, [key]: !sections[key] });
  };

  const isFullMonth =
    startDate === monthMinDate && endDate === monthMaxDate;

  return (
    <div className="print:hidden space-y-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {labels.month}:{" "}
          <Badge className="rounded-sm shadow select-none hover:bg-primary/70">
            <span className="font-medium capitalize">{monthLabel}</span>
          </Badge>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onPreviousMonth}
            aria-label={labels.previous}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8"
            disabled={isCurrentMonthKey(selectedMonth) && isFullMonth}
            onClick={onResetMonth}
          >
            {labels.current}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onNextMonth}
            aria-label={labels.next}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="report-start-date">{labels.from}</Label>
          <DatePicker
            id="report-start-date"
            value={startDate}
            max={endDate || undefined}
            onChange={onStartDateChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="report-end-date">{labels.till}</Label>
          <DatePicker
            id="report-end-date"
            value={endDate}
            min={startDate || undefined}
            onChange={onEndDateChange}
          />
        </div>
      </div>

      {!isFullMonth && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {labels.fullMonth}:{" "}
            {formatYmdDisplay(startDate, i18n.language)} —{" "}
            {formatYmdDisplay(endDate, i18n.language)}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={onResetDateRange}
          >
            {labels.resetDates}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {labels.sections}
          </p>
          <div className="flex flex-wrap gap-4">
            {(
              [
                ["conta", labels.bills],
                ["receita", labels.income],
                ["despesa", labels.expenses],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={`report-section-${key}`}
                  checked={sections[key]}
                  onCheckedChange={() => toggleSection(key)}
                />
                <Label
                  htmlFor={`report-section-${key}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {sections.conta && (
            <div className="space-y-2 min-w-[160px]">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {labels.billStatus}
              </Label>
              <Select
                value={billStatus}
                onValueChange={(value) =>
                  onBillStatusChange(value as ReportBillStatus)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{labels.statusAll}</SelectItem>
                  <SelectItem value="paid">{labels.statusPaid}</SelectItem>
                  <SelectItem value="pending">{labels.statusPending}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2 min-w-[160px]">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {labels.textSize}
            </Label>
            <Select
              value={textSize}
              onValueChange={(value) =>
                onTextSizeChange(value as ReportTextSize)
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">{labels.textSizeSm}</SelectItem>
                <SelectItem value="md">{labels.textSizeMd}</SelectItem>
                <SelectItem value="lg">{labels.textSizeLg}</SelectItem>
                <SelectItem value="xl">{labels.textSizeXl}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={onExport}
            disabled={!canExport}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" />
            {labels.exportPdf}
          </Button>
        </div>
      </div>

      {!canExport && (
        <p className="text-sm text-muted-foreground">{labels.emptyHint}</p>
      )}
    </div>
  );
}
