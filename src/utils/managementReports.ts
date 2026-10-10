import type { CashClosingDiscrepancy } from '@/types/stock.types';
import type {
  ManagementReport,
  ManagementReportFilters,
  ManagementReportItem,
} from '@/types/management-report.types';

export function buildTopSellingReport(
  records: readonly CashClosingDiscrepancy[],
  filters: ManagementReportFilters,
): ManagementReportItem[] {
  const totals = new Map<string, ManagementReportItem>();

  records
    .filter((record) => !filters.date || filters.date === '__all__' || record.date === filters.date)
    .filter((record) => !filters.store || filters.store === '__all__' || record.store === filters.store)
    .filter((record) => !filters.category || filters.category === '__all__' || record.scope === filters.category)
    .forEach((record) => {
      const key = `${record.item}-${record.scope}`;
      const current = totals.get(key);
      totals.set(key, {
        id: key,
        product: record.item,
        category: record.scope,
        unitsSold: (current?.unitsSold ?? 0) + record.soldQuantity,
      });
    });

  return Array.from(totals.values()).sort(
    (first, second) => second.unitsSold - first.unitsSold,
  );
}

export function createManagementReport(
  filters: ManagementReportFilters,
  items: ManagementReportItem[],
): ManagementReport {
  return {
    id: `report-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    filters: { ...filters },
    items,
  };
}

function escapeCsvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function downloadManagementReport(report: ManagementReport): void {
  const rows = [
    ['Produto', 'Categoria', 'Unidades vendidas'],
    ...report.items.map((item) => [item.product, item.category, item.unitsSold]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n')}`;
  const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-produtos-mais-vendidos-${report.id}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
