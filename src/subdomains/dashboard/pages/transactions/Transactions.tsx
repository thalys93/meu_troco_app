import React from 'react'
import { motion } from 'framer-motion'
import PrivateLayout from '../../layout/PrivateLayout'
import TransactionList from '@/components/TransactionList'
import { useUserTransactions } from '@/utils/services/api/transation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useDashboardStats } from '@/hooks/use-dashboard'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

function TransactionsPage() {
    const { data: transactions, isLoading } = useUserTransactions()
    const {
        incomeLength,
        expenseLength,
        totalIncome,
        totalExpense,
        formatCurrency
    } = useDashboardStats()
    const { t } = useTranslation();

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <PrivateLayout>
            <div className="container mx-auto max-w-5xl mt-8 mb-20 md:mt-12 md:mb-12 px-4 md:px-6 space-y-8">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <Card className='glass-card border-none shadow-sm bg-background/60 backdrop-blur-xl'>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-semibold tracking-tight">{t('transactions.title')}</CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground mt-1">
                                        {t('transactionList.allHistory')}
                                    </CardDescription>
                                </div>
                                <div className="p-2 bg-muted/50 rounded-full">
                                    <Activity className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4 select-none', isLoading && "animate-pulse")}>
                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/10 p-6 transition-colors hover:bg-emerald-500/15"
                                >
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">{t('sidebar.income')}</p>
                                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(totalIncome)}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                            <TrendingUp className="h-6 w-6 text-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                                        <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full mr-2 font-medium">
                                            {incomeLength}
                                        </span>
                                        {t('filters.items', { defaultValue: 'transações' })}
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/5 to-red-500/10 border border-red-500/10 p-6 transition-colors hover:bg-red-500/15"
                                >
                                    <div className="flex items-center justify-between space-x-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">{t('sidebar.expenses')}</p>
                                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {formatCurrency(totalExpense)}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                            <TrendingDown className="h-6 w-6 text-red-500" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                                        <span className="bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full mr-2 font-medium">
                                            {expenseLength}
                                        </span>
                                        {t('filters.items', { defaultValue: 'transações' })}
                                    </div>
                                </motion.div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <TransactionList
                    transactions={transactions || []}
                    isLoading={isLoading}
                    title={t('transactionList.allHistory')}
                    scrollClassName="max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-320px)] overflow-auto"
                />
            </div>
        </PrivateLayout>
    )
}

export default TransactionsPage
