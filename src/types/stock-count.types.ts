export type StockCountScope = "Laticínios" | "Açougue" | "Horti-Fruti";

export type StockCountProductStatus = "Divergente" | "Conferido" | "Pendente";

export interface StockCountProduct {
  id: string;
  name: string;
  barcode: string;
  systemQuantity: number;
  physicalQuantity: number | null;
}

export interface StockCountScopeOption {
  value: StockCountScope;
  label: string;
  itemsCounted: number;
  generalDifference: number;
  differenceValueInCents: number;
  responsible: string;
  products: readonly StockCountProduct[];
}

export interface NewStockCountFormState {
  scope: StockCountScope | "";
  barcode: string;
}

export interface NewStockCountPageState {
  form: NewStockCountFormState;
  products: StockCountProduct[];
  lastBarcode: string;
  feedback: string;
  feedbackIsError: boolean;
  isFinalized: boolean;
}
