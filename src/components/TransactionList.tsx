import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Loader2, EllipsisVertical, Trash, Pen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction, useDeleteTransaction, useUserTransactions } from '@/utils/api/transation';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import DeleteDialog from './DeleteDialog';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  showAll?: boolean;
  isLoading: boolean
}

const TransactionList = ({ transactions, title = "Transações Recentes", showAll = false, isLoading }: TransactionListProps) => {
  const displayTransactions = showAll ? transactions : transactions?.slice(0, 5);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction>()

  const { mutate, isPending } = useDeleteTransaction()
  const { refetch } = useUserTransactions()

  const formatAmount = (amount: number, type: 'receita' | 'despesa') => {
    const formatted = `$${amount.toLocaleString()}`;
    return type === 'receita' ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = (id: string) => {
    mutate(id, {
      onSuccess: () => {
        toast({
          title: "Transação excluida",
          description: "Transação excluida com sucesso",
          variant: "destructive"
        })
        refetch()
      },
      onError: () => {
        toast({
          title: "Erro ao excluir transação",
          description: "Erro ao excluir transação",
          variant: "destructive"
        })
      }
    })
  }

  const handleOpenDialog = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, transaction: Transaction) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedTransaction(transaction)
  }

  const isPendingTransaction = (id: string) => {
    return isPending && selectedTransaction?.id === id
  }

  const isIncome = (type: string) => {
    switch (type) {
      case 'receita':
        return 'income'
      case 'despesa':
        return 'expense'
    }    
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className='flex items-center justify-center flex-col gap-2'>
            <Loader2 className='animate-spin' />
            <span className='text-muted-foreground text-sm select-none'>Aguarde Carregando</span>
          </div>
        ) : (
          <>
            {displayTransactions?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma transação encontrada
              </p>
            ) : (
              displayTransactions?.map((transaction) => (
                <div key={transaction?.id} className={cn("flex items-center justify-between p-3 rounded-lg hover:bg-accent/20 transition-colors", isPendingTransaction(transaction.id) && "pointer-events-none animate_pulse")}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      transaction.type === 'receita' ? "bg-emerald-500/20" : "bg-red-500/20"
                    )}>
                      {transaction.type === 'receita' ? (
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
                  <div className='flex flex-row gap-2 items-center'>
                    <div className={cn(
                      "font-semibold",
                      transaction.type === 'receita' ? "text-emerald-400" : "text-red-400"
                    )}>
                      {formatAmount(transaction.value, transaction.type)}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button size='icon' variant='ghost'>
                          <EllipsisVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel className='select-none'>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => handleOpenDialog(e, transaction)}>
                          <DeleteDialog
                            deleteFunction={() => handleDelete(selectedTransaction!.id)}
                            trigger={<div className='flex flex-row items-center gap-2'> <Trash className='h-4 w-4' /> Excluir</div>}
                            title="Excluir Transação"
                            description="Tem certeza que deseja excluir essa transação?"
                            itemDetails={selectedTransaction!}
                          />
                        </DropdownMenuItem>
                        <Link to={`/dashboard/${isIncome(transaction.type)}/${transaction.id}`}>
                          <DropdownMenuItem className='flex flex-row items-center gap-2'>
                            <Pen className='h-4 w-4' /> Editar
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
