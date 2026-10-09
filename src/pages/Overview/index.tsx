import { useCallback, useState } from 'react';
import EngineActionModal from '@/components/EngineActionModal';
import ReusableTable from '@/components/ReusableTable';
import type { EngineDecision, EngineDecisionStatus } from '@/types/engine-decision.types';
import type { EngineActionDialogState } from '@/types/engine-action-modal.types';
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

function createDecisionColumns(
    onViewAction: (decision: EngineDecision, trigger: HTMLButtonElement) => void,
): ReusableTableColumn<EngineDecision>[] {
    return [
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
    {
        id: 'action',
        header: 'Ação',
        renderCell: (decision) => decision.tactic,
        display: 'action',
        actionLabel: (decision) => `Ver ação sugerida pelo motor para o SKU ${decision.sku}`,
        onAction: (decision, event) => onViewAction(decision, event.currentTarget),
        align: 'center',
    },
    ];
}

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
    const [actionDialog, setActionDialog] = useState<EngineActionDialogState | null>(null);

    const handleViewAction = (decision: EngineDecision, trigger: HTMLButtonElement) => {
        setActionDialog({ decision, trigger });
    };

    const handleCloseAction = useCallback(() => setActionDialog(null), []);

    const decisionColumns = createDecisionColumns(handleViewAction);

    return (
        <section aria-labelledby="overview-title">
            <h1 className={styles['sr-only']} id="overview-title">Visão geral</h1>
            <div className={styles['container-card']}>
                <InfoCard title="Última varredura" value="há 50min" footer="Falta 10min para a próxima" tone="danger"/>
                <InfoCard title="Número de SKUs escaneados" value="1201" footer="De 1203 SKUs totais" tone="neutral"/>
                <InfoCard title="Alertas Emitidos" value="104" footer="5% a mais comparado a útima varredura" tone="warning"/>
                <InfoCard title="Assertividade do Motor" value="64,32%" footer="Quanto mais dados mais acertivo" tone="success"/>
            </div>

            <div className={styles.page}>
                <ReusableTable
                    title="Decisões do motor – últimas 24 horas"
                    columns={decisionColumns}
                    data={decisionData}
                    rowKey={(decision) => decision.id}
                />
            </div>
            {actionDialog && (
                <EngineActionModal
                    decision={actionDialog.decision}
                    triggerElement={actionDialog.trigger}
                    onClose={handleCloseAction}
                />
            )}
        </section>
    );
}

export default Overview;
