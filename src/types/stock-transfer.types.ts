export type TransferLevel = "Crítico" | "Alto" | "Moderado";

export type TransferStatus = "Cancelada" | "Fechado";

export type TransferFormStatus =
  | "REQUESTED"
  | "APPROVED"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "CANCELLED";

export interface StockTransferRisk {
  id: string;
  product: string;
  batch: string;
  validity: string;
  originStore: string;
  destinationStore: string;
  suggestedQuantity: string;
  level: TransferLevel;
}

export interface StockTransferHistory {
  id: string;
  date: string;
  requestedBy: string;
  originStore: string;
  destinationStore: string;
  quantity: string;
  status: TransferStatus;
  responsible: string;
}

export interface StockTransferPageState {
  search: string;
}

export type StockTransferDetailsDialogState =
  | { kind: "recommendation"; record: StockTransferRisk; trigger: HTMLButtonElement }
  | { kind: "history"; record: StockTransferHistory; trigger: HTMLButtonElement };

export interface TransferFormState {
  suggestedActionId: string;
  sourceStoreId: string;
  destinationStoreId: string;
  employeeId: string;
  requestDate: string;
  completionDate: string;
  status: TransferFormStatus;
  observation: string;
}

export interface NewTransferPageState {
  form: TransferFormState;
  feedback: string;
  feedbackIsError: boolean;
}
