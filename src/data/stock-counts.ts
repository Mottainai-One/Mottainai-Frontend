import type {
  StockCountProduct,
  StockCountScopeOption,
} from "@/types/stock-count.types";

const dairyProducts: readonly StockCountProduct[] = [
  {
    id: "count-dairy-01",
    name: "Iogurte natural integral",
    barcode: "123456789123465",
    systemQuantity: 48,
    physicalQuantity: 46,
  },
  {
    id: "count-dairy-02",
    name: "Queijo minas frescal",
    barcode: "123456789125463",
    systemQuantity: 48,
    physicalQuantity: 48,
  },
  {
    id: "count-dairy-03",
    name: "Leite integral",
    barcode: "123456789612453",
    systemQuantity: 48,
    physicalQuantity: 50,
  },
  {
    id: "count-dairy-04",
    name: "Manteiga com sal",
    barcode: "123456789012345",
    systemQuantity: 48,
    physicalQuantity: null,
  },
];

const butcherProducts: readonly StockCountProduct[] = [
  {
    id: "count-butcher-01",
    name: "Frango resfriado",
    barcode: "123456789123564",
    systemQuantity: 36,
    physicalQuantity: 34,
  },
  {
    id: "count-butcher-02",
    name: "Carne moída",
    barcode: "123456789126453",
    systemQuantity: 18,
    physicalQuantity: 18,
  },
  {
    id: "count-butcher-03",
    name: "Linguiça toscana",
    barcode: "123456789612354",
    systemQuantity: 21,
    physicalQuantity: null,
  },
];

const produceProducts: readonly StockCountProduct[] = [
  {
    id: "count-produce-01",
    name: "Maçã Fuji",
    barcode: "123456789124563",
    systemQuantity: 72,
    physicalQuantity: 72,
  },
  {
    id: "count-produce-02",
    name: "Alface crespa",
    barcode: "123456789162453",
    systemQuantity: 40,
    physicalQuantity: 42,
  },
  {
    id: "count-produce-03",
    name: "Tomate italiano",
    barcode: "123456789612345",
    systemQuantity: 64,
    physicalQuantity: null,
  },
];

export const stockCountScopes: readonly StockCountScopeOption[] = [
  {
    value: "Laticínios",
    label: "Laticínios",
    itemsCounted: 89,
    generalDifference: -89,
    differenceValueInCents: 5700,
    responsible: "Guilherme Silva",
    products: dairyProducts,
  },
  {
    value: "Açougue",
    label: "Açougue",
    itemsCounted: 75,
    generalDifference: -2,
    differenceValueInCents: 2890,
    responsible: "Ana Costa",
    products: butcherProducts,
  },
  {
    value: "Horti-Fruti",
    label: "Horti-Fruti",
    itemsCounted: 64,
    generalDifference: 2,
    differenceValueInCents: 990,
    responsible: "Mariana Souza",
    products: produceProducts,
  },
];
