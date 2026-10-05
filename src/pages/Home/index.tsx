import { useEffect, useState } from 'react';
import DonutChart from '@/components/DonutChart';
import InfoCard from "@/components/InfoCard"
import HistoricalChart from '@/components/HistoricalChart';
import Ranking from '@/components/Ranking';
import { products } from '@/data/products';
import { wastedItemsByCategory } from '@/data/wastedItemsByCategory';
import { useHistoricalMetrics } from '@/hooks/useHistoricalMetrics';
import { useRanking } from '@/hooks/useRanking';
import { summarizeProductCriticality } from '@/utils/criticalitySummary';
import type { HistoricalMetric } from '@/types/historical-metric.types';
import styles from './style.module.css'

const criticalitySummary = summarizeProductCriticality(products);
const criticalityColors = {
    regular: '#4b9b62',
    attention: '#d78b25',
    critical: '#c64c49',
} as const;
const criticalitySegments = criticalitySummary.map((item) => ({
    id: item.id,
    label: item.status,
    value: item.quantity,
    color: criticalityColors[item.id],
}));
const weeklySalesValues = [64, 68, 72, 76, 91, 118, 83, 86];

function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const formatShortDate = (date: Date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);

function Home(){
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const { data, isLoading, error } = useHistoricalMetrics();
    const { data: rankingData, isLoading: isRankingLoading, error: rankingError } = useRanking();

    useEffect(() => {
        const nextMidnight = new Date(currentDate);
        nextMidnight.setHours(24, 0, 0, 0);
        const timeoutId = window.setTimeout(
            () => setCurrentDate(new Date()),
            Math.max(nextMidnight.getTime() - Date.now(), 1000),
        );

        return () => window.clearTimeout(timeoutId);
    }, [currentDate]);

    const periodEnd = new Date(currentDate);
    periodEnd.setDate(currentDate.getDate() - 1);
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodEnd.getDate() - 7);
    const weeklySalesData: HistoricalMetric[] = weeklySalesValues.map((value, index) => {
        const date = new Date(periodStart);
        date.setDate(periodStart.getDate() + index);
        return { date: toLocalDateString(date), value };
    });
    const periodLabel = `${formatShortDate(periodStart)}–${formatShortDate(periodEnd)}`;

    return(
        <>
            <h1 className={styles.title}>Métricas principais</h1>
            {/* cards */}
            <div className={styles['container-card']}>
                <InfoCard title="Vendas deste mês" value="R$100.00" footer="vendeu 10% a mais do que mês passado" tone="success"/>
                <InfoCard title="Desempenho desse mês" value="23%" footer="Continue aceitando as decisões do motor!" tone="success"/>
                <InfoCard title="Vendas de ontem" value="R$20.845" footer="A menor dessa semana" tone="danger"/>
                <InfoCard title="Ações Críticas" value="100" footer="Veja as ações para ter melhor desempenho" tone="warning"/>
            </div>
            <section className={styles.seasonality} aria-label="Sazonalidade das vendas">
                <HistoricalChart
                    data={weeklySalesData}
                    title="Sazonalidade das vendas"
                    description="Volume diário de sete dias atrás até ontem, incluindo as duas datas."
                    period={periodLabel}
                    datasetLabel="Vendas (demonstração)"
                    ariaLabel={`Gráfico de linha da sazonalidade de vendas entre ${periodLabel}`}
                    beginAtZero
                />
                <dl className={styles.comparison}>
                    <div>
                        <dt>Mesmo dia da semana passada ({formatShortDate(periodStart)})</dt>
                        <dd>{weeklySalesValues[0]} vendas <span>(demonstração)</span></dd>
                    </div>
                    <div>
                        <dt>Ontem ({formatShortDate(periodEnd)})</dt>
                        <dd>{weeklySalesValues[weeklySalesValues.length - 1]} vendas <span>(demonstração)</span></dd>
                    </div>
                </dl>
                <p className={styles.dataNote}>A comparação usa ontem e a data equivalente da semana anterior. Os valores são demonstrativos; o projeto ainda não possui uma fonte de vendas reais por data.</p>
            </section>
            <div className={styles['container']}>

                {/* grafico */}
                {isLoading && <p className={styles.feedback} role="status">Carregando histórico...</p>}
                {error && <p className={styles.feedback} role="alert">{error}</p>}
                {!isLoading && !error && <HistoricalChart data={data} />}

                {/* ranking */}
                {isRankingLoading && <p className={styles.feedback} role="status">Carregando ranking...</p>}
                {rankingError && <p className={styles.feedback} role="alert">{rankingError}</p>}
                {!isRankingLoading && !rankingError && <Ranking data={rankingData} />}
            </div>
            <section className={styles.donutGrid} aria-label="Criticidade e desperdício por categoria">
                <DonutChart
                    title="Níveis de criticidade – SKUs monitorados"
                    description="Distribuição dos produtos por nível de criticidade."
                    segments={criticalitySegments}
                    centerLabel="SKUs"
                    valueLabel="SKUs"
                />
                <DonutChart
                    title="Categoria x quantidade de itens desperdiçados"
                    description="Quantidade demonstrativa de itens descartados em cada categoria."
                    segments={wastedItemsByCategory}
                    centerLabel="itens"
                    valueLabel="itens desperdiçados"
                    note="Dados demonstrativos: o projeto ainda não registra itens descartados por categoria."
                />
            </section>
        </>
    )
}

export default Home
