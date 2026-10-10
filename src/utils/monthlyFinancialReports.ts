import type { CashClosingDiscrepancy } from '@/types/stock.types';
import type {
  MonthlyFinancialReport,
  MonthlyFinancialReportFilters,
  MonthlyFinancialReportItem,
} from '@/types/monthly-financial-report.types';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function buildMonthlyFinancialReportItems(
  records: readonly CashClosingDiscrepancy[],
  filters: MonthlyFinancialReportFilters,
): MonthlyFinancialReportItem[] {
  return records
    .filter((record) => record.date.split('/')[1] === filters.month)
    .filter((record) => filters.store === '__all__' || record.store === filters.store)
    .map((record) => ({
      id: record.id,
      date: record.date,
      store: record.store,
      category: record.scope,
      item: record.item,
      quantityDifference: record.difference,
      differenceValueInCents: record.differenceValueInCents,
      status: record.status,
    }));
}

export function createMonthlyFinancialReport(
  filters: MonthlyFinancialReportFilters,
  items: MonthlyFinancialReportItem[],
): MonthlyFinancialReport {
  const monthNumber = Number(filters.month);
  return {
    id: `financial-report-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    filters: { ...filters },
    monthLabel: monthNames[monthNumber - 1] ?? 'Mês sem identificação',
    yearLabel: 'Ano não informado',
    items: items.map((item) => ({ ...item })),
  };
}

function escapeCsvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function downloadMonthlyFinancialReport(report: MonthlyFinancialReport): void {
  const rows: (string | number)[][] = [
    ['Relatório financeiro mensal — divergências de caixa'],
    ['Mês', `${report.monthLabel} (${report.yearLabel})`],
    ['Loja', report.filters.store === '__all__' ? 'Todas as lojas' : report.filters.store],
    ['Registros de divergência', report.items.length],
    ['Soma dos valores de divergência cadastrados (R$)', (report.items.reduce((total, item) => total + item.differenceValueInCents, 0) / 100).toFixed(2).replace('.', ',')],
    ['Interpretação', 'A soma acima é apenas a soma dos valores registrados; não está classificada como perda, prejuízo, receita ou saldo.'],
    ['Limitação', 'Amostra demonstrativa. Os registros disponíveis são de 17/05, sem ano informado; não há lançamentos de receitas ou despesas.'],
    [],
    ['Data registrada', 'Loja', 'Categoria', 'Item', 'Divergência (unidades)', 'Valor da divergência registrado (R$)', 'Status'],
    ...report.items.map((item) => [
      item.date,
      item.store,
      item.category,
      item.item,
      item.quantityDifference,
      (item.differenceValueInCents / 100).toFixed(2).replace('.', ','),
      item.status,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n')}`;
  const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-financeiro-mensal-${report.filters.month}-${report.id}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
