import { useUserTransactions } from "@/utils/services/api/transation"
import { useUser } from "./use-user";
import { useTranslation } from "react-i18next";
import { FirebaseTimestamp } from "@/types/Firebase";
import { useEffect } from "react";
import { useCardsStore } from "@/store/useCardsStore";
export const useDashboardStats = () => {
    const { data: transactions = [] } = useUserTransactions();
    const { user } = useUser();
    const { i18n } = useTranslation()
    const incomeTransactions = transactions.filter((t) => t.type === "receita");
    const expenseTransactions = transactions.filter((t) => t.type === "despesa");
    const userJoinedTime = user?.details?.createdAt;
    const getDaysSinceUserCreated = (timestamp?: FirebaseTimestamp) => {
        if (!timestamp) return null;

        const createdDate = new Date(timestamp.seconds * 1000);
        const now = new Date();

        const diffInMs = now.getTime() - createdDate.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        return diffInDays;
    };

    const incomeLength = incomeTransactions.length;
    const expenseLength = expenseTransactions.length;

    const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.value, 0);
    const totalExpense = expenseTransactions.reduce((acc, curr) => acc + curr.value, 0);

    const { selectTotalBalance, fetchCards, cards } = useCardsStore();

    useEffect(() => {
        if (user?.uid && cards.length === 0) {
            fetchCards(user.uid);
        }
    }, [user, cards.length, fetchCards]);

    const cardsTotal = selectTotalBalance();
    const totalBalance = cardsTotal;

    const totalMovimentado = totalIncome + totalExpense + Math.abs(cardsTotal);

    const incomePercentage = totalMovimentado > 0 ? (totalIncome / totalMovimentado) * 100 : 0;
    const expensePercentage = totalMovimentado > 0 ? (totalExpense / totalMovimentado) * 100 : 0;
    const totalBalancePercentage = totalMovimentado > 0 ? (totalBalance / totalMovimentado) * 100 : 0;

    const getCurrencySymbol = (locale: string) => {
        switch (locale) {
            case "pt-BR":
                return "R$";
            case "en-US":
                return "$";
            case "es":
                return "€";
            default:
                return "$";
        }
    };

    const formatCurrency = (amount: number) => `${getCurrencySymbol(i18n.language)} ${amount.toLocaleString(i18n.language, { minimumFractionDigits: 2 })}`;

    return {
        totalIncome,
        totalExpense,
        totalBalance,
        incomePercentage,
        expensePercentage,
        totalBalancePercentage,
        formatCurrency,
        isBalancePositive: totalBalance >= 0,
        isIncomePositive: totalIncome >= 0,
        isExpensePositive: totalExpense >= 0,
        incomeLength,
        expenseLength,
        userJoinedTime,
        getDaysSinceUserCreated
    };
}