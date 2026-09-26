import type {
  ProductDraft,
  ProductImportFormat,
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
export function validateProductDraft(product: ProductDraft): string | null {
  if (!product.sku.trim()) return "Informe o SKU.";
  if (!product.barcode.trim()) return "Informe o código de barras.";
  if (!product.name.trim()) return "Informe o nome do produto.";
  if (!product.category) return "Selecione a categoria.";
  if (!product.measurementUnit) return "Selecione a unidade de medida.";
  if (!product.supplier) return "Selecione o fornecedor.";
  return null;
}
