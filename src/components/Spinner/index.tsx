import type { SpinnerProps } from "@/types/spinner.types";
import styles from "./style.module.css";

function Spinner({ label = "Carregando" }: SpinnerProps) {
  return (
    <span className={styles.wrapper} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
export default Spinner;
