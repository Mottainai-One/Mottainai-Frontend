export interface ManagementReportFilters {
  date: string;
  store: string;
  category: string;
}

export type ManagementReportFormat = 'pdf' | 'csv';

export interface ManagementReportItem {
  id: string;
  product: string;
  category: string;
  unitsSold: number;
}

export interface ManagementReport {
  id: string;
  createdAt: string;
  filters: ManagementReportFilters;
  items: ManagementReportItem[];
}

export interface ManagementReportPageState {
  filters: ManagementReportFilters;
  reports: ManagementReport[];
  selectedReport: ManagementReport | null;
  format: ManagementReportFormat;
  isLoadingReports: boolean;
  isSavingPreference: boolean;
  isSavingReport: boolean;
  feedback: string;
  error: string;
}
