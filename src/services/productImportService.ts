import type {
  ProductDraft,
  ProductImportFormat,
  ProductImportPreviewItem,
} from "@/types/product-import.types";

class ProductImportServiceError extends Error {
  readonly cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = "ProductImportServiceError";
    this.cause = cause;
  }
}

const previewItems: ProductImportPreviewItem[] = Array.from(
  { length: 6 },
  (_, index) => ({
    id: `preview-${index + 1}`,
    sku: `SKU-${1001 + index}`,
    itemName:
      index === 0
        ? "Frango resfriado com coentro"
        : `Produto importado ${index + 1}`,
    barcode: `1234567891234${index}`,
    category: index % 2 === 0 ? "Açougue" : "Laticínios",
    brand: "Marca importada",
    measurementUnit: "Unidade",
    supplier: "Distribuidora Central",
    quantity: 13 + index,
    unitPriceInCents: 23700,
    expirationDate: "11/01/2027",
    previousCostInCents: index === 4 ? null : 23700,
    newCostInCents: 23700,
    suggestedPriceInCents: 4500,
    priceVariationPercent: 89,
  }),
);

function wait(milliseconds: number) {
  return new Promise<void>((resolve) =>
    window.setTimeout(resolve, milliseconds),
  );
}

export async function processProductImport(
  file: File,
  format: ProductImportFormat,
): Promise<ProductImportPreviewItem[]> {
  try {
    await wait(700);

    if (!file.name.toLowerCase().endsWith(`.${format}`))
      throw new Error(`O arquivo precisa estar no formato .${format}.`);

    return previewItems;
  } catch (error) {
    throw new ProductImportServiceError(
      "Não foi possível processar o arquivo.",
      error,
    );
  }
}

export async function registerImportedProducts(
  items: ProductImportPreviewItem[],
): Promise<void> {
  try {
    if (items.length === 0) throw new Error("Nenhum produto para cadastrar.");

    await wait(700);
  } catch (error) {
    throw new ProductImportServiceError(
      "Não foi possível cadastrar os produtos.",
      error,
    );
  }
}

export async function registerSingleProduct(
  product: ProductDraft,
): Promise<void> {
  try {
    if (!product.sku.trim()) throw new Error("SKU obrigatório.");

    await wait(700);
  } catch (error) {
    throw new ProductImportServiceError(
      "Não foi possível cadastrar o produto.",
      error,
    );
  }
}
