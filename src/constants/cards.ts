/** ID usado em transações para "Sem Cartão (Bolso)" — não corresponde a documento no Firebase. */
export const NO_CARD_ID = 'no_card';

/** Nome do cartão virtual Bolso (usado para filtrar cartões legados da lista "Meus cartões"). */
export const POCKET_CARD_NAME = 'Sem Cartão (Bolso)';

export function isPocketCardId(cardId: string | undefined): boolean {
    return !cardId || cardId === NO_CARD_ID;
}
