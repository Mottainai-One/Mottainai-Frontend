import { useCallback, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DetailsModal from "@/components/DetailsModal";
import ReusableTable from "@/components/ReusableTable";
import { stockTransferHistory, stockTransferRisks } from "@/data/stock-transfers";
import type { DetailsModalField } from "@/types/details-modal.types";
import type { ReusableTableColumn, TableCellTone } from "@/types/reusable-table.types";
import type {
  StockTransferHistory,
  StockTransferDetailsDialogState,
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
  });
  const [detailsDialog, setDetailsDialog] = useState<StockTransferDetailsDialogState | null>(null);

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

  const handleViewRecommendation = (risk: StockTransferRisk, event: MouseEvent<HTMLButtonElement>) => {
    setDetailsDialog({ kind: "recommendation", record: risk, trigger: event.currentTarget });
  };
  const handleViewTransfer = (transfer: StockTransferHistory, event: MouseEvent<HTMLButtonElement>) => {
    setDetailsDialog({ kind: "history", record: transfer, trigger: event.currentTarget });
  };
  const handleCloseDetails = useCallback(() => setDetailsDialog(null), []);

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
      header: "Ação",
      renderCell: () => null,
      display: "action",
      onAction: handleViewRecommendation,
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
    {
      id: "action",
      header: "Ação",
      renderCell: () => null,
      display: "action",
      onAction: handleViewTransfer,
      actionLabel: (transfer) => `Ver detalhes da transferência ${transfer.id}`,
      align: "center",
    },
  ];

  const detailFields: DetailsModalField[] = !detailsDialog
    ? []
    : detailsDialog.kind === "recommendation"
      ? [
          { id: "product", label: "Produto", value: detailsDialog.record.product },
          { id: "batch", label: "Lote", value: detailsDialog.record.batch },
          { id: "validity", label: "Validade", value: detailsDialog.record.validity },
          { id: "origin", label: "Loja de origem", value: detailsDialog.record.originStore },
          { id: "destination", label: "Loja de destino", value: detailsDialog.record.destinationStore },
          { id: "quantity", label: "Unidades a transferir", value: detailsDialog.record.suggestedQuantity },
          { id: "level", label: "Nível", value: detailsDialog.record.level },
        ]
      : [
          { id: "date", label: "Data", value: detailsDialog.record.date },
          { id: "requestedBy", label: "Solicitante", value: detailsDialog.record.requestedBy },
          { id: "origin", label: "Loja de origem", value: detailsDialog.record.originStore },
          { id: "destination", label: "Loja de destino", value: detailsDialog.record.destinationStore },
          { id: "quantity", label: "Quantidade", value: detailsDialog.record.quantity },
          { id: "status", label: "Status", value: detailsDialog.record.status },
          { id: "responsible", label: "Responsável", value: detailsDialog.record.responsible },
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

      {detailsDialog && (
        <DetailsModal
          title={detailsDialog.kind === "recommendation" ? "Transferência recomendada" : "Detalhes da transferência"}
          description={detailsDialog.kind === "recommendation"
            ? "Confira a recomendação do motor para este lote antes de abrir o fluxo de transferência."
            : "Dados registrados no histórico da transferência, incluindo o status atual."}
          fields={detailFields}
          triggerElement={detailsDialog.trigger}
          onClose={handleCloseDetails}
        />
      )}
    </section>
  );
}

export default StockTransfers;
