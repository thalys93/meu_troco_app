import React from 'react'
import PrivateLayout from '../../layout/PrivateLayout'
import TransactionList from '@/components/TransactionList'
import { useUserTransactions } from '@/utils/api/transation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardStats } from '@/hooks/use-dashboard'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategories } from '@/hooks/use-categories'
import { Calendar, Grid, Grid2X2, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function TransactionsPage() {
    const { data: transactions, isLoading } = useUserTransactions()
    const { incomeLength, expenseLength } = useDashboardStats()
    const { allCategories } = useCategories()
    const [startDate, setStartDate] = React.useState<string>('');
    const [endDate, setEndDate] = React.useState<string>('');
    const [selectedCategory, setSelectedCategory] = React.useState<string>('Todos')
    const { t } = useTranslation();

    const filteredTransactions = React.useMemo(() => {
        if (!transactions) return [];

        return transactions.filter((t) => {
            const transactionDate = new Date(t.date);

            const matchStartDate = startDate ? transactionDate >= new Date(startDate) : true;
            const matchEndDate = endDate ? transactionDate <= new Date(endDate) : true;

            const matchCategory =
                !selectedCategory || selectedCategory === 'Todos'
                    ? true
                    : t.category === selectedCategory;

            return matchStartDate && matchEndDate && matchCategory;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions, startDate, endDate, selectedCategory]);

    const getCategoryLabel = (category: string) => t(`categories.${category}`);

    return (
        <PrivateLayout>
            <div className="container mx-auto mt-8 mb-20 md:mt-12 md:mb-12 px-4 md:px-6 space-y-6">
                <Card className='glass-card'>
                    <CardHeader>
                        <CardTitle>{t('transactions.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn('grid grid-cols-2 md:grid-cols-2 gap-4 select-none', isLoading && "animate_pulse")}>
                            <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                                <p className="text-2xl font-bold text-emerald-400">{incomeLength}</p>
                                <p className="text-sm text-muted-foreground">{t('sidebar.income')}</p>
                            </div>
                            <div className="text-center p-4 bg-red-500/10 rounded-lg">
                                <p className="text-2xl font-bold text-red-400">{expenseLength}</p>
                                <p className="text-sm text-muted-foreground">{t('sidebar.expenses')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <TransactionList
                    transactions={filteredTransactions}
                    isLoading={isLoading}
                    title={t('transactionList.allHistory')}
                />

                <Card className='glass-card'>
                    <CardContent className='py-3'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-center'>
                            <div className='space-y-2'>
                                <Label className='flex flex-row gap-1 items-center'>
                                    <Calendar className='h-4' /> {t('filters.from')}
                                </Label>
                                <Input
                                    type='date'
                                    name='de'
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className='bg-background/50 h-10 border-input'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label className='flex flex-row gap-1 items-center'>
                                    <Calendar className='h-4' /> {t('filters.till')}
                                </Label>
                                <Input
                                    type='date'
                                    name='ate'
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className='bg-background/50 h-10 border-input'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label className='flex flex-row gap-1 items-center'><Tag className='h-4' /> {t('filters.categories')}</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className='h-10 bg-background/50'>
                                        <SelectValue placeholder={t('transactionForm.form.selectCategory')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allCategories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {getCategoryLabel(cat)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PrivateLayout>
    )
}

export default TransactionsPage