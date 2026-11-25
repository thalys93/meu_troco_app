import { useQuery } from "@tanstack/react-query";
import { exchangeRateService } from "../utils/services/api/exchange-rate-service";

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
        staleTime: 5 * 60 * 1000,
        refetchInterval: 60 * 1000,
        placeholderData: (previousData) => previousData,
    });
};
