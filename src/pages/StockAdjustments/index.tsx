import { useMemo, useState, type FormEvent } from "react";
import ReusableTable from "@/components/ReusableTable";
import {
  stockAdjustmentProducts,
  stockAdjustmentRecords,
  stockAdjustmentResponsibles,
  stockAdjustmentTypes,
} from "@/data/stock-adjustments";
import type { ReusableTableColumn, TableCellTone } from "@/types/reusable-table.types";
import type {
  StockAdjustmentFormState,
  StockAdjustmentPageState,
  StockAdjustmentRecord,
  StockAdjustmentSummary,
  StockAdjustmentType,
} from "@/types/stock-adjustment.types";
import styles from "./style.module.css";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const initialForm: StockAdjustmentFormState = {
  product: "",
  quantity: "",
  type: "Avaria",
  observation: "",
  responsible: "",
};

const typeTones: Record<StockAdjustmentType, TableCellTone> = {
  Avaria: "danger",
  "Consumo interno": "info",
  Vencimento: "warning",
};

const formatCurrency = (valueInCents: number) =>
  currencyFormatter.format(valueInCents / 100);

function StockAdjustments() {
  const [state, setState] = useState<StockAdjustmentPageState>({
    form: initialForm,
    records: stockAdjustmentRecords,
    feedback: "",
    feedbackIsError: false,
  });

  const summary = useMemo<StockAdjustmentSummary>(() => {
    const totalLossesInCents = state.records
      .filter((record) => record.type === "Avaria")
      .reduce((total, record) => total + record.valueInCents, 0);
    const internalConsumptionInCents = state.records
      .filter((record) => record.type === "Consumo interno")
      .reduce((total, record) => total + record.valueInCents, 0);
    const expiryInCents = state.records
      .filter((record) => record.type === "Vencimento")
      .reduce((total, record) => total + record.valueInCents, 0);

    return {
      totalLossesInCents,
      internalConsumptionInCents,
      expiryInCents,
      totalLossRecords: state.records.length,
      internalConsumptionPercentage: 38,
      salesPeak: "+45%",
    };
  }, [state.records]);

  const updateForm = <K extends keyof StockAdjustmentFormState>(
    field: K,
    value: StockAdjustmentFormState[K],
  ) => {
    setState((currentState) => ({
      ...currentState,
      form: { ...currentState.form, [field]: value },
      feedback: "",
      feedbackIsError: false,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = Number(state.form.quantity);

    if (!state.form.product.trim() || !state.form.responsible.trim() || quantity < 1) {
      setState((currentState) => ({
        ...currentState,
        feedback: "Informe o produto, uma quantidade maior que zero e o responsável.",
        feedbackIsError: true,
      }));
      return;
    }

    const newRecord: StockAdjustmentRecord = {
      id: `adjustment-${Date.now()}`,
      date: "17/05",
      product: state.form.product.trim(),
      quantity,
      type: state.form.type,
      valueInCents: 0,
      responsible: state.form.responsible.trim(),
      observation: state.form.observation.trim() || "Sem observação",
    };

    setState((currentState) => ({
      form: initialForm,
      records: [newRecord, ...currentState.records],
      feedback: "Baixa registrada e saldo do sistema ajustado.",
      feedbackIsError: false,
    }));
  };

  const columns: ReusableTableColumn<StockAdjustmentRecord>[] = [
    { id: "date", header: "Data", renderCell: (record) => record.date },
    { id: "product", header: "Produto", renderCell: (record) => record.product },
    {
      id: "quantity",
      header: "Qtd.",
      renderCell: (record) => `${record.quantity} un`,
      align: "center",
    },
    {
      id: "type",
      header: "Tipo",
      renderCell: (record) => record.type,
      display: "badge",
      tone: (record) => typeTones[record.type],
      align: "center",
    },
    {
      id: "value",
      header: "Valor",
      renderCell: (record) => formatCurrency(record.valueInCents),
    },
    {
      id: "responsible",
      header: "Responsável",
      renderCell: (record) => record.responsible,
    },
    {
      id: "observation",
      header: "Observação",
      renderCell: (record) => record.observation,
    },
  ];

  return (
    <section className={styles.page} aria-labelledby="stock-adjustments-title">
      <h1 className={styles["sr-only"]} id="stock-adjustments-title">
        Avarias e consumo interno
      </h1>

      <div className={styles.topGrid}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2>Registrar nova avaria/consumo</h2>

          <div className={styles.formField}>
            <label htmlFor="adjustment-product">Produto (busca por nome ou código de barras)</label>
            <input
              id="adjustment-product"
              list="adjustment-products"
              value={state.form.product}
              onChange={(event) => updateForm("product", event.target.value)}
              placeholder="Bipe ou digite o nome"
            />
            <datalist id="adjustment-products">
              {stockAdjustmentProducts.map((product) => (
                <option key={product} value={product} />
              ))}
            </datalist>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="adjustment-quantity">Quantidade</label>
              <input
                id="adjustment-quantity"
                min="1"
                type="number"
                value={state.form.quantity}
                onChange={(event) => updateForm("quantity", event.target.value)}
                placeholder="0"
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="adjustment-type">Tipo de baixa</label>
              <select
                id="adjustment-type"
                value={state.form.type}
                onChange={(event) => updateForm("type", event.target.value as StockAdjustmentType)}
              >
                {stockAdjustmentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="adjustment-observation">Motivo/observação</label>
            <textarea
              id="adjustment-observation"
              value={state.form.observation}
              onChange={(event) => updateForm("observation", event.target.value)}
              placeholder="Ex: Embalagem rompida durante transporte..."
              rows={4}
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="adjustment-responsible">Responsável</label>
            <input
              id="adjustment-responsible"
              list="adjustment-responsibles"
              value={state.form.responsible}
              onChange={(event) => updateForm("responsible", event.target.value)}
              placeholder="Nome do funcionário"
            />
            <datalist id="adjustment-responsibles">
              {stockAdjustmentResponsibles.map((responsible) => (
                <option key={responsible} value={responsible} />
              ))}
            </datalist>
          </div>

          {state.feedback && (
            <p
              className={`${styles.feedback} ${state.feedbackIsError ? styles.feedbackError : ""}`}
              role={state.feedbackIsError ? "alert" : "status"}
              aria-live="polite"
            >
              {state.feedback}
            </p>
          )}

          <button className={styles.submitButton} type="submit">
            Registrar baixa
          </button>
        </form>

        <aside className={styles.summaryCard} aria-labelledby="monthly-summary-title">
          <h2 id="monthly-summary-title">Resumo do mês</h2>
          <div className={styles.summaryGrid}>
            <article className={styles.summaryItem}>
              <h3>Total de avarias (mês)</h3>
              <strong className={styles.lossValue}>{formatCurrency(summary.totalLossesInCents)}</strong>
              <p>{summary.totalLossRecords} registros</p>
            </article>
            <article className={styles.summaryItem}>
              <h3>Consumo interno (mês)</h3>
              <strong className={styles.consumptionValue}>{formatCurrency(summary.internalConsumptionInCents)}</strong>
              <p>{summary.internalConsumptionPercentage}% do faturamento</p>
            </article>
            <article className={styles.summaryItem}>
              <h3>Vencimento (mês)</h3>
              <strong className={styles.expiryValue}>{formatCurrency(summary.expiryInCents)}</strong>
              <p>Pico de vendas ({summary.salesPeak})</p>
            </article>
          </div>
        </aside>
      </div>

      <div className={styles.recordsSection}>
        <ReusableTable
          title="Últimos registros"
          columns={columns}
          data={state.records}
          rowKey={(record) => record.id}
          emptyMessage="Nenhum ajuste registrado."
        />
      </div>
    </section>
  );
}

export default StockAdjustments;
