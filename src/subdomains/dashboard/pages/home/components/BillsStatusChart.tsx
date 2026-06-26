import React from "react";
import { Pie, PieChart, Label } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Transaction } from "@/utils/services/api/transation";
import {
  isBillPaid,
  isBillPending,
} from "@/subdomains/dashboard/utils/transaction-filters";
import { useTranslation } from "react-i18next";

type BillsStatusChartProps = {
  transactions: Transaction[];
};

export default function BillsStatusChart({ transactions }: BillsStatusChartProps) {
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

  const bills = React.useMemo(
    () => transactions.filter((item) => item.type === "conta"),
    [transactions]
  );

  const paidBills = React.useMemo(
    () => bills.filter(isBillPaid),
    [bills]
  );

  const pendingBills = React.useMemo(
    () => bills.filter(isBillPending),
    [bills]
  );

  const paidTotal = React.useMemo(
    () => paidBills.reduce((acc, item) => acc + item.value, 0),
    [paidBills]
  );

  const pendingTotal = React.useMemo(
    () => pendingBills.reduce((acc, item) => acc + item.value, 0),
    [pendingBills]
  );

  const paidCount = paidBills.length;
  const pendingCount = pendingBills.length;

  const data = React.useMemo(() => {
    const slices = [];
    if (paidCount > 0) {
      slices.push({
        status: "paid",
        label: t("dashboard.billsChart.paid"),
        total: Number(paidTotal.toFixed(2)),
        fill: "#22c55e",
        stroke: "hsl(var(--background))",
      });
    }
    if (pendingCount > 0) {
      slices.push({
        status: "pending",
        label: t("dashboard.billsChart.pending"),
        total: Number(pendingTotal.toFixed(2)),
        fill: "#f59e0b",
        stroke: "hsl(var(--background))",
      });
    }
    return slices;
  }, [paidCount, paidTotal, pendingCount, pendingTotal, t]);

  const chartConfig = React.useMemo(
    () => ({
      paid: { label: t("dashboard.billsChart.paid"), color: "#22c55e" },
      pending: { label: t("dashboard.billsChart.pending"), color: "#f59e0b" },
    }),
    [t]
  );

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">
          {t("dashboard.billsChart.title")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {bills.length > 0
            ? t("dashboard.billsChart.summary", {
                paidCount,
                total: bills.length,
                pendingCount,
                pendingAmount: formatCurrency(pendingTotal),
              })
            : t("dashboard.billsChart.noData")}
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
            {t("dashboard.billsChart.noData")}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey="label"
                    formatter={(value, _name, item) => (
                      <div className="flex flex-1 items-center justify-between leading-none gap-1">
                        <span className="text-muted-foreground">
                          {String(item.payload?.label ?? _name)}:
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
                nameKey="label"
                innerRadius={64}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - 8}
                          className="fill-foreground text-lg font-bold"
                        >
                          {paidCount}/{bills.length}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 14}
                          className="fill-muted-foreground text-xs"
                        >
                          {t("dashboard.billsChart.paidShort")}
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
        {pendingCount > 0 && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t("dashboard.billsChart.pendingAmount", {
              amount: formatCurrency(pendingTotal),
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
