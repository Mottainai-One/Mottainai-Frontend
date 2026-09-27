import { useId } from "react";
import type { ProductsFiltersProps } from "@/types/product.types";
import styles from "./style.module.css";

function ProductsFilters({
  value,
  categories,
  onChange,
}: ProductsFiltersProps) {
  const searchId = useId();
  const categoryId = useId();

  return (
    <div
      className={styles.filters}
      role="search"
      aria-label="Filtros de produtos"
    >
      <div className={styles.field}>
        <label className={styles["sr-only"]} htmlFor={searchId}>
          Buscar produto
        </label>
        <input
          id={searchId}
          type="search"
          placeholder="Buscar por nome ou SKU..."
          value={value.search}
          onChange={(event) =>
            onChange({ ...value, search: event.target.value })
          }
        />
      </div>

      <div className={styles.field}>
        <label className={styles["sr-only"]} htmlFor={categoryId}>
          Filtrar por categoria
        </label>
        <select
          id={categoryId}
          value={value.category}
          onChange={(event) =>
            onChange({ ...value, category: event.target.value })
          }
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ProductsFilters;
