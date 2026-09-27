import type { HistoricalMetric } from "@/types/historical-metric.types";

export type CashClosingStatus = "Não conciliado" | "Em análise" | "Conferido";

export type CashCountProductStatus = "Divergente" | "Conferido" | "Pendente";

export interface CashClosingDiscrepancy {
  id: string;
  date: string;
  time: string;
  responsible: string;
  store: string;
  scope: string;
  item: string;
  barcode: string;
  systemQuantity: number;
  soldQuantity: number;
  difference: number;
  differenceValueInCents: number;
  status: CashClosingStatus;
  discrepancyDetectedOnDay: number;
}

export interface CashCountProduct {
  id: string;
  name: string;
  barcode: string;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
  status: CashCountProductStatus;
}

export interface StockFilterState {
  store: string;
}

export type StockPageState = StockFilterState;

export interface StockFiltersProps {
  value: StockFilterState;
  stores: readonly string[];
  onChange: (filters: StockFilterState) => void;
}

export interface StockSectionPlaceholderProps {
  title: string;
  description: string;
}

export interface CashClosingReportState {
  status: CashClosingStatus;
  responsible: string;
  barcodeQuery: string;
  hasUnsavedChanges: boolean;
  isStatusEditorOpen: boolean;
  isResponsibleEditorOpen: boolean;
}

export type CashDiscrepancyHistoryBuilder = (
  records: readonly CashClosingDiscrepancy[],
  resolvedRiskIds: readonly string[],
) => HistoricalMetric[];
