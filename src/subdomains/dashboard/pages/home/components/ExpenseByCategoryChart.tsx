import React from "react";
import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Transaction } from "@/utils/services/api/transation";
import { useTranslation } from "react-i18next";

/** Cores explícitas por fatia — `fill` vai nos dados do Pie (Recharts mescla no setor). */
const SLICE_COLORS = [
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#64748b",
  "#0d9488",
];

type ExpenseByCategoryChartProps = {
  transactions: Transaction[];
};

export default function ExpenseByCategoryChart({
  transactions,
}: ExpenseByCategoryChartProps) {
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
      .slice(0, 6)
      .map((row, index) => ({
        ...row,
        /** Obrigatório no próprio `data`: `Cell` nem sempre repassa `fill` corretamente para todos os setores. */
        fill: SLICE_COLORS[index % SLICE_COLORS.length],
        stroke: "hsl(var(--background))",
      }));
  }, [transactions, t]);

  /** Só `label`: chaves com espaço/acento (ex. "Fatura Cartão") geram `--color-…` inválido no ChartStyle. */
  const chartConfig = React.useMemo(() => {
    return data.reduce<Record<string, { label: string }>>((acc, item) => {
      acc[item.category] = { label: item.label };
      return acc;
    }, {});
  }, [data]);

  const topCategory = data[0];
  const chartRenderKey = React.useMemo(
    () =>
      data
        .map((item) => `${item.category}:${item.total}`)
        .join("|"),
    [data]
  );

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">
          {t("dashboard.charts.expenseByCategory")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {topCategory
            ? `${t("dashboard.charts.topCategoryValue", {
                category: topCategory.label,
              })} (${formatCurrency(topCategory.total)})`
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
            <PieChart key={chartRenderKey}>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="category"
                    formatter={(value, name) => (
                      <div className="flex flex-1 items-center justify-between leading-none gap-1">
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
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                innerRadius={56}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={2}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
