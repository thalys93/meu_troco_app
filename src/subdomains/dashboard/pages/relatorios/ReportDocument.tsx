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
    title: "text-amber-700",
    border: "border-amber-300",
    value: "text-amber-700",
    headerBg: "bg-amber-50",
  },
  receita: {
    title: "text-emerald-700",
    border: "border-emerald-300",
    value: "text-emerald-700",
    headerBg: "bg-emerald-50",
  },
  despesa: {
    title: "text-red-700",
    border: "border-red-300",
    value: "text-red-700",
    headerBg: "bg-red-50",
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
        <p className={cn("text-neutral-500 py-5", size.empty)}>{labels.empty}</p>
      ) : (
        <table className={cn("w-full border-collapse", size.table)}>
          <thead>
            <tr
              className={cn(
                "text-left text-neutral-700 border-b border-neutral-200",
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
                  className="border-b border-neutral-100 text-neutral-900"
                >
                  <td className="py-4 pr-4 whitespace-nowrap align-top">
                    {formatDate(item.date)}
                  </td>
                  <td
                    className={cn(
                      "py-4 pr-4 align-top",
                      skipped && "text-red-700"
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
                        skipped && "text-red-700",
                        !skipped && isBillPaid(item) && "text-emerald-700",
                        !skipped && !isBillPaid(item) && "text-amber-700"
                      )}
                    >
                      {billStatusLabel(item, labels)}
                    </td>
                  )}
                  <td
                    className={cn(
                      "py-4 text-right whitespace-nowrap tabular-nums align-top font-semibold",
                      skipped ? "text-red-700" : theme.value
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
          "report-document w-full bg-white text-neutral-900 rounded-sm border border-neutral-200 shadow-sm",
          size.root
        )}
      >
        <header className="border-b border-neutral-300 pb-6 mb-8">
          <p
            className={cn(
              "report-brand font-bold uppercase tracking-[0.2em] text-emerald-700",
              size.brand
            )}
          >
            {labels.brand}
          </p>
          <h1
            className={cn(
              "mt-3 font-bold tracking-tight text-neutral-950",
              size.title
            )}
          >
            {labels.title}
          </h1>
          <p className={cn("mt-3 text-neutral-600", size.meta)}>
            {labels.issuedAt}: {issuedAtLabel}
          </p>
        </header>

        <section className="mb-2">
          <h2
            className={cn(
              "font-bold uppercase tracking-[0.1em] text-neutral-800 mb-5",
              size.sectionTitle
            )}
          >
            {labels.summary}
          </h2>
          <table className={cn("w-full border-collapse", size.summary)}>
            <tbody>
              <tr className="border-b border-neutral-100">
                <td className="py-4 font-medium text-amber-700">{labels.bills}</td>
                <td className="py-4 text-right font-bold tabular-nums text-amber-700">
                  {formatCurrency(report.billsTotal)}
                </td>
              </tr>
              <tr className="border-b border-neutral-100">
                <td className="py-4 font-medium text-emerald-700">{labels.income}</td>
                <td className="py-4 text-right font-bold tabular-nums text-emerald-700">
                  {formatCurrency(report.incomeTotal)}
                </td>
              </tr>
              <tr className="border-b border-neutral-100">
                <td className="py-4 font-medium text-red-700">{labels.expenses}</td>
                <td className="py-4 text-right font-bold tabular-nums text-red-700">
                  {formatCurrency(report.expenseTotal)}
                </td>
              </tr>
              <tr className="border-t-2 border-neutral-300">
                <td
                  className={cn(
                    "pt-5 font-bold text-neutral-900",
                    size.balance
                  )}
                >
                  {labels.balance}
                </td>
                <td
                  className={cn(
                    "pt-5 text-right font-bold tabular-nums",
                    size.balance,
                    report.balance >= 0 ? "text-emerald-700" : "text-red-700"
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
