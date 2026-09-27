import HistoricalChart from '@/components/HistoricalChart';
import InfoCard from '@/components/InfoCard';
import ReusableTable from '@/components/ReusableTable';
import type { HistoricalMetric } from '@/types/historical-metric.types';
import type { ReusableTableColumn, TableCellTone } from '@/types/reusable-table.types';
import type { StockoutForecastTone, UsageForecast } from '@/types/usage-history.types';
import styles from './style.module.css';

const productVelocityData: HistoricalMetric[] = [
    { date: '2026-09-14', value: 18 },
    { date: '2026-09-15', value: 24 },
    { date: '2026-09-16', value: 21 },
    { date: '2026-09-17', value: 29 },
    { date: '2026-09-18', value: 33 },
    { date: '2026-09-19', value: 41 },
    { date: '2026-09-20', value: 27 },
];

const weeklySeasonalityData: HistoricalMetric[] = [
    { date: '2026-09-14', value: 64 },
    { date: '2026-09-15', value: 68 },
    { date: '2026-09-16', value: 72 },
    { date: '2026-09-17', value: 76 },
    { date: '2026-09-18', value: 91 },
    { date: '2026-09-19', value: 118 },
    { date: '2026-09-20', value: 83 },
];

const forecastTones: Record<StockoutForecastTone, TableCellTone> = {
    Seguro: 'success',
    Atenção: 'warning',
    'Ruptura provável': 'danger',
};

const forecastColumns: ReusableTableColumn<UsageForecast>[] = [
    { id: 'product', header: 'Produto', renderCell: (item) => item.product },
    { id: 'stockAndShelf', header: 'Estoque + gôndola', renderCell: (item) => item.stockAndShelf, align: 'center' },
    { id: 'dailyOutput', header: 'Saída', renderCell: (item) => item.dailyOutput, align: 'center' },
    { id: 'coverage', header: 'Cobertura', renderCell: (item) => item.coverage, align: 'center' },
    {
        id: 'forecast',
        header: 'Previsão de ruptura',
        renderCell: (item) => item.forecast,
        display: 'badge',
        tone: (item) => forecastTones[item.forecastTone],
        align: 'center',
    },
    { id: 'purchaseSuggestion', header: 'Sugestão de compra', renderCell: (item) => item.purchaseSuggestion, align: 'center' },
];

const forecastData: UsageForecast[] = [
    { id: 'forecast-01', product: 'Leite Integral 1L', stockAndShelf: '22 un', dailyOutput: '3 un/dia', coverage: '7 dias', forecast: '26/09', forecastTone: 'Atenção', purchaseSuggestion: '40 un' },
    { id: 'forecast-02', product: 'Iogurte Natural 1L', stockAndShelf: '36 un', dailyOutput: '4 un/dia', coverage: '9 dias', forecast: 'Seguro', forecastTone: 'Seguro', purchaseSuggestion: '24 un' },
    { id: 'forecast-03', product: 'Queijo Minas 500g', stockAndShelf: '18 un', dailyOutput: '3 un/dia', coverage: '6 dias', forecast: '25/09', forecastTone: 'Atenção', purchaseSuggestion: '30 un' },
    { id: 'forecast-04', product: 'Manteiga 200g', stockAndShelf: '8 un', dailyOutput: '4 un/dia', coverage: '2 dias', forecast: '22/09', forecastTone: 'Ruptura provável', purchaseSuggestion: '36 un' },
    { id: 'forecast-05', product: 'Creme de Leite 200g', stockAndShelf: '12 un', dailyOutput: '5 un/dia', coverage: '2,4 dias', forecast: '22/09', forecastTone: 'Ruptura provável', purchaseSuggestion: '48 un' },
    { id: 'forecast-06', product: 'Requeijão 200g', stockAndShelf: '7 un', dailyOutput: '5 un/dia', coverage: '1,4 dias', forecast: '21/09', forecastTone: 'Ruptura provável', purchaseSuggestion: '40 un' },
];

function UsageHistory() {
    return (
        <section className={styles.page} aria-labelledby="usage-history-title">
            <h1 className={styles['sr-only']} id="usage-history-title">Hábitos de consumo</h1>

            <div className={styles.cards}>
                <InfoCard title="Produto mais vendido" value={<span className={styles['card-value']}>Leite Integral 1L</span>} footer="142 un./semana" />
                <InfoCard title="Produto mais desperdiçado" value={<span className={styles['card-value']}>Iogurte 1L</span>} footer="R$ 1.458 perdidos/mês" tone="danger" />
                <InfoCard title="Categoria de maior saída" value={<span className={styles['card-value']}>Laticínios</span>} footer="38% do faturamento" />
                <InfoCard title="Sazonalidade detectada" value={<span className={styles['card-value']}>Sábado</span>} footer="Pico de vendas (+45%)" />
            </div>

            <div className={styles.charts}>
                <HistoricalChart compact data={productVelocityData} title="Velocidade de saída por produto" description="Unidades vendidas por dia" period="7 dias" datasetLabel="Unidades vendidas" ariaLabel="Gráfico de linha da velocidade de saída de produtos nos últimos sete dias" />
                <HistoricalChart compact data={weeklySeasonalityData} title="Sazonalidade – vendas por dia da semana" description="Comparação do volume diário de vendas" period="7 dias" datasetLabel="Volume de vendas" ariaLabel="Gráfico de linha do volume de vendas por dia da semana" />
            </div>

            <div className={styles.table}>
                <ReusableTable title="Previsões de rupturas – próximos 7 dias" columns={forecastColumns} data={forecastData} rowKey={(item) => item.id} />
            </div>
        </section>
    );
}

export default UsageHistory;
