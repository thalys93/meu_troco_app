import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ArrowDownCircle, ArrowUpCircle, BriefcaseBusiness, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslation } from "react-i18next";
import { useDashboardPreferences } from "@/subdomains/dashboard/context/dashboard-preferences";
import { useWalletsStore } from "@/store/useWalletsStore";
import { useUserTransactions } from "@/utils/services/api/transation";
import { NO_WALLET_ID } from "@/constants/wallets";
import { resolveAllocations } from "@/utils/transaction-allocations";
import useUserStore from "@/store/UserStore";
import { computeWalletFlowRow, computeWalletIncome, computeWalletOutflow } from "@/utils/wallet-balance";

type WalletFlowRow = {
    walletId: string;
    walletName: string;
    walletColor: string;
    income: number;
    expense: number;
    net: number;
};

export function WalletsOverview() {
    const { t, i18n } = useTranslation();
    const { selectedMonth } = useDashboardPreferences();
    const { wallets, fetchWallets } = useWalletsStore();
    const { data: transactions = [] } = useUserTransactions();
    const { user } = useUserStore();

    React.useEffect(() => {
        if (user?.uid) {
            fetchWallets(user.uid);
        }
    }, [fetchWallets, user?.uid]);

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

    const monthLabel = React.useMemo(() => {
        const monthDate = new Date(`${selectedMonth}-01T00:00:00`);
        return new Intl.DateTimeFormat(i18n.language, {
            month: "long",
            year: "numeric",
        }).format(monthDate);
    }, [i18n.language, selectedMonth]);

    const monthTransactions = React.useMemo(
        () => transactions.filter((transaction) => transaction.date?.startsWith(selectedMonth)),
        [selectedMonth, transactions]
    );

    const macro = React.useMemo(() => {
        let income = 0;
        let expense = 0;
        let noWalletCount = 0;
        let noWalletValue = 0;

        for (const transaction of monthTransactions) {
            if (transaction.type === "receita") {
                income += transaction.value;
            } else {
                expense += transaction.value;
            }

            if ((transaction.walletId || NO_WALLET_ID) === NO_WALLET_ID) {
                noWalletCount += 1;
                noWalletValue += transaction.value;
            }
        }

        return {
            income,
            expense,
            net: income - expense,
            noWalletCount,
            noWalletValue,
        };
    }, [monthTransactions]);

    const walletFlowRows = React.useMemo<WalletFlowRow[]>(() => {
        const rows = wallets.map((wallet) => computeWalletFlowRow(wallet, transactions, selectedMonth));
        const noWalletIncome = computeWalletIncome(NO_WALLET_ID, transactions, selectedMonth);
        const noWalletExpense = computeWalletOutflow(NO_WALLET_ID, transactions, selectedMonth);
        rows.push({
            walletId: NO_WALLET_ID,
            walletName: t("wallets.noWallet", "Sem carteira"),
            walletColor: "#6b7280",
            income: noWalletIncome,
            expense: noWalletExpense,
            net: noWalletIncome - noWalletExpense,
        });

        return rows.sort((a, b) => {
            const moveA = a.income + a.expense;
            const moveB = b.income + b.expense;
            return moveB - moveA;
        });
    }, [selectedMonth, t, transactions, wallets]);

    const macroChartData = React.useMemo(
        () => [{ period: monthLabel, income: macro.income, expense: macro.expense }],
        [macro.expense, macro.income, monthLabel]
    );

    return (
        <section className="space-y-4">
            <Card className="border-none bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-zinc-100 shadow-xl">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="space-y-2">
                            <Badge className="bg-white/10 text-zinc-100 hover:bg-white/15">
                                {t("wallets.title", "Carteiras")}
                            </Badge>
                            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                {t("wallets.macroTitle", "Visão macro financeira")}
                            </h1>
                            <p className="text-sm text-zinc-300">
                                {t(
                                    "wallets.macroSubtitle",
                                    "Salário mensal, despesas e lançamentos sem carteira em um único painel."
                                )}
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-right">
                            <p className="text-xs uppercase tracking-wider text-zinc-400">
                                {t("dashboard.monthFilter.label", "Mês")}
                            </p>
                            <p className="text-sm font-medium capitalize">{monthLabel}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                {t("wallets.totalIncomeMonth", "Entrou no mês")}
                            </span>
                            <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(macro.income)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20 bg-red-500/5">
                    <CardContent className="p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                {t("wallets.totalExpenseMonth", "Saiu no mês")}
                            </span>
                            <ArrowDownCircle className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(macro.expense)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                {t("wallets.netResultMonth", "Resultado do mês")}
                            </span>
                            <Wallet className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xl font-semibold">
                            {formatCurrency(macro.net)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-500/20 bg-zinc-500/5">
                    <CardContent className="p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                {t("wallets.noWalletSectionTitle", "Sem carteira")}
                            </span>
                            <BriefcaseBusiness className="h-4 w-4 text-zinc-500" />
                        </div>
                        <p className="text-xl font-semibold">
                            {macro.noWalletCount}{" "}
                            <span className="text-sm font-normal text-muted-foreground">
                                {t("wallets.noWalletTransactions", "lançamentos")}
                            </span>
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {formatCurrency(macro.noWalletValue)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="xl:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg">
                            {t("wallets.macroChartTitle", "Salário x despesas do mês")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                income: { label: t("sidebar.income"), color: "#10b981" },
                                expense: { label: t("sidebar.expenses"), color: "#ef4444" },
                            }}
                            className="h-[250px] w-full"
                        >
                            <BarChart data={macroChartData} accessibilityLayer>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="period" tickLine={false} axisLine={false} hide />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) =>
                                        new Intl.NumberFormat(i18n.language, {
                                            notation: "compact",
                                            maximumFractionDigits: 1,
                                        }).format(Number(value))
                                    }
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => (
                                                <div className="flex w-full items-center justify-between gap-2">
                                                    <span className="text-muted-foreground">{String(name)}</span>
                                                    <span className="font-mono font-medium tabular-nums">
                                                        {formatCurrency(Number(value))}
                                                    </span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <Bar dataKey="income" fill="var(--color-income)" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="expense" fill="var(--color-expense)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg">
                            {t("wallets.walletFlowChartTitle", "Entradas e saídas por carteira")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                income: { label: t("sidebar.income"), color: "#22c55e" },
                                expense: { label: t("sidebar.expenses"), color: "#f97316" },
                            }}
                            className="h-[300px] w-full"
                        >
                            <BarChart data={walletFlowRows} layout="vertical" accessibilityLayer margin={{ left: 10, right: 10 }}>
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} />
                                <YAxis
                                    type="category"
                                    dataKey="walletName"
                                    tickLine={false}
                                    axisLine={false}
                                    width={110}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name, item) => (
                                                <div className="flex w-full items-center justify-between gap-2">
                                                    <span className="text-muted-foreground">{String(name)}</span>
                                                    <span className="font-mono font-medium tabular-nums">
                                                        {formatCurrency(Number(value))}
                                                    </span>
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{ backgroundColor: String(item.payload.walletColor) }}
                                                    />
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <Bar dataKey="income" fill="var(--color-income)" radius={[0, 6, 6, 0]} />
                                <Bar dataKey="expense" fill="var(--color-expense)" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
