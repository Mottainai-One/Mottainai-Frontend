import { useId, useMemo } from 'react';
import type { RankingProps } from '@/types/ranking.types';
import styles from './style.module.css';

// Pra pegar a cor
function getValueTone(index: number): 'high' | 'medium' | 'low' {
    if (index < 2) {
        return 'high';
    }
    if (index < 5) {
        return 'medium';
    }
    return 'low';
}

function Ranking({
    data,
    title = 'Produtos com Maior desperdício',
    itemLabel = 'Produtos',
    valueLabel = 'Valor Gasto',
    valueFormat = 'currency',
    valueSuffix = '',
    maxItems,
}: RankingProps) {
    const titleId = useId();
    // Organiza
    const sortedData = useMemo(
        () => [...data].sort((first, second) => second.value - first.value).slice(0, maxItems),
        [data, maxItems],
    );
    // Pra formatar pro Brasil
    const valueFormatter = useMemo(() => (
        valueFormat === 'currency'
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
            : new Intl.NumberFormat('pt-BR')
    ), [valueFormat]);

    return (
        <section className={styles.card} aria-labelledby={titleId}>
            <h2 id={titleId}>{title}</h2>
            <div className={styles.table} role="table" aria-label={title}>
                <div className={styles.tableHeader} role="row">
                    <span role="columnheader">{itemLabel}</span>
                    <span role="columnheader">{valueLabel}</span>
                </div>
                <div role="rowgroup">
                    {sortedData.map((item, index) => (
                        <div className={styles.row} role="row" key={item.id}>
                            <span className={styles.name} role="cell">{item.name}</span>
                            <span className={`${styles.value} ${styles[getValueTone(index)]}`} role="cell">
                                {valueFormatter.format(item.value)}{valueSuffix}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


export default Ranking;
