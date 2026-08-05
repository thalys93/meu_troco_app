export type RecurrenceType = 'conta' | 'despesa';

export type RecurrenceAllocation = {
  walletId: string;
  amount: number;
};

export interface Recurrence {
  id?: string;
  description: string;
  category: string;
  type: RecurrenceType;
  estimatedValue: number;
  walletId: string;
  allocations?: RecurrenceAllocation[];
  dueDay?: number;
  lastGeneratedMonth?: string;
  createdAt?: Date;
}
