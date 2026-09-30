import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReusableTable from "@/components/ReusableTable";
import { stockTransferHistory, stockTransferRisks } from "@/data/stock-transfers";
import type { ReusableTableColumn, TableCellTone } from "@/types/reusable-table.types";
import type {
  StockTransferHistory,
  StockTransferPageState,
  StockTransferRisk,
  TransferLevel,
  TransferStatus,
} from "@/types/stock-transfer.types";
import styles from "./style.module.css";

const levelClasses: Record<TransferLevel, string> = {
  Crítico: styles.critical,
  Alto: styles.high,
  Moderado: styles.moderate,
};

const statusTones: Record<TransferStatus, TableCellTone> = {
  Cancelada: "danger",
  Fechado: "success",
};

function StockTransfers() {
  const [state, setState] = useState<StockTransferPageState>({
    search: "",
    selectedRiskId: "",
    feedback: "",
  });

  const normalizedSearch = state.search.trim().toLocaleLowerCase("pt-BR");
  const filteredRisks = useMemo(
    () =>
      stockTransferRisks.filter((risk) =>
        [
          risk.product,
          risk.batch,
          risk.validity,
          risk.originStore,
          risk.destinationStore,
          risk.level,
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch),
      ),
    [normalizedSearch],
  );
  const filteredHistory = useMemo(
    () =>
      stockTransferHistory.filter((transfer) =>
        [
          transfer.date,
          transfer.requestedBy,
          transfer.originStore,
          transfer.destinationStore,
          transfer.quantity,
          transfer.status,
          transfer.responsible,
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch),
      ),
    [normalizedSearch],
  );

  const handleViewAction = (risk: StockTransferRisk) => {
    setState((currentState) => ({
      ...currentState,
      selectedRiskId: risk.id,
      feedback: `Ação recomendada para ${risk.product}: transferir ${risk.suggestedQuantity} antes do vencimento.`,
    }));
  };

  const riskColumns: ReusableTableColumn<StockTransferRisk>[] = [
    { id: "product", header: "Produto", renderCell: (risk) => risk.product },
    { id: "batch", header: "Lote", renderCell: (risk) => risk.batch },
    { id: "validity", header: "Validade", renderCell: (risk) => risk.validity },
    { id: "originStore", header: "Loja origem", renderCell: (risk) => risk.originStore },
    { id: "destinationStore", header: "Loja destino", renderCell: (risk) => risk.destinationStore },
    {
      id: "suggestedQuantity",
      header: "Qtd. Sugerida",
      renderCell: (risk) => risk.suggestedQuantity,
      align: "center",
    },
    {
      id: "level",
      header: "Nível",
      renderCell: (risk) => (
        <span className={`${styles.levelBadge} ${levelClasses[risk.level]}`}>
          {risk.level}
        </span>
      ),
      align: "center",
    },
    {
      id: "action",
      header: "",
      renderCell: () => null,
      display: "action",
      onAction: handleViewAction,
      actionLabel: (risk) => `Ver ação para ${risk.product}, ${risk.batch}`,
      align: "center",
    },
  ];

  const historyColumns: ReusableTableColumn<StockTransferHistory>[] = [
    { id: "date", header: "Data", renderCell: (transfer) => transfer.date },
    { id: "requestedBy", header: "Solicitante", renderCell: (transfer) => transfer.requestedBy },
    { id: "originStore", header: "Loja origem", renderCell: (transfer) => transfer.originStore },
    { id: "destinationStore", header: "Loja destino", renderCell: (transfer) => transfer.destinationStore },
    { id: "quantity", header: "Qtd.", renderCell: (transfer) => transfer.quantity, align: "center" },
    {
      id: "status",
      header: "Status",
      renderCell: (transfer) => transfer.status,
      display: "badge",
      tone: (transfer) => statusTones[transfer.status],
      align: "center",
    },
    { id: "responsible", header: "Responsável", renderCell: (transfer) => transfer.responsible },
  ];

  return (
    <section className={styles.page} aria-labelledby="stock-transfers-title">
      <div className={styles.toolbar}>
        <h1 id="stock-transfers-title">Transferência de lojas</h1>
        <label className={styles.searchField} htmlFor="transfer-search">
          <span className={styles["sr-only"]}>Buscar transferência</span>
          <input
            id="transfer-search"
            type="search"
            value={state.search}
            onChange={(event) =>
              setState((currentState) => ({
                ...currentState,
                search: event.target.value,
              }))
            }
            placeholder="Buscar por produto, loja ou status..."
          />
        </label>
        <Link className={styles.newTransferButton} to="/stock/transfers/new">
          <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
          Nova transferência
        </Link>
      </div>

      {state.feedback && (
        <p className={styles.feedback} role="status" aria-live="polite">
          {state.feedback}
        </p>
      )}

      <div className={styles.tableSection}>
        <ReusableTable
          title="Lotes com risco de vencimento"
          columns={riskColumns}
          data={filteredRisks}
          rowKey={(risk) => risk.id}
          emptyMessage="Nenhum lote com risco de vencimento."
        />
      </div>

      <div className={styles.tableSection}>
        <ReusableTable
          title="Histórico de transferência"
          columns={historyColumns}
          data={filteredHistory}
          rowKey={(transfer) => transfer.id}
          emptyMessage="Nenhuma transferência registrada."
        />
      </div>

      <span className={styles["sr-only"]} aria-live="polite">
        {state.selectedRiskId}
      </span>
    </section>
  );
}

export default StockTransfers;
