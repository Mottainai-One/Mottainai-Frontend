import ReusableTable from '@/components/ReusableTable';
import type { EngineDecision, EngineDecisionStatus } from '@/types/engine-decision.types';
import type { ReusableTableColumn, TableCellTone } from '@/types/reusable-table.types';
import InfoCard from "@/components/InfoCard"
import styles from './style.module.css';

const statusTones: Record<EngineDecisionStatus, TableCellTone> = {
    'Sem ação': 'neutral',
    Aprovado: 'success',
    'Em aguardo': 'warning',
    Crítico: 'danger',
    Editado: 'info',
};

const decisionColumns: ReusableTableColumn<EngineDecision>[] = [
    {
        id: 'time',
        header: 'Hora',
        renderCell: (decision) => decision.time,
        align: 'center',
    },
    {
        id: 'sku',
        header: 'SKU',
        renderCell: (decision) => decision.sku,
    },
    {
        id: 'tactic',
        header: 'Tática',
        renderCell: (decision) => decision.tactic,
    },
    {
        id: 'status',
        header: 'Status',
        renderCell: (decision) => decision.status,
        display: 'badge',
        tone: (decision) => statusTones[decision.status],
        align: 'center',
    },
];

const decisionData: EngineDecision[] = [
    { id: 'decision-01', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Desconto de 30%', status: 'Sem ação' },
    { id: 'decision-02', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Sugestão de Compra', status: 'Aprovado' },
    { id: 'decision-03', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Doação', status: 'Em aguardo' },
    { id: 'decision-04', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Promoção relâmpago', status: 'Crítico' },
    { id: 'decision-05', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Promoção relâmpago', status: 'Editado' },
    { id: 'decision-06', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Promoção relâmpago', status: 'Crítico' },
    { id: 'decision-07', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Promoção relâmpago', status: 'Editado' },
    { id: 'decision-08', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Promoção relâmpago', status: 'Em aguardo' },
    { id: 'decision-09', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Promoção relâmpago', status: 'Sem ação' },
    { id: 'decision-10', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Promoção relâmpago', status: 'Sem ação' },
    { id: 'decision-11', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Promoção relâmpago', status: 'Sem ação' },
    { id: 'decision-12', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', tactic: 'Promoção relâmpago', status: 'Sem ação' },
];

function Overview() {
    return (
        <section aria-labelledby="overview-title">
            <h1 className={styles['sr-only']} id="overview-title">Visão geral</h1>
            <div className={styles['container-card']}>
                <InfoCard title="Vendas deste mês" value="R$100.00" footer="vendeu 10% a mais do que mês passado" tone="danger"/>
                <InfoCard title="O quanto a babella é legal" value="100%" footer="90% a mais do que ano passado" tone="success"/>
                <InfoCard title="Nota de IA" value="00000000" footer="Parabéns, você zerou" tone="warning"/>
                <InfoCard title="Tokens Gastos" value="10000.00" footer="Chat GPT Sol Alto na conta da PICpAY gastou 10% só" tone="neutral"/>
            </div>

            <div className={styles.page}>
                <ReusableTable
                    title="Decisões do motor – últimas 24 horas"
                    columns={decisionColumns}
                    data={decisionData}
                    rowKey={(decision) => decision.id}
                />
            </div>
        </section>
    );
}

export default Overview;
