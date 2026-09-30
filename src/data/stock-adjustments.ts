import type {
  StockAdjustmentRecord,
  StockAdjustmentType,
} from "@/types/stock-adjustment.types";

export const stockAdjustmentTypes: readonly StockAdjustmentType[] = [
  "Avaria",
  "Consumo interno",
  "Vencimento",
];

export const stockAdjustmentProducts = [
  "Lanchão de bacon com maionese",
  "Lanchão de frango",
  "Leite integral",
  "Milho verde",
  "Pão de queijo",
] as const;

export const stockAdjustmentResponsibles = [
  "Guilherme Silva",
  "Ana Costa",
  "Mariana Souza",
] as const;

export const stockAdjustmentRecords: StockAdjustmentRecord[] = [
  {
    id: "adjustment-01",
    date: "17/05",
    product: "Lanchão de bacon com maionese",
    quantity: 3,
    type: "Avaria",
    valueInCents: 34000,
    responsible: "Guilherme Silva",
    observation: "LOT-1234 vencido",
  },
  {
    id: "adjustment-02",
    date: "17/05",
    product: "Lanchão de bacon com maionese",
    quantity: 3,
    type: "Consumo interno",
    valueInCents: 34000,
    responsible: "Guilherme Silva",
    observation: "Consumo da equipe",
  },
  {
    id: "adjustment-03",
    date: "17/05",
    product: "Lanchão de bacon com maionese",
    quantity: 3,
    type: "Consumo interno",
    valueInCents: 34000,
    responsible: "Guilherme Silva",
    observation: "Treinamento da cozinha",
  },
  {
    id: "adjustment-04",
    date: "17/05",
    product: "Lanchão de bacon com maionese",
    quantity: 3,
    type: "Vencimento",
    valueInCents: 34000,
    responsible: "Guilherme Silva",
    observation: "LOT-1234 vencido",
  },
  {
    id: "adjustment-05",
    date: "17/05",
    product: "Lanchão de bacon com maionese",
    quantity: 3,
    type: "Vencimento",
    valueInCents: 34000,
    responsible: "Guilherme Silva",
    observation: "Embalagem danificada",
  },
  {
    id: "adjustment-06",
    date: "17/05",
    product: "Lanchão de bacon com maionese",
    quantity: 3,
    type: "Vencimento",
    valueInCents: 34000,
    responsible: "Guilherme Silva",
    observation: "Produto fora da validade",
  },
];

