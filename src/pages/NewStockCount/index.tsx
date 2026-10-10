import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import ReusableTable from "@/components/ReusableTable";
import { stockCountScopes } from "@/data/stock-counts";
import type { ReusableTableColumn, TableCellTone } from "@/types/reusable-table.types";
import type {
  NewStockCountFormState,
  NewStockCountPageState,
  StockCountProduct,
  StockCountProductStatus,
  StockCountScope,
} from "@/types/stock-count.types";
import styles from "./style.module.css";

const initialForm: NewStockCountFormState = {
  scope: "",
  barcode: "",
};

const productStatusTones: Record<StockCountProductStatus, TableCellTone> = {
  Divergente: "warning",
  Conferido: "success",
  Pendente: "neutral",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDifference(product: StockCountProduct) {
  if (product.physicalQuantity === null) {
    return "Pendente";
  }

  const difference = product.physicalQuantity - product.systemQuantity;
  return `${difference > 0 ? "+" : ""}${difference.toLocaleString("pt-BR")} un`;
}

function getProductStatus(product: StockCountProduct): StockCountProductStatus {
  if (product.physicalQuantity === null) {
    return "Pendente";
  }

  return product.physicalQuantity === product.systemQuantity
    ? "Conferido"
    : "Divergente";
}

function NewStockCount() {
  const [state, setState] = useState<NewStockCountPageState>({
    form: initialForm,
    products: [],
    lastBarcode: "",
    feedback: "",
    feedbackIsError: false,
    isFinalized: false,
  });

  const selectedScope = useMemo(
    () => stockCountScopes.find((scope) => scope.value === state.form.scope),
    [state.form.scope],
  );

  const updateForm = <K extends keyof NewStockCountFormState>(
    field: K,
    value: NewStockCountFormState[K],
  ) => {
    setState((currentState) => ({
      ...currentState,
      form: { ...currentState.form, [field]: value },
      feedback: "",
      feedbackIsError: false,
    }));
  };

  const handleScopeChange = (scope: StockCountScope | "") => {
    const scopeData = stockCountScopes.find((option) => option.value === scope);

    setState((currentState) => ({
      ...currentState,
      form: { scope, barcode: "" },
      products: scopeData ? [...scopeData.products] : [],
      lastBarcode: "",
      feedback: scopeData ? "Escopo carregado. Confira os produtos da contagem." : "",
      feedbackIsError: false,
      isFinalized: false,
    }));
  };

  const handleBarcodeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const barcode = state.form.barcode.trim();

    if (!selectedScope) {
      setState((currentState) => ({
        ...currentState,
        feedback: "Selecione um escopo antes de adicionar um código de barras.",
        feedbackIsError: true,
      }));
      return;
    }

    if (!barcode) {
      setState((currentState) => ({
        ...currentState,
        feedback: "Digite ou bipe um código de barras.",
        feedbackIsError: true,
      }));
      return;
    }

    const product = state.products.find((item) => item.barcode === barcode);

    if (!product) {
      setState((currentState) => ({
        ...currentState,
        form: { ...currentState.form, barcode: "" },
        lastBarcode: barcode,
        feedback: "Código não encontrado neste escopo.",
        feedbackIsError: true,
      }));
      return;
    }

    setState((currentState) => ({
      ...currentState,
      form: { ...currentState.form, barcode: "" },
      products: currentState.products.map((item) =>
        item.id === product.id
          ? { ...item, physicalQuantity: (item.physicalQuantity ?? 0) + 1 }
          : item,
      ),
      lastBarcode: barcode,
      feedback: `Código encontrado: ${product.name} conferido.`,
      feedbackIsError: false,
    }));
  };

  const handleFinalize = () => {
    if (!selectedScope) {
      setState((currentState) => ({
        ...currentState,
        feedback: "Selecione um escopo antes de finalizar a contagem.",
        feedbackIsError: true,
      }));
      return;
    }

    setState((currentState) => ({
      ...currentState,
      isFinalized: true,
      feedback: "Contagem finalizada com sucesso.",
      feedbackIsError: false,
    }));
  };

  const productColumns: ReusableTableColumn<StockCountProduct>[] = [
    { id: "name", header: "Produtos inclusos", renderCell: (product) => product.name },
    { id: "barcode", header: "Código de barras", renderCell: (product) => product.barcode },
    {
      id: "systemQuantity",
      header: "Saldo sistema",
      renderCell: (product) => product.systemQuantity.toLocaleString("pt-BR"),
      align: "end",
    },
    {
      id: "physicalQuantity",
      header: "Contagem física",
      renderCell: (product) => product.physicalQuantity?.toLocaleString("pt-BR") ?? "Pendente",
      align: "end",
    },
    {
      id: "difference",
      header: "Divergência",
      renderCell: (product) => formatDifference(product),
      display: "badge",
      tone: (product) => productStatusTones[getProductStatus(product)],
      align: "center",
    },
    {
      id: "status",
      header: "Conferência",
      renderCell: (product) => getProductStatus(product),
      display: "badge",
      tone: (product) => productStatusTones[getProductStatus(product)],
      align: "center",
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="new-stock-count-title">
      <div className={styles.summaryCard}>
        <p className={styles.eyebrow}>Iorgute natural 1L – Diagnóstico preditivo</p>
        <h1 className={styles["sr-only"]} id="new-stock-count-title">
          Nova contagem de estoque
        </h1>

        <dl className={styles.summaryList}>
          <div className={styles.summaryRow}>
            <dt>Escopo</dt>
            <dd>
              <label className={styles.inlineField} htmlFor="stock-count-scope">
                <span className={styles["sr-only"]}>Selecione um escopo</span>
                <select
                  id="stock-count-scope"
                  value={state.form.scope}
                  onChange={(event) => handleScopeChange(event.target.value as StockCountScope | "")}
                >
                  <option value="">Selecione um escopo</option>
                  {stockCountScopes.map((scope) => (
                    <option key={scope.value} value={scope.value}>{scope.label}</option>
                  ))}
                </select>
              </label>
            </dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Itens contados</dt>
            <dd>{selectedScope?.itemsCounted.toLocaleString("pt-BR") ?? "—"}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Divergências gerais</dt>
            <dd>{selectedScope ? `${selectedScope.generalDifference > 0 ? "+" : ""}${selectedScope.generalDifference.toLocaleString("pt-BR")}` : "—"}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Valor divergência</dt>
            <dd>{selectedScope ? currencyFormatter.format(selectedScope.differenceValueInCents / 100) : "—"}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Status</dt>
            <dd><span className={styles.status}>Em andamento</span></dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Responsável</dt>
            <dd>{selectedScope?.responsible ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.productsCard}>
        <ReusableTable
          title="Produtos inclusos na contagem"
          columns={productColumns}
          data={state.products}
          rowKey={(product) => product.id}
          emptyMessage="Selecione um escopo para carregar os produtos."
          variant="plain"
        />

        <div className={styles.barcodeFooter}>
          <div className={styles.barcodeFeedback} aria-live="polite">
            <p>Último código de barras: <strong>{state.lastBarcode || "—"}</strong></p>
            {state.feedback && (
              <p className={state.feedbackIsError ? styles.errorMessage : styles.successMessage} role={state.feedbackIsError ? "alert" : "status"}>
                {state.feedback}
              </p>
            )}
          </div>

          <form className={styles.barcodeForm} onSubmit={handleBarcodeSubmit}>
            <label htmlFor="stock-count-barcode">Adicionar código de barras</label>
            <div className={styles.barcodeControls}>
              <input
                id="stock-count-barcode"
                inputMode="numeric"
                value={state.form.barcode}
                onChange={(event) => updateForm("barcode", event.target.value)}
                placeholder="Digite ou bipe o código"
              />
              <button type="submit">Adicionar</button>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.finalizeButton} onClick={handleFinalize} disabled={state.isFinalized}>
          {state.isFinalized ? "Contagem finalizada" : "Finalizar contagem"}
        </button>
        <Link className={styles.cancelButton} to="/stock">
          Cancelar contagem
        </Link>
      </div>
    </section>
  );
}

export default NewStockCount;
