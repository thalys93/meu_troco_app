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
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
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
