import React from "react";
import { Pie, PieChart, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Transaction } from "@/utils/services/api/transation";
import { useTranslation } from "react-i18next";

const COLORS = [
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
];

type ExpenseByCategoryChartProps = {
  transactions: Transaction[];
};

export default function ExpenseByCategoryChart({
  transactions,
}: ExpenseByCategoryChartProps) {
  const { t } = useTranslation();

  const data = React.useMemo(() => {
    const grouped = new Map<string, number>();
    transactions
      .filter((item) => item.type === "despesa")
      .forEach((item) => {
        const previous = grouped.get(item.category) || 0;
        grouped.set(item.category, previous + item.value);
      });

    return Array.from(grouped.entries())
      .map(([category, total]) => ({
        category,
        label: t(`categories.${category}`, category),
        total: Number(total.toFixed(2)),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [transactions, t]);

  const chartConfig = React.useMemo(() => {
    return data.reduce<Record<string, { label: string; color: string }>>(
      (acc, item, index) => {
        acc[item.category] = {
          label: item.label,
          color: COLORS[index % COLORS.length],
        };
        return acc;
      },
      {}
    );
  }, [data]);

  const topCategory = data[0];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">
          {t("dashboard.charts.expenseByCategory")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {topCategory
            ? t("dashboard.charts.topCategoryValue", {
                category: topCategory.label,
              })
            : t("dashboard.charts.noExpenseData")}
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
            {t("dashboard.charts.noExpenseData")}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="category" />} />
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                innerRadius={56}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.category}
                    fill={COLORS[index % COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
