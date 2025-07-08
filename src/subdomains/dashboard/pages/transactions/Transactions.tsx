import React from 'react'
import PrivateLayout from '../../layout/PrivateLayout'
import TransactionList from '@/components/TransactionList'
import { useUserTransactions } from '@/utils/api/transation'

function TransactionsPage() {
    const { data: transactions, isLoading } = useUserTransactions()

    return (
        <PrivateLayout>
            <div className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
                <TransactionList
                    transactions={transactions}
                    isLoading={isLoading}
                    title="Todas as Transações"
                    showAll={true}
                />
            </div>
        </PrivateLayout>
    )
}

export default TransactionsPage