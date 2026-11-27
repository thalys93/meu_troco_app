import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Wallet } from "../../../../../types/Wallet";
import { useUserTransactions } from "@/utils/services/api/transation";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp, ArrowLeft } from "lucide-react";
import {
    calculateStatementAmount,
    calculateNextMonthStatement,
    getStatementDueDate,
    getStatementHistory,
    filterTransactionsByStatement,
    type StatementSummary,
} from "../utils/credit-card-statement";
import { useDashboardPreferences } from "@/subdomains/dashboard/context/dashboard-preferences";

interface CreditCardStatementDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    wallet: Wallet | null;
}

export function CreditCardStatementDetails({
    open,
    onOpenChange,
    wallet,
}: CreditCardStatementDetailsProps) {
    const { t, i18n } = useTranslation();
    const { selectedMonth } = useDashboardPreferences();
    const { data: allTransactions = [] } = useUserTransactions();

    const formatCurrencyValue = (amount: number) => {
        return new Intl.NumberFormat(i18n.language, {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat(i18n.language, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    };

    const formatMonthKey = (monthKey: string) => {
        const [year, month] = monthKey.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return new Intl.DateTimeFormat(i18n.language, {
            month: "long",
            year: "numeric",
        }).format(date);
    };

    const statementData = useMemo(() => {
        if (!wallet || wallet.type !== "credit") return null;

        const currentStatement = calculateStatementAmount(wallet, allTransactions, selectedMonth);
        const nextMonthStatement = calculateNextMonthStatement(wallet, allTransactions, selectedMonth);
        const dueDate = getStatementDueDate(wallet, selectedMonth);
        const statementTransactions = filterTransactionsByStatement(
            allTransactions,
            wallet.id,
            selectedMonth,
            wallet.billingClosingDay ?? 1
        );
        const history = getStatementHistory(wallet, allTransactions, selectedMonth, 6);

        return {
            currentStatement,
            nextMonthStatement,
            dueDate,
            statementTransactions,
            history,
        };
    }, [wallet, allTransactions, selectedMonth]);

    if (!wallet || !statementData) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{wallet.name}</SheetTitle>
                    <SheetDescription>
                        {t("wallets.statementDetails", "Detalhes da fatura")}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Current Statement */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                {t("wallets.currentStatement")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {t("wallets.statementDueDate")}
                                </span>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(statementData.dueDate)}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {t("wallets.currentStatement")}
                                </span>
                                <span className="text-2xl font-bold">
                                    {formatCurrencyValue(statementData.currentStatement)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {t("wallets.nextMonthStatement")}
                                </span>
                                <span className="text-lg font-semibold">
                                    {formatCurrencyValue(statementData.nextMonthStatement)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statement Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                {t("navigation.transactions", { defaultValue: "Transações" })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statementData.statementTransactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    {t("transactionList.empty", { defaultValue: "Nenhuma transação nesta fatura" })}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {statementData.statementTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between py-2 border-b last:border-0"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{transaction.description}</p>
                                                <p className="text-xs text-muted-foreground">{transaction.date}</p>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {formatCurrencyValue(transaction.value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statement History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {t("wallets.statementHistory")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {statementData.history.map((item) => (
                                    <div
                                        key={item.monthKey}
                                        className="flex items-center justify-between py-2 border-b last:border-0"
                                    >
                                        <span className="text-sm">{formatMonthKey(item.monthKey)}</span>
                                        <div className="text-right">
                                            <span className="text-sm font-semibold block">
                                                {formatCurrencyValue(item.amount)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {item.transactionCount} {t("filters.items", { defaultValue: "transações" })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Close Button */}
                    <Button onClick={() => onOpenChange(false)} className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t("legal.close", { defaultValue: "Fechar" })}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
