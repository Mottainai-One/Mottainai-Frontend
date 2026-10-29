import type { ProductRegistrationMode } from "@/types/product-import.types";
import type { RegistrationTabsProps } from "@/types/product-registration-ui.types";
import styles from "@/pages/ProductsRegistration/style.module.css";

function RegistrationTabs({ mode, onModeChange, onKeyDown }: RegistrationTabsProps) {
  const tabs: { mode: ProductRegistrationMode; label: string }[] = [
    { mode: "bulk", label: "Importação em massa" },
    { mode: "single", label: "Nova SKU" },
  ];

  return (
    <div className={styles.tabs} role="tablist" aria-label="Tipo de cadastro">
      {tabs.map((tab) => (
        <button
          key={tab.mode}
          type="button"
          role="tab"
          id={`${tab.mode}-registration-tab`}
          aria-controls={`${tab.mode}-registration-panel`}
          aria-selected={mode === tab.mode}
          tabIndex={mode === tab.mode ? 0 : -1}
          className={mode === tab.mode ? styles.active : ""}
          onKeyDown={(event) => onKeyDown(tab.mode, event)}
          onClick={() => onModeChange(tab.mode)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default RegistrationTabs;
