export type StockAdjustmentType = "Avaria" | "Consumo interno" | "Vencimento";

export interface StockAdjustmentRecord {
  id: string;
  date: string;
  product: string;
  quantity: number;
  type: StockAdjustmentType;
  valueInCents: number;
  responsible: string;
  observation: string;
}

export interface StockAdjustmentFormState {
  product: string;
  quantity: string;
  type: StockAdjustmentType;
  observation: string;
  responsible: string;
}

export interface StockAdjustmentPageState {
  form: StockAdjustmentFormState;
  records: StockAdjustmentRecord[];
  feedback: string;
  feedbackIsError: boolean;
}

export interface StockAdjustmentSummary {
  totalLossesInCents: number;
  internalConsumptionInCents: number;
  expiryInCents: number;
  totalLossRecords: number;
  internalConsumptionPercentage: number;
  salesPeak: string;
}
