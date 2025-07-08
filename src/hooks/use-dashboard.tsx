import { useUserTransactions } from "@/utils/api/transation"
export const useDashboardStats = () => {
    const {data: transactions = []} = useUserTransactions();
    const incomeTransactions = transactions.filter((t) => t.type === "receita");
    const expenseTransactions = transactions.filter((t) => t.type === "despesa");

    const incomeLength = incomeTransactions.length;
    const expenseLength = expenseTransactions.length;

    const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.value, 0);
    const totalExpense = expenseTransactions.reduce((acc, curr) => acc + curr.value, 0);
    const totalBalance = totalIncome - totalExpense;
    const totalMovimentado = totalIncome + totalExpense;

    const incomePercentage = totalMovimentado > 0 ? (totalIncome / totalMovimentado) * 100 : 0;
    const expensePercentage = totalMovimentado > 0 ? (totalExpense / totalMovimentado) * 100 : 0;
    const totalBalancePercentage = totalMovimentado > 0 ? (totalBalance / totalMovimentado) * 100 : 0;

    const formatCurrency = (amount: number) =>
        `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

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
        expenseLength        
    };
}