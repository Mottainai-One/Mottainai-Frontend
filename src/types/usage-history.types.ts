export type StockoutForecastTone = 'Seguro' | 'Atenção' | 'Ruptura provável';

export interface UsageForecast {
    id: string;
    product: string;
    stockAndShelf: string;
    dailyOutput: string;
    coverage: string;
    forecast: string;
    forecastTone: StockoutForecastTone;
    purchaseSuggestion: string;
}
