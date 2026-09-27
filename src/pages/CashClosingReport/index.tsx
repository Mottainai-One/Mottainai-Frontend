import { useId, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReusableTable from "@/components/ReusableTable";
import { cashClosingDiscrepancies, getCashCountProducts } from "@/data/stock";
import type {
  CashClosingReportState,
  CashClosingStatus,
  CashCountProduct,
} from "@/types/stock.types";
import type { ReusableTableColumn, TableCellTone } from "@/types/reusable-table.types";
import styles from "./style.module.css";

const statusOptions: CashClosingStatus[] = [
  "Não conciliado",
  "Em análise",
  "Conferido",
];

const responsibleOptions = [
  "Guilherme Silva",
  "Ana Souza",
  "Carlos Oliveira",
];

const productStatusTones: Record<CashCountProduct["status"], TableCellTone> = {
  Divergente: "warning",
  Conferido: "success",
  Pendente: "neutral",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDifference(value: number) {
  return `${value > 0 ? "+" : ""}${value.toLocaleString("pt-BR")} un`;
}

function CashClosingReport() {
  const { discrepancyId } = useParams<{ discrepancyId: string }>();
  const navigate = useNavigate();
  const statusId = useId();
  const responsibleId = useId();
  const barcodeId = useId();
  const discrepancy = cashClosingDiscrepancies.find(
    (item) => item.id === discrepancyId,
  );

  const [state, setState] = useState<CashClosingReportState | null>(
    discrepancy
      ? {
          status: discrepancy.status,
          responsible: discrepancy.responsible,
          barcodeQuery: "",
          hasUnsavedChanges: false,
          isStatusEditorOpen: false,
          isResponsibleEditorOpen: false,
        }
      : null,
  );

  if (!discrepancyId || !discrepancy || !state) {
    return (
      <section className={styles.page} aria-labelledby="report-error-title">
        <h1 id="report-error-title">Relatório não encontrado</h1>
        <p role="alert">Não foi possível localizar a contagem solicitada.</p>
        <Link className={styles.backLink} to="/stock">
          Voltar para fechamentos divergentes
        </Link>
      </section>
    );
  }

  const products = getCashCountProducts(discrepancy);
  const filteredProducts = products.filter((product) =>
    product.barcode.includes(state.barcodeQuery.trim()),
  );
  const productColumns: ReusableTableColumn<CashCountProduct>[] = [
    { id: "name", header: "Produtos inclusos", renderCell: (product) => product.name },
    { id: "barcode", header: "Código de barras", renderCell: (product) => product.barcode },
    {
      id: "systemQuantity",
      header: "Saldo sistema",
      renderCell: (product) => product.systemQuantity.toLocaleString("pt-BR"),
      align: "end",
    },
    {
      id: "countedQuantity",
      header: "Contagem",
      renderCell: (product) => product.countedQuantity.toLocaleString("pt-BR"),
      align: "end",
    },
    {
      id: "difference",
      header: "Diferença",
      renderCell: (product) => formatDifference(product.difference),
      display: "badge",
      tone: (product) => productStatusTones[product.status],
      align: "center",
    },
    {
      id: "status",
      header: "Conferência",
      renderCell: (product) => product.status,
      display: "badge",
      tone: (product) => productStatusTones[product.status],
      align: "center",
    },
  ];

  const updateState = (changes: Partial<CashClosingReportState>) => {
    setState((currentState) => ({ ...currentState!, ...changes }));
  };

  const updateEditableField = <
    K extends "status" | "responsible",
  >(
    field: K,
    value: CashClosingReportState[K],
  ) => {
    setState((currentState) => ({
      ...currentState!,
      [field]: value,
      hasUnsavedChanges: true,
    }));
  };

  const handleSave = () => {
    updateState({
      hasUnsavedChanges: false,
    });
  };

  const handleCancel = () => {
    setState({
      status: discrepancy.status,
      responsible: discrepancy.responsible,
      barcodeQuery: state.barcodeQuery,
      hasUnsavedChanges: false,
      isStatusEditorOpen: false,
      isResponsibleEditorOpen: false,
    });
  };

  return (
    <section className={styles.page} aria-labelledby="cash-report-title">
      <div className={styles.summaryCard}>
        <h1 id="cash-report-title">
          {discrepancy.item} — Relatório da contagem
        </h1>

        <dl className={styles.summaryList}>
          <div className={styles.summaryRow}>
            <dt>Escopo</dt>
            <dd>{discrepancy.scope}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Itens contados</dt>
            <dd>{discrepancy.soldQuantity.toLocaleString("pt-BR")}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Divergência geral</dt>
            <dd>{formatDifference(discrepancy.difference)}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Valor divergência</dt>
            <dd>{currencyFormatter.format(discrepancy.differenceValueInCents / 100)}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Status</dt>
            <dd className={styles.editableValue}>
              {state.isStatusEditorOpen ? (
                <label className={styles.inlineField} htmlFor={statusId}>
                  <span className={styles["sr-only"]}>Novo status</span>
                  <select
                    id={statusId}
                    value={state.status}
                    onChange={(event) => updateEditableField("status", event.target.value as CashClosingStatus)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <span className={styles.status}>{state.status}</span>
              )}
              <button
                type="button"
                className={styles.changeButton}
                aria-expanded={state.isStatusEditorOpen}
                onClick={() => updateState({ isStatusEditorOpen: !state.isStatusEditorOpen })}
              >
                Alterar status
              </button>
            </dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>Responsável</dt>
            <dd className={styles.editableValue}>
              {state.isResponsibleEditorOpen ? (
                <label className={styles.inlineField} htmlFor={responsibleId}>
                  <span className={styles["sr-only"]}>Novo responsável</span>
                  <select
                    id={responsibleId}
                    value={state.responsible}
                    onChange={(event) => updateEditableField("responsible", event.target.value)}
                  >
                    {responsibleOptions.map((responsible) => (
                      <option key={responsible} value={responsible}>{responsible}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <span>{state.responsible}</span>
              )}
              <button
                type="button"
                className={styles.changeButton}
                aria-expanded={state.isResponsibleEditorOpen}
                onClick={() => updateState({ isResponsibleEditorOpen: !state.isResponsibleEditorOpen })}
              >
                Alterar responsável
              </button>
            </dd>
          </div>
        </dl>
      </div>

      <div className={styles.productsCard}>
        <ReusableTable
          title="Produtos inclusos na contagem"
          columns={productColumns}
          data={filteredProducts}
          rowKey={(product) => product.id}
          emptyMessage="Nenhum produto corresponde ao código pesquisado."
          variant="plain"
        />

        <div className={styles.barcodeSearch}>
          <label htmlFor={barcodeId}>Pesquisar código de barras</label>
          <input
            id={barcodeId}
            type="search"
            value={state.barcodeQuery}
            placeholder="Pesquisar código de barras"
            onChange={(event) =>
              setState((currentState) => ({
                ...currentState!,
                barcodeQuery: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className={styles.actions}>
        {state.hasUnsavedChanges ? (
          <>
            <button type="button" className={styles.saveButton} onClick={handleSave}>
              Salvar contagem
            </button>
            <button type="button" className={styles.cancelButton} onClick={handleCancel}>
              Cancelar
            </button>
          </>
        ) : (
          <button type="button" className={styles.backButton} onClick={() => navigate("/stock")}>
            Voltar
          </button>
        )}
      </div>
    </section>
  );
}

export default CashClosingReport;
