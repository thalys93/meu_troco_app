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
import { useCategories } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";

const EXPENSE_SLICE_COLORS = [
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#64748b",
  "#0d9488",
];

const BILL_SLICE_COLORS = [
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#fbbf24",
  "#fcd34d",
  "#92400e",
];

type ChartSlice = {
  sliceKey: string;
  category: string;
  label: string;
  total: number;
  fill: string;
  stroke: string;
  isBill: boolean;
};

type ExpenseByCategoryChartProps = {
  transactions: Transaction[];
};

export default function ExpenseByCategoryChart({
  transactions,
}: ExpenseByCategoryChartProps) {
  const { t, i18n } = useTranslation();
  const { getCategoryLabel } = useCategories();
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
    const grouped = new Map<string, { total: number; isBill: boolean; category: string }>();
    transactions
      .filter((item) => item.type === "despesa" || item.type === "conta")
      .forEach((item) => {
        const isBill = item.type === "conta";
        const sliceKey = `${item.category}::${item.type}`;
        const previous = grouped.get(sliceKey);
        grouped.set(sliceKey, {
          category: item.category,
          isBill,
          total: (previous?.total ?? 0) + item.value,
        });
      });

    let expenseColorIndex = 0;
    let billColorIndex = 0;

    return Array.from(grouped.entries())
      .map(([sliceKey, row]) => ({
        sliceKey,
        category: row.category,
        label: getCategoryLabel(row.category),
        total: Number(row.total.toFixed(2)),
        isBill: row.isBill,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6)
      .map((row) => {
        const fill = row.isBill
          ? BILL_SLICE_COLORS[billColorIndex++ % BILL_SLICE_COLORS.length]
          : EXPENSE_SLICE_COLORS[expenseColorIndex++ % EXPENSE_SLICE_COLORS.length];

        return {
          ...row,
          fill,
          stroke: "hsl(var(--background))",
        };
      });
  }, [transactions, getCategoryLabel]);

  const chartConfig = React.useMemo(() => {
    return data.reduce<Record<string, { label: string }>>((acc, item) => {
      acc[item.sliceKey] = { label: item.label };
      return acc;
    }, {});
  }, [data]);

  const topCategory = data[0];
  const chartRenderKey = React.useMemo(
    () =>
      data
        .map((item) => `${item.sliceKey}:${item.total}`)
        .join("|"),
    [data]
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

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">
          {t("dashboard.charts.expenseByCategory")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {topCategory ? (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <span>
                {t("dashboard.charts.topCategoryValue", {
                  category: topCategory.label,
                })}{" "}
                ({formatCurrency(topCategory.total)})
              </span>
              {renderTypeLabel(topCategory.isBill)}
            </span>
          ) : (
            t("dashboard.charts.noExpenseData")
          )}
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
            {t("dashboard.charts.noExpenseData")}
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <PieChart key={chartRenderKey}>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="label"
                      formatter={(value, _name, item) => {
                        const payload = item.payload as ChartSlice | undefined;
                        return (
                          <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                              <span>{String(payload?.label ?? _name)}</span>
                              {payload ? renderTypeLabel(payload.isBill) : null}
                            </span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {formatCurrency(Number(value))}
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="sliceKey"
                  innerRadius={56}
                  outerRadius={90}
                  paddingAngle={2}
                  strokeWidth={2}
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.map((item) => (
                <div
                  key={item.sliceKey}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-2 py-1 text-xs"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.fill }}
                    aria-hidden
                  />
                  <span className="text-foreground">{item.label}</span>
                  {renderTypeLabel(item.isBill)}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
