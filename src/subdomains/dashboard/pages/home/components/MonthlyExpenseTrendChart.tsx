import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Transaction } from "@/utils/services/api/transation";
import {
  parseMonthKey,
  shiftMonthKey,
} from "@/subdomains/dashboard/utils/month-range";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const EXPENSE_BAR_COLOR = "#ef4444";
const BILL_BAR_COLOR = "#f59e0b";

type MonthTrendRow = {
  month: string;
  label: string;
  expense: number;
  bill: number;
  total: number;
};

type MonthlyExpenseTrendChartProps = {
  transactions: Transaction[];
  selectedMonth: string;
};

export default function MonthlyExpenseTrendChart({
  transactions,
  selectedMonth,
}: MonthlyExpenseTrendChartProps) {
  const { t, i18n } = useTranslation();
  const currencyCode = React.useMemo(() => {
    if (i18n.language === "pt-BR") return "BRL";
    if (i18n.language === "es") return "EUR";
    return "USD";
  }, [i18n.language]);
  const formatCurrency = React.useCallback(
    (value: number) =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value),
    [currencyCode, i18n.language]
  );
  const formatCurrencyAxis = React.useCallback(
    (value: number) =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: currencyCode,
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value),
    [currencyCode, i18n.language]
  );

  const data = React.useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) =>
      shiftMonthKey(selectedMonth, index - 5)
    );

    return months.map((monthKey) => {
      const monthDate = parseMonthKey(monthKey);
      const label = new Intl.DateTimeFormat(i18n.language, {
        month: "short",
      }).format(monthDate);

      const monthTransactions = transactions.filter((item) =>
        item.date?.startsWith(monthKey)
      );

      const expense = monthTransactions
        .filter((item) => item.type === "despesa")
        .reduce((acc, item) => acc + item.value, 0);

      const bill = monthTransactions
        .filter((item) => item.type === "conta")
        .reduce((acc, item) => acc + item.value, 0);

      return {
        month: monthKey,
        label,
        expense: Number(expense.toFixed(2)),
        bill: Number(bill.toFixed(2)),
        total: Number((expense + bill).toFixed(2)),
      };
    });
  }, [i18n.language, selectedMonth, transactions]);

  const peakMonth = React.useMemo(
    () =>
      data.reduce<MonthTrendRow | undefined>(
        (best, row) => (!best || row.total > best.total ? row : best),
        undefined
      ),
    [data]
  );

  const hasData = data.some((item) => item.total > 0);

  const chartRenderKey = React.useMemo(
    () =>
      `${selectedMonth}-${data
        .map((item) => `${item.month}:${item.expense}:${item.bill}`)
        .join("|")}`,
    [data, selectedMonth]
  );

  const renderTypeLabel = (isBill: boolean, className?: string) => (
    <span
      className={cn(
        "text-[10px] font-medium",
        isBill
          ? "text-amber-700 dark:text-amber-300"
          : "text-red-700 dark:text-red-300",
        className
      )}
    >
      {isBill ? t("dashboard.charts.billBadge") : t("dashboard.charts.expenseBadge")}
    </span>
  );

  const renderLegendChip = (isBill: boolean, color: string) => (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2 py-1 text-xs">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {renderTypeLabel(isBill)}
    </div>
  );

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">
          {t("dashboard.charts.expenseTrend")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {peakMonth && peakMonth.total > 0 ? (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <span>
                {t("dashboard.charts.peakMonthValue", {
                  month: peakMonth.label,
                  total: formatCurrency(peakMonth.total),
                })}
              </span>
              {peakMonth.expense > 0 && renderTypeLabel(false)}
              {peakMonth.bill > 0 && renderTypeLabel(true)}
            </span>
          ) : (
            t("dashboard.charts.lastSixMonths")
          )}
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            {t("dashboard.charts.noExpenseData")}
          </div>
        ) : (
          <>
            <ChartContainer
              config={{
                expense: {
                  label: t("dashboard.charts.expenseBadge"),
                  color: EXPENSE_BAR_COLOR,
                },
                bill: {
                  label: t("dashboard.charts.billBadge"),
                  color: BILL_BAR_COLOR,
                },
              }}
              className="h-[260px] w-full"
            >
              <BarChart key={chartRenderKey} accessibilityLayer data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrencyAxis}
                />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;

                    const row = payload[0]?.payload as MonthTrendRow | undefined;
                    if (!row) return null;

                    const rows = [
                      { isBill: false, value: row.expense, color: EXPENSE_BAR_COLOR },
                      { isBill: true, value: row.bill, color: BILL_BAR_COLOR },
                    ].filter((entry) => entry.value > 0);

                    return (
                      <div className="grid min-w-[9rem] gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                        <div>
                          <p className="font-medium capitalize text-foreground">{label}</p>
                          <p className="font-mono font-semibold tabular-nums text-foreground">
                            {formatCurrency(row.total)}
                          </p>
                        </div>
                        {rows.length > 0 && (
                          <div className="grid gap-1 border-t border-border/50 pt-1">
                            {rows.map((entry) => (
                              <div
                                key={entry.isBill ? "bill" : "expense"}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                    aria-hidden
                                  />
                                  {renderTypeLabel(entry.isBill)}
                                </span>
                                <span className="font-mono font-medium tabular-nums text-foreground">
                                  {formatCurrency(entry.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="expense"
                  stackId="spending"
                  fill="var(--color-expense)"
                  maxBarSize={40}
                />
                <Bar
                  dataKey="bill"
                  stackId="spending"
                  fill="var(--color-bill)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
            <div className="mt-3 flex flex-wrap gap-2">
              {renderLegendChip(false, EXPENSE_BAR_COLOR)}
              {renderLegendChip(true, BILL_BAR_COLOR)}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
