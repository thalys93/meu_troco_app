import type { RankCriterionMetric } from '@/types/backoffice';

export type DefaultRankCriterionSeed = {
    metric: RankCriterionMetric;
    targetValue: number;
};

export type DefaultRankSeed = {
    slug: string;
    level: number;
    icon: string;
    color: string;
    minPoints: number;
    localized: {
        pt: { title: string; description: string };
        en: { title: string; description: string };
        es: { title: string; description: string };
    };
    criteria: DefaultRankCriterionSeed[];
};

export const DEFAULT_RANKS_SEED: DefaultRankSeed[] = [
    {
        slug: 'estagiario-excel',
        level: 1,
        icon: 'Laptop',
        color: '#94a3b8',
        minPoints: 0,
        localized: {
            pt: {
                title: 'Estagiário do Excel',
                description: 'Você entrou no mercado. Ainda não tem book, mas já abriu a planilha e registrou a primeira linha. Todo magnata começou copiando SUM.',
            },
            en: {
                title: 'Spreadsheet Intern',
                description: 'You joined the market. No deal flow yet, but you logged your first transaction. Every mogul started with cell A1.',
            },
            es: {
                title: 'Becario del Excel',
                description: 'Entraste al mercado. Aún no tienes cartera, pero abriste la hoja y registraste la primera línea. Todo magnate empezó con una SUMA.',
            },
        },
        criteria: [{ metric: 'transactions_count', targetValue: 5 }],
    },
    {
        slug: 'analista-troco',
        level: 2,
        icon: 'CircleDollarSign',
        color: '#64748b',
        minPoints: 50,
        localized: {
            pt: {
                title: 'Analista de Troco',
                description: 'Faz due diligence no próprio bolso. Sabe quanto entrou e saiu sem lançamento fora do guidance.',
            },
            en: {
                title: 'Personal Cash Analyst',
                description: 'You run due diligence on your own wallet. Every inflow and outflow tracked — nothing off the books.',
            },
            es: {
                title: 'Analista de Vueltos',
                description: 'Haces due diligence en tu propio bolsillo. Sabes qué entra y qué sale — nada fuera del cierre mensual.',
            },
        },
        criteria: [
            { metric: 'transactions_count', targetValue: 20 },
            { metric: 'income_months', targetValue: 1 },
        ],
    },
    {
        slug: 'operador-planilha',
        level: 3,
        icon: 'Briefcase',
        color: '#6366f1',
        minPoints: 150,
        localized: {
            pt: {
                title: 'Operador de Planilha',
                description: 'Montou o DRE caseiro: receita, despesa e conta fixa no lugar. Fechamento mensal sem susto no caixa.',
            },
            en: {
                title: 'Budget Operator',
                description: 'Built your home P&L: income, expenses, bills categorized. Month-end close without cash flow panic.',
            },
            es: {
                title: 'Operador de Hoja de Cálculo',
                description: 'Montaste tu PyG casero: ingresos, gastos y facturas fijas. Cierre de mes sin susto en caja.',
            },
        },
        criteria: [
            { metric: 'transactions_count', targetValue: 50 },
            { metric: 'wallets_count', targetValue: 1 },
        ],
    },
    {
        slug: 'caca-dividendo-cofrinho',
        level: 4,
        icon: 'TrendingUp',
        color: '#3b82f6',
        minPoints: 300,
        localized: {
            pt: {
                title: 'Caça-Dividendo do Cofrinho',
                description: 'Parou de deixar dinheiro parado e começou a pagar dividendos pra si mesmo. Yield emocional: positivo.',
            },
            en: {
                title: 'Dividend Hunter (Piggy Edition)',
                description: 'Stopped letting money sit idle and started paying yourself monthly. Passive income mindset, retail investor budget.',
            },
            es: {
                title: 'Cazador de Dividendos (Alcancía)',
                description: 'Dejaste de tener dinero muerto y empezaste a pagarte dividendos cada mes. Rentabilidad emocional: positiva.',
            },
        },
        criteria: [
            { metric: 'savings_total', targetValue: 500 },
            { metric: 'savings_streak_days', targetValue: 7 },
        ],
    },
    {
        slug: 'gestor-cpf',
        level: 5,
        icon: 'Shield',
        color: '#0ea5e9',
        minPoints: 500,
        localized: {
            pt: {
                title: 'Gestor do Próprio CPF',
                description: 'Visão 360: carteira, cartão e reserva no radar. Não administra fundo bilionário — administra o que importa.',
            },
            en: {
                title: 'CEO of Your Own Wallet',
                description: 'Full portfolio view: cards, wallets, savings in one dashboard. You don’t run a hedge fund — you run your life.',
            },
            es: {
                title: 'Gestor de Tu Propio DNI',
                description: 'Visión 360: carteras, tarjetas y reserva bajo control. No gestionas un fondo — gestionas lo que importa.',
            },
        },
        criteria: [
            { metric: 'wallets_count', targetValue: 2 },
            { metric: 'cards_count', targetValue: 1 },
            { metric: 'transactions_count', targetValue: 100 },
        ],
    },
    {
        slug: 'bear-market-survivor',
        level: 6,
        icon: 'Banknote',
        color: '#10b981',
        minPoints: 750,
        localized: {
            pt: {
                title: 'Bear Market Survivor',
                description: 'Passou por mês apertado sem estourar o orçamento. Segurou a posição e cortou o burn rate.',
            },
            en: {
                title: 'Bear Market Survivor',
                description: 'Survived a tight month without blowing the budget. Held the line, cut burn rate, no panic selling your dignity at 29.99% APR.',
            },
            es: {
                title: 'Sobreviviente del Bear Market',
                description: 'Pasaste un mes apretado sin reventar el presupuesto. Aguante la posición y bajaste el burn rate.',
            },
        },
        criteria: [{ metric: 'budget_adherence_days', targetValue: 14 }],
    },
    {
        slug: 'hodler-reserva',
        level: 7,
        icon: 'HandCoins',
        color: '#22c55e',
        minPoints: 1000,
        localized: {
            pt: {
                title: 'HODLer de Reserva',
                description: 'Reserva virou posição estrutural. Diamond hands no básico bem feito — não mexe no fundo por impulso.',
            },
            en: {
                title: 'Emergency Fund HODLer',
                description: 'Your safety net is no longer a someday goal. Diamond hands on the basics — impulse purchases denied.',
            },
            es: {
                title: 'HODLer de la Reserva',
                description: 'La reserva dejó de ser meta del año y pasó a ser posición estructural. Diamond hands en lo básico.',
            },
        },
        criteria: [
            { metric: 'savings_total', targetValue: 2000 },
            { metric: 'savings_streak_days', targetValue: 30 },
        ],
    },
    {
        slug: 'shark-orcamento',
        level: 8,
        icon: 'CreditCard',
        color: '#eab308',
        minPoints: 1500,
        localized: {
            pt: {
                title: 'Shark do Orçamento',
                description: 'Fecha o mês dentro do plano com frequência de quem bate guidance. O mercado oscila; seu orçamento não.',
            },
            en: {
                title: 'Budget Shark',
                description: 'You hit your monthly plan like earnings guidance. The market’s volatile; your spending isn’t.',
            },
            es: {
                title: 'Tiburón del Presupuesto',
                description: 'Cierras el mes dentro del plan como quien cumple guidance. El mercado oscila; tu presupuesto no.',
            },
        },
        criteria: [{ metric: 'budget_adherence_days', targetValue: 60 }],
    },
    {
        slug: 'head-financas-pessoais',
        level: 9,
        icon: 'Building2',
        color: '#f59e0b',
        minPoints: 2000,
        localized: {
            pt: {
                title: 'Head de Finanças Pessoais',
                description: 'Metas batidas, receita mapeada, despesas sob controle. O board aprova: você mesmo.',
            },
            en: {
                title: 'Head of Personal Finance',
                description: 'Goals crushed, income mapped, expenses under control. Board meeting approved: you, unanimously.',
            },
            es: {
                title: 'Head de Finanzas Personales',
                description: 'Metas cumplidas, ingresos mapeados, gastos bajo control. El consejo aprueba: tú mismo.',
            },
        },
        criteria: [
            { metric: 'goals_completed', targetValue: 3 },
            { metric: 'income_months', targetValue: 6 },
        ],
    },
    {
        slug: 'magnata-meu-troco',
        level: 10,
        icon: 'TrendingUp',
        color: '#d97706',
        minPoints: 3000,
        localized: {
            pt: {
                title: 'Magnata do Meu Troco',
                description: 'Patrimônio organizado, hábito sólido, visão de longo prazo. Stonks da vida real.',
            },
            en: {
                title: 'Meu Troco Mogul',
                description: 'Organized wealth, solid habits, long-term vision. You don’t need a corner office to master your cash flow. Real-life stonks.',
            },
            es: {
                title: 'Magnate de Meu Troco',
                description: 'Patrimonio ordenado, hábito sólido, visión a largo plazo. Stonks de la vida real.',
            },
        },
        criteria: [
            { metric: 'savings_total', targetValue: 10000 },
            { metric: 'goals_completed', targetValue: 5 },
            { metric: 'budget_adherence_days', targetValue: 90 },
        ],
    },
];
