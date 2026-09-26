import { products } from "@/data/products";
import type {
  ProductActionHistory,
  ProductDetail,
} from "@/types/product-details.types";

class ProductDetailsServiceError extends Error {
  readonly cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = "ProductDetailsServiceError";
    this.cause = cause;
  }
}

const actionHistory: ProductActionHistory[] = [
  {
    id: "action-01",
    date: "17/09",
    tactic: "Sugestão: desconto de 30%",
    decision: "Aprovado",
    efficacy: "Perda total",
    efficacyTone: "danger",
  },
  {
    id: "action-02",
    date: "12/09",
    tactic: "Desconto progressivo",
    decision: "Aprovado",
    efficacy: "82% escoado",
    efficacyTone: "success",
  },
  {
    id: "action-03",
    date: "08/09",
    tactic: "Reposicionamento na gôndola",
    decision: "Aprovado",
    efficacy: "65% escoado",
    efficacyTone: "success",
  },
  {
    id: "action-04",
    date: "02/09",
    tactic: "Transferência entre unidades",
    decision: "Rejeitado",
    efficacy: "Ação não aplicada",
    efficacyTone: "warning",
  },
  {
    id: "action-05",
    date: "27/08",
    tactic: "Desconto de 15%",
    decision: "Aprovado",
    efficacy: "74% escoado",
    efficacyTone: "success",
  },
];

export async function getProductDetails(
  productId: string,
): Promise<ProductDetail | null> {
  try {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 250));

    const product = products.find((item) => item.id === productId);

    if (!product) return null;

    return {
      ...product,
      sku: `MOT-${product.id.slice(-2).padStart(3, "0")}`,
      averageCostInCents: 9800,
      marginPercent: 34.7,
      salesVelocityPerDay: 18,
      effectiveShelfLifeDays: 16,
      nextExpirationLot: "LOT-12345",
      nextExpirationDays: 4,
      monthlySavedProfit: [
        { date: "2026-04-01", value: 820 },
        { date: "2026-05-01", value: 1140 },
        { date: "2026-06-01", value: 980 },
        { date: "2026-07-01", value: 1480 },
        { date: "2026-08-01", value: 1760 },
        { date: "2026-09-01", value: 2240 },
      ],
      actionHistory,
    };
  } catch (error) {
    throw new ProductDetailsServiceError(
      "Não foi possível carregar os detalhes do produto.",
      error,
    );
  }
}
