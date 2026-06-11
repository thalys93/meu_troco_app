import type { CategoryTransactionType } from '@/types/Category';

export type DefaultCategorySeed = {
    legacyKey: string;
    type: CategoryTransactionType;
    icon: string;
    order: number;
    labels: { pt: string; en: string; es: string };
    showInBothTypes?: boolean;
};

export const DEFAULT_CATEGORIES_SEED: DefaultCategorySeed[] = [
    { legacyKey: 'Salário', type: 'receita', icon: 'Banknote', order: 0, labels: { pt: 'Salário', en: 'Salary', es: 'Salario' } },
    { legacyKey: 'Freelancer', type: 'receita', icon: 'Laptop', order: 1, labels: { pt: 'Freelancer', en: 'Freelancer', es: 'Freelancer' } },
    { legacyKey: 'Negócios', type: 'receita', icon: 'Briefcase', order: 2, labels: { pt: 'Negócios', en: 'Business', es: 'Negocios' } },
    { legacyKey: 'Investimentos', type: 'receita', icon: 'TrendingUp', order: 3, labels: { pt: 'Investimentos', en: 'Investments', es: 'Inversiones' } },
    { legacyKey: 'Trabalho Paralelo', type: 'receita', icon: 'Clock', order: 4, labels: { pt: 'Trabalho Paralelo', en: 'Side Job', es: 'Trabajo Adicional' } },
    { legacyKey: 'Outro', type: 'receita', icon: 'CircleDollarSign', order: 5, labels: { pt: 'Outro', en: 'Other', es: 'Otro' }, showInBothTypes: true },
    { legacyKey: 'Moradia', type: 'despesa', icon: 'Home', order: 10, labels: { pt: 'Moradia', en: 'Housing', es: 'Vivienda' } },
    { legacyKey: 'Alimentação', type: 'despesa', icon: 'UtensilsCrossed', order: 11, labels: { pt: 'Alimentação', en: 'Food', es: 'Alimentación' } },
    { legacyKey: 'Transporte', type: 'despesa', icon: 'Car', order: 12, labels: { pt: 'Transporte', en: 'Transport', es: 'Transporte' } },
    { legacyKey: 'Serviços', type: 'despesa', icon: 'Wrench', order: 13, labels: { pt: 'Serviços', en: 'Utilities', es: 'Servicios' } },
    { legacyKey: 'Saúde', type: 'despesa', icon: 'Heart', order: 14, labels: { pt: 'Saúde', en: 'Health', es: 'Salud' } },
    { legacyKey: 'Entretenimento', type: 'despesa', icon: 'Gamepad2', order: 15, labels: { pt: 'Entretenimento', en: 'Entertainment', es: 'Entretenimiento' } },
    { legacyKey: 'Compras', type: 'despesa', icon: 'ShoppingCart', order: 16, labels: { pt: 'Compras', en: 'Shopping', es: 'Compras' } },
    { legacyKey: 'Educação', type: 'despesa', icon: 'GraduationCap', order: 17, labels: { pt: 'Educação', en: 'Education', es: 'Educación' } },
    { legacyKey: 'Viagem', type: 'despesa', icon: 'Plane', order: 18, labels: { pt: 'Viagem', en: 'Travel', es: 'Viaje' } },
    { legacyKey: 'Empréstimo', type: 'despesa', icon: 'HandCoins', order: 19, labels: { pt: 'Empréstimo', en: 'Loan', es: 'Préstamo' } },
    { legacyKey: 'Fatura Cartão', type: 'despesa', icon: 'CreditCard', order: 20, labels: { pt: 'Fatura Cartão', en: 'Credit card bill', es: 'Factura de tarjeta' } },
    { legacyKey: 'Aluguel', type: 'conta', icon: 'Home', order: 30, labels: { pt: 'Aluguel', en: 'Rent', es: 'Alquiler' } },
    { legacyKey: 'Luz', type: 'conta', icon: 'Zap', order: 31, labels: { pt: 'Luz', en: 'Electricity', es: 'Luz' } },
    { legacyKey: 'Água', type: 'conta', icon: 'Droplets', order: 32, labels: { pt: 'Água', en: 'Water', es: 'Agua' } },
    { legacyKey: 'Internet', type: 'conta', icon: 'Wifi', order: 33, labels: { pt: 'Internet', en: 'Internet', es: 'Internet' } },
    { legacyKey: 'Gás', type: 'conta', icon: 'Flame', order: 34, labels: { pt: 'Gás', en: 'Gas', es: 'Gas' } },
    { legacyKey: 'Condomínio', type: 'conta', icon: 'Building2', order: 35, labels: { pt: 'Condomínio', en: 'Condo fee', es: 'Condominio' } },
    { legacyKey: 'Telefone', type: 'conta', icon: 'Phone', order: 36, labels: { pt: 'Telefone', en: 'Phone', es: 'Teléfono' } },
    { legacyKey: 'Seguro', type: 'conta', icon: 'Shield', order: 37, labels: { pt: 'Seguro', en: 'Insurance', es: 'Seguro' } },
];
