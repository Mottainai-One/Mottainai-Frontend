import InfoCard from "@/components/InfoCard"
import HistoricalChart from '@/components/HistoricalChart';
import Ranking from '@/components/Ranking';
import { useHistoricalMetrics } from '@/hooks/useHistoricalMetrics';
import { useRanking } from '@/hooks/useRanking';
import styles from './style.module.css'

function Home(){
    const { data, isLoading, error } = useHistoricalMetrics();
    const { data: rankingData, isLoading: isRankingLoading, error: rankingError } = useRanking();

    return(
        <>
            <h1 className={styles.title}>Métricas principais</h1>
            {/* cards */}
            <div className={styles['container-card']}>
                <InfoCard title="Vendas deste mês" value="R$100.00" footer="vendeu 10% a mais do que mês passado" tone="danger"/>
                <InfoCard title="O quanto a babella é legal" value="100%" footer="90% a mais do que ano passado" tone="success"/>
                <InfoCard title="Nota de IA" value="00000000" footer="Parabéns, você zerou" tone="warning"/>
                <InfoCard title="Tokens Gastos" value="10000.00" footer="Chat GPT Sol Alto na conta da PICpAY gastou 10% só" tone="neutral"/>
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
        </>
    )
}

export default Home
