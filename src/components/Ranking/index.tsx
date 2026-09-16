import { useMemo } from 'react';
import type { RankingItem } from '@/types/ranking-item.types';
import styles from './style.module.css';

interface RankingProps {
    data: RankingItem[];
    title?: string;
    itemLabel?: string;
    valueLabel?: string;
}

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

function Ranking({ data, title = 'Ranking da 2I', itemLabel = 'Alunos', valueLabel = 'Nivel QI' }: RankingProps) {
    // Organiza
    const sortedData = useMemo(() => [...data].sort((first, second) => second.value - first.value), [data]);
    // Pra formatar pro Brasil
    const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), []);

    return (
        <section className={styles.card} aria-labelledby="ranking-title">
            <h2 id="ranking-title">{title}</h2>
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
                                {currencyFormatter.format(item.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


export default Ranking;
