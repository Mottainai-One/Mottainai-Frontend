export type ProductRegistrationMode = "bulk" | "single";

export type ProductImportFormat = "xml" | "csv";

export type ProductImportStatus =
  | "idle"
  | "processing"
  | "registering"
  | "success"
  | "error";

export interface ProductImportPreviewItem {
  id: string;
  sku: string;
  itemName: string;
  barcode: string;
  category: string;
  brand: string;
  measurementUnit: string;
  supplier: string;
  quantity: number;
  unitPriceInCents: number;
  expirationDate: string;
  previousCostInCents: number | null;
  newCostInCents: number;
  suggestedPriceInCents: number;
  priceVariationPercent: number;
}

export interface ProductDraft {
  sku: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  measurementUnit: string;
  supplier: string;
}

export interface ProductDraftState {
  values: ProductDraft;
  status: "idle" | "registering" | "success" | "error";
  message: string;
}

export interface ProductRegistrationSuccessState {
  isOpen: boolean;
  title: string;
  message: string;
}

export interface ProductImportState {
  mode: ProductRegistrationMode;
  format: ProductImportFormat;
  file: File | null;
  isDragging: boolean;
  status: ProductImportStatus;
  message: string;
  previewItems: ProductImportPreviewItem[];
}

export interface RecentProduct {
  id: string;
  itemName: string;
  barcode: string;
  category: string;
  quantity: number;
  source: "XML" | "CSV" | "Cadastro manual";
  addedAt: string;
}
