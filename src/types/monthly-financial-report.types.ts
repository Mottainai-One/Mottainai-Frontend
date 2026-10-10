import type { CashClosingStatus } from '@/types/stock.types';

export interface MonthlyFinancialReportFilters {
  month: string;
  store: string;
}

export interface MonthlyFinancialReportItem {
  id: string;
  date: string;
  store: string;
  category: string;
  item: string;
  quantityDifference: number;
  differenceValueInCents: number;
  status: CashClosingStatus;
}

export interface MonthlyFinancialReport {
  id: string;
  createdAt: string;
  filters: MonthlyFinancialReportFilters;
  monthLabel: string;
  yearLabel: string;
  items: MonthlyFinancialReportItem[];
}

export interface MonthlyFinancialReportPageState {
  month: string;
  store: string;
  reports: MonthlyFinancialReport[];
  selectedReport: MonthlyFinancialReport | null;
  isLoadingReports: boolean;
  isGenerating: boolean;
  feedback: string;
  error: string;
}
