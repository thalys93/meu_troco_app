
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/hooks/useFinanceData';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  showAll?: boolean;
}

const TransactionList = ({ transactions, title = "Recent Transactions", showAll = false }: TransactionListProps) => {
  const displayTransactions = showAll ? transactions : transactions.slice(0, 5);

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const formatted = `$${amount.toLocaleString()}`;
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayTransactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No transactions found
          </p>
        ) : (
          displayTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  transaction.type === 'income' ? "bg-emerald-500/20" : "bg-red-500/20"
                )}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {transaction.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>
              </div>
              <div className={cn(
                "font-semibold",
                transaction.type === 'income' ? "text-emerald-400" : "text-red-400"
              )}>
                {formatAmount(transaction.amount, transaction.type)}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
