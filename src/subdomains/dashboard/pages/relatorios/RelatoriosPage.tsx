import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PrivateLayout from "../../layout/PrivateLayout";
import { useUserTransactions } from "@/utils/services/api/transation";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useDashboardPreferences } from "../../context/dashboard-preferences";
import {
  getCurrentMonthKey,
  getMonthRangeByKey,
  parseMonthKey,
} from "../../utils/month-range";
import { useCategories } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";
import ReportFilters from "./ReportFilters";
import ReportDocument, { formatReportDate } from "./ReportDocument";
import {
  buildReportData,
  type ReportBillStatus,
  type ReportSections,
} from "./report-data";
import { buildReportFileName, downloadReportPdf } from "./print-report";
import type { ReportTextSize } from "./report-text-size";

const DEFAULT_SECTIONS: ReportSections = {
  conta: true,
  receita: true,
  despesa: true,
};

function monthKeyFromYmd(value: string) {
  return value.slice(0, 7);
}

function RelatoriosPageBody() {
  const { t, i18n } = useTranslation();
  const { data: transactions = [], isLoading } = useUserTransactions();
  const { formatCurrency } = useDashboardStats();
  const { getCategoryLabel } = useCategories();
  const {
    selectedMonth,
    setSelectedMonth,
    goToNextMonth,
    goToPreviousMonth,
    resetCurrentMonth,
    layoutMode,
  } = useDashboardPreferences();

  const [sections, setSections] = useState<ReportSections>(DEFAULT_SECTIONS);
  const [billStatus, setBillStatus] = useState<ReportBillStatus>("all");
  const [textSize, setTextSize] = useState<ReportTextSize>("lg");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const skipMonthRangeResetRef = useRef(false);
  const reportRef = useRef<HTMLArticleElement>(null);

  const monthRange = useMemo(
    () => getMonthRangeByKey(selectedMonth),
    [selectedMonth]
  );

  useEffect(() => {
    if (skipMonthRangeResetRef.current) {
      skipMonthRangeResetRef.current = false;
      return;
    }
    setStartDate(monthRange.startDate);
    setEndDate(monthRange.endDate);
  }, [monthRange.endDate, monthRange.startDate]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language, {
        month: "long",
        year: "numeric",
      }).format(parseMonthKey(selectedMonth)),
    [i18n.language, selectedMonth]
  );

  const issuedAtLabel = useMemo(
    () =>
      new Date().toLocaleDateString(i18n.language, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [i18n.language]
  );

  const rangeStart =
    startDate && endDate && startDate > endDate ? endDate : startDate || monthRange.startDate;
  const rangeEnd =
    startDate && endDate && startDate > endDate ? startDate : endDate || monthRange.endDate;

  const applyPeriod = (nextStart: string, nextEnd: string) => {
    const monthKey = monthKeyFromYmd(nextStart);
    if (monthKey !== selectedMonth) {
      skipMonthRangeResetRef.current = true;
      setSelectedMonth(monthKey);
    }
    setStartDate(nextStart);
    setEndDate(nextEnd);
  };

  const report = useMemo(
    () =>
      buildReportData(
        transactions,
        rangeStart,
        rangeEnd,
        sections,
        billStatus
      ),
    [billStatus, rangeEnd, rangeStart, sections, transactions]
  );

  const isFullSelectedMonth =
    rangeStart === monthRange.startDate && rangeEnd === monthRange.endDate;

  const periodLabel = useMemo(() => {
    if (isFullSelectedMonth) return monthLabel;
    return `${formatReportDate(rangeStart, i18n.language)} — ${formatReportDate(rangeEnd, i18n.language)}`;
  }, [i18n.language, isFullSelectedMonth, monthLabel, rangeEnd, rangeStart]);

  const hasActiveSection = sections.conta || sections.receita || sections.despesa;
  const canExport =
    hasActiveSection && report.itemCount > 0 && !isLoading && !isExporting;

  const handleExport = async () => {
    if (!reportRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await downloadReportPdf(
        reportRef.current,
        buildReportFileName(rangeStart, rangeEnd)
      );
    } finally {
      setIsExporting(false);
    }
  };

  const documentLabels = {
    brand: "Meu Troco",
    title: t("reports.document.title", { month: periodLabel }),
    issuedAt: t("reports.document.issuedAt"),
    summary: t("reports.document.summary"),
    bills: t("reports.sections.bills"),
    income: t("reports.sections.income"),
    expenses: t("reports.sections.expenses"),
    balance: t("reports.document.balance"),
    date: t("reports.columns.date"),
    description: t("reports.columns.description"),
    category: t("reports.columns.category"),
    value: t("reports.columns.value"),
    status: t("reports.columns.status"),
    paid: t("dashboard.billsChart.paid"),
    pending: t("dashboard.billsChart.pending"),
    sectionTotal: t("reports.document.sectionTotal"),
    empty: t("reports.document.sectionEmpty"),
  };

  return (
    <div
      className={cn(
        "container mx-auto mt-8 mb-24 md:mt-12 md:mb-12 px-4 md:px-6 space-y-6 print:m-0 print:p-0 print:max-w-none print:space-y-0",
        layoutMode === "notion" && "max-w-screen-xl"
      )}
    >
      <div className="print:hidden space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("reports.page.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("reports.page.subtitle")}
        </p>
      </div>

      <ReportFilters
        selectedMonth={selectedMonth}
        monthLabel={monthLabel}
        monthMinDate={monthRange.startDate}
        monthMaxDate={monthRange.endDate}
        startDate={rangeStart}
        endDate={rangeEnd}
        sections={sections}
        billStatus={billStatus}
        textSize={textSize}
        canExport={canExport}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onResetMonth={() => {
          resetCurrentMonth();
          const current = getMonthRangeByKey(getCurrentMonthKey());
          setStartDate(current.startDate);
          setEndDate(current.endDate);
        }}
        onStartDateChange={(value) => {
          if (!value) return;
          applyPeriod(value, rangeEnd < value ? value : rangeEnd);
        }}
        onEndDateChange={(value) => {
          if (!value) return;
          applyPeriod(rangeStart > value ? value : rangeStart, value);
        }}
        onPeriodChange={applyPeriod}
        onResetDateRange={() => {
          setStartDate(monthRange.startDate);
          setEndDate(monthRange.endDate);
        }}
        onSectionsChange={setSections}
        onBillStatusChange={setBillStatus}
        onTextSizeChange={setTextSize}
        onExport={handleExport}
        labels={{
          month: t("dashboard.monthFilter.label"),
          previous: t("dashboard.monthFilter.previous"),
          next: t("dashboard.monthFilter.next"),
          current: t("dashboard.monthFilter.current"),
          from: t("filters.from"),
          till: t("filters.till"),
          selectDays: t("reports.filters.selectDays"),
          fullMonth: t("reports.filters.fullMonth"),
          resetDates: t("reports.filters.resetDates"),
          sections: t("reports.filters.sections"),
          bills: t("reports.sections.bills"),
          income: t("reports.sections.income"),
          expenses: t("reports.sections.expenses"),
          billStatus: t("reports.filters.billStatus"),
          statusAll: t("reports.filters.statusAll"),
          statusPaid: t("reports.filters.statusPaid"),
          statusPending: t("reports.filters.statusPending"),
          textSize: t("reports.filters.textSize"),
          textSizeSm: t("reports.filters.textSizeSm"),
          textSizeMd: t("reports.filters.textSizeMd"),
          textSizeLg: t("reports.filters.textSizeLg"),
          textSizeXl: t("reports.filters.textSizeXl"),
          exportPdf: isExporting
            ? t("reports.actions.exporting")
            : t("reports.actions.exportPdf"),
          emptyHint: t("reports.page.emptyHint"),
        }}
      />

      <ReportDocument
        ref={reportRef}
        issuedAtLabel={issuedAtLabel}
        report={report}
        textSize={textSize}
        formatCurrency={formatCurrency}
        formatDate={(date) => formatReportDate(date, i18n.language)}
        getCategoryLabel={getCategoryLabel}
        labels={documentLabels}
      />
    </div>
  );
}

export default function RelatoriosPage() {
  return (
    <PrivateLayout>
      <RelatoriosPageBody />
    </PrivateLayout>
  );
}
