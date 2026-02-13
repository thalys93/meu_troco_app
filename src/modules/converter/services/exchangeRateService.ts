import axios from "axios";

export interface ExchangeRateResponse {
    USDBRL: {
        code: string;
        codein: string;
        name: string;
        high: string;
        low: string;
        varBid: string;
        pctChange: string;
        bid: string;
        ask: string;
        timestamp: string;
        create_date: string;
    };
}

const AWESOME_API_URL = "https://economia.awesomeapi.com.br/last";

export const exchangeRateService = {
    getUsdBrlRate: async (): Promise<ExchangeRateResponse> => {
        const response = await axios.get<ExchangeRateResponse>(
            `${AWESOME_API_URL}/USD-BRL`
        );
        return response.data;
    },
};
