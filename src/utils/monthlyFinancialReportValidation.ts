import type { MonthlyFinancialReportFilters } from '@/types/monthly-financial-report.types';

export type MonthlyFinancialReportErrors = Partial<Record<keyof MonthlyFinancialReportFilters, string>>;

export function validateMonthlyFinancialReportFilters(filters: MonthlyFinancialReportFilters): MonthlyFinancialReportErrors {
  const errors: MonthlyFinancialReportErrors = {};
  const month = filters.month.trim();
  if (!month) errors.month = 'Selecione o mês de referência.';
  else if (!/^\d{2}$/.test(month) || Number(month) < 1 || Number(month) > 12) {
    errors.month = 'Selecione um mês válido.';
  }
  if (!filters.store.trim()) errors.store = 'Selecione uma loja.';
  else if (filters.store.length > 100) errors.store = 'Selecione uma loja válida.';
  return errors;
}

export function sanitizeMonthlyFinancialReportFilters(filters: MonthlyFinancialReportFilters): MonthlyFinancialReportFilters {
  return { month: filters.month.trim().slice(0, 2), store: filters.store.trim().slice(0, 100) };
}
