import { useId } from "react";
import type { StockFiltersProps } from "@/types/stock.types";
import styles from "./style.module.css";

function StockFilters({ value, stores, onChange }: StockFiltersProps) {
  const storeId = useId();

  return (
    <div className={styles.filters} role="search" aria-label="Filtros de estoque">
      <label className={styles["sr-only"]} htmlFor={storeId}>
        Filtrar por loja
      </label>
      <select
        id={storeId}
        value={value.store}
        onChange={(event) => onChange({ store: event.target.value })}
      >
        <option value="">Todas as lojas</option>
        {stores.map((store) => (
          <option key={store} value={store}>
            {store}
          </option>
        ))}
      </select>
    </div>
  );
}

export default StockFilters;
