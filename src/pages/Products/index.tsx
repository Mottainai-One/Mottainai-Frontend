import { useState } from "react";
import { Link } from "react-router-dom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProductsFilters from "@/components/ProductsFilters";
import { products } from "@/data/products";
import type {
  ProductFilterState,
  ProductTrafficLight,
} from "@/types/product.types";
import styles from "./style.module.css";

const trafficLightLabels: Record<ProductTrafficLight, string> = {
  regular: "Estoque regular",
  attention: "Estoque requer atenção",
  critical: "Estoque crítico",
};

const initialFilters: ProductFilterState = { search: "", category: "" };

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

function Products() {
  const [filters, setFilters] = useState<ProductFilterState>(initialFilters);

  const categories = Array.from(
    new Set(products.map((product) => product.category)),
  );

  const search = normalize(filters.search);

  const filteredProducts = products.filter((product) => {
    const categoryMatches =
      !filters.category || product.category === filters.category;
    return (
      categoryMatches &&
      (!search ||
        normalize(`${product.name} ${product.barcode}`).includes(search))
    );
  });

  return (
    <section className={styles.page} aria-labelledby="products-title">
      <h1 className={styles["sr-only"]} id="products-title">
        Produtos
      </h1>

      <div className={styles.toolbar}>
        <ProductsFilters
          value={filters}
          categories={categories}
          onChange={setFilters}
        />
        <Link className={styles["new-product"]} to="/productsRegistration">
          <FontAwesomeIcon icon={faPlus} aria-hidden="true" /> Novo Produto
        </Link>
      </div>

      <p className={styles["sr-only"]} role="status" aria-live="polite">
        {filteredProducts.length} produtos encontrados.
      </p>

      <section className={styles.card} aria-labelledby="sku-list-title">
        <h2 className={styles["list-title"]} id="sku-list-title">
          Lista de SKUs
        </h2>
        <div
          className={styles["table-region"]}
          aria-labelledby="sku-list-title"
          tabIndex={0}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Código de barras</th>
                <th scope="col">Produto</th>
                <th scope="col">Categoria</th>
                <th scope="col">Fornecedor</th>
                <th scope="col">Estoque</th>
                <th scope="col">Gôndola</th>
                <th scope="col">Preço</th>
                <th className={styles.center} scope="col">
                  Farol
                </th>
                <th className={styles.center} scope="col">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.barcode}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.supplier}</td>
                  <td>{product.stockQuantity}</td>
                  <td>{product.shelfQuantity}</td>
                  <td>
                    {currencyFormatter.format(product.priceInCents / 100)}
                  </td>
                  <td className={styles.center}>
                    <span
                      className={`${styles.signal} ${styles[product.trafficLight]}`}
                      role="img"
                      aria-label={trafficLightLabels[product.trafficLight]}
                    />
                  </td>
                  <td className={styles.center}>
                    <Link
                      className={styles["view-button"]}
                      to={`/products/${product.id}`}
                    >
                      Ver
                      <span className={styles["sr-only"]}>
                        {" "}
                        detalhes de {product.name}
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td className={styles.empty} colSpan={9}>
                    Nenhum produto corresponde aos filtros informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default Products;
