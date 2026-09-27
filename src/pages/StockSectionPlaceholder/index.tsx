import { Link } from "react-router-dom";
import type { StockSectionPlaceholderProps } from "@/types/stock.types";
import styles from "./style.module.css";

function StockSectionPlaceholder({
  title,
  description,
}: StockSectionPlaceholderProps) {
  return (
    <section className={styles.page} aria-labelledby="stock-section-title">
      <h1 id="stock-section-title">{title}</h1>
      <p>{description}</p>
      <Link className={styles.backLink} to="/stock">
        Voltar para inventário e contagem
      </Link>
    </section>
  );
}

export default StockSectionPlaceholder;
