
export const useCategories = () => {

    const incomeCategories = [
        'Salário', 'Freelancer', 'Negócios', 'Investimentos', 'Trabalho Paralelo', 'Outro'
    ];

    const expenseCategories = [
        'Moradia', 'Alimentação', 'Transporte', 'Serviços', 'Saúde',
        'Entretenimento', 'Compras', 'Educação', 'Viagem', 'Outro'
    ];

    const allCategories = Array.from(new Set([...incomeCategories, ...expenseCategories, 'Todos']));

    return {
        incomeCategories,
        expenseCategories,
        allCategories
    }
}