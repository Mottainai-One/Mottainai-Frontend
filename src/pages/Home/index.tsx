import CriticalitySummary from '@/components/CriticalitySummary';
import InfoCard from "@/components/InfoCard"
import HistoricalChart from '@/components/HistoricalChart';
import Ranking from '@/components/Ranking';
import { products } from '@/data/products';
import { useHistoricalMetrics } from '@/hooks/useHistoricalMetrics';
import { useRanking } from '@/hooks/useRanking';
import { summarizeProductCriticality } from '@/utils/criticalitySummary';
import styles from './style.module.css'

const criticalitySummary = summarizeProductCriticality(products);

function Home(){
    const { data, isLoading, error } = useHistoricalMetrics();
    const { data: rankingData, isLoading: isRankingLoading, error: rankingError } = useRanking();

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
            <div className={styles.criticalitySummary}>
                <CriticalitySummary data={criticalitySummary} />
            </div>
        </>
    )
}

export default Home
