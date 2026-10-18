import { useId } from 'react';
import DropdownSelect from '@/components/DropdownSelect';
import type { ExpiringProductsFilterState, ExpiringProductsFiltersProps } from '@/types/expiring-products.types';
import styles from './style.module.css';

function ExpiringProductsFilters({ value, riskLevels, stores, categories, onChange }: ExpiringProductsFiltersProps) {
    const baseId = useId();

    function updateFilter<K extends keyof ExpiringProductsFilterState>(key: K, nextValue: ExpiringProductsFilterState[K]) {
        onChange({ ...value, [key]: nextValue });
    }

    return (
        <form className={styles.filters} aria-label="Filtros dos produtos próximos do vencimento">
            <div className={styles.field}>
                <span className={styles.label} id={`${baseId}-risk-label`}>Nível de risco</span>
                <DropdownSelect id={`${baseId}-risk`} labelledBy={`${baseId}-risk-label`} value={value.riskLevel} onChange={(event) => updateFilter('riskLevel', event.target.value as ExpiringProductsFilterState['riskLevel'])}>
                    <option value="">Todos os níveis</option>
                    {riskLevels.map((riskLevel) => <option key={riskLevel} value={riskLevel}>{riskLevel}</option>)}
                </DropdownSelect>
            </div>
            <div className={styles.field}>
                <span className={styles.label} id={`${baseId}-store-label`}>Loja</span>
                <DropdownSelect id={`${baseId}-store`} labelledBy={`${baseId}-store-label`} value={value.store} onChange={(event) => updateFilter('store', event.target.value)}>
                    <option value="">Todas as lojas</option>
                    {stores.map((store) => <option key={store} value={store}>{store}</option>)}
                </DropdownSelect>
            </div>
            <div className={`${styles.field} ${styles['category-field']}`}>
                <span className={styles.label} id={`${baseId}-category-label`}>Categoria</span>
                <DropdownSelect id={`${baseId}-category`} labelledBy={`${baseId}-category-label`} value={value.category} onChange={(event) => updateFilter('category', event.target.value)}>
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </DropdownSelect>
            </div>
        </form>
    );
}

export default ExpiringProductsFilters;
