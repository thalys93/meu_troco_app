import { forwardRef } from "react";
import { Transaction } from "@/utils/services/api/transation";
import { cn } from "@/lib/utils";
import {
  isBillPaid,
  isBillSkipped,
  isTransactionSkipped,
} from "../../utils/transaction-filters";
import { parseLocalDateInput } from "../../utils/month-range";
import type { ReportData, ReportSectionData } from "./report-data";
import {
  REPORT_TEXT_SIZE_CLASSES,
  type ReportTextSize,
} from "./report-text-size";

type ReportDocumentProps = {
  issuedAtLabel: string;
  report: ReportData;
  textSize: ReportTextSize;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getCategoryLabel: (categoryRef: string) => string;
  labels: {
    brand: string;
    title: string;
    issuedAt: string;
    summary: string;
    bills: string;
    income: string;
    expenses: string;
    balance: string;
    date: string;
    description: string;
    category: string;
    value: string;
    status: string;
    paid: string;
    pending: string;
    skipped: string;
    sectionTotal: string;
    empty: string;
  };
};

function billStatusLabel(
  item: Transaction,
  labels: ReportDocumentProps["labels"]
) {
  if (isBillSkipped(item)) return labels.skipped;
  if (isBillPaid(item)) return labels.paid;
  return labels.pending;
}

const SECTION_THEME = {
  conta: {
    title: "text-amber-600",
    border: "border-amber-500/40",
    value: "text-amber-600",
    headerBg: "bg-amber-500/5",
  },
  receita: {
    title: "text-emerald-600",
    border: "border-emerald-500/40",
    value: "text-emerald-600",
    headerBg: "bg-emerald-500/5",
  },
  despesa: {
    title: "text-red-600",
    border: "border-red-500/40",
    value: "text-red-600",
    headerBg: "bg-red-500/5",
  },
} as const;

function sectionTitle(
  type: ReportSectionData["type"],
  labels: ReportDocumentProps["labels"]
) {
  if (type === "conta") return labels.bills;
  if (type === "receita") return labels.income;
  return labels.expenses;
}

function ReportTable({
  section,
  formatCurrency,
  formatDate,
  getCategoryLabel,
  labels,
  textSize,
}: {
  section: ReportSectionData;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
  getCategoryLabel: (categoryRef: string) => string;
  labels: ReportDocumentProps["labels"];
  textSize: ReportTextSize;
}) {
  const showStatus = section.type === "conta";
  const theme = SECTION_THEME[section.type];
  const size = REPORT_TEXT_SIZE_CLASSES[textSize];

  return (
    <section className="mt-12 break-inside-avoid">
      <h2
        className={cn(
          "font-bold uppercase tracking-[0.1em] border-b-2 pb-3 mb-0",
          size.sectionTitle,
          theme.title,
          theme.border
        )}
      >
        {sectionTitle(section.type, labels)}
      </h2>
      {section.items.length === 0 ? (
        <p className={cn("text-muted-foreground py-5", size.empty)}>{labels.empty}</p>
      ) : (
        <table className={cn("w-full border-collapse", size.table)}>
          <thead>
            <tr
              className={cn(
                "text-left text-muted-foreground border-b border-border",
                theme.headerBg
              )}
            >
              <th className="py-4 pr-4 font-semibold w-[110px]">{labels.date}</th>
              <th className="py-4 pr-4 font-semibold">{labels.description}</th>
              <th className="py-4 pr-4 font-semibold w-[160px]">{labels.category}</th>
              {showStatus && (
                <th className="py-4 pr-4 font-semibold w-[110px]">{labels.status}</th>
              )}
              <th className="py-4 font-semibold text-right w-[130px]">{labels.value}</th>
            </tr>
          </thead>
          <tbody>
            {section.items.map((item: Transaction, index) => {
              const skipped = isTransactionSkipped(item);
              return (
                <tr
                  key={item.id ?? `${item.description}-${item.date}-${index}`}
                  className="border-b border-border/60 text-foreground"
                >
                  <td className="py-4 pr-4 whitespace-nowrap align-top">
                    {formatDate(item.date)}
                  </td>
                  <td
                    className={cn(
                      "py-4 pr-4 align-top",
                      skipped && "text-red-600"
                    )}
                  >
                    {item.description}
                  </td>
                  <td className="py-4 pr-4 align-top">
                    {getCategoryLabel(item.category)}
                  </td>
                  {showStatus && (
                    <td
                      className={cn(
                        "py-4 pr-4 align-top font-semibold whitespace-nowrap",
                        skipped && "text-red-600",
                        !skipped && isBillPaid(item) && "text-emerald-600",
                        !skipped && !isBillPaid(item) && "text-amber-600"
                      )}
                    >
                      {billStatusLabel(item, labels)}
                    </td>
                  )}
                  <td
                    className={cn(
                      "py-4 text-right whitespace-nowrap tabular-nums align-top font-semibold",
                      skipped ? "text-red-600" : theme.value
                    )}
                  >
                    {formatCurrency(item.value)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr
              className={cn(
                "font-bold border-t-2",
                size.tableTotal,
                theme.border,
                theme.value
              )}
            >
              <td
                colSpan={showStatus ? 4 : 3}
                className="pt-5 pr-4 text-right"
              >
                {labels.sectionTotal}
              </td>
              <td className="pt-5 text-right tabular-nums">
                {formatCurrency(section.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </section>
  );
}

const ReportDocument = forwardRef<HTMLArticleElement, ReportDocumentProps>(
  function ReportDocument(
    {
      issuedAtLabel,
      report,
      textSize,
      formatCurrency,
      formatDate,
      getCategoryLabel,
      labels,
    },
    ref
  ) {
    const size = REPORT_TEXT_SIZE_CLASSES[textSize];

    return (
      <article
        ref={ref}
        className={cn(
          "report-document w-full rounded-sm border border-border shadow-sm",
          size.root
        )}
      >
        <header className="border-b border-border pb-6 mb-8">
          <p
            className={cn(
              "report-brand font-bold uppercase tracking-[0.2em] text-primary",
              size.brand
            )}
          >
            {labels.brand}
          </p>
          <h1
            className={cn(
              "mt-3 font-bold tracking-tight text-foreground",
              size.title
            )}
          >
            {labels.title}
          </h1>
          <p className={cn("mt-3 text-muted-foreground", size.meta)}>
            {labels.issuedAt}: {issuedAtLabel}
          </p>
        </header>

        <section className="mb-2">
          <h2
            className={cn(
              "font-bold uppercase tracking-[0.1em] text-foreground mb-5",
              size.sectionTitle
            )}
          >
            {labels.summary}
          </h2>
          <table className={cn("w-full border-collapse", size.summary)}>
            <tbody>
              <tr className="border-b border-border/60">
                <td className="py-4 font-medium text-amber-600">{labels.bills}</td>
                <td className="py-4 text-right font-bold tabular-nums text-amber-600">
                  {formatCurrency(report.billsTotal)}
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-4 font-medium text-emerald-600">{labels.income}</td>
                <td className="py-4 text-right font-bold tabular-nums text-emerald-600">
                  {formatCurrency(report.incomeTotal)}
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-4 font-medium text-red-600">{labels.expenses}</td>
                <td className="py-4 text-right font-bold tabular-nums text-red-600">
                  {formatCurrency(report.expenseTotal)}
                </td>
              </tr>
              <tr className="border-t-2 border-border">
                <td
                  className={cn(
                    "pt-5 font-bold text-foreground",
                    size.balance
                  )}
                >
                  {labels.balance}
                </td>
                <td
                  className={cn(
                    "pt-5 text-right font-bold tabular-nums",
                    size.balance,
                    report.balance >= 0 ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {formatCurrency(report.balance)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {report.sections.map((section) => (
          <ReportTable
            key={section.type}
            section={section}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getCategoryLabel={getCategoryLabel}
            labels={labels}
            textSize={textSize}
          />
        ))}
      </article>
    );
  }
);

export default ReportDocument;

export function formatReportDate(dateString: string, language: string) {
  const date = parseLocalDateInput(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
