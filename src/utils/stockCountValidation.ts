import type { StockCountScope } from "@/types/stock-count.types";

export interface StockCountBarcodeInput {
  scope: StockCountScope | "";
  barcode: string;
}

export type StockCountBarcodeErrors = Partial<Record<keyof StockCountBarcodeInput, string>>;

export function validateStockCountBarcode(input: StockCountBarcodeInput): StockCountBarcodeErrors {
  const errors: StockCountBarcodeErrors = {};
  if (!input.scope) errors.scope = "Selecione um escopo antes de adicionar um código de barras.";
  if (!input.barcode.trim()) errors.barcode = "Digite ou bipe um código de barras.";
  else if (input.barcode.trim().length > 50) errors.barcode = "Use até 50 caracteres no código de barras.";
  return errors;
}

export function sanitizeStockCountBarcode(barcode: string): string {
  return barcode.trim().slice(0, 50);
}
