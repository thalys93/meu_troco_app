import { Code, Rocket, MessageCircle } from 'lucide-react';
import type { LandingScreen } from './LandingScreenMockup';

export interface Bank {
    name: string;
    logo: string;
}

export interface TransactionType {
    id: string;
    labelKey: string;
}

export interface RecentTransaction {
    name: string;
    cat: string;
    price: string;
    dateKey: string;
    green?: boolean;
}

export interface BudgetItem {
    labelKey: string;
    icon: string;
    val: number;
}

export interface SecurityItem {
    titleKey: string;
    descKey: string;
    icon: any;
}

export const mockBanks: Bank[] = [
    { name: 'Nubank', logo: 'https://logodownload.org/wp-content/uploads/2019/08/nubank-logo-2.png' },
    { name: 'Inter', logo: 'https://raichu-uploads.s3.amazonaws.com/logo_inter_XNlYcp.png' },
    { name: 'Itaú', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBVX5cePnQ8Ro6l7hbukhRyGJmzmRDLyFKug&s' },
    { name: 'XP Investimentos', logo: 'https://uploads.spacemoney.com.br/2024/04/xp-investimentos.jpg' }
];

export const mockTransactionTypes: TransactionType[] = [
    { id: 'Income', labelKey: 'landing_v2.transactions.income' },
    { id: 'Expense', labelKey: 'landing_v2.transactions.expense' },
    { id: 'Transfer', labelKey: 'landing_v2.transactions.transfer' }
];

export const mockRecentTransactions: RecentTransaction[] = [
    { name: 'Apple Store', cat: 'Tech', price: '- $14.99', dateKey: 'landing_v2.transactions.today' },
    { name: 'Starbucks', cat: 'Cafe', price: '- $5.50', dateKey: 'landing_v2.transactions.today' },
    { name: 'Freelance Web', cat: 'Income', price: '+ $500.00', dateKey: 'landing_v2.transactions.yesterday', green: true },
];

export const mockBudgetItems: BudgetItem[] = [
    { labelKey: 'categories.Moradia', icon: '🏠', val: 75 },
    { labelKey: 'categories.Alimentação', icon: '🍕', val: 45 },
    { labelKey: 'categories.Entretenimento', icon: '🎨', val: 90 },
];



export const landingFeatures: {
    id: string;
    featureKey: string;
    screen: LandingScreen;
    reversed: boolean;
}[] = [
    { id: 'dashboard', featureKey: 'dashboard', screen: 'dashboard', reversed: false },
    { id: 'transacoes', featureKey: 'transactions', screen: 'transactions', reversed: true },
    { id: 'relatorios', featureKey: 'reports', screen: 'reports', reversed: false },
    { id: 'previsoes', featureKey: 'forecasts', screen: 'forecasts', reversed: true },
    { id: 'perfil', featureKey: 'profile', screen: 'profile', reversed: false },
];

export const mockSecurityItems: SecurityItem[] = [
    // { titleKey: 'landing_v2.security.f1_title', descKey: 'landing_v2.security.f1_desc', icon: Shield },
    // { titleKey: 'landing_v2.security.f2_title', descKey: 'landing_v2.security.f2_desc', icon: Lock },
    { titleKey: 'landing_v3.security.f3_title', descKey: 'landing_v3.security.f3_desc', icon: Code },
    { titleKey: 'landing_v3.security.f4_title', descKey: 'landing_v3.security.f4_desc', icon: Rocket },
    { titleKey: 'landing_v3.security.f5_title', descKey: 'landing_v3.security.f5_desc', icon: MessageCircle }
];