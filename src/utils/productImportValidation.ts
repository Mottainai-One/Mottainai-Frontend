import type {
  ProductDraft,
  ProductImportFormat,
  ProductImportPreviewItem,
} from "@/types/product-import.types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
export function validateProductImportFile(
  file: File,
  format: ProductImportFormat,
): string | null {
  if (!file.name.toLowerCase().endsWith(`.${format}`))
    return `Selecione um arquivo .${format}.`;
  if (file.size > MAX_FILE_SIZE) return "O arquivo deve ter no máximo 10 MB.";
  return null;
}
export function validateProductDraft(product: ProductDraft): Partial<Record<keyof ProductDraft, string>> {
  const errors: Partial<Record<keyof ProductDraft, string>> = {};
  if (!product.sku.trim()) errors.sku = "Informe o SKU.";
  else if (product.sku.trim().length > 64) errors.sku = "Use até 64 caracteres.";
  if (!product.barcode.trim()) errors.barcode = "Informe o código de barras.";
  else if (product.barcode.trim().length > 32) errors.barcode = "Use até 32 caracteres.";
  if (!product.name.trim()) errors.name = "Informe o nome do produto.";
  else if (product.name.trim().length > 120) errors.name = "Use até 120 caracteres.";
  if (!product.category.trim()) errors.category = "Selecione a categoria.";
  if (!product.measurementUnit.trim()) errors.measurementUnit = "Selecione a unidade de medida.";
  if (!product.supplier.trim()) errors.supplier = "Selecione o fornecedor.";
  if (product.brand.trim().length > 100) errors.brand = "Use até 100 caracteres.";
  return errors;
}

export function sanitizeProductDraft(product: ProductDraft): ProductDraft {
  return {
    sku: product.sku.trim().slice(0, 64),
    barcode: product.barcode.trim().slice(0, 32),
    name: product.name.trim().slice(0, 120),
    category: product.category.trim().slice(0, 80),
    brand: product.brand.trim().slice(0, 100),
    measurementUnit: product.measurementUnit.trim().slice(0, 40),
    supplier: product.supplier.trim().slice(0, 120),
  };
}

export function validateProductImportPreview(
  items: readonly ProductImportPreviewItem[],
): string | null {
  if (items.length === 0) return "O arquivo não contém produtos para cadastrar.";

  for (const [index, item] of items.entries()) {
    const row = index + 1;
    if (!item.id.trim() || !item.sku.trim() || !item.barcode.trim() || !item.itemName.trim()) {
      return `Revise SKU, código de barras e nome do produto na linha ${row}.`;
    }
    if (!Number.isFinite(item.quantity) || item.quantity < 0
      || !Number.isFinite(item.unitPriceInCents) || item.unitPriceInCents < 0
      || !Number.isFinite(item.newCostInCents) || item.newCostInCents < 0
      || !Number.isFinite(item.suggestedPriceInCents) || item.suggestedPriceInCents < 0) {
      return `Revise quantidade e valores na linha ${row}.`;
    }
  }

  return null;
}

export function sanitizeProductImportPreview(
  items: readonly ProductImportPreviewItem[],
): ProductImportPreviewItem[] {
  return items.map((item) => ({
    ...item,
    id: item.id.trim().slice(0, 100),
    sku: item.sku.trim().slice(0, 64),
    itemName: item.itemName.trim().slice(0, 120),
    barcode: item.barcode.trim().slice(0, 32),
    category: item.category.trim().slice(0, 80),
    brand: item.brand.trim().slice(0, 100),
    measurementUnit: item.measurementUnit.trim().slice(0, 40),
    supplier: item.supplier.trim().slice(0, 120),
    expirationDate: item.expirationDate.trim().slice(0, 20),
  }));
}
