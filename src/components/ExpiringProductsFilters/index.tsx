import { useId } from 'react';
import type { ExpiringProductsFiltersProps } from '@/types/expiring-products.types';
import styles from './style.module.css';

function ExpiringProductsFilters({
    value,
    riskLevels,
    stores,
    categories,
    onChange,
}: ExpiringProductsFiltersProps) {
    const riskLevelId = useId();
    const storeId = useId();
    const categoryId = useId();

    return (
        <form className={styles.filters} aria-label="Filtros dos produtos próximos do vencimento">
            <div className={styles.field}>
                <label className={styles.label} htmlFor={riskLevelId}>Nível de risco</label>
                <select
                    className={styles.select}
                    id={riskLevelId}
                    value={value.riskLevel}
                    onChange={(event) => onChange({
                        ...value,
                        riskLevel: riskLevels.find((riskLevel) => riskLevel === event.target.value) ?? '',
                    })}
                >
                    <option value="">Todos os níveis</option>
                    {riskLevels.map((riskLevel) => (
                        <option key={riskLevel} value={riskLevel}>{riskLevel}</option>
                    ))}
                </select>
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor={storeId}>Loja</label>
                <select
                    className={styles.select}
                    id={storeId}
                    value={value.store}
                    onChange={(event) => onChange({ ...value, store: event.target.value })}
                >
                    <option value="">Todas as lojas</option>
                    {stores.map((store) => (
                        <option key={store} value={store}>{store}</option>
                    ))}
                </select>
            </div>

            <div className={`${styles.field} ${styles['category-field']}`}>
                <label className={styles.label} htmlFor={categoryId}>Categoria</label>
                <select
                    className={styles.select}
                    id={categoryId}
                    value={value.category}
                    onChange={(event) => onChange({ ...value, category: event.target.value })}
                >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </div>
        </form>
    );
}

export default ExpiringProductsFilters;
