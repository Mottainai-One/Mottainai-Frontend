import type { HistoricalMetric } from "@/types/historical-metric.types";
import type {
  CashCountProduct,
  CashClosingDiscrepancy,
  CashDiscrepancyHistoryBuilder,
} from "@/types/stock.types";

export const cashClosingDiscrepancies: CashClosingDiscrepancy[] = [
  {
    id: "cash-discrepancy-01",
    date: "17/05",
    time: "15h45",
    responsible: "Guilherme Silva",
    store: "Loja Morumbi",
    scope: "Mercearia",
    item: "Milho verde",
    barcode: "7891000100011",
    systemQuantity: 24,
    soldQuantity: 25,
    difference: 1,
    differenceValueInCents: 5700,
    status: "Não conciliado",
    discrepancyDetectedOnDay: 5,
  },
  {
    id: "cash-discrepancy-02",
    date: "17/05",
    time: "15h45",
    responsible: "Guilherme Silva",
    store: "Loja Morumbi",
    scope: "Açougue",
    item: "Carne moída",
    barcode: "7891000100028",
    systemQuantity: 42,
    soldQuantity: 40,
    difference: -2,
    differenceValueInCents: 3400,
    status: "Em análise",
    discrepancyDetectedOnDay: 8,
  },
  {
    id: "cash-discrepancy-03",
    date: "17/05",
    time: "15h45",
    responsible: "Guilherme Silva",
    store: "Loja Centro",
    scope: "Laticínios",
    item: "Leite integral",
    barcode: "7891000100035",
    systemQuantity: 89,
    soldQuantity: 90,
    difference: 1,
    differenceValueInCents: 690,
    status: "Em análise",
    discrepancyDetectedOnDay: 11,
  },
  {
    id: "cash-discrepancy-04",
    date: "17/05",
    time: "15h45",
    responsible: "Guilherme Silva",
    store: "Loja Norte",
    scope: "Horti-Fruti",
    item: "Tomate italiano",
    barcode: "7891000100042",
    systemQuantity: 64,
    soldQuantity: 61,
    difference: -3,
    differenceValueInCents: 1590,
    status: "Não conciliado",
    discrepancyDetectedOnDay: 14,
  },
  {
    id: "cash-discrepancy-05",
    date: "17/05",
    time: "15h45",
    responsible: "Guilherme Silva",
    store: "Loja Centro",
    scope: "Laticínios",
    item: "Queijo minas frescal",
    barcode: "7891000100059",
    systemQuantity: 28,
    soldQuantity: 31,
    difference: 3,
    differenceValueInCents: 2450,
    status: "Em análise",
    discrepancyDetectedOnDay: 18,
  },
  {
    id: "cash-discrepancy-06",
    date: "17/05",
    time: "15h45",
    responsible: "Guilherme Silva",
    store: "Loja Morumbi",
    scope: "Congelados",
    item: "Frango resfriado",
    barcode: "7891000100066",
    systemQuantity: 26,
    soldQuantity: 24,
    difference: -2,
    differenceValueInCents: 2590,
    status: "Não conciliado",
    discrepancyDetectedOnDay: 22,
  },
];

export const stockStores = Array.from(
  new Set(cashClosingDiscrepancies.map((record) => record.store)),
);

export const getCashCountProducts = (
  discrepancy: CashClosingDiscrepancy,
): CashCountProduct[] => [
  {
    id: `${discrepancy.id}-main`,
    name: discrepancy.item,
    barcode: discrepancy.barcode,
    systemQuantity: discrepancy.systemQuantity,
    countedQuantity: discrepancy.soldQuantity,
    difference: discrepancy.difference,
    status: discrepancy.difference === 0 ? "Conferido" : "Divergente",
  },
  {
    id: `${discrepancy.id}-checked`,
    name: "Produto conferido",
    barcode: `${discrepancy.barcode.slice(0, -1)}8`,
    systemQuantity: 48,
    countedQuantity: 48,
    difference: 0,
    status: "Conferido",
  },
  {
    id: `${discrepancy.id}-pending`,
    name: "Produto pendente de conferência",
    barcode: `${discrepancy.barcode.slice(0, -1)}5`,
    systemQuantity: 48,
    countedQuantity: 48,
    difference: 0,
    status: "Pendente",
  },
];

const chartMonth = "2026-05";
const daysInChartMonth = 31;

export const buildCashDiscrepancyHistory: CashDiscrepancyHistoryBuilder = (
  records,
  resolvedDiscrepancyIds,
): HistoricalMetric[] =>
  Array.from({ length: daysInChartMonth }, (_, index) => {
    const day = index + 1;
    const activeRiskCount = records.filter(
      (record) =>
        record.discrepancyDetectedOnDay <= day &&
        !resolvedDiscrepancyIds.includes(record.id),
    ).length;

    return {
      date: `${chartMonth}-${String(day).padStart(2, "0")}`,
      value: activeRiskCount,
    };
  });
