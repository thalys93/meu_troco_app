import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Transaction } from "@/utils/services/api/transation";
import {
  parseMonthKey,
  shiftMonthKey,
} from "@/subdomains/dashboard/utils/month-range";
import { useTranslation } from "react-i18next";

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

      const total = transactions
        .filter((item) => item.type === "despesa")
        .filter((item) => item.date?.startsWith(monthKey))
        .reduce((acc, item) => acc + item.value, 0);

      return {
        month: monthKey,
        label,
        total: Number(total.toFixed(2)),
      };
    });
  }, [i18n.language, selectedMonth, transactions]);

  const maxExpense = React.useMemo(
    () => Math.max(...data.map((item) => item.total), 0),
    [data]
  );
  const chartRenderKey = React.useMemo(
    () =>
      `${selectedMonth}-${data
        .map((item) => `${item.month}:${item.total}`)
        .join("|")}`,
    [data, selectedMonth]
  );

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">
          {t("dashboard.charts.expenseTrend")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("dashboard.charts.lastSixMonths")}
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            total: {
              label: t("sidebar.expenses"),
              color: "hsl(var(--primary))",
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
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex flex-1 items-center justify-between leading-none">
                      
                      <span className="text-muted-foreground">
                        {String(name)}:
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {formatCurrency(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="total"
              radius={[8, 8, 0, 0]}
              fill="var(--color-total)"
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
        {maxExpense === 0 && (
          <p className="text-sm text-muted-foreground text-center pt-4">
            {t("dashboard.charts.noExpenseData")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
