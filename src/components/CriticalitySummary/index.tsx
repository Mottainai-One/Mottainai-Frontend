import ReusableTable from '@/components/ReusableTable';
import type { CriticalitySummaryProps } from '@/types/criticality-summary.types';
import type { ReusableTableColumn } from '@/types/reusable-table.types';
import styles from './style.module.css';

const columns: ReusableTableColumn<CriticalitySummaryProps['data'][number]>[] = [
    {
        id: 'level',
        header: 'Nível',
        renderCell: (item) => (
            <span className={`${styles.levelBadge} ${styles[item.id]}`}>
                {item.status}
            </span>
        ),
    },
    {
        id: 'quantity',
        header: 'Quantidade',
        renderCell: (item) => item.quantity.toLocaleString('pt-BR'),
    },
    {
        id: 'guidance',
        header: 'Faixa',
        renderCell: (item) => item.guidance,
    },
];

function CriticalitySummary({ data }: CriticalitySummaryProps) {
    return (
        <ReusableTable
            title="Níveis de criticidade – SKUs monitorados"
            columns={columns}
            data={[...data]}
            rowKey={(item) => item.id}
        />
    );
}

export default CriticalitySummary;
