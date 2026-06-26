export type RecurrenceType = 'conta' | 'despesa';

export interface Recurrence {
  id?: string;
  description: string;
  category: string;
  type: RecurrenceType;
  estimatedValue: number;
  walletId: string;
  dueDay?: number;
  lastGeneratedMonth?: string;
  createdAt?: Date;
}
