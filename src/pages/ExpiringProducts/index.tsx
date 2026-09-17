import { useState } from 'react';
import ExpiringProductsFilters from '@/components/ExpiringProductsFilters';
import ReusableTable from '@/components/ReusableTable';
import type { EngineDecisionStatus } from '@/types/engine-decision.types';
import type {
    ExpirationRiskLevel,
    ExpiringProductDecision,
    ExpiringProductsFilterState,
} from '@/types/expiring-products.types';
import type { ReusableTableColumn, TableCellTone } from '@/types/reusable-table.types';
import styles from './style.module.css';

const statusTones: Record<EngineDecisionStatus, TableCellTone> = {
    'Sem ação': 'neutral',
    Aprovado: 'success',
    'Em aguardo': 'warning',
    Crítico: 'danger',
    Editado: 'info',
};

const riskTones: Record<ExpirationRiskLevel, TableCellTone> = {
    Crítico: 'danger',
    Alto: 'warning',
    Moderado: 'info',
};

const decisionColumns: ReusableTableColumn<ExpiringProductDecision>[] = [
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
        id: 'store',
        header: 'Loja',
        renderCell: (decision) => decision.store,
    },
    {
        id: 'category',
        header: 'Categoria',
        renderCell: (decision) => decision.category,
    },
    {
        id: 'riskLevel',
        header: 'Nível',
        renderCell: (decision) => decision.riskLevel,
        display: 'badge',
        tone: (decision) => riskTones[decision.riskLevel],
        align: 'center',
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

const decisionData: ExpiringProductDecision[] = [
    { id: 'decision-01', time: '14:32', sku: 'NIK-CAM-ESP-BRC-G', store: 'Loja Centro', category: 'Câmeras', riskLevel: 'Crítico', tactic: 'Desconto de 30%', status: 'Sem ação' },
    { id: 'decision-02', time: '14:32', sku: 'NIK-CAM-ESP-BRC-P', store: 'Loja Norte', category: 'Câmeras', riskLevel: 'Alto', tactic: 'Sugestão de Compra', status: 'Aprovado' },
    { id: 'decision-03', time: '14:32', sku: 'CAB-USB-C-2M', store: 'Loja Sul', category: 'Acessórios', riskLevel: 'Moderado', tactic: 'Doação', status: 'Em aguardo' },
    { id: 'decision-04', time: '14:32', sku: 'FON-BT-PRO', store: 'Loja Centro', category: 'Áudio', riskLevel: 'Crítico', tactic: 'Promoção relâmpago', status: 'Crítico' },
    { id: 'decision-05', time: '14:32', sku: 'FON-BT-LITE', store: 'Loja Norte', category: 'Áudio', riskLevel: 'Alto', tactic: 'Promoção relâmpago', status: 'Editado' },
    { id: 'decision-06', time: '14:32', sku: 'SUP-NOT-ALU', store: 'Loja Sul', category: 'Acessórios', riskLevel: 'Crítico', tactic: 'Promoção relâmpago', status: 'Crítico' },
    { id: 'decision-07', time: '14:32', sku: 'MOU-WLS-BLK', store: 'Loja Centro', category: 'Periféricos', riskLevel: 'Moderado', tactic: 'Promoção relâmpago', status: 'Editado' },
    { id: 'decision-08', time: '14:32', sku: 'TEC-MEC-RGB', store: 'Loja Norte', category: 'Periféricos', riskLevel: 'Alto', tactic: 'Promoção relâmpago', status: 'Em aguardo' },
    { id: 'decision-09', time: '14:32', sku: 'WEB-FHD-01', store: 'Loja Sul', category: 'Câmeras', riskLevel: 'Moderado', tactic: 'Promoção relâmpago', status: 'Sem ação' },
    { id: 'decision-10', time: '14:32', sku: 'MIC-USB-PRO', store: 'Loja Centro', category: 'Áudio', riskLevel: 'Crítico', tactic: 'Promoção relâmpago', status: 'Sem ação' },
    { id: 'decision-11', time: '14:32', sku: 'HUB-USB-7P', store: 'Loja Norte', category: 'Acessórios', riskLevel: 'Alto', tactic: 'Promoção relâmpago', status: 'Sem ação' },
    { id: 'decision-12', time: '14:32', sku: 'MOU-PAD-XL', store: 'Loja Sul', category: 'Periféricos', riskLevel: 'Moderado', tactic: 'Promoção relâmpago', status: 'Sem ação' },
];

const riskLevels = Array.from(new Set(decisionData.map((decision) => decision.riskLevel)));
const stores = Array.from(new Set(decisionData.map((decision) => decision.store)));
const categories = Array.from(new Set(decisionData.map((decision) => decision.category)));

const initialFilters: ExpiringProductsFilterState = {
    riskLevel: '',
    store: '',
    category: '',
};

function ExpiringProducts() {
    const [filters, setFilters] = useState<ExpiringProductsFilterState>(initialFilters);

    const filteredDecisions = decisionData.filter((decision) => (
        (!filters.riskLevel || decision.riskLevel === filters.riskLevel)
        && (!filters.store || decision.store === filters.store)
        && (!filters.category || decision.category === filters.category)
    ));

    const resultLabel = filteredDecisions.length === 1
        ? '1 registro encontrado.'
        : `${filteredDecisions.length} registros encontrados.`;

    return (
        <section aria-labelledby="expiring-products-title">
            <h1 className={styles['sr-only']} id="expiring-products-title">Alertas de vencimento</h1>

            <ExpiringProductsFilters
                value={filters}
                riskLevels={riskLevels}
                stores={stores}
                categories={categories}
                onChange={setFilters}
            />

            <p className={styles['sr-only']} role="status" aria-live="polite">{resultLabel}</p>

            <div className={styles.container}>
                <div className={styles.page}>
                    <ReusableTable
                        title="Lotes com risco de vencimento"
                        columns={decisionColumns}
                        data={filteredDecisions}
                        rowKey={(decision) => decision.id}
                        emptyMessage="Nenhum lote corresponde aos filtros selecionados."
                    />
                </div>
                <div className={styles.page}>
                    <ReusableTable
                        title="Decisões do motor – últimas 24 horas"
                        columns={decisionColumns}
                        data={filteredDecisions}
                        rowKey={(decision) => decision.id}
                        emptyMessage="Nenhuma decisão corresponde aos filtros selecionados."
                    />
                </div>
            </div>
        </section>
    );
}

export default ExpiringProducts;
