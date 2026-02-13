import { useQuery } from "@tanstack/react-query";
import { exchangeRateService } from "../services/exchangeRateService";

export const useExchangeRate = () => {
    return useQuery({
        queryKey: ["exchangeRate", "USD-BRL"],
        queryFn: async () => {
            const data = await exchangeRateService.getUsdBrlRate();
            const rate = data.USDBRL;

            return {
                bid: parseFloat(rate.bid),
                ask: parseFloat(rate.ask),
                high: parseFloat(rate.high),
                low: parseFloat(rate.low),
                pctChange: parseFloat(rate.pctChange),
                createDate: rate.create_date,
                name: rate.name
            };
        },
        // Otimização: manter os dados frescos por 5 minutos
        staleTime: 5 * 60 * 1000,
        // Atualizar em background a cada 1 minuto se a janela estiver focada
        refetchInterval: 60 * 1000,
        // Garantir que temos dados iniciais sensatos enquanto carrega (fallback opcional)
        placeholderData: (previousData) => previousData,
    });
};
