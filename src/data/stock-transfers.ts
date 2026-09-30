import type {
  StockTransferHistory,
  StockTransferRisk,
} from "@/types/stock-transfer.types";

export const transferStoreOptions = [
  { id: 1, label: "Loja Zona Sul" },
  { id: 2, label: "Loja Centro" },
  { id: 3, label: "Loja Norte" },
] as const;

export const transferEmployeeOptions = [
  { id: 21, label: "Guilherme Silva" },
  { id: 22, label: "Mariana Souza" },
  { id: 23, label: "Ana Costa" },
] as const;

export const transferSuggestedActionOptions = [
  { id: 301, label: "Transferir aveia antes do vencimento" },
  { id: 302, label: "Redistribuir lote com baixa saída" },
] as const;

export const stockTransferRisks: StockTransferRisk[] = [
  {
    id: "transfer-risk-01",
    product: "Aveia em flocos grandes",
    batch: "Lote-1234",
    validity: "1 dia",
    originStore: "Loja Zona Sul",
    destinationStore: "Loja Zona Sul",
    suggestedQuantity: "5 un",
    level: "Crítico",
  },
  {
    id: "transfer-risk-02",
    product: "Aveia em flocos grandes",
    batch: "Lote-1234",
    validity: "2 dias",
    originStore: "Loja Zona Sul",
    destinationStore: "Loja Zona Sul",
    suggestedQuantity: "5 un",
    level: "Crítico",
  },
  {
    id: "transfer-risk-03",
    product: "Aveia em flocos grandes",
    batch: "Lote-1234",
    validity: "2 dias",
    originStore: "Loja Zona Sul",
    destinationStore: "Loja Zona Sul",
    suggestedQuantity: "5 un",
    level: "Moderado",
  },
  {
    id: "transfer-risk-04",
    product: "Aveia em flocos grandes",
    batch: "Lote-1234",
    validity: "144 dias",
    originStore: "Loja Zona Sul",
    destinationStore: "Loja Zona Sul",
    suggestedQuantity: "5 un",
    level: "Alto",
  },
  {
    id: "transfer-risk-05",
    product: "Aveia em flocos grandes",
    batch: "Lote-1234",
    validity: "23 dias",
    originStore: "Loja Zona Sul",
    destinationStore: "Loja Zona Sul",
    suggestedQuantity: "5 un",
    level: "Alto",
  },
  {
    id: "transfer-risk-06",
    product: "Aveia em flocos grandes",
    batch: "Lote-1234",
    validity: "2 dias",
    originStore: "Loja Zona Sul",
    destinationStore: "Loja Zona Sul",
    suggestedQuantity: "5 un",
    level: "Alto",
  },
  {
    id: "transfer-risk-07",
    product: "Aveia em flocos grandes",
    batch: "Lote-1234",
    validity: "9 dias",
    originStore: "Loja Zona Sul",
    destinationStore: "Loja Zona Sul",
    suggestedQuantity: "5 un",
    level: "Alto",
  },
];

export const stockTransferHistory: StockTransferHistory[] = [
  {
    id: "transfer-history-01",
    date: "17/05",
    requestedBy: "Maionese verde com orégano",
    originStore: "Loja Zona Sul",
    destinationStore: "Loja Zona Sul",
    quantity: "12 un",
    status: "Cancelada",
    responsible: "—",
  },
  ...Array.from({ length: 6 }, (_, index): StockTransferHistory => ({
    id: `transfer-history-${String(index + 2).padStart(2, "0")}`,
    date: "17/05",
    requestedBy: "Guilherme Silva",
    originStore: "Loja Zona Sul",
    destinationStore: "Loja Zona Sul",
    quantity: "12 un",
    status: "Fechado",
    responsible: "Guilherme Silva",
  })),
];
